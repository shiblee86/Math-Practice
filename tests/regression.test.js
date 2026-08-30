// REGRESSION TESTS — pins specific decisions and previously-fragile behaviors from
// the Turbo Math Dojo redesign so they can't silently drift back. Each test names
// the regression it guards in its title. Reuses appWin()/appDoc()/run()/$()/$$()
// from integration.test.js (loaded earlier on this same page, so they're already
// global here).

suite('regression — theme switcher removal', () => {
  test('no .theme-selector UI and no setTheme/loadTheme globals remain', () => {
    assert.equal($$('.theme-selector').length, 0);
    assert.equal(run('typeof setTheme'), 'undefined');
    assert.equal(run('typeof loadTheme'), 'undefined');
    assert.ok(!appDoc().body.className.includes('theme-'), 'body must not carry a theme-* class');
  });
});

suite('regression — persistence key rename (safia-* → mathdojo-*), now also racer-namespaced', () => {
  test('every write goes through the new mathdojo-*-<racer> prefix, never the old safia- prefix', () => {
    run(`(function(){
      activeRacer = 'safia'; loadRacerState();
      progress = {}; LEVELS.forEach(l => progress[l.id] = {completed:false, score:0});
      soarProgress = {}; trophyData = {}; badges = {}; totalStarsEarned = 5;
      persistAll();
    })()`);
    ['progress', 'soar', 'trophies', 'badges', 'stars'].forEach(suffix => {
      assert.ok(run(`localStorage.getItem(nk('mathdojo-${suffix}')) !== null`), `mathdojo-${suffix}-safia was not written`);
    });
    // Sweep every key actually present in the iframe's localStorage — none may start with "safia-".
    const keys = JSON.parse(run('JSON.stringify(Object.keys(localStorage))'));
    keys.forEach(k => assert.ok(!k.startsWith('safia-'), `found a stale legacy key: ${k}`));
  });

  test('persistAll() writes all 5 bundle fields (for the active racer) in one call, not a subset', () => {
    run(`(function(){
      activeRacer = 'safia';
      ['mathdojo-progress','mathdojo-soar','mathdojo-trophies','mathdojo-badges','mathdojo-stars']
        .forEach(k => localStorage.removeItem(nk(k)));
      persistAll();
    })()`);
    ['progress', 'soar', 'trophies', 'badges', 'stars'].forEach(suffix => {
      assert.ok(run(`localStorage.getItem(nk('mathdojo-${suffix}')) !== null`), `persistAll skipped mathdojo-${suffix}`);
    });
  });
});

suite('regression — persistent back button targets every screen correctly', () => {
  test('back button is hidden on Home (and the Gym hub) and visible on every other screen', () => {
    const allScreens = ['homeScreen', 'practiceMenuScreen', 'soarMenuScreen', 'soarActivityScreen', 'quizScreen', 'resultScreen'];
    allScreens.forEach(id => {
      run(`showScreen('${id}')`);
      const expected = id === 'homeScreen' ? 'hidden' : 'visible';
      assert.equal(getComputedStyle($('#topStripBack')).visibility, expected, `${id}: back button visibility wrong`);
    });
  });

  test('nav tab is correct for all 6 screens (Home/SOAR/Levels)', () => {
    const expected = {
      homeScreen: 'home', practiceMenuScreen: 'levels', soarMenuScreen: 'soar',
      soarActivityScreen: 'soar', quizScreen: 'levels', resultScreen: 'levels'
    };
    Object.entries(expected).forEach(([id, tab]) => {
      run(`showScreen('${id}')`);
      assert.equal($('.nav-item--active').dataset.tab, tab, `${id}: expected nav tab "${tab}"`);
    });
  });
});

suite('regression — fact-family checking is per-row, not all-or-nothing', () => {
  test('a correct row keeps its "correct" class even when other rows are wrong', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'fact_family'); startLevel(l); })()`);
    const q = JSON.parse(run('JSON.stringify(questions[0])'));
    // Row 1 uses the canonical a+b=total fact; rows 2-4 are deliberately wrong.
    run(`document.getElementById('f1a').value='${q.a}'; document.getElementById('f1b').value='${q.b}'; document.getElementById('f1c').value='${q.total}';`);
    ['f2', 'f3', 'f4'].forEach(row => {
      run(`document.getElementById('${row}a').value='1'; document.getElementById('${row}b').value='1'; document.getElementById('${row}c').value='1';`);
    });
    run('checkAnswer()');
    assert.equal($('#f1a').classList.contains('correct'), true);
    assert.equal($('#f1b').classList.contains('correct'), true);
    assert.equal($('#f1c').classList.contains('correct'), true);
    assert.equal($('#f2a').classList.contains('wrong'), true);
    assert.equal($('#f4a').classList.contains('wrong'), true);
  });

  test('reusing the same canonical fact for two different rows does not count both as correct', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'fact_family'); startLevel(l); })()`);
    const q = JSON.parse(run('JSON.stringify(questions[0])'));
    // Rows 1 and 2 both submit the exact same a+b=total fact — only one of the 4
    // canonical permutations can be "claimed" per row (see QUESTION_TYPES.fact_family
    // in script.js), so this must NOT be accepted as a full-correct answer.
    run(`document.getElementById('f1a').value='${q.a}'; document.getElementById('f1b').value='${q.b}'; document.getElementById('f1c').value='${q.total}';`);
    run(`document.getElementById('f2a').value='${q.a}'; document.getElementById('f2b').value='${q.b}'; document.getElementById('f2c').value='${q.total}';`);
    run(`document.getElementById('f3a').value='9'; document.getElementById('f3b').value='9'; document.getElementById('f3c').value='9';`);
    run(`document.getElementById('f4a').value='9'; document.getElementById('f4b').value='9'; document.getElementById('f4c').value='9';`);
    const result = run('QUESTION_TYPES.fact_family.check(questions[0])');
    assert.equal(result.status, 'wrong');
  });
});

suite('regression — trophy/badge content matches the redesign, not the old princess theme', () => {
  test('TROPHIES uses the racing/dojo names, not the old Kingdom names', () => {
    const names = JSON.parse(run('JSON.stringify(TROPHIES.map(t => t.name))'));
    assert.ok(names.includes('Track Champion'), 'expected the redesigned trophy name "Track Champion"');
    assert.ok(names.includes('Full Circuit'), 'expected the redesigned trophy name "Full Circuit"');
    assert.ok(!names.includes('Kingdom Queen'), 'old princess-themed trophy name should not exist anymore');
  });

  test('there is exactly one, single-sourced TROPHIES/BADGES_DEF (no shadow copy left in script.js)', () => {
    assert.equal(run('TROPHIES.length'), 16);
    assert.equal(run('BADGES_DEF.length'), 10);
  });
});

suite('regression — the 6 kept SVG render helpers were not lost during the port', () => {
  test('clockFaceSvg, formatTime, pieSliceSvg, barChartHtml, shapeSvg, lengthBlocksHtml all still exist', () => {
    ['clockFaceSvg', 'formatTime', 'pieSliceSvg', 'barChartHtml', 'shapeSvg', 'lengthBlocksHtml'].forEach(fn => {
      assert.equal(run(`typeof ${fn}`), 'function', `${fn} is missing from script.js`);
    });
  });

  test('the richer generator branches that use them are actually reachable', () => {
    // These 4 level ids each have at least one branch wired to a kept SVG helper
    // (see DESIGN.md "fidelity fix" note). Sample generously since branch choice is random.
    const sawSvgFor = {};
    ['time', 'shapes_measurement'].forEach(id => { sawSvgFor[id] = false; });
    for (let i = 0; i < 40; i++) {
      const t = JSON.parse(run('JSON.stringify(eqTime())'));
      if (t.type === 'time_read') sawSvgFor.time = true;
      const s = JSON.parse(run('JSON.stringify(eqShapes())'));
      if (s.type === 'shape_sides' || s.type === 'shape_name') sawSvgFor.shapes_measurement = true;
    }
    Object.entries(sawSvgFor).forEach(([id, saw]) => {
      assert.ok(saw, `never hit an SVG-rendering branch for "${id}" in 40 samples — possible regression`);
    });
  });
});

suite('regression — design tokens: button shadow color follows its variant', () => {
  test('.btn--primary and .btn--accent use their own colored shadow, not a shared neutral one', () => {
    // Two separate elements, not one reused element with its className mutated:
    // Chrome does not reliably invalidate a just-read getComputedStyle() result
    // when only className changes within the same synchronous task, which made an
    // earlier version of this exact test spuriously fail against correct CSS.
    const a = appDoc().createElement('button');
    const b = appDoc().createElement('button');
    a.className = 'btn btn--primary';
    b.className = 'btn btn--accent';
    appDoc().body.appendChild(a);
    appDoc().body.appendChild(b);
    const primaryShadow = getComputedStyle(a).boxShadow;
    const accentShadow = getComputedStyle(b).boxShadow;
    a.remove(); b.remove();
    assert.ok(primaryShadow.length > 0 && accentShadow.length > 0, 'expected a box-shadow on both variants');
    assert.ok(primaryShadow !== accentShadow, '.btn--primary and .btn--accent must not share the same shadow color');
  });
});

suite('regression — mathdata.js is loaded as a plain script, not an ES module', () => {
  test('no ES-module "export" syntax remains in the shipped mathdata.js', async () => {
    const res = await fetch('../mathdata.js');
    const src = await res.text();
    assert.ok(!/^export\s/m.test(src), 'mathdata.js must not contain top-level "export" statements');
  });
});

suite('regression — app branding', () => {
  test('page title and home hero reflect both kids\' names, not the old "Kingdom" branding', () => {
    assert.match(appDoc().title, "Safia's & Safaan's Math Dojo");
    assert.ok(!appDoc().title.includes('Kingdom'));
  });
});

suite('regression — the vestigial mistakePatterns mechanism was retired, not left alongside its replacement', () => {
  test('mistakePatterns/updateMistakePatternsDisplay no longer exist, and #patternSummary is driven by weakFacts instead', () => {
    assert.equal(run('typeof mistakePatterns'), 'undefined');
    assert.equal(run('typeof updateMistakePatternsDisplay'), 'undefined');
    assert.equal(run('typeof renderWeakFactsPanel'), 'function');
    run(`(function(){ mmMisses = {'add20:2 + 2': 9}; renderWeakFactsPanel(); })()`);
    assert.equal($('#patternSummary').style.display, 'block');
    assert.match($('#patternTags').innerHTML, '2 + 2');
  });
});
