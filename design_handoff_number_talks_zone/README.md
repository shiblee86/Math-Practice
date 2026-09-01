# Handoff: Number Talks Zone

## Overview

`shiblee86/Math-Practice` is a plain static site (`index.html` + `style.css` + `mathdata.js` + `mentalmath.js` + `script.js`, no build step) — a kids' math practice app for two racers, Safia and Safaan.

Safia's Winter 2026 MAP Growth results showed **84th percentile achievement** (she can do 1st-grade math well) but only **56th percentile growth** (her improvement rate is just average) — a sign she's coasting on procedures rather than building the flexible number sense that speeds up learning. This handoff adds a new top-level app section, **Number Talks Zone**, that targets that specific gap: five activities that build conceptual understanding (multiple ways to decompose a number, pattern reasoning, multi-strategy problem solving, real-world contexts, and quick strategic games) rather than more drill.

The zone is scoped to Safia only, added as a sixth rail/tab-bar destination alongside Home, Levels, SOAR, Gym and Trophies.

## About the design files

The files in this bundle are **design references authored in HTML** — a working prototype of the intended look, content and question logic, not production code to lift as-is. The target app is the existing vanilla-JS static site; implement this feature there (extend `index.html`, `style.css`, `script.js`, and add the content/generators to `mathdata.js`), keeping the project's constraints: no bundler, no `package.json`, no ES modules (it must still open from `file://`).

`Number Talks Hub.dc.html` is fully interactive — open it directly in a browser (needs `support.js` next to it) to click through all five activities and see the real question-generation logic in action. Nothing in that runtime (support.js, the `.dc.html` wrapper) should ship; port the *behavior* into `script.js` / `mathdata.js`.

## Fidelity

**High fidelity, and functionally real** — this isn't a mockup with placeholder interactions. Every activity generates fresh questions, validates answers, and gives real feedback:
- **Number Talks**: type two numbers that sum to a target; duplicate combinations are rejected; a running list of "ways found" builds up. New target button cycles through {8, 10, 12, 15, 20}.
- **Patterns**: repeating (emoji, multiple-choice) and growing (arithmetic step, numeric input) patterns generate at random; a streak counter tracks consecutive correct answers.
- **Problem Solving**: a pool of 6 racing/food-truck word problems (numeric input). After a correct answer, "Try it another way" reveals two named strategies (e.g. Count on / Make a ten) with a one-line explanation each — this is the multi-strategy thinking the MAP feedback calls for.
- **Real-World Math**: randomly generated money (coin totals), time (clock + 15-minute increments), and measurement (comparing two lengths) problems, multiple-choice.
- **Pit Crew Games**: a missing-number drill (`? + 5 = 12` style) with 4 answer tiles; difficulty scales up with streak length.

Colors, typography, spacing, radii and shadows come from the bundled Turbo Math design system (`_ds/`) — the same token set as the rest of the app. Recreate pixel-for-pixel; the content pools (word problems, pattern generators, real-world generators) should be treated as a strong starting set to wire into `mathdata.js`'s content conventions, not final copy locked forever.

## Screens / Views

### Shell (all screens)
- Left rail, `flex:0 0 150px`, `--surface-1` bg, 2px `--border-strong`, radius `--radius-lg`, `padding:14px 10px`, column flex gap 6px.
  - Racer chip (Safia only, this zone is not racer-switchable in the prototype): 40px circle avatar `--color-primary` bg with "S" in Lilita One 1.2rem; name below in Lilita One .95rem; `★ 42` stars note in `--cyan-300` .68rem/800.
  - Nav items 🏠 Home, 🏎️ Levels, 🦅 SOAR, 🧠 Gym, **🎯 Number Talks** (new, always shown active/highlighted — `--color-primary` bg, `--text-on-primary` text), 🏆 Trophies. Other items are static in this prototype (no other screens built here — they exist in the main app).
  - `👪 Grown-up` pinned to bottom, dashed top border.
- Main content area, `flex:1`.
- Status column, `flex:0 0 270px`, shown throughout this zone (not just Home/Levels/Trophies as elsewhere in the app): a "Why this zone" card citing Safia's actual 84th/56th percentiles and the 65th-percentile-by-Spring-2027 goal (ProgressBar, reward variant, value 56/100), plus a "Today" card summing completed activities across all five types.

### 1. Number Talks Zone (hub)
- Header: "🎯 Number Talks Zone" Lilita One 1.5rem `--cyan-300`, subtitle "Understand the why, not just the how." .9rem `--text-secondary`.
- Five `MenuCard` components in a 3-column grid, `gap:14px`: Number Talks (default/cyan), Patterns (accent/coral), Problem Solving (reward/amber), Real-World Math (default/cyan), Pit Crew Games (accent/coral). Each has an emoji icon, Lilita One title, one-line description. Clicking opens that activity.

### 2. Number Talks
- Back button (ghost, sm) + title row.
- Card: `--surface-1`, 3px `--border-strong`, radius lg, padding 26px, `--shadow-card`.
- Instruction line, then a big circular target-number display (88px, `--color-reward` bg, Lilita One 2.2rem).
- Two 70×70px number inputs + "+" / "=" signs + target number repeated in amber, then a Check button (primary).
- Feedback line (mint on correct, red on incorrect) below.
- "Ways found (N)" section: pill chips (`rgba(47,230,167,.14)` bg, `--color-success` border) reading e.g. "6 + 4 ✓", one per unique combination found.
- "🔄 New number" ghost button at the bottom.

### 3. Patterns
- Back + title + live streak counter (top right).
- Card: `--border-top:5px solid --color-accent`, centered content.
- "What comes next?" prompt, then a row of 60×60px tiles showing the sequence so far, plus a dashed amber "?" tile.
- Repeating patterns: 3 circular `AnswerTile`s (emoji) to pick the next item — tinted green/red after pick.
- Growing patterns: a numeric input + Check button instead.
- Feedback message below; auto-advances to a new pattern after ~1–1.3s.

### 4. Problem Solving
- Back + title.
- Card, max-width 640px: word problem in Lilita One 1.4rem, a numeric input (pill-shaped, amber text) + Check + Next buttons.
- On correct: feedback line, then a "🔀 Try it another way" reward button reveals 2 strategy cards (`--surface-2` bg, 5px amber left border) each with a bolded strategy name and a one-line explanation.

### 5. Real-World Math
- Back + title.
- Card, max-width 640px: a randomly-generated money / time / measurement question, followed by up to 3 rectangular `AnswerTile` options (120×92px). Correct/incorrect tinting on pick; auto-advances to a new random problem.

### 6. Pit Crew Games
- Back + title + live score/streak (top right).
- Card, centered: instruction line, a large equation with one blank (`? − 5 = 2` style, Lilita One 2.6rem), and 4 circular `AnswerTile` options. Correct/incorrect tinting; auto-advances; difficulty (number range) increases with streak.

## Interactions & Behavior
- All navigation between the hub and the five activities is client-side state (`screen` field) — no page reload.
- Every activity is self-checking: answers are validated against a computed target, not hardcoded per-question.
- Auto-advance timers: Patterns (1000–1300ms), Real-World (1300–1700ms), Games (900–1500ms) — correct answers advance slightly faster than incorrect ones, giving time to read the "it was X" callout.
- Number Talks and Problem Solving are not timer-driven — the child controls pacing (Check / New number / Next).
- A lightweight `stats` object in state (`talks, patterns, problems, realWorld, games`) increments on every correct action and feeds the status column's "Today" count. In the real app this should merge into the existing per-racer progress tracking (`mathdojo-<racer>-*` keys) rather than being a separate counter.

## State Management
- `screen`: `'hub' | 'numberTalks' | 'patterns' | 'problems' | 'realWorld' | 'games'`.
- Per-activity local state (target number, current pattern/problem/game object, input values, message/feedback, selected option, streak/score) — see the logic class in `Number Talks Hub.dc.html` for the exact shape and the generator functions (`genPattern`, `genRealWorld`, `genGame`) to port into `mathdata.js`.
- No persistence in the prototype — wire into the app's existing save/load and per-racer `localStorage` scoping when implemented for real.

## Design Tokens

Same token set as the rest of the app (already in `style.css` `:root` and mirrored in `_ds/`):

**Colors**: `--teal-950 #081716 --teal-900 #0A1F1F --teal-850 #0D2828 --teal-800 #123636 --teal-700 #1B4747 --teal-600 #275C5C --cyan-500 #17C7C7 --cyan-300 #7EEAEA --coral-500 #FF5C3D --coral-300 #FFB29B --amber-500 #FFB020 --amber-400 #FFC94D --mint-500 #2FE6A7 --mint-400 #6EF0C2 --red-500 #FF3B3B --red-400 #FF6B6B --ink-000 #F4FBFB --ink-300 #A9C4C4 --ink-500 #6E8C8C`. Semantic: `--bg-app`, `--surface-1/2`, `--border-strong`, `--text-primary/secondary/muted`, `--color-primary` (cyan), `--color-accent` (coral), `--color-reward` (amber), `--color-success` (mint), `--color-error` (red).

**Type**: display `'Lilita One'`, body `'Nunito Sans'`. Scale: `--text-xs .8rem` through `--text-3xl 3.6rem` (see `tokens/typography.css`).

**Spacing/Radius**: 4/8/12/16/20/24/32/40; radius sm 8 / md 14 / lg 20 / xl 28 / pill 999.

**Shadows/Easing**: `--shadow-card 0 10px 24px rgba(4,14,14,.45)`; button shadows collapse from `0 Npx 0 <hue-600>` to `0 2px 0` on press; `--ease-snap cubic-bezier(.34,1.56,.64,1)`.

## Assets
- `race-bg.jpg` — the repo's existing background photo, copied verbatim, used unchanged (fixed background with the same dark scrim as the rest of the app).
- All icons are emoji (🎯🔢🔁🧩🏁🎮 etc.), consistent with the app's existing no-icon-system approach — no new assets were introduced.
- Fonts: Lilita One + Nunito Sans via `tokens/fonts.css` (Google Fonts).

## Files
- `Number Talks Hub.dc.html` — the design/logic reference, fully clickable.
- `support.js` — runtime needed only to open the `.dc.html` file in a browser; not for shipping.
- `_ds/` — Turbo Math design system: tokens + component bundle (Button, MenuCard, AnswerTile, Badge, ProgressBar, etc.) used to build this screen.
- `race-bg.jpg` — background photo asset.
- `screenshots/` — a screenshot of each of the six states (hub + 5 activities).

Source files this design extends, in the main repo: `index.html` (rail/shell), `style.css` (design tokens), `script.js` (`renderHome`, `TAB_FOR_SCREEN`, `SCREEN_TITLES` — extend these for the new screen and nav item), `mathdata.js` (content conventions — add the word-problem pool, pattern generators and real-world generators here, alongside `LEVELS`/`SOAR_ACTIVITIES`).
