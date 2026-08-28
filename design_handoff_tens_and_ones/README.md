# Handoff: Tens & Ones — place-value add and subtract within 100

## Overview
A new **Tens & ones** section for the Mental Math Gym in `shiblee86/Math-Practice`, built to cover the school standard *"Applies place value understanding to add and subtract multi-digit numbers within 100."*

The point of the section is understanding, not procedure: 45 is 4 tens and 5 ones, and 45 + 32 can be solved by adding 40 + 30 and 5 + 2. Twelve problems per sheet, mixed regrouping and non-regrouping, both addition and subtraction, each problem taught through one of five strategies. A grown-up summary reports which strategies are clean and which are slipping.

## About the design files
The files in this bundle are **design references written in HTML** — a working prototype of the intended look and behaviour, not production code to paste in. The target codebase is the existing plain-static app (`index.html` + `style.css` + `mathdata.js` + `mentalmath.js` + `script.js`, no build step, no modules). Implement this section **in that app's own patterns**: pure content/logic in `mentalmath.js`, render/interaction in `script.js`, a new `<div id="tensScreen" class="screen"><div id="tensContent"></div></div>` in `index.html`, and no new CSS classes beyond the few listed under "New CSS" below.

The prototype is a Design Component (`.dc.html`) — a React-ish template plus a logic class. Read it for behaviour and copy; do not port its structure.

## Fidelity
**High fidelity.** Colours, type, spacing, and component structure come from the app's own `style.css` (the Turbo Math token set). Every screen in the prototype except the new section is a faithful recreation of `renderGym()` in `script.js`. Recreate the new section pixel-for-pixel using the existing classes.

## Screens / views

### 1. Gym hub (existing screen, one addition)
Recreated from `renderGym()` in `script.js`. Unchanged except:

- **New tile, first in the grid, full width** (`gym-tile gym-tile--cyan1 gym-tile--full`):
  - icon `🔟`
  - name `Tens & ones`
  - line `45 + 32 by splitting the tens from the ones.`
  - stat `0/12` (problems completed today, same pattern as `mmSheet.daily.done`)
  - onclick → `startTens()`
- **New fact-set chip** appended to the `FACT_SETS` chip row: `{ id: 'tensOnes', icon: '🏗️', label: 'Tens & ones', desc: 'Two-digit adding' }`. All nine existing chips stay in their current order; do not reuse the 🔟 icon (taken by `sameTens`).
- **New footer button** under the chip card: `btn btn--ghost`, full width, `👪 Grown-up summary` → `showTensReport()`.

### 2. Tens & ones player (new screen)
Purpose: work one problem at a time, filling one blank at a time on the app's keypad.

Layout, top to bottom, inside `.wrap`:

1. **Meta row** — `display:flex; justify-content:space-between; color:var(--text-secondary); font-size:.75rem; font-weight:800; margin-bottom:8px;`
   `🔟 Tens & ones` · group label (`Adding` / `Taking away`) · `3 / 12`
2. **Thin progress bar** — `progress-bar progress-bar--thin`, fill `progress-bar__fill`, width = `idx / 12 * 100`%, `margin-bottom:12px`
3. **Question card** — `content-card content-card--quiz`
   - `.q-type-badge` with the strategy name, uppercase: `SPLIT THE TENS AND ONES`, `BUILD IT WITH BLOCKS`, `JUMP ALONG THE NUMBER LINE`, `ROUND AND ADJUST`, `COLUMN METHOD`
   - `.question-text` at `font-size:2.2rem; margin-bottom:6px` — e.g. `22 + 45` (minus sign is U+2212 `−`, as in `mentalmath.js`)
   - Sub-line, centred, `color:var(--text-muted); font-size:.8rem; font-weight:800; margin-bottom:12px` — `This one needs a trade` or `No trading needed`
   - **Strategy visual** (see below) — only for blocks / number line / column
   - **Step rows** — one `.trainer-step` per step, exactly the existing markup: `.trainer-step__text` + `.trainer-step__slot`. Done rows get `is-done`, the current row `is-current`. A step's text is masked to `Next step…` until it is reached (otherwise later steps give away earlier answers). Slot content: the answer if done, the live keypad entry (or `?`) if current, `·` if not yet reached.
   - **Feedback** — `.feedback show ok|bad`, `margin-top:12px`
   - **Keypad** — `.keypad-display` + the standard `mmKeypadHtml()` 3×4 grid, reused verbatim
   - **Yes/No row** for the column method's first step — `btn-row` with `btn btn--primary` "Yes" and `btn btn--accent` "No" (same as `answerColumnYesNo`)
   - **Solved block** — centred `font-family:var(--font-display); font-size:1.15rem; color:var(--cyan-300)` line `So 22 + 45 = 67.`, then a `color:var(--text-secondary); font-size:.95rem; font-weight:700` teaching note, then a full-width `btn btn--reward` `Next ▶`
4. **Pause** — full-width `btn btn--ghost`, `Pause sheet` → `showGym()`

#### Strategy visuals

**Base-ten blocks** — panel `background:var(--surface-2); border:2px solid var(--border-strong); border-radius:var(--radius-md); padding:12px; margin-bottom:12px`.
- Header row: `TENS` left, `ONES` right, `color:var(--text-muted); font-size:.68rem; font-weight:800`
- Rods: `width:16px; height:76px; border-radius:4px; border:2px solid var(--cyan-300); background:var(--cyan-600)`, containing 10 pips (`width:8px; height:4px; background:rgba(8,23,22,.45); border-radius:1px`, `justify-content:space-evenly`). Wrapped in a `flex-wrap` row, `gap:5px`, `max-width:60%`.
- Cubes: `width:16px; height:16px; border-radius:3px; border:2px solid var(--amber-300); background:var(--amber-500)`, `flex-wrap` row, `gap:5px`, `flex:1`.
- Footer row: tally text (`font-family:var(--font-display); color:var(--cyan-300); font-size:1.05rem`) on the left, action button (`btn btn--reward`, `padding:10px 14px; font-size:.85rem`) on the right.
- Hint line under it: `color:var(--text-secondary); font-size:.85rem; font-weight:700; margin-top:8px`.

**Number line** — same panel chrome, `padding:18px 14px 12px`. A `position:relative; height:82px` box with a `3px` `var(--border-strong)` rule at `top:38px`. Three stops, absolutely positioned by value (`left = 6 + (v − min)/(max − min) × 88`%, `translateX(-50%)`): start in `--cyan-300`, midpoint in `--amber-400`, final in `--color-success`; each is a display-font label over a `3px × 16px` tick. Unreached stops show `?`. Hop labels (`+30`, `+2` / `−10`, `−4`) sit at `top:48px`, centred between the stops they span, `color:var(--coral-400)`, display font, `.95rem`.

**Column method** — the existing `.column-math` grid from `style.css`, identical to `renderColumnStep()`: carry / crossed-out ten above, `__op` in coral, `__rule`, results in `__result` cyan. Reveals are driven per step exactly like `columnPlan()`'s `reveal` keys.

### 3. Result screen
`result-card` with `border-color:var(--cyan-500); box-shadow:0 0 32px rgba(23,199,199,.2)`; `🔟` emoji, title `Tens & ones done`, score `9/12` in display font `1.8rem` amber, a `result-message`, then a `btn-row`: `Do it again` (primary), `Grown-up summary` (accent), `Gym` (ghost). Score counts **clean** solves only — problems finished with no wrong step.

### 4. Grown-up summary
Header: `👪`, `Grown-up summary` in display font `1.5rem` cyan, sub-line `Applies place value to add and subtract within 100.`

- **By strategy** card (`content-card`): one row per strategy — name left, `2/3 clean` right, and a `progress-bar progress-bar--thin` below. Fill colour: `var(--color-success)` ≥75%, `var(--amber-400)` ≥40%, `var(--coral-400)` below, `var(--text-muted)` if unattempted.
- **Where the steps break down** (`pattern-section`): `.pattern-tag` chips per strategy with slips; `high` modifier when nothing was clean. Falls back to `No slips yet`.
- Closing note, then a full-width `btn btn--ghost` `Back to the gym`.

## Interactions & behaviour
- Keypad max 3 digits; `✓` submits the current step; `⌫` deletes.
- Wrong step → entry clears, `.feedback bad` shows `Not that one — it is N.`, the problem is marked not-clean, the step stays current. The correct answer is told, never hidden (matches the existing trainer).
- Right step → the row locks to `is-done`, the next row becomes current, any column-method reveal is drawn.
- Last step → solved state, teaching note, `Next ▶`.
- **Blocks (addition)**: the mat opens with the two numbers already combined (rods = tens of both, cubes = ones of both). If there are ≥10 loose cubes the keypad is hidden and a `Trade 10 ones → 1 ten` button appears; pressing it removes 10 cubes and adds a rod. Only then do the three blanks (tens, ones, total) unlock. The tally text reads `Count them yourself` until the counting blanks are done, then shows `6 tens · 5 ones`.
- **Blocks (subtraction)**: the mat shows the first number only. Tapping a rod removes ten, tapping a cube removes one. The single blank unlocks when exactly `b` has been removed; while anything is removed, a `Put them all back` button resets the mat.
- **Column method**: subtraction opens with the yes/no question `Is 4 big enough to take 7 away?`, exactly as `columnPlan()` does today.
- Reuse the existing confetti call on a clean solve (`launchConfetti(20)`) and `+3★` on sheet completion, matching `nextSheetItem()`.
- No animations beyond those already in `style.css` (`cardSlide`, `popIn`, the button press transform).

## State management
Mirror the existing Gym state style — module-level globals in `script.js`, persistence in `localStorage` under a `tm-` key.

```
tensItems      // the 12 generated problems for today (seeded by date, like dailySheet)
tensIdx        // current problem index
tensStep       // current step index within the problem
tensEntry      // keypad buffer (string)
tensFeedback   // {ok, msg} | null
tensSolved     // current problem finished
tensClean      // no wrong step on the current problem
tensCorrect    // count of clean solves this sheet
tensLog        // [{strategy, ok}] — drives the grown-up summary
tensBlocks     // {tens, ones, removedTens, removedOnes, gateOpen} for the blocks strategies
tensDraw       // {carry, tensNew, onesNew, resTens, resOnes} for the column drawing
```

Persist `{ key: todayKey(), done, correct, log }` under `tm-mm-tens` so the sheet resumes mid-way like `mmSheet` does, and so the summary survives a reload.

### Content generation (belongs in `mentalmath.js`)
Seeded from the date, same `seedFrom`/`seeded` helpers already there, so the sheet is stable across a day.

Fixed plan of 12 — `[op, strategy, needsRegrouping]`:
```
+ split      no      + blocks     no      − split      no
− line       no      + blocks     yes     + compensate no
+ split      no      + line       yes     + column     yes
− blocks     no      − compensate no      − column     yes
```
Number ranges: addends `a` = 20–59, `b` = 10–49, all sums under 100; subtraction `a` = 40–99 with `b` at least two tens smaller. Regrouping problems force ones that cross ten (addition) or a smaller top ones digit (subtraction). Compensation problems always give `b` a ones digit of 9.

Steps per strategy (a10/a1 = tens/ones of `a`):
- **split**: `45 is 40 and how many ones?` → `32 is 30 and how many ones?` → `Now the tens: 40 + 30` → `Now the ones: 5 + 2` → `Put them back together: 70 + 7`
- **line**: `Start at 57 and jump 1 ten back. Where do you land?` → `Now 4 little hops back. Where do you finish?`
- **compensate**: `39 is one away from 40. What is 77 − 40?` → `You took one too many away. Put 1 back on 37`
- **blocks (+)**: `Count the ten-rods. How many tens?` → `Count the loose cubes. How many ones?` → `6 tens and 5 ones makes`
- **blocks (−)**: `Count what is left on the mat.`
- **column**: identical to `columnPlan()` in `mentalmath.js` today, including the yes/no borrow question and the `reveal` payloads.

Teaching notes on the solved state:
- split — `45 is 40 and 5. 32 is 30 and 2. Do the tens, do the ones, put them back together.`
- line — `Big jumps of ten first, then the little ones. Same answer, less counting.`
- compensate — `Round to the friendly ten, then fix it by one.`
- blocks with a trade — `Ten loose cubes always trade for one rod. That is what carrying means.`
- blocks without — `The rods are tens. The cubes are ones.`
- column + — `The carried 1 is a whole ten moving over.`
- column − — `Borrowing breaks one ten into ten ones.`

## Design tokens
All already defined at the top of `style.css` — use the variables, never literals:

`--teal-950 #081716` · `--teal-900 #0A1F1F` (app bg) · `--teal-850 #0D2828` (surface-1) · `--teal-800 #123636` (surface-2) · `--teal-700 #1B4747` (border-subtle) · `--teal-600 #275C5C` (border-strong)
`--cyan-600 #0EA3A3` · `--cyan-500 #17C7C7` (primary) · `--cyan-400 #3DDCDC` · `--cyan-300 #7EEAEA` · `--cyan-200 #B8F5F5`
`--coral-600 #E6432E` · `--coral-500 #FF5C3D` (accent) · `--coral-400 #FF8563` · `--amber-500 #FFB020` (reward) · `--amber-400 #FFC94D` · `--amber-300 #FFDE8C`
`--mint-500 #2FE6A7` (success) · `--red-500 #FF3B3B` (error)
`--ink-000 #F4FBFB` (text) · `--ink-300 #A9C4C4` (secondary) · `--ink-500 #6E8C8C` (muted)

Spacing `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40`. Radius `sm 8 · md 14 · lg 20 · xl 28 · pill 999`. Button shadows `0 5px 0 <hue-600>`, collapsing to `0 2px 0` with `translateY(3px)` on press. Easing `--ease-snap cubic-bezier(.34,1.56,.64,1)`, `--ease-out cubic-bezier(.16,1,.3,1)`. Type: `Lilita One` display, `Nunito Sans` body.

### New CSS
None required for the step rows, keypad, column drawing, chips, tiles, progress bars, feedback, or result card — all exist. The only genuinely new visuals are the base-ten blocks and the number line, and both are built from inline styles listed above. If you prefer classes, add `.blocks-mat`, `.block-rod`, `.block-cube`, `.numberline` to `style.css` using those exact values.

## Assets
No new assets. Emoji only (`🔟 🏗️ 👪 🧠 📋 🧮 ⏱️ 🃏 🌉`), consistent with the app's emoji-as-iconography approach. Background photo `race-bg.jpg` is the existing one.

## Files in this bundle
- `Tens and Ones.dc.html` — the interactive prototype (Gym hub, player with all five strategies, result, grown-up summary). Open it in a browser; it needs `support.js` and `style.css` beside it.
- `support.js` — runtime for the prototype only. Not part of the app.
- `style.css` — copied verbatim from the repo at `main`, for reference and so the prototype renders.
- `race-bg.jpg` — copied verbatim from the repo.

## Where it lands in the repo
| Change | File |
| --- | --- |
| `tensScreen` / `tensContent` markup, quick-nav mapping | `index.html` |
| Problem generation, step plans, teaching notes | `mentalmath.js` |
| `startTens`, `renderTensProblem`, `submitTens`, block handlers, `showTensReport` | `script.js` |
| Gym tile, new chip, summary button | `script.js` (`renderGym`) |
| Screen title, `TAB_FOR_SCREEN` entry | `script.js` (`SCREEN_TITLES`) |
| Unit tests for the generator, integration test for one problem of each strategy | `tests/unit-mentalmath.test.js`, `tests/integration.test.js` |

## Still open
Two placements the customer asked for that are **not** in this prototype:
1. A block of 4 tens-and-ones problems inside **Today's Sheet** (`dailySheet()` in `mentalmath.js`).
2. A **Practice Math level** using the same generator (`mathdata.js` level list).
Both should reuse the generator from this section rather than duplicating it.
