// UNIT TESTS — mentalmath.js in isolation (loaded alongside mathdata.js in
// tests/index.html; no DOM dependency, same shape as unit.test.js).

function mmExpectedAnswer(f) {
  if (f.set === 'makeTen') return 10 - f.a;
  if (f.set === 'tables') return f.a * f.b;
  if (f.missing === 'b') return f.op === '-' ? f.a - f.c : f.c - f.a;
  if (f.missing === 'a') return f.op === '-' ? f.b + f.c : f.c - f.b;
  return f.op === '+' ? f.a + f.b : f.a - f.b;
}

suite('mentalmath.js — fact generators', () => {
  test('every set is registered and randFact(id) never throws', () => {
    assert.ok(ALL_SET_IDS.length > 0);
    ALL_SET_IDS.forEach(id => {
      for (let i = 0; i < 20; i++) {
        const f = randFact(id);
        assert.equal(f.set, id, `randFact('${id}') returned a fact for set '${f.set}'`);
      }
    });
  });

  test('every generated fact\'s answer matches its structured a/b/c fields (not scraped from display text, which varies in format across sets)', () => {
    ALL_SET_IDS.forEach(id => {
      for (let i = 0; i < 200; i++) {
        const f = randFact(id);
        const expected = mmExpectedAnswer(f);
        assert.equal(f.answer, expected, `${id}: ${JSON.stringify(f)} expected answer ${expected}`);
      }
    });
  });

  test('fact.id is stable per (set, display) pair and non-empty', () => {
    const f = randFact('add20');
    assert.equal(f.id, f.set + ':' + f.display);
  });

  test('choicesFor returns 4 distinct choices with exactly one correct', () => {
    for (let i = 0; i < 30; i++) {
      const f = randFact('add20');
      const choices = choicesFor(f);
      assert.equal(choices.length, 4);
      assert.equal(new Set(choices.map(c => c.label)).size, 4, 'choices must be distinct');
      assert.equal(choices.filter(c => c.correct).length, 1);
    }
  });

  test('strategyFor never throws and returns a name + line for every set', () => {
    ALL_SET_IDS.forEach(id => {
      for (let i = 0; i < 10; i++) {
        const s = strategyFor(randFact(id));
        assert.ok(s.name && s.line, `${id}: strategyFor returned an empty name/line`);
      }
    });
  });

  test('FACT_SETS gained a "carry" set (Carry & borrow) and DEFAULT_GYM_SETS picks the first five', () => {
    assert.ok(ALL_SET_IDS.includes('carry'), 'expected a "carry" fact set for the Gym hub picker');
    assert.equal(ALL_SET_IDS.length, 11);
    assert.deepEqual(DEFAULT_GYM_SETS, ['tensOnes', 'carry', 'add20', 'sub20', 'bridge']);
    assert.equal(new Set(DEFAULT_GYM_SETS).size, DEFAULT_GYM_SETS.length, 'defaults must be unique ids');
    DEFAULT_GYM_SETS.forEach(id => assert.ok(ALL_SET_IDS.includes(id), `default set "${id}" is not a real FACT_SETS id`));
  });

  test('GYM_SET_SAMPLE has a sample problem for every set the Gym hub picker offers', () => {
    ALL_SET_IDS.forEach(id => assert.ok(GYM_SET_SAMPLE[id], `missing a sample problem for "${id}"`));
  });
});

suite('mentalmath.js — flash-card 30 cap (cappedFact)', () => {
  test('capped sets (add20, sub20, tensOnes) never produce a number above 30, sampled widely', () => {
    FLASH_CAP_SETS.forEach(id => {
      for (let i = 0; i < 300; i++) {
        const f = cappedFact(id);
        [f.a, f.b, f.answer].forEach(n => {
          if (typeof n === 'number') assert.ok(Math.abs(n) <= 30, `${id}: ${JSON.stringify(f)} exceeds the 30 cap`);
        });
      }
    });
  });

  test('cappedFact still returns a fact for the given set id (no silent fallback to a different set)', () => {
    FLASH_CAP_SETS.forEach(id => {
      for (let i = 0; i < 20; i++) assert.equal(cappedFact(id).set, id);
    });
  });

  test('an uncapped set (e.g. carry) is returned untouched by cappedFact, numbers above 30 allowed', () => {
    let sawAbove30 = false;
    for (let i = 0; i < 60; i++) {
      const f = cappedFact('carry');
      assert.equal(f.set, 'carry');
      if (Math.max(f.a, f.b) > 30) sawAbove30 = true;
    }
    assert.ok(sawAbove30, 'expected at least one uncapped carry fact above 30 in 60 samples');
  });

  test('the bounded-retry fallback (cap so tight normal generation can\'t satisfy it) still returns a valid, in-cap fact', () => {
    const f = cappedFact('tensOnes', 5);
    assert.ok(Number.isFinite(f.answer));
    assert.ok(f.a <= 5 && f.b <= 5 && f.answer <= 5);
  });
});

suite('mentalmath.js — buildDrill / trainer / flashDeck', () => {
  test('buildDrill(count) returns exactly `count` facts', () => {
    const drill = buildDrill(20, ALL_SET_IDS, {});
    assert.equal(drill.length, 20);
  });

  test('buildDrill weights sets with misses more heavily (sampled, not guaranteed every draw)', () => {
    // Not a strict statistical test — just confirms a heavily-missed single set
    // dominates a drill restricted to two sets, which is the whole point of the weighting.
    const misses = {}; for (let i = 0; i < 50; i++) misses['add20:x' + i] = 3;
    const drill = buildDrill(30, ['add20', 'sub20'], misses);
    const add20Count = drill.filter(f => f.set === 'add20').length;
    assert.ok(add20Count > drill.length / 2, 'heavily-missed set should dominate the drill');
  });

  test('trainerFact + trainerSteps always produce at least one step with a valid answer', () => {
    for (let i = 0; i < 50; i++) {
      const f = trainerFact();
      const steps = trainerSteps(f);
      assert.ok(steps.length > 0, `trainerSteps returned no steps for ${JSON.stringify(f)}`);
      steps.forEach(st => assert.ok(Number.isFinite(st.answer), `step missing a finite answer: ${JSON.stringify(st)}`));
    }
  });

  test('trainerSteps uses the Gym hub redesign\'s rewritten, plain-language copy (not the old "Split the 9 into 8 and" wording)', () => {
    // bridge subtract, e.g. 18 - 9: get-down-to-ten / how-many-still-to-take / take-off-ten
    const bs = trainerSteps({ a: 18, b: 9, op: '-', set: 'bridge', answer: 9 });
    assert.equal(bs.length, 3);
    assert.equal(bs[0].text, 'First get down to ten. 18 − ? = 10');
    assert.equal(bs[0].answer, 8);
    assert.equal(bs[1].text, 'You took away 8 of the 9. How many are still left to take?');
    assert.equal(bs[1].answer, 1);
    assert.equal(bs[2].text, 'Now take those off ten. 10 − 1 = ?');
    assert.equal(bs[2].answer, 9);

    // bridge add, e.g. 8 + 8: make-ten / left-over / add-to-ten
    const ba = trainerSteps({ a: 8, b: 8, op: '+', set: 'bridge', answer: 16 });
    assert.equal(ba[0].text, 'First make ten. 8 + ? = 10');
    assert.equal(ba[1].text, 'You used 2 of the 8. How many are left over?');
    assert.equal(ba[2].text, 'Now add those to ten. 10 + 6 = ?');

    // missing minuend now shows the reconstructing equation, not a bare "put it back"
    const mm = trainerSteps({ b: 4, c: 6, op: '-', missing: 'a', answer: 10 });
    assert.equal(mm.length, 1);
    assert.equal(mm[0].text, 'We took 4 away and 6 was left. Put the 4 back: 6 + 4 = ?');

    // none of the old wording survives anywhere it could still show up
    [bs, ba, mm].flat().forEach(st => assert.ok(!/Split the/.test(st.text), `old scaffold wording leaked into: "${st.text}"`));
  });

  test('gradeCard advances the Leitner box on easy, resets to 0 on hard', () => {
    let cards = {};
    cards = gradeCard(cards, 'add20:2 + 2', true, 1);
    assert.equal(cards['add20:2 + 2'].box, 1);
    cards = gradeCard(cards, 'add20:2 + 2', true, 2);
    assert.equal(cards['add20:2 + 2'].box, 2);
    cards = gradeCard(cards, 'add20:2 + 2', false, 3);
    assert.equal(cards['add20:2 + 2'].box, 0);
  });

  test('flashDeck returns exactly `count` cards, all with a non-null answer', () => {
    const deck = flashDeck({}, 0, ALL_SET_IDS, 12);
    assert.equal(deck.length, 12);
    deck.forEach(c => assert.ok(Number.isFinite(c.answer), `flashDeck card missing an answer: ${JSON.stringify(c)}`));
  });

  test('mastery() is 0 for no cards and rises as cards reach box>=3', () => {
    assert.equal(mastery({}), 0);
    const cards = { a: { box: 3 }, b: { box: 0 } };
    assert.equal(mastery(cards), 50);
  });

  test('weakFacts sorts by miss count descending and respects the limit', () => {
    const misses = { 'add20:1 + 1': 2, 'sub20:9 - 3': 9, 'nine:5 + 9': 5 };
    const weak = weakFacts(misses, 2);
    assert.equal(weak.length, 2);
    assert.equal(weak[0].id, 'sub20:9 - 3');
    assert.equal(weak[1].id, 'nine:5 + 9');
  });
});

suite('mentalmath.js — daily sheet', () => {
  test('dailySheet(key) always returns exactly 16 problems: 4 add, 4 subtract, 4 market, 4 change-back', () => {
    const sheet = dailySheet('2026-08-28');
    assert.equal(sheet.length, 16);
    const groups = {};
    sheet.forEach(p => { groups[p.group] = (groups[p.group] || 0) + 1; });
    assert.equal(groups['Adding'], 4);
    assert.equal(groups['Taking away'], 4);
    assert.equal(groups['At the market'], 4);
    assert.equal(groups['Change back'], 4);
  });

  test('the same date key always produces the same sheet (seeded, deterministic)', () => {
    const a = dailySheet('2026-08-28');
    const b = dailySheet('2026-08-28');
    assert.deepEqual(a, b);
  });

  test('different date keys produce different sheets', () => {
    const a = dailySheet('2026-08-28');
    const b = dailySheet('2099-01-01');
    assert.ok(JSON.stringify(a) !== JSON.stringify(b), 'expected two different dates to seed different sheets');
  });

  test('every plain problem\'s answer matches a op b, every market/change-back problem\'s answer is internally consistent', () => {
    dailySheet('2026-08-28').forEach(p => {
      if (p.kind === 'plain') {
        assert.equal(p.answer, p.op === '+' ? p.a + p.b : p.a - p.b, JSON.stringify(p));
      } else {
        const total = p.items.reduce((s, it) => s + it.price, 0);
        if (p.op === '+') assert.equal(p.answer, total, 'market total should equal answer');
        else assert.equal(p.answer, p.note - total, 'change back should equal note minus total');
      }
    });
  });

  test('dailyHint never throws for any problem in a sheet', () => {
    dailySheet('2026-08-28').forEach(p => assert.ok(typeof dailyHint(p) === 'string' && dailyHint(p).length > 0));
  });
});

suite('mentalmath.js — carry & borrow sheet', () => {
  test('columnSheet(key) always returns exactly 12 problems: 3 carrying, 3 borrowing, 3 market bill, 3 change back', () => {
    const sheet = columnSheet('2026-08-28');
    assert.equal(sheet.length, 12);
    const groups = {};
    sheet.forEach(p => { groups[p.group] = (groups[p.group] || 0) + 1; });
    assert.equal(groups['Carrying'], 3);
    assert.equal(groups['Borrowing'], 3);
    assert.equal(groups['Market bill'], 3);
    assert.equal(groups['Change back'], 3);
  });

  test('the same date key always produces the same column sheet', () => {
    assert.deepEqual(columnSheet('2026-08-28'), columnSheet('2026-08-28'));
  });

  test('different date keys produce different column sheets', () => {
    assert.ok(JSON.stringify(columnSheet('2026-08-28')) !== JSON.stringify(columnSheet('2099-01-01')));
  });

  test('every two-digit problem is >= 10 on both sides (genuinely two-digit column arithmetic)', () => {
    columnSheet('2026-08-28').forEach(p => {
      assert.ok(p.a >= 10 && p.b >= 10, `expected two-digit a/b, got ${p.a}, ${p.b}`);
    });
  });
});

suite('mentalmath.js — columnPlan reconstructs the right answer', () => {
  function reconstructAdd(plan) {
    const onesReveal = plan.steps[0].reveal, tensReveal = plan.steps[1].reveal;
    return tensReveal.resTens * 10 + onesReveal.resOnes;
  }
  function reconstructSub(plan) {
    // steps are always [yesno, onesStep(reveal.resOnes), tensStep(reveal.resTens)]
    // for both the borrow and non-borrow branches.
    const tensStep = plan.steps[plan.steps.length - 1], onesStep = plan.steps[plan.steps.length - 2];
    return tensStep.reveal.resTens * 10 + onesStep.reveal.resOnes;
  }

  test('addition without carrying: 2 steps, result reconstructs a+b', () => {
    const p = { a: 23, b: 14, op: '+' };
    const plan = columnPlan(p);
    assert.equal(plan.steps.length, 2);
    assert.equal(plan.carry, 0);
    assert.equal(reconstructAdd(plan), p.a + p.b);
  });

  test('addition with carrying: 2 steps, carry flag set, result reconstructs a+b', () => {
    const p = { a: 27, b: 15, op: '+' }; // 7+5=12, carries
    const plan = columnPlan(p);
    assert.equal(plan.steps.length, 2);
    assert.equal(plan.carry, 1);
    assert.equal(reconstructAdd(plan), p.a + p.b);
  });

  test('subtraction without borrowing: yes/no step answer is "yes", result reconstructs a-b', () => {
    const p = { a: 38, b: 14, op: '-' }; // 8 >= 4, no borrow
    const plan = columnPlan(p);
    assert.equal(plan.borrow, false);
    assert.equal(plan.steps.length, 3);
    assert.equal(plan.steps[0].kind, 'yesno');
    assert.equal(plan.steps[0].answer, 'yes', 'no borrow needed => correct response to "is it big enough" is yes');
    assert.equal(reconstructSub(plan), p.a - p.b);
  });

  test('subtraction with borrowing: yes/no step answer is "no", result reconstructs a-b', () => {
    const p = { a: 32, b: 14, op: '-' }; // 2 < 4, borrow needed
    const plan = columnPlan(p);
    assert.equal(plan.borrow, true);
    assert.equal(plan.steps.length, 3);
    assert.equal(plan.steps[0].kind, 'yesno');
    assert.equal(plan.steps[0].answer, 'no', 'borrow needed => correct response to "is it big enough" is no');
    assert.equal(reconstructSub(plan), p.a - p.b);
  });

  test('columnPlan reconstructs the answer correctly across every problem in a full sampled sheet', () => {
    columnSheet('2026-08-28').concat(columnSheet('2099-01-01')).forEach(p => {
      const plan = columnPlan(p);
      const result = p.op === '+' ? reconstructAdd(plan) : reconstructSub(plan);
      assert.equal(result, p.answer, `${p.a} ${p.op} ${p.b}: plan reconstructed ${result}, expected ${p.answer}`);
    });
  });
});

suite('mentalmath.js — tensSheet / tensSteps (tens & ones)', () => {
  // The 12-problem plan is fixed (not randomized) — only the numbers are seeded.
  const EXPECTED_PLAN = [
    ['+', 'split'], ['+', 'blocks'], ['-', 'split'], ['-', 'line'],
    ['+', 'blocks'], ['+', 'compensate'], ['+', 'split'], ['+', 'line'],
    ['+', 'column'], ['-', 'blocks'], ['-', 'compensate'], ['-', 'column'],
  ];

  // For split/line/compensate/blocks, the last step's `answer` is the final
  // two-digit result. For column, the result is assembled from two different
  // steps' `reveal` fields (see columnPlan-style reconstruction above).
  function reconstructTensAnswer(it, steps) {
    if (it.strategy === 'column') {
      if (it.op === '+') return steps[1].reveal.resTens * 10 + steps[0].reveal.resOnes;
      return steps[2].reveal.resTens * 10 + steps[1].reveal.resOnes;
    }
    return steps[steps.length - 1].answer;
  }

  test('tensSheet(key) always returns exactly 12 problems following the fixed strategy plan', () => {
    const sheet = tensSheet('2026-08-28');
    assert.equal(sheet.length, 12);
    sheet.forEach((it, i) => {
      assert.equal(it.op, EXPECTED_PLAN[i][0], `problem ${i}: expected op ${EXPECTED_PLAN[i][0]}`);
      assert.equal(it.strategy, EXPECTED_PLAN[i][1], `problem ${i}: expected strategy ${EXPECTED_PLAN[i][1]}`);
    });
  });

  test('the same date key always produces the same tens sheet (seeded, deterministic)', () => {
    assert.deepEqual(tensSheet('2026-08-28'), tensSheet('2026-08-28'));
  });

  test('different date keys produce different tens sheets', () => {
    assert.ok(JSON.stringify(tensSheet('2026-08-28')) !== JSON.stringify(tensSheet('2099-01-01')));
  });

  test('every problem is genuinely two-digit and its answer matches a op b', () => {
    tensSheet('2026-08-28').concat(tensSheet('2099-01-01')).forEach(it => {
      assert.ok(it.a >= 10 && it.a < 100 && it.b >= 10 && it.b < 100, `expected two-digit a/b, got ${it.a}, ${it.b}`);
      assert.equal(it.answer, it.op === '+' ? it.a + it.b : it.a - it.b, JSON.stringify(it));
    });
  });

  test('tensSteps reconstructs the correct final answer for every strategy across a sampled sheet', () => {
    tensSheet('2026-08-28').concat(tensSheet('2099-01-01')).forEach(it => {
      const steps = tensSteps(it);
      assert.ok(steps.length > 0, `tensSteps returned no steps for ${JSON.stringify(it)}`);
      steps.forEach(st => assert.ok(st.answer !== undefined && st.answer !== '', `step missing an answer: ${JSON.stringify(st)}`));
      const result = reconstructTensAnswer(it, steps);
      assert.equal(result, it.answer, `${it.a} ${it.op} ${it.b} (${it.strategy}): reconstructed ${result}, expected ${it.answer}`);
    });
  });

  test('TENS_STRATEGY_LABEL and TENS_STRATEGY_NAME cover every strategy used in the plan', () => {
    const strategies = [...new Set(EXPECTED_PLAN.map(p => p[1]))];
    strategies.forEach(s => {
      assert.ok(TENS_STRATEGY_LABEL[s], `missing TENS_STRATEGY_LABEL for '${s}'`);
      assert.ok(TENS_STRATEGY_NAME[s], `missing TENS_STRATEGY_NAME for '${s}'`);
    });
  });

  test('tensNote never throws and returns non-empty text for every problem in a sheet', () => {
    tensSheet('2026-08-28').forEach(it => assert.ok(typeof tensNote(it) === 'string' && tensNote(it).length > 0));
  });
});
