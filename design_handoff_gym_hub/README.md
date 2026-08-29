# Handoff: Mental Math Gym hub — decluttered

## Overview
A redesign of the Mental Math Gym hub screen in `shiblee86/Math-Practice` (`script.js` → `renderGym()`, `index.html` → `#gymScreen`). The shipped screen showed six same-weight tiles in six different border colors, plus a ten-chip "Pick what to practise" panel whose chips did nothing, plus a footer button — too many competing elements. This redesign restructures it around three featured actions and folds the rest in as content sources.

Structural changes from the shipped screen:
- **Three featured cards** replace six tiles: **Daily assignment**, **Learn a trick**, **Flash cards**, laid out as equal-width columns (wrapping on narrow screens).
- **Tens & ones, Carry & borrow and Speed drill are no longer top-level destinations.** They became problem *sets* that feed the Daily assignment (Speed drill survives as a "⚡ Speed round" toggle on the Daily assignment card).
- **New "Random mix" tile** — a secondary-tier, neutral-colored row: a surprise mix of number and word problems from the picked sets.
- **"Pick what to practise" now does something**: toggling a chip changes the set count and the per-set problem breakdown shown inside Daily assignment and Random mix.
- **Palette cut from six tile colors to three** (cyan / amber / coral) plus a neutral tier.
- **Persistent back button** in the header, driven by a navigation history stack (hidden, not removed, when there is nothing to go back to — so layout does not shift).

## About the Design Files
`Mental Math Gym.dc.html` is a **design reference built as an interactive HTML prototype** (React under the hood, no build step — open it in a browser). It is not production code to paste in. The task is to **recreate this design and its interactions in `shiblee86/Math-Practice`'s own patterns**: vanilla JS in `script.js`, content/logic in `mentalmath.js`, tokens and component classes in `style.css`, no bundler, no ES modules (the app is also opened over `file://`).

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, shadows and all interactive states are final and should be matched. The prototype is fully functional — click through it to see every state (chip toggles, question flow, right/wrong feedback, flip cards, completion screens).

## Screens / Views

### 1. Gym hub
- Centered column, `max-width: 640px`, page padding `32px 16px`, page background `var(--bg-app)`.
- **Header**: 40×40 back button (`var(--surface-2)`, `2px solid var(--border-strong)`, `var(--radius-md)`, glyph `‹`) + centered block: 🧠 at 30px, "Mental Math Gym" in `var(--font-display)` / `var(--text-xl)`, sub-line "Fast facts, in your head. No paper, no fingers." in `var(--text-sm)` / `var(--text-secondary)`. A 40px spacer balances the row. Back button uses `visibility: hidden` when the history stack is empty.
- **Featured row**: `display:flex; flex-wrap:wrap; gap:14px`, each card `flex: 1 1 190px`, `background: var(--surface-1)`, `3px solid` its hue, `var(--radius-lg)`, padding `20px 18px`, `box-shadow: 0 8px 0 <hue-600>`.
  | Card | Border / shadow | Icon | Copy | Stat |
  | --- | --- | --- | --- | --- |
  | Daily assignment | `var(--color-primary)` / `var(--shadow-primary)` | 📋 | "Number and word problems from the sets you pick below." | `<n> sets picked · 0/16 today` in `var(--cyan-300)` |
  | Learn a trick | `var(--amber-500)` / `var(--shadow-reward)` | 🌉 | "A hard sum, broken into little steps." | `go` in `var(--amber-400)` |
  | Flash cards | `var(--color-accent)` / `var(--shadow-accent)` | 🃏 | "Flip a card. Say the answer out loud." | `72% mastered` in `var(--coral-300)` (wire to `mastery(mmCards)`) |
  - Icon 32px, title `var(--font-display)` / `var(--text-lg)`, body `var(--text-sm)` / `var(--text-secondary)` with `min-height:40px` so the three cards align.
  - Daily assignment also carries a **⚡ Speed round toggle**: label `var(--text-xs)` / `var(--text-muted)` + a 38×20 pill switch (`var(--radius-pill)`, cyan when on, `var(--surface-2)` + `var(--border-strong)` when off) with a 14px white knob that slides `1px → 17px` over `.15s var(--ease-out)`. Its click must `stopPropagation()` so it does not open the card.
- **Random mix row** (secondary tier): full-width flex row, `var(--surface-1)`, `2px solid var(--border-strong)`, `var(--radius-md)`, padding `14px 16px`, `margin-top:14px`. 🎲 at 24px, title `var(--font-display)` / `var(--text-base)`, sub-line `Mixes <n> sets you picked` in `var(--text-xs)`, `›` chevron in `var(--text-muted)`. Deliberately no colored border or shadow — it reads as a level below the three featured cards.
- **Pick what to practise panel**: `margin-top:20px`, `var(--surface-1)`, `2px solid var(--border-subtle)`, `var(--radius-lg)`, padding `18px`. Title in `var(--font-display)` / `var(--text-base)` / `var(--cyan-300)`; helper line "Tap to turn a set on or off — it changes what shows up in Daily assignment and Random." in `var(--text-xs)` / `var(--text-muted)` / weight 700. Chips: `display:flex; flex-wrap:wrap; gap:8px`, each `padding:9px 15px`, `var(--radius-pill)`, `var(--text-sm)` weight 700, icon + label.
  - Active chip: `background: var(--color-primary)`, `color: var(--text-on-primary)`, `2px solid var(--color-primary)`.
  - Inactive chip: `background: var(--surface-2)`, `color: var(--text-secondary)`, `2px solid var(--border-strong)`.
  - Sets (11): 🔟 Tens & ones · 🧮 Carry & borrow · ➕ Add to 20 · ➖ Take away · 🌉 Bridging ten · 🔷 Doubles · 🎯 Make ten · ⚡ Nines · ❓ Missing number · ✖️ Times tables · 🔢 Same tens. Defaults on: the first five.
- **Footer**: full-width quiet button "👪 Grown-up summary" — transparent background, `2px solid var(--border-subtle)`, `var(--radius-md)`, padding 10px, `var(--text-secondary)` / `var(--text-sm)` / weight 700. No shadow, deliberately lower emphasis than everything above.

### 2. Daily assignment / Random mix overview
- Header: back button + `📋 Daily assignment` (or `🎲 Random mix`) in `var(--font-display)` / `var(--text-lg)`.
- Description card: `var(--surface-1)`, `3px solid` the screen's hue, `var(--radius-lg)`, padding `28px 22px`, centered, `box-shadow: 0 8px 0 <hue-600>`. 40px icon, then copy:
  - Daily: `16 problems today — number and word problems, split evenly across the <n> sets you picked below[, with a speed round mixed in].`
  - Random: `12 problems, a surprise mix pulled from the <n> sets you picked below — numbers and word problems both.`
- "Problems will come from:" label (`var(--text-xs)` / `var(--text-muted)` / 700), then one row per picked set: `var(--surface-1)`, `2px solid var(--border-subtle)`, `var(--radius-md)`, padding `12px 14px`, `margin-bottom:8px` — set icon (20px), set name (`var(--font-display)` / `var(--text-sm)`), `<n> problems` beneath it in `var(--text-xs)` / `var(--text-muted)`, and a sample problem right-aligned in `var(--font-display)` / `var(--text-base)` / `var(--cyan-300)`.
- Problem counts split the total evenly with the remainder spread over the first sets (`16` daily, `12` random).
- Full-width primary "Start daily assignment ▶" / "Start random mix ▶" button (cyan, `0 5px 0 var(--shadow-primary)`); dimmed to `opacity .4` when no set is picked.

### 3. Question flow (Daily assignment / Random mix)
- Progress line: `Question <i> of <n> · <score> correct` in `var(--text-xs)` / `var(--text-muted)` / 700.
- Question card (same card shell as above): question text in `var(--font-display)` / `var(--text-2xl)`, then a 160px centered number input (`var(--surface-2)`, `2px solid var(--border-strong)`, `var(--radius-md)`, `var(--text-lg)`, `var(--font-display)`).
- After Check: feedback line in `var(--font-display)` / `var(--text-base)` — `✅ Correct!` in `var(--mint-400)`, or `Answer: <n>` in `var(--coral-300)`. The Check button swaps to `Next ▶`.
- Completion card: 🏁, "All done!" in `var(--font-display)` / `var(--text-lg)`, `You got <score> of <total> correct`, and a `Done` button returning to the hub.
- In the real app these questions must come from the existing generators (`dailySheet`, `columnSheet`, `tensSheet`, `randFact`/`buildDrill` in `mentalmath.js`) filtered to the picked sets — the prototype uses lightweight stand-in generators for the same shapes.

### 4. Learn a trick
Matches the shipped trainer screen's pattern, and uses the **real `trainerFact()` / `trainerSteps()` from `mentalmath.js`** (ported verbatim into the prototype) so the strategies are identical: bridging ten (add and subtract), missing number, same tens, count up, count on.
- Intro state: card with 🌉, "A hard sum, broken into little steps, until it clicks." and a `Start ▶` button.
- Stepping state: the fact (e.g. `18 − 9`) centered in `var(--font-display)` / `var(--text-xl)`, then **all of the fact's steps stacked from the start** — each a row with the step text on the left and its answer slot on the right:
  - **Active step**: `background: var(--surface-2)`, `2px solid var(--amber-500)`, `var(--radius-md)`, weight 700; its slot shows the live typed digits (or `·`) in `var(--amber-400)` / `var(--text-lg)`.
  - **Solved step**: transparent background, transparent border, slot shows the entered answer in `var(--mint-400)`.
  - **Future step**: transparent, `opacity: .5`, empty slot.
- Number keypad below: `grid-template-columns: repeat(3, 1fr)`, `gap:8px`, keys `1–9`, `⌫`, `0`, `✓`. Keys are `var(--surface-2)` / `var(--text-primary)`; `✓` is `var(--color-primary)` / `var(--text-on-primary)`. Padding `16px 0`, `var(--font-display)` / `var(--text-lg)`, `var(--radius-md)`. Entry capped at 3 digits.
- **A wrong answer does not advance.** It clears the entry and shows "Not quite — try again ✏️" in `var(--coral-300)` / `var(--text-sm)` / 700 between the card and the keypad; the child stays on that step until it is right. Consequently the completion copy — `Nailed it! <fact> = <answer>.` — is always earned. `Try another ▶` regenerates a new fact.
- Step copy was **rewritten from the shipped wording** for comprehension (the original "Split the 9 into 8 and" tested badly with adults, let alone 7-year-olds). Answers and step counts are unchanged:
  - Bridge add (`8 + 8`): "First make ten. 8 + ? = 10" → "You used 2 of the 8. How many are left over?" → "Now add those to ten. 10 + 6 = ?"
  - Bridge subtract (`18 − 9`): "First get down to ten. 18 − ? = 10" → "You took away 8 of the 9. How many are still left to take?" → "Now take those off ten. 10 − 1 = ?"
  - Missing number: "Hop up from <a> to ten. How many hops?" → "Now hop from ten up to <c>. How many hops?" → "Put the hops together: <x> + <y> = ?"
  - Missing minuend: "We took <b> away and <c> was left. Put the <b> back: <c> + <b> = ?"
  - Same tens: "<a> and <b> both have <t> tens. The tens match, so just take the ones: <a1> − <b1> = ?"
  - Count up / count on keep the shipped wording (already plain): "We start at <b>. What number comes next?" → "Now hop up to <a>: 8 → 9, 9 → 10… How many hops was that?"
- **Step text must be derived at render time from the fact**, not stored — otherwise copy changes never reach an in-progress problem.

### 5. Flash cards
- Intro: card with 🃏, "Flip a card, say the answer out loud, grade yourself." and `Start ▶`.
- Deck of 5 cards drawn from the picked sets. Progress line `Card <i> of <n>`.
- Card front: the fact in `var(--font-display)` / `var(--text-2xl)` + "Tap to flip" hint in `var(--text-xs)` / `var(--text-muted)`. Tapping the card flips it.
- Card back: the answer in `var(--font-display)` / `var(--text-3xl)` / `var(--coral-300)`, with the set name beneath in `var(--text-xs)` / `var(--text-muted)`. In the real app also show `strategyFor(fact).name` and `.line`.
- Grading row (back only): two equal buttons, `gap:10px`, padding 14px, `var(--radius-md)` — "Got it ✅" on `var(--color-success)` / `var(--text-on-primary)`, "Tricky 🔁" on `var(--surface-2)` / `var(--text-primary)`. Both advance; wire them to `gradeCard(cards, id, easy, session)` (Leitner boxes) in the real app.
- Completion: 🏁 "Deck done! Shuffle in a new one whenever you like." + `New deck ▶`.
- **Number limit**: every adding, taking-away and tens & ones fact on a flash card is capped at **30** — no number in the question and no answer exceeds it (times tables are currently uncapped). Enforce this in the generator, with a bounded retry and a safe fallback, not by filtering after the fact.

### 6. Grown-up summary
Reached from the hub footer. Card with 👪 and "A quick look at which strategies are clicking and which need another go." — a placeholder in the prototype; in the real app render the existing `showTensReport()` content here.

## Interactions & Behavior
- **Navigation**: a screen name plus a history stack. Opening a screen pushes the current one; back pops. Back is `visibility:hidden` (never `display:none`) when the stack is empty, so nothing shifts.
- **Chip toggles** re-render the hub immediately and change the set count, the per-set problem counts, and both Daily/Random descriptions. Never allow an empty selection to start a session — the Start button dims instead.
- **Speed round toggle** lives on the Daily assignment card and must not trigger card navigation.
- **Card / button press feel**: keep the app's existing pressed-button mechanic (`box-shadow` collapses to 2px, element translates down into it, `var(--ease-out)`).
- **Keypad**: max 3 digits; `⌫` deletes one; `✓` submits. Typing clears any "Not quite" message.

## State Management
- `screen`: `hub | daily | random | play | trick | flash | summary`
- `history`: array of screen names for back navigation
- `chips`: `{ [setId]: boolean }` — the practise selection
- `speedRound`: boolean
- `play`: `{ kind, queue, idx, score, wrong, inputValue, feedback, done }`
- `trick`: `{ f (the fact object), doneSteps: [{given, ok}], entry, done, wrongFlash }` — steps derived from `f` on render
- `flash`: `{ cards, idx, flipped, done }`

In the real app, persist through the existing `tm-mm-*` localStorage keys and include any new field in `buildSaveBundle()` / `handleLoadFile`, each individually guarded.

## Design Tokens
From the Turbo Math design system (`_ds/.../tokens/` in this bundle, matching the app's `style.css`).

- **Surfaces**: `--bg-app #0A1F1F`, `--bg-app-deep #081716`, `--surface-1 #0D2828`, `--surface-2 #123636`, `--surface-raised #1B4747`, `--border-subtle #1B4747`, `--border-strong #275C5C`
- **Cyan (primary)**: `#0EA3A3` / `#17C7C7` / `#3DDCDC` / `#7EEAEA` / `#B8F5F5` (600→200)
- **Coral (accent)**: `#E6432E` / `#FF5C3D` / `#FF8563` / `#FFB29B` (600→300)
- **Amber (reward)**: `#D68A00` / `#FFB020` / `#FFC94D` / `#FFDE8C` (600→300)
- **Signal**: mint `#2FE6A7` / `#6EF0C2`, red `#FF3B3B` / `#FF6B6B`
- **Text**: `--text-primary #F4FBFB`, `--text-secondary #A9C4C4`, `--text-muted #6E8C8C`, `--text-on-primary #081716`, `--text-on-accent #2A0F08`
- **Type**: display `Lilita One`, body `Nunito Sans`. Scale `--text-xs .8rem`, `sm .95rem`, `base 1.1rem`, `md 1.3rem`, `lg 1.6rem`, `xl 2rem`, `2xl 2.6rem`, `3xl 3.6rem`. Weights 400 / 700 / 900.
- **Spacing**: `--space-1..18` = 4 → 72px
- **Radius**: sm 8 / md 14 / lg 20 / xl 28 / pill 999
- **Shadows**: `--shadow-btn-sm 0 3px 0`, `md 0 5px 0`, `lg 0 7px 0`; colored variants `--shadow-primary` (cyan-600), `--shadow-accent` (coral-600), `--shadow-reward` (amber-600), `--shadow-neutral` (teal-950)
- **Easing**: `--ease-snap cubic-bezier(.34,1.56,.64,1)`, `--ease-out cubic-bezier(.16,1,.3,1)`

## Assets
No images or icon files. Iconography is emoji, matching the app. `race-bg.jpg` (the app's fixed background with its dark scrim) is not included in this bundle — keep the app's existing background treatment behind these screens.

## Files
- `Mental Math Gym.dc.html` — the interactive prototype. Open directly in a browser; needs `support.js` and `_ds/` beside it.
- `support.js` — prototype runtime (not for production).
- `_ds/turbo-math-design-system-.../` — design tokens (`tokens/*.css`), root stylesheet, component bundle. The token files are the exact source for every value above.
