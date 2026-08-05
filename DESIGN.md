# Design Doc — Safia's & Safaan's Math Dojo

## What this is

A browser-based math practice app for two kids (Safia & Safaan): 20 practice levels with auto-generated questions across 5 input types, 56 real-world "SOAR" activities (sourced from NRICH), trophies/badges/streaks/daily bonus for motivation, and a save/load system for progress. Visually it follows the "Turbo Math Design System" — dark teal/graphite surfaces, cyan/coral/amber accents, a racing/dojo motif, and a "pressed game button" interaction language throughout.

It began as "Safia's Math Kingdom" (hot-pink/purple, princess-themed) and was reskinned and restructured into its current form. Where that history matters to a design decision, it's called out below.

## Architecture

**No build step, no bundler, no npm.** Four plain files, loaded as classic (non-module) `<script>` tags, in this order:

```
index.html          screen markup, persistent TopBar + QuickNav chrome
style.css           Turbo Math design tokens + component classes + layout
mathdata.js         content & pure logic: levels, SOAR activities, hints, trophies, badges
script.js           interaction/render/animation layer that drives the DOM
```

This split is deliberate: `mathdata.js` has zero DOM dependencies (you could run it in Node or a test page with no scaffolding — see [Testing](#testing)), while `script.js` is 100% DOM/interaction code that assumes it's running inside the real `index.html`. Content edits (add a level, tweak a hint, add a SOAR activity) touch only `mathdata.js`; interaction/visual changes touch only `script.js`/`style.css`.

**Why no ES modules:** the app is opened directly via `file://` in addition to being served statically (e.g. GitHub Pages), and `<script type="module">` imports are blocked by CORS under `file://` in Chrome. So `mathdata.js` exposes everything as plain top-level `function`/`const` declarations in global scope rather than `export`s, and `script.js` just uses those names directly — both files share one script realm, in the same way two classic `<script>` tags on one page always have (this matters for how the test suite reaches into that scope — see below).

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

Six screens (`<div class="screen">` with a `.active` toggle): `homeScreen → practiceMenuScreen/soarMenuScreen → soarActivityScreen/quizScreen → resultScreen`. `showScreen(id)` toggles the `.active` class and updates two pieces of persistent chrome shared across all screens (not duplicated per-screen):

```js
const BACK_TARGET     = { practiceMenuScreen: 'homeScreen', soarMenuScreen: 'homeScreen',
                           soarActivityScreen: 'soarMenuScreen', quizScreen: 'practiceMenuScreen',
                           resultScreen: 'practiceMenuScreen' };
const TAB_FOR_SCREEN  = { homeScreen: 'home', practiceMenuScreen: 'levels', soarMenuScreen: 'soar',
                           soarActivityScreen: 'soar', quizScreen: 'levels', resultScreen: 'levels' };
```

`handleBack()` looks up the current screen in `BACK_TARGET` (no history stack needed — the hierarchy is fixed and shallow); the back button itself is `visibility:hidden` (not `display:none`, so layout doesn't shift) whenever the active screen is `homeScreen`. `setActiveQuickNavTab()` does the analogous thing for the bottom QuickNav's Home/SOAR/Levels tabs.

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

## Game feel: streaks, trophies, badges, confetti

- **Streak**: increments on each correct answer, resets on any wrong answer. Drives the streak-dot row, a floating "🔥 N in a row!" badge (shown once streak ≥ 2), and confetti volume.
- **Trophies** (`TROPHIES` in `mathdata.js`, 16 entries): each has a `check(newStarTotal, progress) → boolean`, called after every scoring event. `pendingMilestones` is a real queue — `showMilestone()` pushes, `showNextMilestone()` shifts and displays one at a time via the modal, `closeMilestone()` drains the next after its close animation. This matters because a single scoring event can satisfy several trophy thresholds simultaneously (e.g. going from 0→20 stars in one jump trips `first_correct`, `five_stars`, `ten_stars`, and `twenty_stars` all at once) — the queue is what stops all but one from being silently dropped.
- **Badges** (`BADGES_DEF`, 10 entries): simpler derived-from-`progress` checks (e.g. "complete both `time` and `calendar`"), recomputed wholesale by `checkBadges()` after anything that could affect them.
- **Daily bonus**: one `+3` star claim per calendar day, gated by comparing `new Date().toDateString()` against the last-claimed date in `localStorage`.
- **Confetti**: canvas-based (`launchConfetti(n)` + `requestAnimationFrame` loop), not DOM-node-per-particle — cheaper for the larger bursts (level completion, trophy unlock).

## Persistence

All state lives in `localStorage` under a `mathdojo-` prefix: `progress`, `soar`, `trophies`, `badges`, `stars`, `lastbonus`, `mistakes`. `persistAll()` writes the first five in one call and is used anywhere more than one of them can change together (finishing a level, completing a SOAR activity, loading a save file).

**Save/Load** exports/imports *everything* (`buildSaveBundle()` → `{version, savedAt, progress, soarProgress, trophyData, badges, totalStarsEarned}`), not just level-completion progress. `handleLoadFile` branches on the presence of a `version` field: no `version` → treat the file as a legacy bare-`progress` object and merge it into `progress` only; otherwise pull each of the five fields independently (each individually `if`-guarded, so a hand-edited or partial file doesn't wipe fields it doesn't mention).

## Testing

See [`tests/`](tests/) and its own comments for specifics; the shape of the split:

- **Unit** (`tests/unit.test.js`) — `mathdata.js` alone, no DOM. The six SVG helpers it calls are stubbed with minimal same-signature stand-ins (real coverage of those lives in integration tests) so generator-structure assertions (question counts, valid `kind`, exactly-one-correct-choice, etc.) don't need the real app running.
- **Integration** (`tests/integration.test.js`) — the *real* `index.html`/`style.css`/`mathdata.js`/`script.js`, loaded in a same-origin iframe and driven like a player would: click through screens, answer all 5 question kinds, complete a level, complete a SOAR activity, save/load.
- **Regression** (`tests/regression.test.js`) — pins specific decisions and previously-fragile behaviors by name (the `mathdojo-*` key rename, the trophy milestone queue, per-row fact-family checking, the design tokens) so they can't silently drift back.

**Why integration/regression tests use `iframe.contentWindow.eval(...)` instead of `iframe.contentWindow.someGlobal`:** most app state (`progress`, `currentStreak`, `LEVELS`, `TROPHIES`, ...) is declared with top-level `let`/`const`. Unlike `var` or function declarations, `let`/`const` at script scope do **not** become properties of the `window` object — they're only visible to code evaluated *inside that same realm* (exactly like typing into that page's own DevTools console). `frame.contentWindow.eval(code)` runs as indirect eval in the iframe's global scope and *can* see those bindings; a plain property read from the parent can't. Calling an exported function (`appWin().startLevel(...)`) works fine either way since function declarations do attach to `window` — the tests just use `eval()` uniformly for consistency.

Run the suite by opening `tests/index.html` in any browser (zero dependencies), or headlessly via `python3 tests/run.py` (spawns its own static server + headless Chrome; needs `pip install websockets` for that one optional CLI wrapper only).

## Known quirks (intentionally left as-is)

- A handful of SOAR activities (`nim7`, `gotIt`) are authored with age band `"5-14"`, which isn't one of the 5 visual buckets `showSoarMenu()` groups by — they fall into the "5–11" bucket via that function's fallback. This is inherited from the original app, not a redesign regression, and is cheap enough (2 of 56 activities) not to be worth a data model change.
- `mistakePatterns`/`updateMistakePatternsDisplay()` and the Home screen's "🎯 Practice These" panel are wired up but nothing ever writes to `mistakePatterns` — it's vestigial from the original app (kept verbatim, since removing dead-but-harmless code was out of scope for the redesign).
