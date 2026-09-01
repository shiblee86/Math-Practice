# 🏁 Safia's & Safaan's Math Dojo

A browser-based math practice app for two kids sharing one device — 20 auto-generated practice levels, 56 real-world "SOAR" activities, a Mental Math Gym for building fast mental arithmetic, a Safia-only Number Talks Zone for conceptual number sense, stepped interactive hints, trophies/badges/streaks/daily bonus, and save/load progress, all scoped to whichever racer (Safia or Safaan) is active. Built as a plain static site: no build step, no npm, no framework.

## Running it

Just open `index.html` in a browser — no server required. It also works served statically (e.g. GitHub Pages) or via any local static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## What's here

```
index.html      screen markup — left rail (≥900px) / top strip + bottom nav (<900px)
style.css       Turbo Math design tokens + component styles
mathdata.js     content & pure logic — racers, levels, SOAR activities, stepped hints, Number Talks Zone, trophies, badges
mentalmath.js   content & pure logic for the Mental Math Gym
script.js       interaction/render/animation layer
race-bg.jpg     fixed background image
tests/          unit, integration, and regression test suites (see below)
DESIGN.md       architecture, design system, and testing-strategy write-up
```

For the "why" behind how these fit together (why there's no build step, why the SVG helpers live where they do, how the screen/navigation/persistence model works, the design token system), see **[DESIGN.md](DESIGN.md)**.

## Features

- **Two racer profiles, Safia and Safaan**, each with their own scoped level lane, SOAR age band, stars, trophies, and Gym progress — a racer chip in the rail/top strip switches between them, with no bleed between the two. Levels and SOAR content is shared, just windowed differently per racer (Safia: Counting → Make a Sum, band 3–5; Safaan: Carry Addition → Grand Finale, band 7–11).
- A persistent **left rail** for navigation on a laptop/desktop-sized screen (≥900px), falling back to a top strip + bottom tab bar below that — same screens, same state, just different chrome for the device at hand.
- **20 practice levels** (Counting through a mixed-review "Grand Finale"), each generating 15 fresh questions across 5 input types: numeric, multiple choice, coin picker, compose-pair, and fact family (with per-row right/wrong feedback). **Keyboard play**: Enter checks the current answer, then advances to the next question — no mouse needed on a Chromebook.
- A **stepped, interactive hint** for every hinted arithmetic question — a column-method grid or a number-strip, advanced one step at a time with Back / Next step / Start again, never showing the answer before the last step. Non-arithmetic questions (money, fractions, logic, shapes, calendar, graphs) keep their original color-coded prose hint.
- **56 SOAR activities** (age 3–14, sourced from NRICH) with instructions, an optional video/NRICH link, a hint, talk-starter questions, and completion tracking — each racer sees only the activities in their own age band.
- **Mental Math Gym** — a hub built around three cards: **Daily assignment** (16 pooled number/word problems, plus an optional ⚡ speed round) and its **Random mix** counterpart (12 problems, a quieter secondary tile below the three cards), **Learn a trick** (a hard sum broken into stacked steps on a number keypad — get one wrong and it stays put until you get it right, no answer given away), and **Flash cards** (a fresh 5-card deck each time, graded with spaced-repetition Leitner boxes, every quick fact capped at 30 so nothing three-digit slips onto a flash card). An 11-set "Pick what to practise" chip picker actually drives what shows up in Daily/Random and Flash cards. The hub has its own persistent back button and navigation history, separate from the rest of the app. Two richer, more specialized practice modes — a guided two-digit carry/borrow column sheet, and a **Tens & Ones** sheet teaching two-digit addition/subtraction through 5 hands-on strategies (base-ten blocks you trade by tapping, a number line, round-and-adjust, the column method) — aren't hub tiles anymore but are still fully built and tested; see [DESIGN.md](DESIGN.md#mental-math-gym) for how to reach them directly. Misses are tracked per fact and feed the Home screen's "🎯 Practice These" panel.
- **Streaks, 16 trophies, and 10 badges** for motivation, shown as a generated tile grid on their own **Trophies** screen, plus a daily +3★ bonus, confetti, and a milestone modal (unlocking several trophies at once queues them instead of dropping all but one).
- A **Grown-up summary** screen showing both racers side by side — stars, mastered levels, trophy count, and weakest facts for each — and home to **Save / Load**: exports a full backup of *both* racers (level progress, SOAR completion, trophies, badges, total stars) as a downloadable JSON file; loading merges it back in, with backward-compatible support for older, single-profile save files.
- A **Number Talks Zone**, scoped to Safia only (targeting a specific number-sense gap flagged by her own MAP Growth results, not a generic feature) — five short, self-checking activities for conceptual understanding rather than more drill: **Number Talks** (find every way to split a number into two parts), **Patterns** (repeating or growing, spot what's next), **Problem Solving** (a word-problem pool with a post-correct "try it another way" reveal of two named strategies), **Real-World Math** (money/time/measurement, multiple choice), and **Pit Crew Games** (a missing-number drill that gets harder the longer the streak runs). Hidden from Safaan's nav entirely rather than shown disabled.

## Testing

The suite is plain, dependency-free browser JavaScript — open **`tests/index.html`** in any browser to run it and see a pass/fail report. It's organized as:

- **Unit** — `mathdata.js` and `mentalmath.js`'s content and logic in isolation (levels, question generators, SOAR data, trophies/badges, Gym fact sets, daily/column sheet determinism, the stepped hint engine's `columnSteps`/`stripSteps`/`workSteps`, and the Number Talks Zone's `ntGenPattern`/`ntGenRealWorld`/`ntGenGame` generators).
- **Integration** — the real app, loaded in an iframe and driven like a player would (click through screens, answer every question kind, complete a level, complete a SOAR activity, save/load a file, switch racers and confirm Levels/SOAR/stars/trophies/Gym re-scope independently, play a question with keyboard-only Enter, step through a hint panel, exercise the Gym hub's chip picker/speed round/back-navigation and play both Daily assignment and Random mix to completion, one problem of each Tens & Ones strategy, and all 5 Number Talks Zone activities including its Safia-only gate).
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
