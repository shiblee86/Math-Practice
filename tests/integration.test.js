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
    assert.equal(getComputedStyle($('#topBarBack')).visibility, 'hidden');
  });
});

suite('integration — navigation (TopBar back button + QuickNav)', () => {
  test('showPracticeMenu renders all 20 level tiles and reveals the back button', () => {
    run('window.showPracticeMenu()');
    assert.equal($('#practiceMenuScreen').classList.contains('active'), true);
    assert.equal($$('#levelsGrid > *').length, 20);
    assert.equal(getComputedStyle($('#topBarBack')).visibility, 'visible');
    assert.equal($('.quicknav__tab--active').dataset.tab, 'levels');
  });

  test('every screen maps to the correct back target and QuickNav tab', () => {
    const cases = [
      ['practiceMenuScreen', 'homeScreen', 'levels'],
      ['soarMenuScreen', 'homeScreen', 'soar'],
      ['quizScreen', 'practiceMenuScreen', 'levels'],
      ['resultScreen', 'practiceMenuScreen', 'levels'],
    ];
    cases.forEach(([from, expectedBack, expectedTab]) => {
      run(`showScreen('${from}')`);
      assert.equal($('.quicknav__tab--active')?.dataset.tab, expectedTab, `${from}: wrong active QuickNav tab`);
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
      progress.carry_add = { completed: false, score: 0 };
      const l = LEVELS.find(l => l.id === 'carry_add');
      startLevel(l);
      questions = questions.slice(0, 10);
      score = 9; wrong = 1; qIndex = questions.length;
      showResults();
    })()`);
    assert.equal(appDoc().querySelector('.screen.active').id, 'resultScreen');
    const saved = JSON.parse(run("localStorage.getItem('mathdojo-progress')"));
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
    run("localStorage.removeItem('mathdojo-lastbonus')");
    run('checkDailyBonus()');
    assert.ok($('.daily-claim'), 'daily bonus claim button should render when unclaimed');
    const before = run('totalStarsEarned');
    run('claimDaily()');
    assert.equal(run('totalStarsEarned'), before + 3);
    assert.equal(run("localStorage.getItem('mathdojo-lastbonus')"), new Date().toDateString());
    assert.equal($('#topBarStars').textContent, '★ ' + (before + 3));
  });
});

suite('integration — SOAR activities', () => {
  test('showSoarMenu renders 56 activities grouped under 5 age-band headers', () => {
    run('showSoarMenu()');
    assert.equal($$('.soar-level-btn').length, 56);
    assert.equal($$('.age-group-header').length, 5);
  });

  test('marking an activity done persists it and shows a done marker back on the menu', () => {
    run(`(function(){ soarProgress = {}; showSoarActivity(3); markDone(3); })()`);
    assert.equal(run('soarProgress[3]'), true);
    const saved = JSON.parse(run("localStorage.getItem('mathdojo-soar')"));
    assert.equal(saved['3'], true);
    run('showSoarMenu()');
    assert.match($$('.soar-title')[3].textContent, '✅');
  });

  test('unmarking an activity removes the done marker', () => {
    run(`(function(){ showSoarActivity(3); unmarkDone(3); showSoarMenu(); })()`);
    assert.equal(run('soarProgress[3]'), false);
    assert.ok(!$$('.soar-title')[3].textContent.includes('✅'));
  });
});

suite('integration — badges', () => {
  test('checkBadges flips a badge true once its condition is met and reflects it in the DOM', () => {
    run(`(function(){
      progress = {}; LEVELS.forEach(l => progress[l.id] = { completed: false, score: 0 });
      progress.counting = { completed: true, score: 100 };
      checkBadges();
    })()`);
    assert.equal(run('badges.counting'), true);
    assert.equal($('#badgeCounting').classList.contains('unlocked'), true);
  });
});

suite('integration — save/load', () => {
  test('buildSaveBundle includes progress, SOAR completion, trophies, badges and total stars', () => {
    const bundle = JSON.parse(run('JSON.stringify(buildSaveBundle())'));
    assert.equal(bundle.version, 1);
    ['progress', 'soarProgress', 'trophyData', 'badges', 'totalStarsEarned'].forEach(k => {
      assert.ok(k in bundle, `save bundle missing "${k}"`);
    });
  });

  test('handleLoadFile merges a full versioned bundle across all 5 fields', async () => {
    const bundleJson = run(`
      JSON.stringify({version:1, progress:{money:{completed:true,score:100}}, soarProgress:{9:true},
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

  test('buildSaveBundle includes all 6 Mental Math Gym fields alongside the original 5', () => {
    const bundle = JSON.parse(run('JSON.stringify(buildSaveBundle())'));
    ['mmCards', 'mmMisses', 'mmBest', 'mmSets', 'mmSession', 'mmSheet'].forEach(k => {
      assert.ok(k in bundle, `save bundle missing "${k}"`);
    });
  });
});

suite('integration — Mental Math Gym: navigation', () => {
  test('every Gym screen maps to the correct back target and QuickNav tab', () => {
    const cases = [
      ['gymScreen', 'homeScreen'], ['drillScreen', 'gymScreen'], ['flashScreen', 'gymScreen'],
      ['trainerScreen', 'gymScreen'], ['dailyScreen', 'gymScreen'], ['columnScreen', 'gymScreen'],
      ['gymResultScreen', 'gymScreen'], ['sheetResultScreen', 'gymScreen'],
    ];
    cases.forEach(([from, expectedBack]) => {
      run(`showScreen('${from}')`);
      assert.equal($('.quicknav__tab--active')?.dataset.tab, 'gym', `${from}: wrong active QuickNav tab`);
      run('handleBack()');
      assert.equal(appDoc().querySelector('.screen.active').id, expectedBack, `${from}: back() went to the wrong screen`);
    });
  });

  test('the Home screen has a Gym card that opens the hub', () => {
    run(`(function(){ progress = {}; LEVELS.forEach(l => progress[l.id] = {completed:false, score:0}); window.showHome(); })()`);
    assert.ok($('#gymHomeStat'), 'expected a Gym stat element on Home');
    run('showGym()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'gymScreen');
  });
});

suite('integration — Mental Math Gym: play one problem in each section', () => {
  test('Gym hub renders 6 tiles (including Tens & Ones) and the fact-set chip picker', () => {
    run('showGym()');
    assert.equal($$('.gym-tile').length, 6);
    assert.ok($$('.chip').length > 0);
  });

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

  test('Flash cards: flipping and grading a card updates mmCards', () => {
    run('startFlash()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'flashScreen');
    run('flipFlashCard()');
    assert.equal(run('mmFlipped'), true);
    const cardId = run('mmDeck[mmIdx].id');
    run('gradeFlashCard(true)');
    const box = run(`mmCards[${JSON.stringify(cardId)}] ? mmCards[${JSON.stringify(cardId)}].box : -1`);
    assert.ok(box >= 1, 'grading "Got it" should advance the card\'s Leitner box');
  });

  test('Learn a trick: submitting the first step\'s correct answer advances mmStep', () => {
    run('startTrainer()');
    assert.equal(appDoc().querySelector('.screen.active').id, 'trainerScreen');
    const before = run('mmStep');
    const answer = run('mmSteps[mmStep].answer');
    run(`mmEntry='${answer}'; submitTrainerStep();`);
    assert.ok(run('mmStep') > before || run('mmTrainerDone') === true);
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
