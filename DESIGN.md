# Design Doc — Safia's & Safaan's Math Dojo

## What this is

A browser-based math practice app for two kids (Safia & Safaan): 20 practice levels with auto-generated questions across 5 input types, 56 real-world "SOAR" activities (sourced from NRICH), a Mental Math Gym (speed drill, flash cards, a strategy coach, and two resumable daily practice sheets) for building fast mental arithmetic, trophies/badges/streaks/daily bonus for motivation, and a save/load system for progress. Visually it follows the "Turbo Math Design System" — dark teal/graphite surfaces, cyan/coral/amber accents, a racing/dojo motif, a fixed race-photo background, and a "pressed game button" interaction language throughout.

It began as "Safia's Math Kingdom" (hot-pink/purple, princess-themed) and was reskinned and restructured into its current form. Where that history matters to a design decision, it's called out below.

## Architecture

**No build step, no bundler, no npm.** Five plain files, loaded as classic (non-module) `<script>` tags, in this order:

```
index.html          screen markup, persistent TopBar + QuickNav chrome
style.css           Turbo Math design tokens + component classes + layout
mathdata.js         content & pure logic: levels, SOAR activities, hints, trophies, badges
mentalmath.js       content & pure logic for the Mental Math Gym — same shape as mathdata.js, zero DOM
script.js           interaction/render/animation layer that drives the DOM
```

This split is deliberate: `mathdata.js`/`mentalmath.js` have zero DOM dependencies (you could run them in Node or a test page with no scaffolding — see [Testing](#testing)), while `script.js` is 100% DOM/interaction code that assumes it's running inside the real `index.html`. Content edits (add a level, tweak a hint, add a SOAR activity, add a fact-family set) touch only the data files; interaction/visual changes touch only `script.js`/`style.css`.

**Why no ES modules:** the app is opened directly via `file://` in addition to being served statically (e.g. GitHub Pages), and `<script type="module">` imports are blocked by CORS under `file://` in Chrome. So the data files expose everything as plain top-level `function`/`const` declarations in global scope rather than `export`s, and `script.js` just uses those names directly — all three files share one script realm, in the same way multiple classic `<script>` tags on one page always have (this matters for how the test suite reaches into that scope — see below). One consequence worth knowing: because `mathdata.js` and `mentalmath.js` share that one global scope, a same-named top-level declaration in both would be a hard parse-time collision, not a silent override — `mentalmath.js`'s own `pick()` helper was renamed `mmPick()` in this repo's copy for exactly that reason (`mathdata.js` already declares a `pick()`).

**Why one small exception lives in `script.js`, not `mathdata.js`:** six SVG/HTML render helpers (`clockFaceSvg`, `formatTime`, `pieSliceSvg`, `barChartHtml`, `shapeSvg`, `lengthBlocksHtml`) are called *by* `mathdata.js`'s question generators but are defined in `script.js`. They're pure presentation (building an inline `<svg>` string), not content, so they belong with the render layer — `mathdata.js` just calls them by name at question-generation time, which works because by the time a level actually runs, both scripts have already loaded.

## Turbo Math Design System

Tokens live at the top of `style.css`, split into three tiers:

1. **Base color scales** — `--teal-950..500`, `--cyan-600..200`, `--coral-600..300`, `--amber-600..300`, plus `--mint-*`/`--red-*` signal colors and `--ink-*` neutrals.
2. **Semantic aliases** — `--bg-app`, `--surface-1/2/raised`, `--text-primary/secondary/muted`, `--color-primary/accent/reward/success/error` (each with a `-hover`/`-press` variant), `--shadow-primary/accent/neutral/reward`. Everything else in the file references *these*, never the raw base scale — that's the seam to change if the palette ever needs adjusting.
3. **Spacing/radius/shadow/type scale** — `--space-1..18`, `--radius-sm/md/lg/xl/pill`, `--shadow-btn-sm/md/lg`, `--ease-snap` (bouncy, for celebratory motion) / `--ease-out` (press feedback), and the type scale (`--font-display` = Lilita One, `--font-body` = Nunito Sans).

**The "pressed game button" mechanic** is pure CSS, no JS:

```css
.btn { box-shadow: 0 5px 0 var(--shadow-neutral); transform: translateY(0);
       transition: transform .08s var(--ease-out), box-shadow .08s var(--ease-out); }
.btn:active { box-shadow: 0 2px 0 var(--shadow-neutral); transform: translateY(3px); }
```

Every pressable class (`.btn`, `.icon-btn`, `.mc-choice`, `.coin-btn`, `.level-tile`, `.menu-card`, `.soar-level-btn`) follows this shape, with the shadow color swapped per variant (`--shadow-primary`/`accent`/`reward`/`neutral`). This intentionally departs from the original React design spec, which tracked a `pressed` boolean in component state via `onMouseDown`/`onMouseUp` — that machinery exists there only because React needs explicit state to re-render. A plain DOM element doesn't: CSS `:active` already fires on press/release for both mouse and touch. The one cross-browser wrinkle is iOS Safari, which only honors `:active` on elements with a touch listener somewhere in the ancestor chain — fixed with a single global no-op listener in `script.js`:

```js
document.body.addEventListener('touchstart', () => {}, { passive: true });
```

## Screens & navigation

Fourteen screens (`<div class="screen">` with a `.active` toggle): the original six — `homeScreen → practiceMenuScreen/soarMenuScreen → soarActivityScreen/quizScreen → resultScreen` — plus eight Mental Math Gym screens (`gymScreen` and its seven children — see below). `showScreen(id)` toggles the `.active` class and updates two pieces of persistent chrome shared across all screens (not duplicated per-screen): the TopBar back button/title, and the bottom QuickNav's active tab (now Home/SOAR/Levels/Gym). `BACK_TARGET`, `TAB_FOR_SCREEN`, and `SCREEN_TITLES` are flat lookup maps keyed by screen id — every Gym child screen maps back to `gymScreen`, and `gymScreen` itself maps back to `homeScreen`, exactly like the original hierarchy's two levels.

`handleBack()` looks up the current screen in `BACK_TARGET` (no history stack needed — the hierarchy is fixed and shallow); the back button itself is `visibility:hidden` (not `display:none`, so layout doesn't shift) whenever the active screen is `homeScreen`. `setActiveQuickNavTab()` does the analogous thing for the bottom QuickNav's tabs. `showScreen()` is also the single hook point for tearing down the Speed Drill's live timers (see below) whenever navigation leaves `drillScreen` — every navigation path (back button, QuickNav tab, in-content "End workout" button) funnels through it, so the cleanup can't be missed by adding a new way to leave the screen later.

## Question engine

Every question object carries a `type` (specific, e.g. `carry_add`, `fraction_identify`) and either an explicit `kind` or one resolved via `KIND_BY_TYPE` fallback — `kindOf(q)` in `mathdata.js` is the single dispatch point. Five kinds exist, and `script.js`'s `QUESTION_TYPES` registry is the contract each must satisfy:

```js
QUESTION_TYPES[kind] = {
  inputHtml(q),   // returns the input markup to inject into the question card
  bindEnter(q),   // wires up click/Enter-to-submit handlers
  check(q)        // -> { status: 'empty'|'correct'|'wrong', message }
}
```

kinds: `numeric` (text input), `multiple_choice` (button grid), `coin_picker` (tap-to-select coins with a running total), `compose_pair` (two rows of two numbers), `fact_family` (four rows of `a op b = c`, checked and colored **per row independently** — not all-or-nothing — against the 4 canonical fact permutations of `a`, `b`, `total`).

`generateLevel(id)` → `buildLevel(eqFn, wordPool)` produces exactly 15 questions per level: 7 hinted + 3 unhinted auto-generated equations, then 2 hinted + 3 unhinted hand-written word problems (pulled and shuffled from that level's pool). Most `eqXxx()` generators pick randomly among 2–4 sub-type "flavors" each call (e.g. `eqCompare` rotates through symbol-comparison, true/false, doubles, and near-doubles) — this is where most of the content variety comes from, and it's also why several tests sample a generator many times (`for i in 0..N`) rather than asserting on a single call.

## Mental Math Gym

A separate practice mode for building *speed* at facts a level's untimed quiz doesn't push on. Reached via a Gym card on Home or the QuickNav's 🧠 tab. The hub (`renderGym()`) is a 5-tile grid, one color each, plus a picker of toggleable fact-set chips (`FACT_SETS` in `mentalmath.js` — add-to-20, take-away, bridging ten, doubles, make ten, nines, missing-number, times tables, same-tens) that filters every mode below:

- **Speed drill** (`startDrill()`) — a fixed-length `buildDrill(20, sets, misses)` queue, keypad entry except every 3rd question (`idx % 3 === 2`) which is multiple-choice via `choicesFor()`. No fail state, no time limit — just a live `setInterval` clock and a "ghost" bar showing where a personal-best run would be at the same elapsed time (a linear pace projection, `min(N, elapsed/(best.time/N))`, not a literal replay). Answering auto-advances after a fixed delay (550ms correct / 1400ms wrong) with no manual "Next" tap — the one place in the whole app with a live countdown-driven timer, which is why it's also the one screen `showScreen()` has a special cleanup hook for (`stopDrillTimers()` clears both the clock `setInterval` and the pending auto-advance `setTimeout`, called whenever navigation leaves `drillScreen` and at the moment a drill finishes).
- **Flash cards** (`startFlash()`) — a 12-card deck from `flashDeck()`, which spaced-repetition-prioritizes cards already due (via Leitner boxes: `gradeCard()` advances a card's box on "Got it", resets it to 0 on "Tricky", with gaps of 0/1/2/4/8 sessions before it comes due again) and backfills the rest with fresh random facts.
- **Learn a trick** (`startTrainer()`) — one `trainerFact()` at a time, walked through via `trainerSteps()`'s ordered `{text, answer}` blanks. A wrong step answer shows a coaching message and does not advance — the child re-tries the same blank. After 3 clean fact-completions in a row, the scaffold shrinks one level (all steps → last two → answer only) for future facts; the "clean streak" counter is session-only, not persisted.
- **Today's sheet** / **Carry & borrow** (`startDaily()`/`startColumn()`) — two resumable, date-seeded practice sheets (`dailySheet()`/`columnSheet()`, both deterministic per `todayKey()` so refreshing mid-sheet doesn't reshuffle it), sharing one `startSheet(kind)`/`nextSheetItem()` pair since their resumability/scoring bookkeeping is identical; only the per-problem renderer differs. **Carry & borrow** is the most visually distinct piece: `columnPlan(problem)` returns an ordered list of guided steps (a leading yes/no step for subtraction — "is the top ones digit big enough?" — then numeric entry steps), each carrying a `reveal` object whose keys (`carry`, `tensNew`/`onesNew`, `resTens`/`resOnes`) the renderer paints directly into a live column-arithmetic drawing (`.column-math`) as the child answers — the borrow/carry sequence isn't hardcoded in the renderer, it's read off whatever `reveal` keys that step happens to send.

Adaptivity is shared across drill and flash cards: every missed fact increments a `tm-mm-misses` counter keyed by fact id (`set:display`); a correct answer decrements it (deleted once it hits 0). `buildDrill()` weights its random draw toward fact *sets* with more misses, and the Home screen's "🎯 Practice These" panel (`renderWeakFactsPanel()`) surfaces the worst offenders via `weakFacts(misses, 6)` — this is the same `#patternSummary`/`#patternTags` panel the original app shipped with, just now actually wired up (see [Known quirks](#known-quirks) history below).

## Game feel: streaks, trophies, badges, confetti

- **Streak**: increments on each correct answer, resets on any wrong answer. Drives the streak-dot row, a floating "🔥 N in a row!" badge (shown once streak ≥ 2), and confetti volume.
- **Trophies** (`TROPHIES` in `mathdata.js`, 16 entries): each has a `check(newStarTotal, progress) → boolean`, called after every scoring event. `pendingMilestones` is a real queue — `showMilestone()` pushes, `showNextMilestone()` shifts and displays one at a time via the modal, `closeMilestone()` drains the next after its close animation. This matters because a single scoring event can satisfy several trophy thresholds simultaneously (e.g. going from 0→20 stars in one jump trips `first_correct`, `five_stars`, `ten_stars`, and `twenty_stars` all at once) — the queue is what stops all but one from being silently dropped.
- **Badges** (`BADGES_DEF`, 10 entries): simpler derived-from-`progress` checks (e.g. "complete both `time` and `calendar`"), recomputed wholesale by `checkBadges()` after anything that could affect them.
- **Daily bonus**: one `+3` star claim per calendar day, gated by comparing `new Date().toDateString()` against the last-claimed date in `localStorage`.
- **Confetti**: canvas-based (`launchConfetti(n)` + `requestAnimationFrame` loop), not DOM-node-per-particle — cheaper for the larger bursts (level completion, trophy unlock).

## Persistence

Core app state lives in `localStorage` under a `mathdojo-` prefix: `progress`, `soar`, `trophies`, `badges`, `stars`, `lastbonus`. `persistAll()` writes those five in one call and is used anywhere more than one of them can change together (finishing a level, completing a SOAR activity, loading a save file).

The Mental Math Gym uses its own prefix, `tm-mm-`, and its own `persistMM()` function: `cards` (Leitner boxes), `misses` (the adaptivity counter), `best` (drill personal-best `{time, score}`), `sets` (which fact sets are toggled on), `session` (a counter used to compute which flash cards are "due"), `sheet` (`{key: <today's date string>, daily:{done,correct}, column:{done,correct}}`, reset whenever `key` doesn't match today — that's what makes the two sheets resumable-but-daily). It's a separate function rather than folded into `persistAll()` on purpose: Gym state changes on nearly every keystroke/flip/answer, far more often than the five `mathdojo-*` fields (which only change at level/activity completion boundaries), and keeping them separate means a test asserting `persistAll()`'s exact field count doesn't have to know about the Gym at all.

**Save/Load** exports/imports *everything* (`buildSaveBundle()` → the five `mathdojo-*` fields plus the six Gym fields above), not just level-completion progress. `handleLoadFile` branches on the presence of a `version` field: no `version` → treat the file as a legacy bare-`progress` object and merge it into `progress` only; otherwise pull each field independently (each individually `if`-guarded, so a hand-edited or partial file doesn't wipe fields it doesn't mention), then flush both `persistAll()` and `persistMM()`.

## Testing

See [`tests/`](tests/) and its own comments for specifics; the shape of the split:

- **Unit** (`tests/unit.test.js`, `tests/unit-mentalmath.test.js`) — `mathdata.js` and `mentalmath.js` alone, no DOM. The six SVG helpers `mathdata.js` calls are stubbed with minimal same-signature stand-ins (real coverage of those lives in integration tests) so generator-structure assertions (question counts, valid `kind`, exactly-one-correct-choice, sheet sizes, date-seeded determinism, `columnPlan` step-answer reconstruction, etc.) don't need the real app running.
- **Integration** (`tests/integration.test.js`) — the *real* `index.html`/`style.css`/`mathdata.js`/`mentalmath.js`/`script.js`, loaded in a same-origin iframe and driven like a player would: click through screens, answer all 5 question kinds, complete a level, complete a SOAR activity, save/load, and play one problem through each of the 5 Gym sections.
- **Regression** (`tests/regression.test.js`) — pins specific decisions and previously-fragile behaviors by name (the `mathdojo-*` key rename, the trophy milestone queue, per-row fact-family checking, the design tokens) so they can't silently drift back.

**Why integration/regression tests use `iframe.contentWindow.eval(...)` instead of `iframe.contentWindow.someGlobal`:** most app state (`progress`, `currentStreak`, `LEVELS`, `TROPHIES`, ...) is declared with top-level `let`/`const`. Unlike `var` or function declarations, `let`/`const` at script scope do **not** become properties of the `window` object — they're only visible to code evaluated *inside that same realm* (exactly like typing into that page's own DevTools console). `frame.contentWindow.eval(code)` runs as indirect eval in the iframe's global scope and *can* see those bindings; a plain property read from the parent can't. Calling an exported function (`appWin().startLevel(...)`) works fine either way since function declarations do attach to `window` — the tests just use `eval()` uniformly for consistency.

Run the suite by opening `tests/index.html` in any browser (zero dependencies), or headlessly via `python3 tests/run.py` (spawns its own static server + headless Chrome; needs `pip install websockets` for that one optional CLI wrapper only).

## Known quirks (intentionally left as-is)

- A handful of SOAR activities (`nim7`, `gotIt`) are authored with age band `"5-14"`, which isn't one of the 5 visual buckets `showSoarMenu()` groups by — they fall into the "5–11" bucket via that function's fallback. This is inherited from the original app, not a redesign regression, and is cheap enough (2 of 56 activities) not to be worth a data model change.

## History: the retired `mistakePatterns` panel

Earlier versions of this app shipped a `mistakePatterns`/`updateMistakePatternsDisplay()` mechanism and a Home-screen "🎯 Practice These" panel that nothing ever actually wrote to — pure vestigial dead code from a prior iteration. When the Mental Math Gym's adaptivity tracking (`mmMisses`, keyed the same way — by fact id) needed a place to surface its weakest facts, that dead panel was the obvious real home for it rather than adding a second, competing "practice these" UI: `mistakePatterns` and `updateMistakePatternsDisplay()` were deleted outright, and `renderWeakFactsPanel()` now drives the exact same `#patternSummary`/`#patternTags` DOM slot and `.pattern-tag` CSS from `weakFacts(mmMisses, 6)` instead.
