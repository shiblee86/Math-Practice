// UNIT TESTS — mathdata.js content/logic in isolation.
//
// mathdata.js is pure data/logic with one seam: 6 SVG/HTML render helpers
// (clockFaceSvg, formatTime, pieSliceSvg, barChartHtml, shapeSvg, lengthBlocksHtml)
// live in script.js, not mathdata.js, because they're presentation, not content
// (see DESIGN.md). script.js can't be loaded standalone here — its top-level code
// reaches for DOM elements (#confettiCanvas, #mascot, ...) that only exist in the
// real index.html. So this file stubs those 6 helpers with minimal same-signature
// stand-ins, just enough for the generators that call them to run structurally.
// The *real* helpers, wired through the *real* app, are covered in integration.test.js.
(function stubRenderHelpers() {
  window.clockFaceSvg = (hour, minute) => `<svg data-stub="clock" data-hour="${hour}" data-minute="${minute}"></svg>`;
  window.formatTime = (hour, minute) => { const h12 = hour % 12 === 0 ? 12 : hour % 12; return `${h12}:${minute === 0 ? '00' : minute}`; };
  window.pieSliceSvg = (parts, shaded) => `<svg data-stub="pie" data-parts="${parts}" data-shaded="${shaded}"></svg>`;
  window.barChartHtml = (items) => `<div data-stub="chart" data-n="${items.length}"></div>`;
  window.shapeSvg = (type) => `<svg data-stub="shape" data-type="${type}"></svg>`;
  window.lengthBlocksHtml = (n) => `<div data-stub="blocks" data-n="${n}"></div>`;
})();

const KNOWN_KINDS = ['numeric', 'multiple_choice', 'coin_picker', 'compose_pair', 'fact_family'];

suite('mathdata.js — helpers', () => {
  test('rnd(a,b) stays within bounds and is an integer', () => {
    for (let i = 0; i < 500; i++) {
      const v = rnd(3, 9);
      assert.ok(Number.isInteger(v), `rnd should return an integer, got ${v}`);
      assert.ok(v >= 3 && v <= 9, `rnd(3,9) out of range: ${v}`);
    }
  });

  test('shuffle(arr) preserves the multiset without mutating the input', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    const shuffled = shuffle(original);
    assert.deepEqual(original, copy, 'shuffle must not mutate its argument');
    assert.deepEqual([...shuffled].sort(), [...original].sort(), 'shuffle must preserve elements');
  });

  test('formatCents formats sub-dollar and dollar-plus amounts', () => {
    assert.equal(formatCents(5), '5¢');
    assert.equal(formatCents(99), '99¢');
    assert.equal(formatCents(100), '$1.00');
    assert.equal(formatCents(250), '$2.50');
  });

  test('coinLabel maps known coin values', () => {
    assert.equal(coinLabel(25), '25¢');
    assert.equal(coinLabel(10), '10¢');
    assert.equal(coinLabel(5), '5¢');
    assert.equal(coinLabel(1), '1¢');
  });

  test('hint-card builders return non-empty HTML strings without throwing', () => {
    assert.match(bubble('hi'), 'hi');
    assert.match(wrap('#fff', '🏁', 'Title', 'body'), 'Title');
    assert.match(numChip(7), '7');
    assert.match(colBox([{ text: 'x' }]), 'x');
    assert.match(coinChip(25), '25');
    assert.match(coinRow([1, 5]), '1');
  });

  test('addColumn / subtractColumn render the correct final answer', () => {
    assert.match(addColumn(37, 45), String(37 + 45));
    assert.match(subtractColumn(52, 27), String(52 - 27));
  });
});

suite('mathdata.js — LEVELS / generateLevel', () => {
  test('LEVELS has exactly 20 entries with unique, non-empty ids', () => {
    assert.equal(LEVELS.length, 20);
    const ids = LEVELS.map(l => l.id);
    assert.equal(new Set(ids).size, 20, 'level ids must be unique');
    LEVELS.forEach(l => {
      assert.ok(l.id && l.name && l.icon, `level missing id/name/icon: ${JSON.stringify(l)}`);
    });
  });

  test('LEVEL_VIDEOS has an entry for every level id', () => {
    LEVELS.forEach(l => {
      assert.ok(LEVEL_VIDEOS[l.id], `missing LEVEL_VIDEOS entry for ${l.id}`);
      assert.ok(LEVEL_VIDEOS[l.id].url && LEVEL_VIDEOS[l.id].title);
    });
  });

  test('generateLevel(id) returns exactly 15 questions for every level', () => {
    LEVELS.forEach(l => {
      const qs = generateLevel(l.id);
      assert.equal(qs.length, 15, `${l.id} should produce 15 questions, got ${qs.length}`);
    });
  });

  test('generateLevel(id) mixes 7 hinted + 3 unhinted equations and 2 hinted + 3 unhinted words', () => {
    LEVELS.forEach(l => {
      const qs = generateLevel(l.id);
      const eqHinted = qs.filter(q => q.category === 'equation' && q.hasHint).length;
      const eqUnhinted = qs.filter(q => q.category === 'equation' && !q.hasHint).length;
      const wordHinted = qs.filter(q => q.category === 'word' && q.hasHint).length;
      const wordUnhinted = qs.filter(q => q.category === 'word' && !q.hasHint).length;
      assert.equal(eqHinted, 7, `${l.id}: expected 7 hinted equations, got ${eqHinted}`);
      assert.equal(eqUnhinted, 3, `${l.id}: expected 3 unhinted equations, got ${eqUnhinted}`);
      assert.equal(wordHinted, 2, `${l.id}: expected 2 hinted words, got ${wordHinted}`);
      assert.equal(wordUnhinted, 3, `${l.id}: expected 3 unhinted words, got ${wordUnhinted}`);
    });
  });

  test('every generated question has a non-empty question string and a resolvable kind', () => {
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        assert.ok(typeof q.question === 'string' && q.question.length > 0, `${l.id}: empty question text`);
        const k = kindOf(q);
        assert.ok(KNOWN_KINDS.includes(k), `${l.id}: unknown kind "${k}" for type "${q.type}"`);
      });
    });
  });

  test('numeric questions have a finite numeric answer', () => {
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        if (kindOf(q) === 'numeric') {
          assert.ok(Number.isFinite(q.answer), `${l.id}/${q.type}: numeric question missing finite answer`);
        }
      });
    });
  });

  test('multiple_choice questions have exactly one correct choice', () => {
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        if (kindOf(q) === 'multiple_choice') {
          const correctCount = q.choices.filter(c => c.correct).length;
          assert.equal(correctCount, 1, `${l.id}/${q.type}: expected exactly 1 correct choice, got ${correctCount}`);
        }
      });
    });
  });

  test('fact_family questions satisfy a + b === total', () => {
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        if (kindOf(q) === 'fact_family') {
          assert.equal(q.a + q.b, q.total, `${l.id}: fact family ${q.a}+${q.b} !== ${q.total}`);
          assert.ok(q.a !== q.b, `${l.id}: fact family must not use a===b (only 2 unique facts, not 4)`);
        }
      });
    });
  });

  test('compose_pair questions define a numeric target', () => {
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        if (kindOf(q) === 'compose_pair') {
          assert.ok(Number.isFinite(q.target), `${l.id}: compose_pair missing numeric target`);
        }
      });
    });
  });

  test('coin_picker "money_make" questions have a target reachable by summing all shown coins', () => {
    let sawMoneyMake = false;
    for (let i = 0; i < 30; i++) {
      const q = eqMoney();
      if (q.type === 'money_make') {
        sawMoneyMake = true;
        const sum = q.coins.reduce((a, b) => a + b, 0);
        assert.equal(sum, q.target, 'money_make target should equal the sum of all displayed coins');
      }
    }
    assert.ok(sawMoneyMake, 'expected at least one money_make question across 30 samples');
  });
});

suite('mathdata.js — TROPHIES / BADGES_DEF', () => {
  test('TROPHIES has 16 entries with unique ids and callable checks', () => {
    assert.equal(TROPHIES.length, 16);
    assert.equal(new Set(TROPHIES.map(t => t.id)).size, 16);
    TROPHIES.forEach(t => {
      assert.ok(typeof t.check === 'function', `${t.id}: check must be a function`);
      assert.ok(t.icon && t.name, `${t.id}: missing icon/name`);
    });
  });

  test('BADGES_DEF has 10 entries with unique keys and callable checks', () => {
    assert.equal(BADGES_DEF.length, 10);
    assert.equal(new Set(BADGES_DEF.map(b => b.key)).size, 10);
    BADGES_DEF.forEach(b => {
      assert.ok(typeof b.check === 'function', `${b.key}: check must be a function`);
    });
  });

  test('trophy score-threshold checks are monotonic (satisfied by a fresh, empty progress object)', () => {
    const emptyProgress = {};
    const first = TROPHIES.find(t => t.id === 'first_correct');
    const five = TROPHIES.find(t => t.id === 'five_stars');
    assert.equal(first.check(0, emptyProgress), false);
    assert.equal(first.check(1, emptyProgress), true);
    assert.equal(five.check(4, emptyProgress), false);
    assert.equal(five.check(5, emptyProgress), true);
  });
});

suite('mathdata.js — SOAR_ACTIVITIES', () => {
  test('SOAR_ACTIVITIES has exactly 56 entries with unique ids', () => {
    assert.equal(SOAR_ACTIVITIES.length, 56);
    assert.equal(new Set(SOAR_ACTIVITIES.map(a => a.id)).size, 56);
  });

  test('every SOAR activity has the fields the render layer depends on', () => {
    SOAR_ACTIVITIES.forEach(a => {
      ['id', 'icon', 'title', 'age', 'desc', 'aim', 'illustration', 'hint'].forEach(field => {
        assert.ok(a[field], `${a.id || '(no id)'}: missing "${field}"`);
      });
      assert.ok(Array.isArray(a.instructions) && a.instructions.length > 0, `${a.id}: instructions must be a non-empty array`);
      assert.ok(Array.isArray(a.questions) && a.questions.length > 0, `${a.id}: questions must be a non-empty array`);
    });
  });

  test('every SOAR activity age band is one of the known bands', () => {
    // showSoarMenu() groups activities into 5 visual buckets (3-5/5-7/5-11/7-11/9-14);
    // a handful of activities (e.g. Nim-7, Got It) are authored with a wider "5-14"
    // band and fall through to the 5-11 bucket via that function's `||` fallback —
    // that's existing, intentional grouping behavior carried over from the original
    // app, not a typo, so it's included here too.
    const known = ['3-5', '5-7', '5-11', '7-11', '9-14', '5-14'];
    SOAR_ACTIVITIES.forEach(a => {
      assert.ok(known.includes(a.age), `${a.id}: unexpected age band "${a.age}"`);
    });
  });

  test('SOAR_VIDEOS_BY_ID and NRICH_LINKS_BY_ID keys all correspond to real activity ids', () => {
    const ids = new Set(SOAR_ACTIVITIES.map(a => a.id));
    Object.keys(SOAR_VIDEOS_BY_ID).forEach(k => assert.ok(ids.has(k), `SOAR_VIDEOS_BY_ID has stale key "${k}"`));
    Object.keys(NRICH_LINKS_BY_ID).forEach(k => assert.ok(ids.has(k), `NRICH_LINKS_BY_ID has stale key "${k}"`));
  });
});

suite('mathdata.js — kindOf / friendlyAnswer / TYPE_LABELS', () => {
  test('kindOf prefers an explicit kind, falls back to KIND_BY_TYPE, then to numeric', () => {
    assert.equal(kindOf({ kind: 'coin_picker', type: 'whatever' }), 'coin_picker');
    assert.equal(kindOf({ type: 'fact_family' }), 'fact_family');
    assert.equal(kindOf({ type: 'compose_add' }), 'compose_pair');
    assert.equal(kindOf({ type: 'totally_unknown_type' }), 'numeric');
  });

  test('friendlyAnswer special-cases compose_add/compose_sub/fact_family and defaults to the raw answer', () => {
    assert.match(friendlyAnswer({ type: 'compose_add' }), '+');
    assert.match(friendlyAnswer({ type: 'compose_sub' }), '−');
    assert.equal(friendlyAnswer({ type: 'fact_family', a: 3, b: 4, total: 7 }), '3+4=7, 4+3=7, 7−3=4, 7−4=3');
    assert.equal(friendlyAnswer({ type: 'carry_add', answer: 42 }), '42');
  });

  test('every question type produced by generateLevel has a TYPE_LABELS entry', () => {
    const missing = new Set();
    LEVELS.forEach(l => {
      generateLevel(l.id).forEach(q => {
        if (!TYPE_LABELS[q.type]) missing.add(q.type);
      });
    });
    assert.equal([...missing].join(','), '', `TYPE_LABELS missing entries for: ${[...missing].join(', ')}`);
  });
});

suite('mathdata.js — stepped worked-example hints (columnSteps / stripSteps / workSteps)', () => {
  // The result is spelled out digit-by-digit in a row of cells; reconstruct
  // the number from whichever row a step reveals it in, the same way the
  // Tens & Ones/Carry & Borrow tests already do for columnPlan().
  function digitsToNumber(row) {
    return parseInt(row.slice(1).map(c => c.v).join('').trim() || 'NaN', 10);
  }

  test('columnSteps(+) reconstructs the sum correctly with and without carrying', () => {
    const noCarry = columnSteps(23, 14, '+');
    assert.equal(digitsToNumber(noCarry[noCarry.length - 1].res), 37);
    const carry = columnSteps(28, 34, '+');
    assert.equal(digitsToNumber(carry[carry.length - 1].res), 62);
    assert.equal(carry.length, 5, 'a carrying addition has 5 steps (vs 4 without carrying)');
  });

  test('columnSteps(+) never truncates a 3-digit carry result (e.g. 69 + 69 = 138)', () => {
    const steps = columnSteps(69, 69, '+');
    const final = steps[steps.length - 1];
    assert.equal(digitsToNumber(final.res), 138);
    assert.equal(final.res.length, 4, 'a 3-digit result needs a 4-cell row (sign + 3 digits)');
  });

  test('columnSteps(-) reconstructs the difference for same-tens, no-borrow, and borrow branches', () => {
    const sameTens = columnSteps(17, 14, '-');
    assert.equal(digitsToNumber(sameTens[sameTens.length - 1].res), 3);
    const noBorrow = columnSteps(58, 23, '-');
    assert.equal(digitsToNumber(noBorrow[noBorrow.length - 1].res), 35);
    const borrow = columnSteps(35, 27, '-');
    assert.equal(digitsToNumber(borrow[borrow.length - 1].res), 8);
    assert.equal(borrow.length, 6, 'a borrowing subtraction has 6 steps');
  });

  test('columnSteps never gives away the answer on the very first "line them up" step', () => {
    // The answer legitimately becomes visible once both digits are computed
    // (that's the point of a worked example) — but step 0 is pure setup and
    // must not spoil it upfront.
    [columnSteps(28, 34, '+'), columnSteps(35, 27, '-'), columnSteps(17, 14, '-')].forEach(steps => {
      const shown = digitsToNumber(steps[0].res);
      assert.ok(Number.isNaN(shown), `step 0 (line them up) should reveal nothing yet, got ${shown}`);
    });
  });

  test('stripSteps always returns exactly 4 steps and the last step\'s chip count matches the answer', () => {
    const add = stripSteps('cup', 11, 8);
    assert.equal(add.length, 4);
    assert.equal(add[3].chips.length, 8, 'count-on strip shows one chip per number counted (the smaller addend)');
    const sub = stripSteps('cdown', 15, 7);
    assert.equal(sub.length, 4);
    assert.equal(sub[3].chips.length, 8, '15 − 7 = 8, one chip per number counted up');
  });

  test('workSteps expands a chained (array) work descriptor into one continuous step sequence', () => {
    const steps = workSteps([{ k: 'add', a: 19, b: 21 }, { k: 'add', a: 40, b: 30 }]);
    const partOneSteps = columnSteps(19, 21, '+').length;
    assert.equal(steps.length, partOneSteps + columnSteps(40, 30, '+').length);
    assert.equal(digitsToNumber(steps[partOneSteps - 1].res), 40, 'first chained part ends with its own subtotal');
    assert.equal(digitsToNumber(steps[steps.length - 1].res), 70, 'second chained part ends with the final total');
  });

  test('workSteps returns null when a question has no work descriptor (prose-hint fallback)', () => {
    assert.equal(workSteps(undefined), null);
    assert.equal(workSteps(null), null);
  });
});

suite('mathdata.js — RACERS (two-racer lanes)', () => {
  test('both racers exist with the exact prototype-sourced fields', () => {
    assert.deepEqual(Object.keys(RACERS).sort(), ['safaan', 'safia']);
    assert.equal(RACERS.safia.age, 6);
    assert.equal(RACERS.safia.band, '3-5');
    assert.equal(RACERS.safaan.age, 9);
    assert.equal(RACERS.safaan.band, '7-11');
  });

  test('safia\'s lane is levels 1-8 (Counting through Make a Sum) and safaan\'s is 4-20 (Carry Addition through Grand Finale)', () => {
    const safiaLane = LEVELS.slice(RACERS.safia.from, RACERS.safia.to);
    const safaanLane = LEVELS.slice(RACERS.safaan.from, RACERS.safaan.to);
    assert.equal(safiaLane.length, 8);
    assert.equal(safaanLane.length, 17);
    assert.equal(safiaLane[0].id, LEVELS[0].id);
    assert.equal(safaanLane[safaanLane.length - 1].id, LEVELS[LEVELS.length - 1].id);
  });

  test('the two lanes deliberately overlap on levels 4-8 (index 3-7), shared practice ground for both racers', () => {
    const safiaLane = LEVELS.slice(RACERS.safia.from, RACERS.safia.to);
    const safaanLane = LEVELS.slice(RACERS.safaan.from, RACERS.safaan.to);
    const sharedIds = LEVELS.slice(3, 8).map(l => l.id);
    sharedIds.forEach(id => {
      assert.ok(safiaLane.some(l => l.id === id), `expected shared level "${id}" in Safia's lane`);
      assert.ok(safaanLane.some(l => l.id === id), `expected shared level "${id}" in Safaan's lane`);
    });
  });

  test('no level is ever locked for either racer (RACERS carries no lock data)', () => {
    Object.values(RACERS).forEach(r => {
      assert.equal('locked' in r, false);
    });
  });
});
