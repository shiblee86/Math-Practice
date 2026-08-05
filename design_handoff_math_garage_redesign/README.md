# Handoff: Safia's & Safaan's Math Dojo — Modern Redesign

## Overview
A visual and UX modernization of the legacy "Safia's Math Kingdom" practice app (originally `Math-Practice/index.html`, `style.css`, `script.js`). The redesign keeps every game mechanic and piece of educational content from the original — 20 practice levels, 56 SOAR real-world activities, quizzes, hints, scoring, streaks, trophies, badges, daily bonus, save/load progress — and replaces the old hot-pink/purple bubbly look with the **Turbo Math Design System** (dark teal/graphite surfaces, cyan + coral action colors, amber rewards, Lilita One display type, "pressed game button" interactions). The two kids the app is for, Safia and Safaan, are both named in the app title; the mascot and reward theming mix their Hello Kitty, Labubu, and MMA-dojo favorites with the racing motifs already in the level iconography. A persistent back button sits in the top bar on every screen (Home → Levels/SOAR menu → Quiz/Activity/Result hierarchy).

## About the Design Files
The files in this bundle are **design references built as an interactive HTML prototype** (a self-contained "Design Component" using React under the hood), not production code to copy directly into a codebase. The task is to **recreate this design and its interaction logic in the target app's real environment** — React Native, native iOS/Android, or whatever stack the actual "Safia's Math Kingdom" / production app is built on — using that codebase's existing patterns, navigation, and state/persistence layers.

## Fidelity
**High-fidelity.** Colors, type, spacing, component shapes, and all interactive states are final and should be recreated precisely. The prototype is fully functional (not a static mock) — click through it to see every state (correct/wrong feedback, hint reveal, milestone popup, streak badge, result screens) directly.

## Design tokens (Turbo Math Design System)
Colors:
- Base surfaces (teal/graphite): `--bg-app #0A1F1F`, `--bg-app-deep #081716`, `--surface-1 #0D2828`, `--surface-2 #123636`, `--surface-raised #1B4747`, `--border-subtle #275C5C`, `--border-strong #275C5C`
- Primary (cyan): `#0EA3A3` / `#17C7C7` / `#3DDCDC` / `#7EEAEA` / `#B8F5F5` (600→300)
- Accent (coral): `#E6432E` / `#FF5C3D` / `#FF8563` / `#FFB29B` (600→300)
- Reward (amber): `#D68A00` / `#FFB020` / `#FFC94D` / `#FFDE8C` (600→300)
- Success (mint) `#2FE6A7` / `#6EF0C2`; Error (red) `#FF3B3B` / `#FF6B6B`
- Text: `--text-primary #F4FBFB`, `--text-secondary #A9C4C4`, `--text-muted #6E8C8C`, `--text-on-primary #081716`, `--text-on-accent #2A0F08`

Typography: display face **Lilita One** (`--font-display`), body/UI face **Nunito Sans** (`--font-body`). Scale: `--text-xs 0.8rem` … `--text-5xl 7rem`. Weights: regular 400 / bold 700 / black 900.

Spacing/radius: `--space-1..18` (4px→72px). Radius `--radius-sm 8 / md 14 / lg 20 / xl 28 / pill 999`.

Shadows/motion: colored "pressed button" shadows (`--shadow-primary` = cyan-600, `--shadow-accent` = coral-600, `--shadow-reward` = amber-600, `--shadow-neutral` = near-black). Buttons/cards translate down into their own shadow on press. Easing: `--ease-snap` (springy back-out) for feedback/celebration, `--ease-out` for presses.

Full token source and component specs: `_ds/` folder in this bundle (colors.css, typography.css, spacing.css, base.css, and the individual component `.jsx` files under `components/`).

## Screens / Views

### 1. Home
- Top bar: app title/logo (click → home), Save button, Load button (file picker, `.json`), star counter (total stars earned).
- Daily bonus card (dismissible once claimed per calendar day): claim button grants +3 stars, triggers confetti.
- Two large menu cards side by side: "SOAR Adventures" (🦅, links to SOAR menu) and "Practice Math" (🏎️, links to Levels).
- Progress panel: "X of 20 levels mastered (Y%)" + progress bar.
- Trophy case: grid of trophy chips, locked (🔒, dim) vs earned (icon, amber border/glow).
- Bottom quick-nav (sticky): Home / SOAR / Levels, active tab highlighted cyan.
- Floating mascot button (bottom-right circle): cycles through 4 emoji + a short encouragement message bubble on click.

### 2. Levels (Practice Math)
- Back-to-home and SOAR shortcut buttons.
- Grid of 20 level tiles (icon, name, star rating 0–3 based on best score: 0 not completed, 1 star ≥70%, 2 stars ≥90%... adjust per your exact original thresholds — see Behavior below). Locked visual state exists in the component (not used here — all levels are unlocked/always playable).

### 3. SOAR menu
- 56 activities grouped into 5 age bands (3–5, 5–7, 5–11, 7–11, 9–14), each band as a header pill followed by a responsive grid of activity cards (icon, title + ✅ if done, short description).

### 4. SOAR activity detail
- Icon + title + age badge, "aim" statement, illustration box (ASCII/emoji diagram), optional video link + optional NRICH link, numbered instruction steps, collapsible hint box, 1–2 "talk starter" question bubbles, and two action buttons: "Show hint" and "I did it! / Mark undone" (toggles done state, awards a star and confetti the first time).

### 5. Quiz
- Back-to-home and back-to-levels buttons.
- Stat header: level label + question counter (e.g. "Q3/15"), 3-stat row (Correct / Oops / Accuracy%), streak dots (up to 5, lit amber as correct answers accumulate), thin progress bar for question position.
- Question card: type badge, question text (may include emoji runs, inline math), then ONE of 5 input types depending on question kind:
  - **Numeric**: single number input.
  - **Multiple choice**: 2-col grid of choice buttons, selected state highlighted coral.
  - **Coin picker**: row of circular coin buttons (toggle selected), running total label below.
  - **Compose pair**: 2 rows of two number inputs each with an operator symbol and "= target" label.
  - **Fact family**: 4 rows of three number inputs (`a op b = c`), rows 1–2 use "+", rows 3–4 use "−"; on check, each row's border/background flips green/red for right/wrong.
  - Optional hint button (amber pill) reveals a rich formatted hint (color-coded worked example) below the input.
  - Feedback banner (green/correct or red/wrong) appears after Check; "Check" button swaps to "Next ▶" once answered.
- Streak badge (top-right floating pill) appears once streak ≥2, "🔥 N in a row!".
- Milestone modal (trophy unlock) can appear over any quiz state; pauses interaction until dismissed.
- Confetti burst (emoji pieces falling + rotating + fading) fires on correct answers (more pieces at streak ≥3), daily bonus claim, SOAR completion, and level completion ≥70%.

### 6. Result
- Emoji (🏆 ≥90%, 🏁 ≥70%, 🔧 below), title, star rating, "You got X/Y correct (Z%)" message.
- Retry / Levels / (conditional) Next-level buttons. Next level only shown if passed (≥70%) and not the last level.

## Interactions & Behavior
- **Passing threshold**: ≥70% correct marks a level "completed" and persists progress; ≥90% = 3★, ≥70% = 2★, else 1★ shown only once completed (0★/no stars if never completed).
- **Streak**: increments on each correct answer, resets to 0 on any wrong answer; drives the streak-dot row, the floating streak badge, and confetti volume.
- **Trophies**: 16 trophies auto-unlock on score/streak/completion thresholds (see `mathdata.js` `TROPHIES` for exact conditions) — unlocking one shows the milestone modal + confetti.
- **Badges**: 10 badges derived from combinations of completed levels/scores (see `BADGES_DEF` in `mathdata.js`).
- **Daily bonus**: one claim per calendar day (compared via `Date().toDateString()`), +3 stars.
- **Save/Load**: Save downloads current level-progress object as `max-progress.json`; Load merges a chosen JSON file's contents into current progress.
- **Persistence**: all state (progress, SOAR completion, trophies, badges, total stars, daily-bonus date) is stored in `localStorage` in the prototype — a production app should back this with its real persistence layer (server sync, app storage, etc.) instead.

## State Management
Key state needed per the prototype (see `Component` class in the `.dc.html` file's script for the reference shape):
`screen` (home/levels/soarMenu/soarActivity/quiz/result), `progress` (per-level `{completed, score}`), `soarProgress` (per-activity-index bool), `trophyData`/`badges` (unlock maps), `totalStars`, `dailyClaimed`, `currentLevelId`, `questions` (generated per level entry), `qIndex`, `score`, `wrong`, `streak`, `answered`, `hintShown`, plus per-question-kind input state (numeric value / choice index / selected coin indices / compose-pair inputs / fact-family inputs).

## Assets
No image/icon assets — this design is 100% emoji-as-iconography plus the Turbo Math Design System's UI chrome (built from CSS + the system's own React components, no external icon files). No logo exists for this app; none was invented.

## Files in this bundle
- `Safia's & Safaan's Math Dojo.dc.html` — the full interactive prototype (open directly in a browser).
- `mathdata.js` — the pure-JS game engine and content module: all 20 levels' question generators, the 56 SOAR activities (with instructions/hints/video/NRICH links), hint-rendering helpers, trophies, and badges. This is the most implementation-ready reference in the bundle — the question logic, word-problem content, and hint text can largely be ported as-is into the target codebase's language/framework.
- `_ds/` — the Turbo Math Design System: tokens (`colors.css`, `typography.css`, `spacing.css`, `base.css`, `fonts.css`) and component source (`components/core/Button.jsx`, `IconButton.jsx`, `Badge.jsx`, `ProgressBar.jsx`; `components/cards/MenuCard.jsx`, `LevelTile.jsx`; `components/game/AnswerTile.jsx`, `QuizStatRow.jsx`; `components/navigation/TopBar.jsx`, `QuickNav.jsx`; `components/feedback/Modal.jsx`). These are the exact specs for every color/spacing/shadow value and interaction state used.
- `CLAUDE_CODE_PROMPT.txt` — a ready-to-paste prompt for Claude Code to kick off the implementation in your actual codebase.
