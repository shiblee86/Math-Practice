// INTEGRATION TESTS — the real index.html + style.css + mathdata.js + script.js,
// loaded in a same-origin iframe (window.__APP_FRAME__, created by tests/index.html)
// and driven like an actual player would use it.
//
// Why `.eval()` instead of `iframeWindow.someGlobal`: most of script.js's and
// mathdata.js's state (`progress`, `currentStreak`, `LEVELS`, `TROPHIES`, ...) is
// declared with top-level `let`/`const`, which — unlike `var` or function
// declarations — does NOT attach to the `window` object. It's only visible to code
// evaluated *inside* that same realm (exactly like typing into that page's own
// DevTools console). `iframe.contentWindow.eval(code)` runs `code` as indirect eval
// in the iframe's global scope, which *can* see those bindings. Calling an exported
// function like `appWin().startLevel(...)` also works fine (function declarations
// DO attach to window) — `run()` is used uniformly below for consistency.
function appWin() { return window.__APP_FRAME__.contentWindow; }
function appDoc() { return window.__APP_FRAME__.contentDocument; }
function run(expr) { return appWin().eval(expr); }
function $(sel) { return appDoc().querySelector(sel); }
function $$(sel) { return Array.from(appDoc().querySelectorAll(sel)); }

// Every test resets exactly the state it depends on (see file header in
// regression.test.js for why: tests share one long-lived iframe for speed,
// so nothing here may assume a pristine app beyond what it sets up itself).

suite('integration — app boot', () => {
  test('the real app loads with no thrown errors and exposes its public functions', () => {
    assert.equal(run('typeof LEVELS'), 'object');
    assert.equal(run('LEVELS.length'), 20);
    assert.equal(run('typeof SOAR_ACTIVITIES'), 'object');
    assert.equal(run('typeof renderHome'), 'function');
    assert.equal(run('typeof checkAnswer'), 'function');
    assert.equal(run('typeof handleBack'), 'function');
  });

  test('home screen is active on boot and the back button is hidden there', () => {
    run('window.showHome()');
    assert.equal($('#homeScreen').classList.contains('active'), true);
    assert.equal(getComputedStyle($('#topStripBack')).visibility, 'hidden');
  });
});

suite('integration — navigation (rail/top-strip back + nav tabs)', () => {
  test('showPracticeMenu renders this racer\'s lane and reveals the back button', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); window.showPracticeMenu(); })()`);
    assert.equal($('#practiceMenuScreen').classList.contains('active'), true);
    assert.equal($$('#levelsGrid > *').length, 8, 'Safia\'s lane is levels 1-8');
    assert.equal(getComputedStyle($('#topStripBack')).visibility, 'visible');
    assert.equal($('.nav-item--active').dataset.tab, 'levels');
  });

  test('every screen maps to the correct back target and nav tab', () => {
    const cases = [
      ['practiceMenuScreen', 'homeScreen', 'levels'],
      ['soarMenuScreen', 'homeScreen', 'soar'],
      ['quizScreen', 'practiceMenuScreen', 'levels'],
      ['resultScreen', 'practiceMenuScreen', 'levels'],
    ];
    cases.forEach(([from, expectedBack, expectedTab]) => {
      run(`showScreen('${from}')`);
      assert.equal($('.nav-item--active')?.dataset.tab, expectedTab, `${from}: wrong active nav tab`);
      run('handleBack()');
      assert.equal(appDoc().querySelector('.screen.active').id, expectedBack, `${from}: back() went to the wrong screen`);
    });
  });

  test('soarActivityScreen backs to soarMenuScreen', () => {
    run(`(function(){ showSoarActivity(0); })()`);
    assert.equal(appDoc().querySelector('.screen.active').id, 'soarActivityScreen');
    run('handleBack()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'soarMenuScreen');
  });
});

suite('integration — quiz flow: numeric question', () => {
  test('starting a numeric level renders a numeric answer input', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'carry_add'); startLevel(l); })()`);
    assert.equal($('#quizScreen').classList.contains('active'), true);
    assert.equal(run('kindOf(questions[0])'), 'numeric');
    assert.ok($('#answerInput'));
  });

  test('a correct answer shows positive feedback, increments score, and advances Check→Next', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'carry_add'); startLevel(l); })()`);
    const answer = run('questions[0].answer');
    run(`document.getElementById('answerInput').value = '${answer}'`);
    run('checkAnswer()');
    assert.equal($('#feedback').classList.contains('ok'), true);
    assert.equal(run('score'), 1);
    assert.equal(getComputedStyle($('#checkButton')).display, 'none');
    assert.equal(getComputedStyle($('#nextButton')).display, 'block');
  });

  test('a wrong answer shows negative feedback, increments wrong count, and resets the streak', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'carry_add'); startLevel(l); currentStreak = 3; })()`);
    const answer = run('questions[0].answer');
    run(`document.getElementById('answerInput').value = '${answer + 999}'`);
    run('checkAnswer()');
    assert.equal($('#feedback').classList.contains('bad'), true);
    assert.equal(run('wrong'), 1);
    assert.equal(run('currentStreak'), 0);
  });

  test('nextQuestion advances qIndex, and finishing the last question shows the result screen', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'carry_add'); startLevel(l); questions = questions.slice(0, 1); qIndex = 0; })()`);
    const answer = run('questions[0].answer');
    run(`document.getElementById('answerInput').value = '${answer}'`);
    run('checkAnswer()');
    run('nextQuestion()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'resultScreen');
  });
});

suite('integration — quiz flow: the other 4 question kinds render their real markup', () => {
  test('fact_family renders 4 rows of 3 inputs and colors each row independently on check', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'fact_family'); startLevel(l); })()`);
    assert.equal(run('kindOf(questions[0])'), 'fact_family');
    assert.equal($$('.fact-input').length, 12);
    // Fill row 1 correctly, rows 2-4 wrong — verifies per-row (not all-or-nothing) coloring.
    const q = JSON.parse(run('JSON.stringify(questions[0])'));
    run(`document.getElementById('f1a').value='${q.a}'`);
    run(`document.getElementById('f1b').value='${q.b}'`);
    run(`document.getElementById('f1c').value='${q.total}'`);
    ['f2a', 'f2b', 'f2c', 'f3a', 'f3b', 'f3c', 'f4a', 'f4b', 'f4c'].forEach(id => run(`document.getElementById('${id}').value='0'`));
    run('checkAnswer()');
    assert.equal($('#f1a').classList.contains('correct'), true, 'row 1 (correct) should be marked correct');
    assert.equal($('#f2a').classList.contains('wrong'), true, 'row 2 (wrong) should be marked wrong');
  });

  test('multiple_choice renders one button per choice and marks the clicked one on check', () => {
    // eqCompare() has 4 random branches and only 3 are multiple_choice (compare_double is
    // numeric) — keep re-rolling question 0 until it lands on one, same reasoning as the
    // coin_picker test below for eqMoney().
    run(`(function(){
      const l = LEVELS.find(l => l.id === 'compare_numbers'); startLevel(l);
      let guard = 0;
      while (kindOf(questions[0]) !== 'multiple_choice' && guard++ < 100) { questions[0] = eqCompare(); }
      renderQuestion();
    })()`);
    assert.equal(run('kindOf(questions[0])'), 'multiple_choice');
    const choiceCount = run('questions[0].choices.length');
    assert.equal($$('.mc-choice').length, choiceCount);
    $('.mc-choice').click();
    run('checkAnswer()');
    const cls = $('.mc-choice').className;
    assert.ok(cls.includes('correct') || cls.includes('wrong'), 'clicked choice should be marked correct or wrong');
  });

  test('coin_picker renders one button per coin and the running total updates as coins are tapped', () => {
    // eqMoney() has 3 random branches and only one (money_make) is coin_picker —
    // start the level, then keep re-rolling question 0 until we land on it, so this
    // test exercises the real render pipeline rather than a hand-built question.
    run(`(function(){
      const l = LEVELS.find(l => l.id === 'money');
      startLevel(l);
      let guard = 0;
      while (kindOf(questions[0]) !== 'coin_picker' && guard++ < 100) { questions[0] = eqMoney(); }
      renderQuestion();
    })()`);
    assert.equal(run('kindOf(questions[0])'), 'coin_picker');
    const coinCount = run('questions[0].coins.length');
    assert.equal($$('.coin-btn').length, coinCount);
    $('.coin-btn').click();
    assert.ok($('#coinTotal').textContent.includes('¢') || $('#coinTotal').textContent.includes('$'));
  });

  test('compose_pair renders 2 rows of 2 inputs', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'compose_add'); startLevel(l); })()`);
    assert.equal(run('kindOf(questions[0])'), 'compose_pair');
    assert.equal($$('.compose-input').length, 4);
  });
});

suite('integration — level completion, trophies, and daily bonus', () => {
  test('passing a level (>=70%) marks it completed and persists to localStorage', () => {
    // showResults() computes pct as score/questions.length (NOT score/(score+wrong)) —
    // trim questions to exactly 10 so a synthetic score=9,wrong=1 means an exact 90%.
    run(`(function(){
      activeRacer = 'safia'; loadRacerState();
      progress.carry_add = { completed: false, score: 0 };
      const l = LEVELS.find(l => l.id === 'carry_add');
      startLevel(l);
      questions = questions.slice(0, 10);
      score = 9; wrong = 1; qIndex = questions.length;
      showResults();
    })()`);
    assert.equal(appDoc().querySelector('.screen.active').id, 'resultScreen');
    const saved = JSON.parse(run("localStorage.getItem(nk('mathdojo-progress'))"));
    assert.equal(saved.carry_add.completed, true);
    assert.equal(saved.carry_add.score, 90);
  });

  test('unlocking several trophies in one jump queues them instead of dropping all but one', async () => {
    run(`(function(){ trophyData = {}; totalStarsEarned = 0; pendingMilestones.length = 0; document.getElementById('milestoneOverlay').classList.remove('show'); })()`);
    // 0 -> 20 stars satisfies first_correct(>=1), five_stars(>=5), ten_stars(>=10), twenty_stars(>=20) all at once.
    run('checkTrophies(0, 20, progress)');
    assert.equal($('#milestoneOverlay').classList.contains('show'), true, 'first milestone should show immediately');
    assert.ok(run('pendingMilestones.length') >= 3, 'the other simultaneously-unlocked trophies should be queued, not dropped');
    const queueLenBefore = run('pendingMilestones.length');
    run('closeMilestone()');
    await sleep(500); // closeMilestone drains the queue after its 400ms close animation
    assert.equal($('#milestoneOverlay').classList.contains('show'), true, 'next queued milestone should show after closing the first');
    assert.equal(run('pendingMilestones.length'), queueLenBefore - 1);
  });

  test('claiming the daily bonus adds 3 stars and records today\'s date', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); localStorage.removeItem(nk('mathdojo-lastbonus')); })()`);
    run('checkDailyBonus()');
    assert.ok($('.daily-claim'), 'daily bonus claim button should render when unclaimed');
    const before = run('totalStarsEarned');
    run('claimDaily()');
    assert.equal(run('totalStarsEarned'), before + 3);
    assert.equal(run("localStorage.getItem(nk('mathdojo-lastbonus'))"), new Date().toDateString());
    assert.equal($('#topStripStars').textContent, '★ ' + (before + 3));
  });
});

suite('integration — SOAR activities', () => {
  test('showSoarMenu renders only the active racer\'s age band, no sticky headers', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); })()`);
    const expected = run("SOAR_ACTIVITIES.filter(a=>a.age===RACERS.safia.band).length");
    run('showSoarMenu()');
    assert.equal($$('.soar-level-btn').length, expected);
    assert.equal($$('.age-group-header').length, 0, 'sticky age-band headers were dropped in the redesign');
  });

  test('marking an activity done persists it and shows a done marker back on the menu', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); soarProgress = {}; })()`);
    const idx = run("SOAR_ACTIVITIES.findIndex(a=>a.age===RACERS.safia.band)");
    run(`(function(){ showSoarActivity(${idx}); markDone(${idx}); })()`);
    assert.equal(run(`soarProgress[${idx}]`), true);
    const saved = JSON.parse(run("localStorage.getItem(nk('mathdojo-soar'))"));
    assert.equal(saved[String(idx)], true);
    run('showSoarMenu()');
    assert.match($$('.soar-title')[0].textContent, '✅');
  });

  test('unmarking an activity removes the done marker', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); })()`);
    const idx = run("SOAR_ACTIVITIES.findIndex(a=>a.age===RACERS.safia.band)");
    run(`(function(){ showSoarActivity(${idx}); unmarkDone(${idx}); showSoarMenu(); })()`);
    assert.equal(run(`soarProgress[${idx}]`), false);
    assert.ok(!$$('.soar-title')[0].textContent.includes('✅'));
  });
});

suite('integration — badges', () => {
  test('checkBadges flips a badge true once its condition is met and shows it earned on the Trophies screen', () => {
    run(`(function(){
      progress = {}; LEVELS.forEach(l => progress[l.id] = { completed: false, score: 0 });
      progress.counting = { completed: true, score: 100 };
      checkBadges();
      showTrophies();
    })()`);
    assert.equal(run('badges.counting'), true);
    const idx = run("BADGES_DEF.findIndex(b=>b.key==='counting')");
    assert.equal($$('#badgesGrid .trophy-tile')[idx].classList.contains('trophy-tile--earned'), true);
  });
});

suite('integration — save/load', () => {
  test('buildSaveBundle includes progress, SOAR completion, trophies, badges and total stars', () => {
    const bundle = JSON.parse(run('JSON.stringify(buildSaveBundle())'));
    assert.equal(bundle.version, 2);
    ['safia', 'safaan'].forEach(id => assert.ok(id in bundle.racers, `save bundle missing racer "${id}"`));
    ['progress', 'soarProgress', 'trophyData', 'badges', 'totalStarsEarned'].forEach(k => {
      assert.ok(k in bundle.racers[bundle.activeRacer], `save bundle missing "${k}"`);
    });
  });

  test('handleLoadFile merges a full versioned bundle across all 5 fields', async () => {
    // handleLoadFile's final render sweep calls checkBadges(), which recomputes
    // `badges` from `progress` (BADGES_DEF's checks), overwriting whatever was
    // merged from data.badges — so progress.counting must itself satisfy the
    // 'counting' badge's check(progress) for the badges.counting assertion
    // below to hold, independent of whatever any other test left behind.
    const bundleJson = run(`
      JSON.stringify({version:1, progress:{money:{completed:true,score:100},counting:{completed:true,score:100}}, soarProgress:{9:true},
        trophyData:{first_correct:true}, badges:{counting:true}, totalStarsEarned:77})
    `);
    run(`(function(){
      progress = {}; soarProgress = {}; trophyData = {}; badges = {}; totalStarsEarned = 0;
      const file = new File([${JSON.stringify(bundleJson)}], 'save.json', {type:'application/json'});
      handleLoadFile({target:{files:[file]}});
    })()`);
    await sleep(200); // FileReader.onload is async
    assert.equal(run('progress.money.completed'), true);
    assert.equal(run('soarProgress[9]'), true);
    assert.equal(run('trophyData.first_correct'), true);
    assert.equal(run('badges.counting'), true);
    assert.equal(run('totalStarsEarned'), 77);
  });

  test('handleLoadFile treats a legacy bare-progress file as progress-only, without throwing', async () => {
    run(`(function(){
      progress = {}; totalStarsEarned = 42;
      const legacy = JSON.stringify({carry_add:{completed:true,score:80}});
      const file = new File([legacy], 'old-save.json', {type:'application/json'});
      handleLoadFile({target:{files:[file]}});
    })()`);
    await sleep(200);
    assert.equal(run('progress.carry_add.completed'), true);
    assert.equal(run('totalStarsEarned'), 42, 'legacy load must not touch totalStarsEarned');
  });

  test('buildSaveBundle includes all 6 Mental Math Gym fields, tensRecord, and gymSpeedRound/gymDaily, for BOTH racers', () => {
    const bundle = JSON.parse(run('JSON.stringify(buildSaveBundle())'));
    ['mmCards', 'mmMisses', 'mmBest', 'mmSets', 'mmSession', 'mmSheet', 'tensRecord', 'gymSpeedRound', 'gymDaily'].forEach(k => {
      assert.ok(k in bundle.racers.safia, `safia bundle missing "${k}"`);
      assert.ok(k in bundle.racers.safaan, `safaan bundle missing "${k}"`);
    });
  });

  test('handleLoadFile (v2): writes each racer to its own keys and reloads live state for the active one only', async () => {
    run(`(function(){ activeRacer = 'safia'; loadRacerState(); })()`);
    const emptyGym = `mmCards:{},mmMisses:{},mmBest:null,mmSets:[],mmSession:0,mmSheet:{key:null,daily:{done:0,correct:0},column:{done:0,correct:0}},tensRecord:{key:null,done:0,correct:0,log:[]},gymSpeedRound:true,gymDaily:{key:null,done:0,correct:0}`;
    const bundleJson = run(`
      JSON.stringify({version:2, activeRacer:'safia', racers:{
        safia:{progress:{money:{completed:true,score:100}}, soarProgress:{}, trophyData:{}, badges:{}, totalStarsEarned:11, ${emptyGym}},
        safaan:{progress:{carry_add:{completed:true,score:80}}, soarProgress:{}, trophyData:{}, badges:{}, totalStarsEarned:22, ${emptyGym}}
      }})
    `);
    run(`(function(){
      const file = new File([${JSON.stringify(bundleJson)}], 'save.json', {type:'application/json'});
      handleLoadFile({target:{files:[file]}});
    })()`);
    await sleep(200);
    assert.equal(run('progress.money.completed'), true, 'active racer (safia) live state should reload from the loaded file');
    assert.equal(run('totalStarsEarned'), 11);
    const safaanStars = run("parseInt(localStorage.getItem(nkFor('mathdojo-stars','safaan')),10)");
    assert.equal(safaanStars, 22, 'the other racer\'s data is written to storage too, even though it is not currently active');
  });

  test('handleLoadFile merges gymSpeedRound and gymDaily, each individually guarded', async () => {
    const bundleJson = run(`
      JSON.stringify({version:1, progress:{}, soarProgress:{}, trophyData:{}, badges:{}, totalStarsEarned:0,
        gymSpeedRound:false, gymDaily:{key:'x',done:9,correct:7}})
    `);
    run(`(function(){
      gymSpeedRound = true; gymDaily = {key:null,done:0,correct:0};
      const file = new File([${JSON.stringify(bundleJson)}], 'save.json', {type:'application/json'});
      handleLoadFile({target:{files:[file]}});
    })()`);
    await sleep(200);
    assert.equal(run('gymSpeedRound'), false);
    assert.equal(run('gymDaily.done'), 9);
    assert.equal(run('gymDaily.correct'), 7);
  });
});

suite('integration — Mental Math Gym: navigation', () => {
  test('every Gym screen maps to the correct back target and QuickNav tab', () => {
    // gymScreen's own back button is history-stack driven (see gymBack()), so
    // reset the gym's internal nav state first — it is not part of the DOM
    // snapshot showScreen() alone would give us, and other tests in this file
    // share one long-lived iframe.
    run(`(function(){ gymNav='hub'; gymHistory=[]; })()`);
    const cases = [
      ['gymScreen', 'homeScreen'], ['drillScreen', 'gymScreen'],
      ['dailyScreen', 'gymScreen'], ['columnScreen', 'gymScreen'],
      ['gymResultScreen', 'gymScreen'], ['sheetResultScreen', 'gymScreen'],
    ];
    cases.forEach(([from, expectedBack]) => {
      run(`showScreen('${from}')`);
      assert.equal($('.nav-item--active')?.dataset.tab, 'gym', `${from}: wrong active nav tab`);
      run('handleBack()');
      assert.equal(appDoc().querySelector('.screen.active').id, expectedBack, `${from}: back() went to the wrong screen`);
    });
  });

  test('the Home screen has a Gym tile that opens the hub', () => {
    run(`(function(){ progress = {}; LEVELS.forEach(l => progress[l.id] = {completed:false, score:0}); window.showHome(); })()`);
    assert.ok($('#destTiles'), 'expected the Home destination tiles to render');
    run('showGym()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'gymScreen');
  });

  test('the hub\'s own back button is hidden at the root and appears once nested, and gymBack() pops the history stack', () => {
    run('showGym()');
    assert.equal(getComputedStyle($('#gymContent .gym-back')).visibility, 'hidden', 'hub root: own back button should be hidden');
    run(`gymOpen('trick')`);
    assert.equal($('#gymContent .gym-back').style.visibility, '', 'nested screen: own back button should be visible (no forced hidden style)');
    run('gymBack()');
    assert.equal(run('gymNav'), 'hub', 'gymBack() from a nested screen with empty history should return to hub');
  });
});

suite('integration — Mental Math Gym hub redesign', () => {
  test('Gym hub renders 3 featured cards, a Random mix row, and the 11-set chip picker', () => {
    run('showGym()');
    assert.equal($$('.gym-card').length, 3);
    assert.equal($$('.gym-random-row').length, 1);
    assert.equal($$('.chip').length, 11);
  });

  test('toggling a chip changes the Daily assignment breakdown shown on its detail screen', () => {
    run(`(function(){ mmSets=['add20','sub20']; persistMM(); showGym(); })()`);
    run(`gymOpen('daily')`);
    assert.equal($$('.gym-set-row').length, 2, 'expected one row per picked set');
    const firstCount = $('.gym-set-row__count').textContent;
    run('gymBack()'); // back to hub
    run(`gymToggleChip('bridge')`); // now 3 sets picked
    run(`gymOpen('daily')`);
    assert.equal($$('.gym-set-row').length, 3, 'adding a set should add a row');
    assert.ok($('.gym-set-row__count').textContent !== firstCount, 'the per-set problem count should change when the set count changes');
  });

  test('an empty selection dims and disables the Start button instead of allowing an empty run', () => {
    run(`(function(){ mmSets=['add20']; persistMM(); showGym(); gymOpen('daily'); gymToggleChip('add20'); })()`);
    assert.equal(run('mmSets.length'), 0);
    run('renderGymNav()');
    const btn = [...appDoc().querySelectorAll('#gymContent button')].find(b => /Start daily assignment/.test(b.textContent));
    assert.ok(btn.disabled, 'Start button should be disabled with nothing picked');
    run('gymStartPlay(\'daily\')');
    assert.equal(run('gymNav'), 'daily', 'gymStartPlay must not navigate when no set is picked');
  });

  test('the speed round toggle flips gymSpeedRound without opening the Daily assignment card', () => {
    run(`(function(){ mmSets=['add20']; gymSpeedRound=true; persistGym(); showGym(); })()`);
    // a real dispatched click, so the toggle's own stopPropagation() has a bubble to stop
    run(`document.querySelector('.gym-speed-toggle').click()`);
    assert.equal(run('gymSpeedRound'), false);
    assert.equal(run('gymNav'), 'hub', 'clicking the speed toggle must not open the Daily assignment card');
  });

  test('Daily assignment: playing through to done awards a completion and returns via Done', () => {
    run(`(function(){ mmSets=['add20','sub20']; gymSpeedRound=false; gymDaily={key:todayKey(),done:0,correct:0}; showGym(); gymStartPlay('daily'); })()`);
    assert.equal(run('gymPlay.queue.length'), 16);
    for (let i = 0; i < 16; i++) {
      const answer = run('gymPlay.queue[gymPlay.idx].answer');
      run(`gymSetPlayInput('${answer}')`);
      run('gymCheckPlay()');
      run('gymNextPlay()');
    }
    assert.equal(run('gymPlay.done'), true);
    assert.equal(run('gymPlay.score'), 16);
    assert.equal(run('gymDaily.done'), 16);
    run('gymFinishPlay()');
    assert.equal(run('gymNav'), 'hub');
  });

  test('Random mix pulls 12 problems and a wrong answer still advances via Next', () => {
    run(`(function(){ mmSets=['tensOnes','carry']; showGym(); gymStartPlay('random'); })()`);
    assert.equal(run('gymPlay.queue.length'), 12);
    run(`gymSetPlayInput('-99999')`);
    run('gymCheckPlay()');
    assert.equal(run('gymPlay.feedback.ok'), false);
    run('gymNextPlay()');
    assert.equal(run('gymPlay.idx'), 1);
  });

  test('Learn a trick: shows an intro card until Start is tapped, then stacks every step; a wrong answer does not advance', () => {
    run(`(function(){ gymTrick=null; showGym(); gymOpen('trick'); })()`);
    assert.ok(/Start/.test($('#gymContent').textContent), 'expected the intro card before Start is tapped');
    run('gymStartTrick()');
    const stepCount = run('trainerSteps(gymTrick.f).length');
    assert.equal(run('gymTrick.doneSteps.length'), 0);
    run(`gymPressTrickKey('9');gymPressTrickKey('9');gymPressTrickKey('9')`); // near-certainly wrong
    run('gymCommitTrickStep()');
    assert.equal(run('gymTrick.doneSteps.length'), 0, 'a wrong answer must not advance to the next step');
    assert.equal(run('gymTrick.wrongFlash'), true);
    const correct = run('trainerSteps(gymTrick.f)[0].answer');
    run(`(function(){ gymTrick.entry='${correct}'; })()`);
    run('gymCommitTrickStep()');
    assert.equal(run('gymTrick.doneSteps.length'), 1);
    assert.equal(run('gymTrick.wrongFlash'), false);
    if (stepCount === 1) assert.equal(run('gymTrick.done'), true);
  });

  test('Flash cards: a fresh deck is capped at 5 cards, and grading updates the Leitner box', () => {
    run(`(function(){ mmSets=['add20','sub20','doubles']; showGym(); gymOpen('flash'); gymStartFlash(); })()`);
    assert.ok(run('gymFlash.cards.length') <= 5);
    run('gymFlipFlash()');
    assert.equal(run('gymFlash.flipped'), true);
    const cardId = run('gymFlash.cards[gymFlash.idx].id');
    run('gymGradeFlash(true)');
    const box = run(`mmCards[${JSON.stringify(cardId)}] ? mmCards[${JSON.stringify(cardId)}].box : -1`);
    assert.ok(box >= 1, 'grading "Got it" should advance the card\'s Leitner box');
  });

  test('Grown-up summary is reached from the hub footer and reuses the tens strategy tally', () => {
    run('showGym()');
    run('gymOpen(\'summary\')');
    assert.equal(appDoc().querySelector('.screen.active').id, 'gymScreen');
    assert.ok(/Grown-up summary/.test($('#gymContent').textContent));
    assert.equal($$('#gymContent .progress-bar--thin').length, 5, 'expected one row per tens strategy');
  });
});

suite('integration — Mental Math Gym: dormant screens (unlinked from the hub, still fully functional)', () => {
  test('Speed drill: answering a keypad question correctly increments the score', () => {
    run(`(function(){ mmSets=[...ALL_SET_IDS]; mmMisses={}; startDrill(); })()`);
    // force question 0 (never the every-3rd multiple-choice slot) so a keypad exists
    assert.equal(run('mmIdx'), 0);
    const answer = run('mmQueue[0].answer');
    run(`submitDrillAnswer('${answer}')`);
    assert.equal(run('mmScore'), 1);
    // scoped to #drillContent: the static quiz screen also has a class="feedback" div
    // in the DOM at all times, so a bare .feedback selector would match the wrong one.
    assert.equal($('#drillContent .feedback').classList.contains('ok'), true);
  });

  test("Today's sheet: submitting the first problem's correct answer marks it solved", () => {
    run('startDaily()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'dailyScreen');
    const answer = run('mmSheetItems[mmSheetIdx].answer');
    run(`mmEntry='${answer}'; submitDaily();`);
    assert.equal(run('mmSheetSolved'), true);
    assert.equal($('#dailyContent .feedback').classList.contains('ok'), true);
  });

  test('Carry & borrow: submitting the first guided step (numeric or yes/no) advances mmPlanStep', () => {
    run('startColumn()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'columnScreen');
    const kind = run('mmPlan.steps[0].kind');
    if (kind === 'yesno') {
      const answer = run('mmPlan.steps[0].answer');
      run(`answerColumnYesNo('${answer}')`);
    } else {
      const answer = run('mmPlan.steps[0].answer');
      run(`mmEntry='${answer}'; submitColumn();`);
    }
    assert.equal(run('mmPlanStep'), 1);
  });
});

suite('integration — Tens & Ones: play one problem of each strategy', () => {
  function solveTensStep(idx) {
    run(`loadTensProblem(${idx})`);
    const steps = JSON.parse(run('JSON.stringify(currentTensSteps())'));
    steps.forEach(st => {
      if (st.kind === 'yesno') run(`answerTensYesNo('${st.answer}')`);
      else run(`mmEntry='${st.answer}'; submitTensKeypad();`);
    });
  }

  test('startTens opens the tens screen with the first (split) problem', () => {
    run('startTens()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'tensScreen');
    assert.equal(run('tensItems[0].strategy'), 'split');
  });

  test('split: submitting every step in order solves the problem', () => {
    solveTensStep(0);
    assert.equal(run('tensItems[tensIdx].strategy'), 'split');
    assert.equal(run('tensSolved'), true);
    assert.equal($('#tensContent .feedback').classList.contains('ok'), true);
  });

  test('blocks (no regroup): the keypad is available immediately and solving works', () => {
    run('loadTensProblem(1)');
    assert.equal(run('tensItems[tensIdx].strategy'), 'blocks');
    assert.equal(run('tensBlocks.gate'), true, 'no regroup needed => no trade gate');
    solveTensStep(1);
    assert.equal(run('tensSolved'), true);
  });

  test('blocks (with regroup): the keypad is gated until tradeTensBlocks runs', () => {
    run('loadTensProblem(4)');
    assert.equal(run('tensItems[tensIdx].strategy'), 'blocks');
    assert.equal(run('tensItems[tensIdx].regroup'), true);
    assert.equal(run('tensBlocks.gate'), false, 'regroup needed => gated before the trade');
    assert.equal($$('#tensContent .keypad').length, 0, 'keypad should be hidden before the trade');
    run('tradeTensBlocks()');
    assert.equal(run('tensBlocks.gate'), true, 'gate should open after trading ten cubes for a rod');
    solveTensStep(4);
    assert.equal(run('tensSolved'), true);
  });

  test('number line: submitting both jumps solves the problem', () => {
    solveTensStep(3);
    assert.equal(run('tensItems[tensIdx].strategy'), 'line');
    assert.equal(run('tensSolved'), true);
  });

  test('round and adjust (compensate): submitting both steps solves the problem', () => {
    solveTensStep(5);
    assert.equal(run('tensItems[tensIdx].strategy'), 'compensate');
    assert.equal(run('tensSolved'), true);
  });

  test('column method (addition with carry): submitting both steps solves the problem', () => {
    solveTensStep(8);
    assert.equal(run('tensItems[tensIdx].strategy'), 'column');
    assert.equal(run('tensItems[tensIdx].op'), '+');
    assert.equal(run('tensSolved'), true);
  });

  test('column method (subtraction with borrow): a wrong yes/no answer marks the run unclean, the correct one still solves it', () => {
    run('loadTensProblem(11)');
    assert.equal(run('tensItems[tensIdx].strategy'), 'column');
    assert.equal(run('tensItems[tensIdx].op'), '-');
    const correct = run('currentTensSteps()[0].answer');
    const wrong = correct === 'yes' ? 'no' : 'yes';
    run(`answerTensYesNo('${wrong}')`);
    assert.equal(run('tensClean'), false, 'a wrong first guess should mark the attempt unclean');
    run(`answerTensYesNo('${correct}')`);
    const steps = JSON.parse(run('JSON.stringify(currentTensSteps())'));
    for (let i = 1; i < steps.length; i++) run(`mmEntry='${steps[i].answer}'; submitTensKeypad();`);
    assert.equal(run('tensSolved'), true);
  });

  test('nextTensProblem advances tensRecord.done and only counts a clean solve toward tensRecord.correct', () => {
    run(`(function(){ tensRecord={key:todayKey(),done:0,correct:0,log:[]}; persistTens(); loadTensProblem(0); })()`);
    solveTensStep(0);
    run('nextTensProblem()');
    assert.equal(run('tensRecord.done'), 1);
    assert.equal(run('tensRecord.correct'), 1);
  });

  test('finishing all 12 problems shows the result screen and the grown-up summary lists all 5 strategies', () => {
    run(`(function(){ tensRecord={key:todayKey(),done:0,correct:0,log:[]}; persistTens(); startTens(); })()`);
    for (let i = 0; i < 12; i++) {
      const steps = JSON.parse(run('JSON.stringify(currentTensSteps())'));
      steps.forEach(st => {
        if (st.kind === 'yesno') run(`answerTensYesNo('${st.answer}')`);
        else run(`mmEntry='${st.answer}'; submitTensKeypad();`);
      });
      run('nextTensProblem()');
    }
    assert.equal(run('tensView'), 'result');
    assert.equal(run('tensRecord.done'), 12);
    run('showTensReport()');
    assert.equal(run('tensView'), 'report');
    assert.equal($$('#tensContent .progress-bar--thin').length, 5, 'expected one row per strategy (split/blocks/line/compensate/column)');
  });
});

suite('integration — two racers: Levels/SOAR/stars/trophies/Gym scope independently', () => {
  test('swapping racers changes the Levels lane, the SOAR band, and stars, with no bleed between racers', () => {
    run(`(function(){
      activeRacer = 'safia'; loadRacerState();
      progress = {}; LEVELS.forEach(l => progress[l.id] = {completed:false, score:0});
      totalStarsEarned = 12; persistAll();
    })()`);
    assert.equal(run('laneLevels().length'), 8, 'Safia\'s lane is levels 1-8');
    assert.equal(run("RACERS[activeRacer].band"), '3-5');

    run('swapRacer()');
    assert.equal(run('activeRacer'), 'safaan');
    assert.equal(run('laneLevels().length'), 17, 'Safaan\'s lane is levels 4-20');
    assert.equal(run("RACERS[activeRacer].band"), '7-11');

    run(`(function(){ totalStarsEarned = 30; persistAll(); })()`);
    run('swapRacer()'); // back to safia
    assert.equal(run('activeRacer'), 'safia');
    assert.equal(run('totalStarsEarned'), 12, 'swapping back to Safia should restore exactly her own stars, not Safaan\'s 30');

    run('swapRacer()');
    assert.equal(run('totalStarsEarned'), 30, 'Safaan\'s 30 stars should still be there, undisturbed by Safia\'s session');
    run('swapRacer()'); // leave the shared iframe back on the default racer for later tests
  });

  test('the Gym\'s picked sets (mmSets) are also racer-scoped', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); mmSets=['add20']; persistMM(); })()`);
    run('swapRacer()');
    run(`(function(){ mmSets=['tensOnes','carry']; persistMM(); })()`);
    run('swapRacer()'); // back to safia
    assert.equal(run('JSON.stringify(mmSets)'), JSON.stringify(['add20']));
    run('swapRacer()');
    assert.equal(run('JSON.stringify(mmSets)'), JSON.stringify(['tensOnes','carry']));
    run('swapRacer()');
  });
});

suite('integration — Quiz: Chromebook keyboard play', () => {
  test('Enter checks the answer when unchecked, and advances to the next question when already checked', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'add_three'); startLevel(l); })()`);
    assert.equal(run('answered'), false);
    const answer = run('questions[qIndex].answer');
    run(`document.getElementById('answerInput').value = '${answer}'`);
    run(`window.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter'}))`);
    assert.equal(run('answered'), true, 'first Enter should check the answer');
    assert.equal($('#feedback').classList.contains('ok'), true);
    const qIndexBefore = run('qIndex');
    run(`window.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter'}))`);
    assert.equal(run('qIndex'), qIndexBefore + 1, 'second Enter should advance to the next question');
  });

  test('Enter does nothing outside the quiz screen', () => {
    run('showHome()');
    run(`window.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter'}))`); // must not throw
    assert.equal(appDoc().querySelector('.screen.active').id, 'homeScreen');
  });
});

suite('integration — Quiz: stepped hint panel', () => {
  test('a carry_add question gets an interactive column-method hint that steps without revealing the answer up front', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'carry_add'); startLevel(l); })()`);
    assert.ok(run('!!questions[qIndex].work'), 'carry_add questions should carry a work descriptor');
    run('showHint()');
    assert.equal($('#hintDisplay').classList.contains('show'), true);
    assert.match($('#hintDisplay').textContent, 'Step 1 of');
    const answer = run('questions[qIndex].answer');
    assert.ok(!$('#hintDisplay').textContent.includes(String(answer)) || String(answer).length < 2,
      'the answer should not already be on screen at step 1');
    run('hintStepNext()');
    assert.equal(run('hintStep'), 1);
    run('hintStepRestart()');
    assert.equal(run('hintStep'), 0);
  });

  test('a level with no arithmetic work descriptor falls back to the plain prose hint', () => {
    run(`(function(){ const l = LEVELS.find(l => l.id === 'money'); startLevel(l); })()`);
    assert.equal(run('!!questions[qIndex].work'), false, 'money questions carry no work descriptor');
    assert.ok(!$('#hintDisplay').textContent.includes('Step'), 'no stepper chrome for a plain-prose hint');
  });
});

suite('integration — Trophies screen', () => {
  test('renders all 16 trophies and all 10 badges as tiles, none earned yet', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); trophyData={}; badges={}; showTrophies(); })()`);
    assert.equal($('#trophiesScreen').classList.contains('active'), true);
    assert.equal($$('#trophiesGrid .trophy-tile').length, 16);
    assert.equal($$('#badgesGrid .trophy-tile').length, 10);
    assert.equal($$('#trophiesGrid .trophy-tile--earned').length, 0, 'nothing earned yet');
    assert.match($('#trophiesHeadingTitle').textContent, "Safia's trophy case");
  });

  test('an earned trophy shows its real icon instead of the lock, and the heading count updates', () => {
    run(`(function(){
      activeRacer='safia'; loadRacerState();
      trophyData={}; trophyData[TROPHIES[0].id]=true;
      showTrophies();
    })()`);
    const tile = $$('#trophiesGrid .trophy-tile')[0];
    assert.equal(tile.classList.contains('trophy-tile--earned'), true);
    assert.ok(!tile.textContent.includes('🔒'), 'an earned tile must not still show the lock icon');
    assert.match($('#trophiesHeadingSub').textContent, '1 of 16 earned');
  });

  test('nav tab is "trophies" while here, and back returns Home', () => {
    run('showTrophies()');
    assert.equal($('.nav-item--active')?.dataset.tab, 'trophies');
    run('handleBack()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'homeScreen');
  });
});

suite('integration — Grown-up summary (both racers, independent of which is active)', () => {
  test('shows one card per racer, each reflecting that racer\'s own stored stars — not the active racer\'s live state bleeding over', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); totalStarsEarned=9; persistAll(); })()`);
    run('swapRacer()');
    run(`(function(){ totalStarsEarned=21; persistAll(); })()`);
    run('swapRacer()'); // back to safia as the active racer
    run('showGrownup()');
    assert.equal($('#grownupScreen').classList.contains('active'), true);
    const cards = $$('.grownup-card');
    assert.equal(cards.length, 2, 'one card per racer, always both, regardless of which is active');
    const safiaCard = cards.find(c => c.textContent.includes('Safia'));
    const safaanCard = cards.find(c => c.textContent.includes('Safaan'));
    assert.ok(safiaCard && safaanCard, 'expected one card naming each racer');
    assert.match(safiaCard.textContent, '★ 9');
    assert.match(safaanCard.textContent, '★ 21');
  });

  test('Save/Load live in the footer here, and no nav tab lights up (it is a pinned rail link, not one of the 5 tabs)', () => {
    run('showGrownup()');
    assert.equal($$('.grownup-footer button').length, 2, 'expected exactly Save and Load');
    assert.equal($('.nav-item--active'), null, 'grownupScreen deliberately has no TAB_FOR_SCREEN entry');
    run('handleBack()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'homeScreen');
  });
});

suite('integration — racer chip click actually swaps (not just calling swapRacer() directly)', () => {
  test('clicking either the rail chip or the narrow top-strip chip fires the real onclick wiring', () => {
    run(`(function(){ activeRacer='safia'; loadRacerState(); showHome(); })()`);
    assert.match($('#railRacerChip').textContent, 'Safia');
    assert.match($('#topStripRacer').textContent, 'Safia');
    $('#railRacerChip').click();
    assert.equal(run('activeRacer'), 'safaan');
    assert.match($('#railRacerChip').textContent, 'Safaan');
    assert.match($('#topStripRacer').textContent, 'Safaan');
    $('#topStripRacer').click();
    assert.equal(run('activeRacer'), 'safia', 'the narrow chip must swap too, not just the rail one');
  });
});

suite('integration — status column visibility (wide-layout companion panel)', () => {
  test('#statusCol shows on Home/Levels/Trophies and hides on every other screen', () => {
    ['homeScreen', 'practiceMenuScreen', 'trophiesScreen'].forEach(id => {
      run(`showScreen('${id}')`);
      assert.ok($('#statusCol').style.display !== 'none', `${id}: status column should be visible`);
    });
    ['soarMenuScreen', 'quizScreen', 'resultScreen'].forEach(id => {
      run(`showScreen('${id}')`);
      assert.equal($('#statusCol').style.display, 'none', `${id}: status column should be hidden`);
    });
  });
});
