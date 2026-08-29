You are working in `shiblee86/Math-Practice`, a plain static site: `index.html`, `style.css`,
`mathdata.js` and `mentalmath.js` (content + pure logic), `script.js` (DOM/interaction). No build
step, no npm, no bundler, no `<script type="module">` — the app is also opened over `file://`, so
classic scripts and global declarations only. Keep that split: content and pure logic in the data
files, DOM code in `script.js`, tokens and component classes in `style.css`. Read `DESIGN.md`
before you start.

Redesign the **Mental Math Gym hub** (`renderGym()` in `script.js`, `#gymScreen` in `index.html`)
per `README.md` in this folder. Open `Mental Math Gym.dc.html` in a browser and click through it —
it is the source of truth for layout, colour, copy and interaction. It is a React-based prototype:
do not copy its code, recreate its behaviour in the repo's vanilla-JS patterns.

The short version of what changes:

1. Six equal tiles become **three featured cards** — Daily assignment, Learn a trick, Flash cards —
   as equal-width columns, plus a quieter neutral **Random mix** row beneath them.
2. **Tens & ones, Carry & borrow and Speed drill stop being top-level destinations.** They become
   problem sets feeding the Daily assignment; Speed drill survives as a "⚡ Speed round" toggle on
   the Daily assignment card.
3. **"Pick what to practise" must actually do something**: the chips filter which sets feed Daily
   assignment and Random mix, and the picked count and per-set problem breakdown are shown on both
   of those screens. Daily = 16 problems, Random = 12, split evenly across picked sets.
4. **Tile colours drop from six to three** (cyan / amber / coral) plus a neutral tier.
5. **Persistent back button** in the top bar, driven by a history stack; `visibility:hidden` (not
   `display:none`) when there is nothing to go back to.
6. **Learn a trick** keeps using the real `trainerFact()` / `trainerSteps()` from `mentalmath.js`,
   but: show **all** of a fact's steps stacked from the start (active one highlighted, future ones
   dimmed), enter answers on a **number keypad**, and **do not advance on a wrong answer** — clear
   the entry, show "Not quite — try again ✏️", stay on that step. Also apply the rewritten step
   copy in the README (the shipped "Split the 9 into 8 and" wording is being replaced — the copy
   must read plainly to a 7-year-old). Derive step text from the fact at render time; never store it.
7. **Flash cards**: cap every adding, taking-away and tens & ones fact at **30** — no number in the
   question and no answer above it. Enforce in the generator with a bounded retry, not by filtering
   afterwards.
8. Grown-up summary stays as a quiet footer button.

Visual rules: Turbo Math tokens only, no new colours. Keypad keys and answer tiles at least 52px
tall. Reuse the existing pressed-button mechanic (`box-shadow` + `translateY` on `:active`) for
every new pressable. Keep `race-bg.jpg` and its scrim behind the screens.

Copy rules: the audience is K–3 and the app doubles as reading practice. Short sentences, plain
words, no maths jargon. Instructions must name what the child sees on screen. If a step's wording
would confuse an adult reading it cold, it is wrong.

Persistence: keep using the existing `tm-mm-*` localStorage keys; include any new field in
`buildSaveBundle()` and `handleLoadFile`, each individually guarded like the existing ones.

Tests: follow the existing suite. Add unit tests for the flash-card 30 cap and for the trainer's
"wrong answer does not advance" rule, plus an integration test that toggles a chip and checks the
Daily assignment breakdown changes. `python3 tests/run.py` must pass.
