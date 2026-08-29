# 🏁 Safia's & Safaan's Math Dojo

A browser-based math practice app for kids — 20 auto-generated practice levels, 56 real-world "SOAR" activities, a Mental Math Gym for building fast mental arithmetic, trophies/badges/streaks/daily bonus, and save/load progress. Built as a plain static site: no build step, no npm, no framework.

## Running it

Just open `index.html` in a browser — no server required. It also works served statically (e.g. GitHub Pages) or via any local static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## What's here

```
index.html      screen markup + persistent top bar / bottom nav
style.css       Turbo Math design tokens + component styles
mathdata.js     content & pure logic — levels, SOAR activities, hints, trophies, badges
mentalmath.js   content & pure logic for the Mental Math Gym
script.js       interaction/render/animation layer
race-bg.jpg     fixed background image
tests/          unit, integration, and regression test suites (see below)
DESIGN.md       architecture, design system, and testing-strategy write-up
```

For the "why" behind how these fit together (why there's no build step, why the SVG helpers live where they do, how the screen/navigation/persistence model works, the design token system), see **[DESIGN.md](DESIGN.md)**.

## Features

- **20 practice levels** (Counting through a mixed-review "Grand Finale"), each generating 15 fresh questions across 5 input types: numeric, multiple choice, coin picker, compose-pair, and fact family (with per-row right/wrong feedback).
- Rich, color-coded **hints** for every hinted question — worked examples for carrying/borrowing, fact-family relationships, money counting, and more.
- **56 SOAR activities** (age 3–14, sourced from NRICH) with instructions, an optional video/NRICH link, a hint, talk-starter questions, and completion tracking.
- **Mental Math Gym** — a hub built around three cards: **Daily assignment** (16 pooled number/word problems, plus an optional ⚡ speed round) and its **Random mix** counterpart (12 problems, a quieter secondary tile below the three cards), **Learn a trick** (a hard sum broken into stacked steps on a number keypad — get one wrong and it stays put until you get it right, no answer given away), and **Flash cards** (a fresh 5-card deck each time, graded with spaced-repetition Leitner boxes, every quick fact capped at 30 so nothing three-digit slips onto a flash card). An 11-set "Pick what to practise" chip picker actually drives what shows up in Daily/Random and Flash cards, and a quiet "👪 Grown-up summary" footer button shows which strategy needs another go. The hub has its own persistent back button and navigation history, separate from the rest of the app. Two richer, more specialized practice modes — a guided two-digit carry/borrow column sheet, and a **Tens & Ones** sheet teaching two-digit addition/subtraction through 5 hands-on strategies (base-ten blocks you trade by tapping, a number line, round-and-adjust, the column method) — aren't hub tiles anymore but are still fully built and tested; see [DESIGN.md](DESIGN.md#mental-math-gym) for how to reach them directly. Misses are tracked per fact and feed the Home screen's "🎯 Practice These" panel.
- **Streaks, 16 trophies, 10 badges, and a daily +3★ bonus** for motivation, with confetti and a milestone modal (unlocking several trophies at once queues them instead of dropping all but one).
- **Save / Load**: exports a full backup (level progress, SOAR completion, trophies, badges, total stars) as a downloadable JSON file; loading merges it back in, with backward-compatible support for older, progress-only save files.

## Testing

The suite is plain, dependency-free browser JavaScript — open **`tests/index.html`** in any browser to run it and see a pass/fail report. It's organized as:

- **Unit** — `mathdata.js` and `mentalmath.js`'s content and logic in isolation (levels, question generators, SOAR data, trophies/badges, Gym fact sets, daily/column sheet determinism).
- **Integration** — the real app, loaded in an iframe and driven like a player would (click through screens, answer every question kind, complete a level, complete a SOAR activity, save/load a file, exercise the Gym hub's chip picker/speed round/back-navigation and play both Daily assignment and Random mix to completion, and one problem of each Tens & Ones strategy).
- **Regression** — pins specific decisions and previously-fragile behaviors by name, so they can't silently drift back.

To run it from a terminal / CI instead of a browser tab:

```bash
pip install websockets   # only needed for this optional CLI wrapper
python3 tests/run.py
```

This spins up its own static server and headless Chrome instance, runs the full suite, prints a report, and exits non-zero on any failure. It never touches a real player's saved progress — it snapshots and restores the `mathdojo-*` `localStorage` keys around the run.

## Contributing notes

- No build step by design — don't introduce a bundler, `package.json`, or `<script type="module">` (the app is opened via `file://` in addition to being served, and ES module imports are blocked by CORS there).
- Content (levels, word problems, hints, SOAR activities, trophies, badges) lives in `mathdata.js`; Mental Math Gym content lives in `mentalmath.js`; interaction/rendering lives in `script.js`; keep that split.
- Run `python3 tests/run.py` (or open `tests/index.html`) before submitting a change — see [DESIGN.md](DESIGN.md#testing) for what each suite covers.
