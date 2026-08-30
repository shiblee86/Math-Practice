# Handoff: Math Dojo redesign (rail shell, two racer lanes, keyboard play)

## Overview

`shiblee86/Math-Practice` is a plain static site (`index.html` + `style.css` + `mathdata.js` + `mentalmath.js` + `script.js`, no build step) — a kids' math practice app with 20 auto-generated levels, 56 SOAR activities, a Mental Math Gym, trophies/badges/streaks and JSON save/load.

This handoff covers a **layout and hierarchy redesign** of that app. Content and mechanics do not change: same level generators, same SOAR activities, same gym modes, same trophy/badge/streak rules, same save format (with one addition — see State). What changes:

1. **Home** collapses from six competing panels (daily bonus, hero, practice-these, two menu cards, gym card, progress chart, trophy shelf, badge row) into one "Next up" card, a three-item Today list, three destination tiles, and a status column.
2. **Navigation** becomes a persistent left rail on wide screens (the app is also used on a Chromebook), falling back to the existing bottom tab bar below 900px.
3. **Two racer lanes.** The app serves two kids of different ages. A racer switcher at the top of the rail scopes levels, stars, trophies, SOAR age band, gym progress and practice-these. Only the Grown-up summary shows both.
4. **Quiz** header drops to a single line; the question becomes the largest thing on screen; the score row appears only after the first answer is checked.
5. **Keyboard play** for Chromebook: Enter checks, Enter again advances, the answer field re-focuses on every question, and every interactive element has a hover state (the current CSS only styles `:active`).

## About the design files

The files in this bundle are **design references authored in HTML** — prototypes of the intended look and behavior, not production code to lift. The target app is the existing vanilla-JS static site, so implement the redesign there: edit `index.html`, `style.css` and `script.js` in the real repo, keeping the project's stated constraints (no bundler, no `package.json`, no ES modules — it must still open from `file://`). Keep content in `mathdata.js` / `mentalmath.js` and interaction in `script.js`, as CONTRIBUTING notes require.

The prototypes are written as "Design Components" and need `support.js` (bundled) next to them; open the `.dc.html` files directly in a browser to click through them. Nothing in that runtime should ship.

## Fidelity

**High fidelity.** Colors, typography, spacing, radii and shadows are exact and all come from the design system bundled in `_ds/` (Turbo Math), which is the same token set already inlined at the top of the repo's `style.css`. Recreate pixel-for-pixel. Question content in the prototype is a small hand-picked sample of the real generators — wire the real ones in.

## Files in this bundle

| File | What it is |
| --- | --- |
| `Math Dojo - Redesign.dc.html` | **The design to build.** All eight screens, clickable, both layouts. |
| `Math Dojo - Current.dc.html` | Faithful recreation of the app as it is today, for before/after comparison. |
| `Math Dojo - Redesign Options.dc.html` | The three directions explored (1a One next thing, 1b Two lanes, 1c Training ground). The chosen design combines all three. |
| `_ds/` | Design system: token stylesheets and the component bundle (Button, IconButton, Badge, ProgressBar, MenuCard, LevelTile, AnswerTile, QuizStatRow, TopBar, QuickNav, Modal). |
| `race-bg.jpg` | Background photo, copied verbatim from the repo root. |
| `support.js` | Runtime needed to open the `.dc.html` prototypes. Not for shipping. |

Source files the design was built from, in the repo: `index.html`, `style.css`, `script.js` (`renderHome`, `renderTrophyShelf`, `checkDailyBonus`, `updateProgressStats`, `renderQuestion`, `QUESTION_TYPES`, `showResults`, `renderGymHub`, `showSoarMenu`, `updateTopBar`, `SCREEN_TITLES`, `TAB_FOR_SCREEN`), `mathdata.js` (`LEVELS`, `TROPHIES`, `BADGES_DEF`, `SOAR_ACTIVITIES`, `LEVEL_VIDEOS`), `mentalmath.js` (`FACT_SETS`).

## Design tokens

All tokens already exist in `style.css` `:root` — use those variable names; do not introduce new values.

**Colors**
```
--teal-950 #081716  --teal-900 #0A1F1F  --teal-850 #0D2828  --teal-800 #123636
--teal-700 #1B4747  --teal-600 #275C5C  --teal-500 #3B7A7A
--cyan-600 #0EA3A3  --cyan-500 #17C7C7  --cyan-400 #3DDCDC  --cyan-300 #7EEAEA  --cyan-200 #B8F5F5
--coral-600 #E6432E --coral-500 #FF5C3D --coral-400 #FF8563 --coral-300 #FFB29B
--amber-600 #D68A00 --amber-500 #FFB020 --amber-400 #FFC94D --amber-300 #FFDE8C
--mint-500 #2FE6A7  --mint-400 #6EF0C2  --red-500 #FF3B3B   --red-400 #FF6B6B
--ink-000 #F4FBFB   --ink-100 #D3E7E7   --ink-300 #A9C4C4   --ink-500 #6E8C8C  --ink-700 #425555
```
Semantic: `--bg-app` teal-900, `--bg-app-deep` teal-950, `--surface-1` teal-850, `--surface-2` teal-800, `--border-subtle` teal-700, `--border-strong` teal-600, `--text-primary` ink-000, `--text-secondary` ink-300, `--text-muted` ink-500, `--text-on-primary` teal-950, `--text-on-accent` #2A0F08, `--color-primary` cyan-500, `--color-accent` coral-500, `--color-reward` amber-500, `--color-success` mint-500, `--color-error` red-500. Colored button shadows: `--shadow-primary` cyan-600, `--shadow-accent` coral-600, `--shadow-reward` amber-600, `--shadow-neutral` teal-950.

**Type** — display `'Lilita One'` (titles, level names, big numbers, buttons), body `'Nunito Sans'` (weights 400/700/800/900). Scale in use: `.6rem`/`.68rem`/`.72rem`/`.78rem`/`.82rem`/`.85rem`/`.9rem`/`1rem`/`1.05rem`/`1.1rem`/`1.2rem`/`1.5rem`/`1.9rem`/`2rem`/`2.5rem`/`2.6rem`/`3rem`/`3.4rem`.

**Spacing** `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40`. **Radius** sm 8, md 14, lg 20, xl 28, pill 999. **Shadows** `--shadow-card 0 10px 24px rgba(4,14,14,.45)`; button/card shadow is `0 Npx 0 <hue-600>` collapsing to `0 2px 0` on press. **Easing** `--ease-snap cubic-bezier(.34,1.56,.64,1)`, `--ease-out cubic-bezier(.16,1,.3,1)`.

**Background (unchanged from today)** — one fixed layer on `body::before`: `linear-gradient(180deg, rgba(8,23,22,.88), rgba(8,23,22,.96)), url('race-bg.jpg')`, `background-size: cover`, centered. Note the scrim is **darker than the current app's** (.88/.96 vs .62/.88) because at Chromebook width much more of the photo is visible behind the content; keep the darker values.

## Layout: the shell

Two layouts, one breakpoint at **900px** viewport width.

**Wide (≥900px — Chromebook, desktop, landscape tablet)**
- Outer: `display:flex; gap:16px; align-items:flex-start; padding:20px; max-width:1440px; margin:0 auto; min-height:100vh`.
- **Rail**: `flex:0 0 150px`, `--surface-1`, 2px `--border-strong`, radius lg, `padding:14px 10px`, `display:flex; flex-direction:column; gap:6px`, stretched to the shell height.
  - Racer chip at the top: `--surface-2`, 2px `--border-strong`, radius md, `padding:10px 8px`, centered; 40px circle avatar in `--color-primary` with `--text-on-primary` initial in Lilita One 1.2rem; name in Lilita One .95rem; below it `★ <stars> · swap ⇄` at .68rem/800 in `--cyan-300`. Click swaps racer. Hover: `border-color: var(--color-primary)`.
  - Nav items: radius md, `padding:11px 8px`, centered, weight 800, .8rem. Active = `--color-primary` bg + `--text-on-primary`; inactive = transparent + `--text-secondary`, hover `background: var(--surface-2)`. Order: `🏠 Home`, `🏎️ Levels`, `🦅 SOAR`, `🧠 Gym`, `🏆 Trophies`. Levels stays active while on Quiz and Result.
  - Spacer, then `👪 Grown-up` pinned to the bottom: .75rem/800, `--text-secondary`, 2px dashed `--border-strong`, hover `color: var(--text-primary)`.
- **Main**: `flex:1; min-width:0`.
- **Status column**: `flex:0 0 270px`, `display:flex; flex-direction:column; gap:12px`. Shown only on Home, Levels and Trophies.

**Narrow (<900px — phone, portrait tablet)**
- Outer: `display:block; padding:12px; max-width:560px; margin:0 auto` (the app's current column).
- Rail is replaced by a top bar: `--surface-1`, 2px `--border-strong`, radius xl, `padding:8px 12px`, avatar + `<name> ⇄` on the left, `★ <stars>` pill (2px `--amber-500`, radius pill, `--amber-400`) on the right.
- The existing sticky bottom tab bar returns at the end of the main column: `--bg-app-deep`, `border-top:2px solid --border-strong`, `padding:8px`, radius lg, `position:sticky; bottom:8px`, five equal buttons showing icon only (`🏠 🏎️ 🦅 🧠 🏆`) at .72rem/800, active = `--color-primary` + `--text-on-primary`.
- Every multi-column grid on the screens below becomes one column.
- Status column is not rendered; its three cards are not shown on phone (the Today list and Next-up card already carry that information).

## Screens

### 1. Home
Purpose: answer "what do I do right now" in one glance.

- **Next-up card** — `--surface-1`, 3px `--color-accent`, `box-shadow:0 8px 0 --shadow-accent`, radius lg, `padding:22px 24px`, `display:flex; align-items:center; gap:20px; flex-wrap:wrap`.
  - Level emoji at 3rem.
  - Middle block (`flex:1; min-width:180px`): eyebrow `NEXT UP · LEVEL <n> OF <total>` at .7rem/900, letter-spacing .08em, `--coral-300`; level name in Lilita One 1.9rem, line-height 1.05; `15 questions · about 5 minutes` at .9rem `--text-secondary`.
  - `Start ▶` — Button, variant `primary`, size `lg` (padding 16px 32px, font `--text-md`, shadow 7px).
- **Today card** — `--surface-1`, 2px `--border-strong`, radius lg, `padding:18px 20px`, `margin-top:14px`. Header row: `Today` in Lilita One 1.1rem `--cyan-300`; right side `<n> of 3 done · +3★ daily bonus` at .78rem/800 `--text-secondary`. Three rows, `gap:8px`, each `display:flex; align-items:center; gap:12px`, radius md, `padding:12px 14px`, 2px border, hover `transform:translateY(-2px)`:
  - done row: `rgba(47,230,167,.10)` bg, `--color-success` border, label in `--text-secondary`;
  - pending rows: `--surface-2` bg, `--border-strong` border, label `--text-primary`;
  - trailing stat in Lilita One .85rem `--cyan-300` (`4/16`, `›`, `done`).
  - Content: `🃏 Flash cards — 5 cards`, `📋 Daily assignment`, `🦅 SOAR quest — <activity title>`. The daily +3★ bonus lives here as the header note instead of the current pulsing full-width banner.
- **Three destination tiles** — `display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px`. Each: `--surface-1`, 2px accent border + `0 6px 0` matching shadow (Levels cyan, SOAR coral, Gym amber), radius lg, `padding:16px`, hover `translateY(-3px)`; 1.7rem emoji, title Lilita One 1.05rem, one line of .8rem `--text-secondary` stat (`3 of 8 mastered`, `6 for ages 3-5`, `4/16 problems today`).
- **Removed from Home**: the 10-circle badge row, the 16-tile trophy shelf, the separate progress chart, the pulsing daily-bonus banner, the practice-these panel, the animated mascot and crown. Badges and trophies live on the Trophies screen; practice-these lives in the status column and on Result.

### 2. Levels
- Heading row: `🏎️ <Racer>'s levels` in Lilita One 1.5rem `--cyan-300`, plus `<n> of <total> mastered — tuned to age <n>` at .85rem `--text-secondary`.
- `display:flex; flex-wrap:wrap; gap:12px` of LevelTile components (104×104, radius lg, display font, `0 5px 0` shadow collapsing to 2px on press). Mastered tiles show 3 stars; the next-up tile uses `variant="accent"`; **all tiles are unlocked and playable** (no `🔒` state, no `opacity:.5` — this replaces the current gating).
- Footer note in `--surface-2`, 2px dashed `--border-strong`, radius md, `padding:14px 16px`, .82rem `--text-secondary`, explaining the two lanes.

### 3. SOAR
- Heading `🦅 SOAR quests` Lilita One 1.5rem `--cyan-300`; sub-line naming the age band being shown for the current racer.
- `grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px`. Cards: `--surface-1`, 2px `--color-accent`, `0 5px 0 --shadow-accent`, radius lg, `padding:16px`, hover `translateY(-3px)`; 1.8rem emoji + title Lilita One 1rem `--amber-400` on one row; `desc` .82rem `--text-secondary`; `aim` .72rem/800 `--text-muted`.
- Age band follows the racer (3–5 for the younger, 7–11 for the older) instead of listing all five bands with sticky headers.

### 4. Quiz
- `max-width:720px`.
- Header, one line: back `←` (1.2rem `--text-secondary`, hover `--text-primary`), `<icon> <Level> · Q<n> of 15` at .88rem/900 `--text-secondary`, `★ <stars>` in Lilita One .9rem `--amber-400`.
- ProgressBar directly under it, height 8, value `(q-1)/15*100`.
- Question card: `--surface-1`, 3px `--border-strong` with `border-top:5px solid --color-primary`, radius lg, `padding:34px 26px`, `--shadow-card`. Inside: type chip (`--surface-2`, `--text-secondary`, radius pill, `padding:3px 12px`, .68rem/800, 1px `--border-strong`); question in Lilita One **2.6rem**, centered, line-height 1.2; answer input full width, `padding:18px`, 2rem Lilita One, `--surface-2` bg, 2px `--border-strong`, radius pill, `--amber-400` text, centered, focus ring `border-color:--color-reward` + `0 0 0 3px rgba(255,176,32,.2)`.
- Feedback strip (only after a check): radius md, `padding:14px 16px`, `animation:popIn .3s`; correct = `rgba(47,230,167,.14)` on `--color-success`, text `--mint-400`, `✅`; wrong = `rgba(255,59,59,.14)` on `--color-error`, text `--red-400`, `🥊`, and it names the right answer.
- Buttons: before checking, `Check ✅ (Enter)` — Button primary lg, `flex:1; min-width:130px`; after checking it is replaced by `Next ▶ (Enter)` — Button accent lg. `💡 Hint` — Button reward, fixed ~140px, toggles the hint panel (`--surface-2`, `border-left:5px solid --amber-500`, radius sm, `padding:14px 16px`, .92rem, line-height 1.6). The `(Enter)` suffix is `font-size:.7rem; opacity:.7`.
- QuizStatRow (correct / oops / accuracy pill) renders **only once at least one answer has been checked**, below the buttons, left-aligned on wide and centered on narrow.
- Dropped from the current quiz header: the always-on three-stat row, the five streak dots, the level/counter double row, and the red YouTube button above the card. Keep the video link, but as a small `▶ Watch` ghost button beside Hint.

### 5. Result
- `max-width:560px`, `--surface-1`, 4px `--amber-500`, radius lg, `padding:32px`, centered, `box-shadow:0 0 30px rgba(255,176,32,.25)`. No infinite pulse/bounce animation — the milestone pop is the celebration.
- 3.4rem emoji (🏆 ≥90%, 🏁 pass, 🔧 below), title Lilita One 2rem `--cyan-300`, stars 1.9rem, `<n> right out of 15 on <Level>.` at .95rem `--text-secondary`.
- Practise panel: `--surface-2`, 2px `--border-strong`, radius md, `padding:14px 16px`, left-aligned; `🎯 Next session, practise` .82rem/900 `--cyan-300` + one .88rem line.
- Three Buttons, `flex:1; min-width:130px`: `🔁 Retry` ghost, `🏁 Levels` primary, `➡️ Next level` accent.

### 6. Mental Math Gym
Same content as today, restructured to the grid:
- Heading `🧠 Mental Math Gym` + `Fast facts, in your head. No paper, no fingers.`
- Three cards in `repeat(3,minmax(0,1fr))`, `gap:12px`: Daily assignment (3px `--color-primary`, `0 8px 0 --shadow-primary`), Learn a trick (amber), Flash cards (coral). Each: 1.9rem emoji, title Lilita One 1.1rem, .85rem `--text-secondary` line, then a Lilita One .88rem stat tinted to the card's hue (`5 sets · 4/16 today`, `go`, `38% mastered`). Hover `translateY(-3px)`.
- Random mix row below: `--surface-1`, 2px `--border-strong`, radius md, `padding:14px 16px`, 1.5rem 🎲, name Lilita One 1rem, .78rem sub-line, `›` in `--text-muted`, hover `border-color:--color-primary`.
- "Pick what to practise" panel: `--surface-1`, 3px `--border-strong`, radius lg, `padding:18px 20px`; title Lilita One 1.05rem `--cyan-300`; .78rem/700 `--text-muted` explainer; 11 chips (`display:flex; flex-wrap:wrap; gap:8px`), each radius pill, `padding:9px 15px`, .82rem/900, `0 3px 0 --shadow-neutral`; active = `--color-primary` bg / `--cyan-400` border / `--text-on-primary`, inactive = `--surface-2` / `--border-strong` / `--text-secondary`. Chip set and ids come from `mentalmath.js FACT_SETS`.
- The speed-round toggle stays on the Daily assignment card (as today).

### 7. Trophies (new screen)
- Heading `🏆 <Racer>'s trophy case` Lilita One 1.5rem `--amber-400`; sub-line `<n> of 16 earned · one shelf per racer`.
- `repeat(4,minmax(0,1fr)); gap:12px`. Earned: `rgba(255,176,32,.12)` bg, 2px `--amber-500`, icon 1.9rem, name .75rem/800 `--text-secondary`. Locked: `--surface-2` bg, 2px `--border-strong`, `🔒`, name `--text-muted`. No glow animation on idle tiles.
- The 10 badges from `BADGES_DEF` belong on this screen too, as a second section below the trophies (same tile treatment, circular icons as today).

### 8. Grown-up summary (new screen)
- `max-width:760px`. Heading `👪 Grown-up summary` + `The only screen where both racers appear together.`
- Two cards, `repeat(2,minmax(0,1fr)); gap:14px`: `--surface-1`, 2px `--border-strong`, radius lg, `padding:20px`. Header row: 38px avatar circle (cyan for one racer, coral for the other), name Lilita One 1.2rem, `★ <stars>` Lilita One .9rem `--amber-400`. Then a .85rem `--text-secondary` plain-language summary (last played, what's solid, what stalls), a reward-variant ProgressBar (height 14), `<n> of <total> levels · <n> of 16 trophies` at .75rem/800 `--text-muted`, and miss chips (`rgba(255,59,59,.16)` bg, 1px `--red-500`, radius md, `padding:6px 10px`, .78rem/700).
- Footer row: `--surface-2`, 2px `--border-strong`, radius md, `padding:16px 18px`; explainer text plus `💾 Save` and `📂 Load` Buttons (variant `ghost`, size `sm`). **Save/Load move here from the top bar** — they are grown-up actions, not play actions.

## Hints: the worked example (important — this replaces the current hint text)

Today a hint is one line of prose. In the redesign, a hint is a **drawn, stepped worked example in column form**, advanced one step at a time by the child, in the exact method the parent teaches. Never show the answer before the last step.

Panel placement: the hint sits **directly under the question card and above the Check/Hint row** — on a 1366×768 Chromebook (~640px of usable viewport) the question, the whole worked example and the `Next step ▶` button must all be visible without scrolling. Measured in the prototype: question card ends at y=299, hint panel 311–633, `Next step` bottom at 617.

Panel: `--surface-2`, 2px `--amber-500` with a 6px left edge in the same amber, radius md, `padding:14px 18px`. Header `Let's do it together` in Lilita One 1.05rem `--amber-400`, with `Step n of m` beside it at .75rem/800 `--text-muted`. Below: the drawing and (when present) a side working, then the sentence at 1rem/1.5 (`max-width:560px`), then `◀ Back` (ghost sm), `Next step ▶` (reward), `↻ Start again` (ghost sm, from step 2 on).

Drawing (column methods): a 3-column grid `38px 50px 50px` (operator column, tens, ones), `justify-content:center`, Lilita One, on `--bg-app-deep` with 2px `--border-strong`, radius md, `padding:8px 14px 10px`. Four rows: carry row (height 22, 1.05rem, bottom-aligned, `--cyan-300`), top number (height 38, 2rem), bottom number (height 38, 2rem; operator in `--coral-400`), a full-width rule (`border-top:4px solid --text-primary`, `margin:3px 0 4px`), then the result row (height 38, 2rem). A crossed-out digit uses `text-decoration:line-through` with `text-decoration-color:var(--color-error)` and `text-decoration-thickness:3px`, and dims to `--text-muted`. The digit currently being worked on is `--amber-400`; digits already settled are `--cyan-300`; untouched digits are `--text-primary`. Side working (e.g. `15 − 7 = 8`) sits beside the grid in Lilita One 1.3rem `--amber-400` on `--surface-1` with a 2px dashed amber border.

Drawing (count-on strip): `display:flex; flex-wrap:wrap; gap:8px`, same dark panel, `padding:10px 14px`, `min-height:60px`. Each chip is a 44px-wide centered column: number in Lilita One 1.4rem, a 3px rule (`margin:3px 5px`, radius 2px), then the count at .78rem/900. Landed chip: number and count `--amber-400`, rule `--amber-500`; other chips: number `--text-primary`, count `--cyan-300`, rule `--border-strong`.

The question line itself is 2.2rem (not 2.6rem) and the card padding `20px 26px` — both trimmed so the hint fits the Chromebook fold.

**Carry addition — steps for 28 + 34 (generate for any two-digit pair)**
1. "Line the numbers up. Ones under ones, tens under tens."
2. "Start with the ones. What is 8 + 4?" — ones column highlighted, side `8 + 4 = 12`.
3. "12 is more than 9. Keep the 2 down in the ones, and move the 1 ten over to the tens." — `1` appears in the carry row above the tens, `2` appears in the result ones. Side `12 = 1 ten and 2 ones`.
4. "Now the tens. 2 + 3, and add the 1 we carried." — tens highlighted, side `2 + 3 + 1 = 6`, result `6 2`.
5. "So 28 + 34 = 62."
If the ones sum is 9 or less, step 3 becomes "9 or less, so there is nothing to carry" and no carry digit is drawn.

**Borrowing — steps for 35 − 27**
1. "Line them up. Ones under ones, tens under tens."
2. "Look at the ones. Is 5 bigger than 7? No. So we need to borrow a ten." — side `5 is smaller than 7`.
3. "Take one ten from the 3. Cross the 3 out and write 2 above it. Give that ten to the ones, so 5 becomes 15." — 3 struck through, `2` in the carry row, ones now reads `15`. Side `5 + 10 = 15`.
4. "Now the ones are easy. 15 take away 7." — side `15 − 7 = 8`, result ones `8`.
5. "Then the tens. We have 2 left, take away 2." — side `2 − 2 = 0`.
6. "The tens made 0, so we do not write it. 35 − 27 = 8."
When the ones digit is already big enough, skip the borrow: step 2 becomes "Is 5 bigger than 2? Yes, so we can take it away right away."

**Same-tens subtraction — steps for 17 − 14**
1. "Line them up. Ones under ones, tens under tens."
2. "Look at the tens. Both numbers have 1 ten. Same tens take each other away, so the tens make 0." — tens highlighted, side `10 − 10 = 0`.
3. "That leaves just the ones. 7 take away 4." — side `7 − 4 = 3`.
4. "So 17 − 14 = 3. When the tens match, you only have to do the ones."
This branch is chosen automatically whenever the two tens digits are equal, ahead of the borrow branch.

**Count-on addition — steps for 11 + 8** (drawn as a number strip, not a column: a row of number chips, each with a 3px rule under it and its count below in `--cyan-300`; the chip being landed on is `--amber-400`)
1. "Which number is bigger? 11 is the big number. 8 is the small number." — strip empty, side `11 + 8`.
2. "Start at the number after the big number. After 11 comes 12." — first chip only, highlighted. Side `start at 12`.
3. "Now count on 8 numbers — one for every one in 8. Say them out loud and count on your fingers." — all chips revealed with counts 1–8 underneath (12/1, 13/2 … 19/8).
4. "The last number we said is the answer. 11 + 8 = 19." — last chip highlighted, side `11 + 8 = 19`.

**Count-up subtraction — steps for 15 − 7** (same strip)
1. "Which number is bigger? 15 is the big number. 7 is the small number."
2. "Start at the number after the small number. After 7 comes 8." — first chip only. Side `start at 8`.
3. "Now keep counting until you reach 15. Count how many numbers you say." — chips 8…15 with counts 1–8.
4. "We said 8 numbers, so 15 − 7 = 8." — last chip highlighted.

**Which method goes with which problem** — this mapping matters as much as the drawings:
| Problem shape | Hint method |
| --- | --- |
| Single-digit or teen add/sub with no regrouping (`11 + 8`, `9 + 6`, `15 − 7`) | count-on strip |
| Missing-number problems (`? + 9 = 15`, `17 − ? = 8`) | count-up strip from the known small number to the big number — it finds the missing part directly |
| Two-digit addition where the ones sum passes 9 (`28 + 34`, `24 + 38`) | column carry |
| Two-digit subtraction, tens equal (`17 − 14`, `26 − 23`) | same-tens shortcut |
| Two-digit subtraction, ones too small (`35 − 27`, `43 − 18`) | column borrow |
| Two-digit subtraction, ones big enough (`58 − 23`) | column, no borrow branch |
| Money, fractions, logic, shapes, calendar, graphs | prose hint (no column method taught) |
In the prototype the strip appears on Counting and Missing Number, and the column methods on Carry Addition, Borrow Sub, Add Three and Subtract Three. Apply the same rule inside every generator in `mathdata.js`, including the word-problem pools and the Gym's Daily/Random sets — a hint's method should follow the numbers in the question, not the level it happens to sit in.

Language rules for every step: one idea per step, second person, no jargon ("borrow", "carry" and "ten" are fine — "regroup", "minuend", "column addition" are not), numbers as numerals, questions asked back to the child ("Is 5 bigger than 7?") rather than stated. In the repo, replace the corresponding `hintCarryAdd` / `hintBorrowSub` / `hintMissing*` helpers in `mathdata.js` with step arrays of the same shape and render them from `script.js`; keep prose hints for the levels that have no column method (money, fractions, logic, shapes, calendar).

## Interactions & behavior

- **Nav** — rail/tab click switches screen. Levels tab stays active on Quiz and Result (matches the repo's existing `TAB_FOR_SCREEN`).
- **Racer swap** — clicking the racer chip toggles the active racer; if the swap happens mid-quiz, return to Home. Everything racer-scoped re-renders: lane levels, star total, streak, trophies, SOAR band, gym counts, practice-these.
- **Level start** — resets question index, answer, score and hint state, then opens Quiz.
- **Check** — empty input counts as wrong (today it `alert()`s; drop the alert and show the feedback strip instead). Correct increments correct + stars + streak and fires the existing confetti/sound/pop; wrong increments wrong, resets streak, and names the answer.
- **Next** — advances; after Q15 goes to Result.
- **Keyboard (Chromebook)** — a window `keydown` listener: on the quiz screen, Enter checks when unchecked and advances when checked; the answer field is focused on mount and re-focused whenever the question index changes. This replaces the current per-input Enter binding.
- **Hover** — every nav item, card and tile has a hover state: nav `background:var(--surface-2)`, cards `transform:translateY(-3px)`, rows `translateY(-2px)`, chips/rows `border-color:var(--color-primary)`. Press keeps the existing shadow-collapse + `translateY` game feel.
- **Animation** — keep `--ease-snap` feedback animations (correct/wrong pop, milestone modal, star drop, confetti). Drop the ambient loops: floating mascot, crown bounce, daily-card pulse, trophy glow, result-card pulse.
- **Responsive** — single breakpoint at 900px, driven by viewport width; nothing else changes between layouts.

## State

Existing state and `localStorage` keys stay (`mathdojo-*`: progress, trophies, badges, stars, last bonus, gym sets/daily/cards). Additions:

- `activeRacer: 'safia' | 'safaan'` — persisted; drives all scoping.
- Per-racer progress: today's `mathdojo-*` values become per-racer namespaces (e.g. `mathdojo-<racer>-progress`). **Save/load must stay backward compatible**: an old single-profile file loads into the racer who is active at load time; the new export contains both.
- Lane definition per racer: `{ name, initial, age, from, to, soarBand }` where `from`/`to` slice `LEVELS` (younger racer runs Counting → Fact Family; older runs Carry Addition → Grand Finale). Ages and the split are product decisions — confirm with the customer before shipping.
- Quiz-local: `levelIdx`, `qNum`, `answer`, `checked ('ok'|'bad'|null)`, `hintOpen`, `correct`, `wrong`.
- Derived only, never stored: accuracy, quiz progress %, trophy %, next-trophy label, mastered counts.

## Assets

- `race-bg.jpg` — the repo's existing background photo, unchanged.
- All iconography is emoji, as in the source app (no icon files exist in the repo). Level, trophy, badge, SOAR and gym-set emoji come verbatim from `mathdata.js` / `mentalmath.js`.
- Fonts: Lilita One + Nunito Sans from Google Fonts, already imported at the top of `style.css`.
- No logo exists in the repo; none was invented.

## Known gaps in the prototype

- Quiz questions are a small hand-picked sample per level; the real `generateLevel()` output (15 questions, 5 input kinds: numeric, multiple choice, coin picker, compose-pair, fact family) must be wired in. Multiple choice should use the design system's AnswerTile; coin picker, compose and fact-family inputs keep their current markup with the new card treatment.
- The Gym's Learn-a-trick, Flash-card, Tens & Ones and Carry & Borrow interiors, and the SOAR activity detail screen, are unchanged from today and were not redesigned — they inherit the new shell only.
- Badge section on the Trophies screen is specified above but not drawn in the prototype.
