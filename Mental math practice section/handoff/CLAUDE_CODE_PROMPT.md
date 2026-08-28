# Claude Code prompt — Mental Math Gym

Paste everything below the line into Claude Code, run from the root of a clone of
`shiblee86/Math-Practice` with this handoff folder available.

---

You are working in `shiblee86/Math-Practice`, a plain static site: `index.html`, `style.css`,
`mathdata.js` (content + pure logic), `script.js` (DOM/interaction). No build step, no npm, no
bundler, no `<script type="module">` — the app is also opened over `file://`, so classic scripts
and global declarations only. Keep that split: content and pure logic in data files, DOM code in
`script.js`, tokens and component classes in `style.css`. Read `DESIGN.md` before you start.

Add a **Mental Math Gym** section for a 7-year-old who is slow at mental arithmetic (12 − 5,
17 − 8, 11 + 7) and at missing-number problems (17 − ? = 10, ? + 5 = 9).

## Files in this handoff

- `mentalmath.js` — the complete engine, already converted to a classic script. Copy it to the
  repo root as-is and load it in `index.html` **after** `mathdata.js` and **before** `script.js`.
  It defines, in global scope: `FACT_SETS`, `SET_LABEL`, `ALL_SET_IDS`, `randFact`, `buildDrill`,
  `choicesFor`, `strategyFor`, `trainerFact`, `trainerSteps`, `gradeCard`, `dueCards`, `flashDeck`,
  `mastery`, `weakFacts`, `todayKey`, `dailySheet`, `dailyHint`, `columnSheet`, `columnPlan`.
- `Safia's & Safaan's Math Dojo.dc.html` — the interactive design reference. Open it in a browser
  and click through the Gym; it is the source of truth for layout, colour, copy and interaction.
  It is a React-based prototype — do not copy its code, recreate its behaviour in the repo's
  vanilla-JS patterns.
- `race-bg.jpg` — the app background image.

## What to build

Five sections, reached from a new 🧠 **Gym** tab in the bottom QuickNav and a Gym card on Home.
The Gym hub is a single grid of five tiles (icon, name, one short line, one stat), one colour each:

| Tile | Colour token | Stat shown |
| --- | --- | --- |
| 📋 Today's sheet | `--color-success` | `n/16` done today |
| 🧮 Carry & borrow | `--amber-400` | `n/12` done today |
| ⏱️ Speed drill | `--cyan-300` | best time |
| 🃏 Flash cards | `--coral-400` | mastery % |
| 🌉 Learn a trick | `--cyan-200` | facts to fix |

Each section's screen repeats its own colour on the card's top border and progress bar. Do not
add a stats row, a separate "practice these" panel, or any other duplicate of these numbers.

**1. Today's sheet** — `dailySheet(todayKey())` returns 16 problems, seeded by date so the same
day always gives the same sheet: 4 additions, 4 subtractions, 4 market bills (buy 2–3 items at
listed prices, "how much do you owe the shopkeeper?"), 4 change-back problems (hand over a $10 or
$20 note). Big keypad input. A wrong answer shows the answer plus `dailyHint(problem)`.

**2. Carry & borrow** — `columnSheet(todayKey())` returns 12 two-digit problems (3 add, 3 subtract,
3 market bills, 3 money-left). `columnPlan(problem)` returns the guided steps. This one is taught,
not just marked — render a real column sum and update the drawing as each step is answered:

- Addition: "Add the ones: 4 + 8" → the 2 drops under the ones and the carried 1 appears above the
  tens → "Now the tens, and don't forget the 1 you carried: 1 + 3 + 2".
- Subtraction: opens with a Yes/No step, "Is 3 big enough to take 4 away?" → answering No strikes
  through the tens digit, writes the reduced digit above it and 13 above the ones → "Borrowed a
  ten. Now do 13 − 4" → "The 3 became 2. Now 2 − 2" → closes with "So 33 − 24 = 9."

**3. Speed drill** — `buildDrill(20, sets, misses)`. Count-up clock, no fail state, no cutoff. A
second grey bar is a ghost of her own best run at the same elapsed time. Input alternates keypad
and multiple choice (`choicesFor`). Streak dots. Result screen: time, correct, seconds per fact,
new-best flag, and up to 5 missed facts with their strategy names.

**4. Flash cards** — `flashDeck(cards, session, sets, 12)`. Tap to flip; the back shows the answer
plus the strategy name and line from `strategyFor`. "Got it" / "Tricky" grade through `gradeCard`
(Leitner boxes, gaps 0/1/2/4/8 sessions).

**5. Learn a trick** — `trainerFact()` + `trainerSteps(fact)`. One blank at a time, keypad input,
each solved step turning green. After 3 clean solves the scaffold fades: all steps → last two →
answer only. Covers bridging ten, missing numbers, same tens, count up, count on.

## Adaptivity

Every missed fact increments a counter keyed by fact id in `localStorage`; correct answers
decrement it. `buildDrill` weights fact sets by those misses, and the Learn a trick tile shows the
count. Wire this to the vestigial `mistakePatterns` / "🎯 Practice These" code in `script.js` or
delete that dead code — do not leave both.

## Persistence

New `localStorage` keys, alongside the existing `mathdojo-*` set:
`tm-mm-cards`, `tm-mm-misses`, `tm-mm-best`, `tm-mm-sets`, `tm-mm-session`,
`tm-mm-sheet` (`{key: <date string>, daily: {done, correct}, column: {done, correct}}` — sheets are
resumable and reset on a new date). Include them in `buildSaveBundle()` and `handleLoadFile`,
each field individually guarded like the existing ones.

## Visual

Turbo Math tokens only — no new colours. `race-bg.jpg` is a fixed, cover-sized background on the
body with a dark scrim (`linear-gradient(180deg, rgba(8,23,22,.62), rgba(8,23,22,.88))`) so cards
stay readable. Keypad keys and answer tiles are at least 52px tall. Reuse the existing pressed-
button mechanic (`box-shadow` + `translateY` on `:active`) for every new pressable.

## Copy rules

The audience is K–3 and the app doubles as reading practice. Short sentences, plain words, no
maths jargon: no "cancel", no "difference of", no "compose". Say "take away", "hop up", "count on",
"number family". Instructions must name what she sees on screen — "Rows 1 and 2: make a plus fact.
Rows 3 and 4: make a take-away fact", not "fill in all four facts". This handoff already contains
the corrected wording for the existing fact-family and paired-number questions in the level
content; apply the same standard to anything you add.

## Tests

Follow the existing suite. Add unit tests for `mentalmath.js` (sheet sizes 16 and 12, same date
gives the same sheet, `columnPlan` step answers reconstruct the right result for both carry and
borrow, every generated fact's `answer` matches its `display`) and an integration test that plays
one problem in each of the five sections. `python3 tests/run.py` must pass.
