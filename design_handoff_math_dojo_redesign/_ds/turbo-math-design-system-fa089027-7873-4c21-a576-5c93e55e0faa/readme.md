# Turbo Math Design System

A modernized, boy-appeal redesign of **Math for Pre-K** (in-app title: "Safaan's Car & Food Truck Math"), a Capacitor/Android counting-and-math app for preschoolers built around toy cars and food trucks. The customer's brief: the existing app reads as **too girly and dated** (hot-pink/purple palette, bubbly cartoon type, candy emoji everywhere); redesign it for a boy audience while keeping the car/food-truck subject matter and the underlying game mechanics (levels, quizzes, streaks, trophies, SOAR real-world activities).

This system, **Turbo Math**, keeps the racing theme already latent in the source content and expresses it visually: dark teal/graphite surfaces, cyan + coral action colors, a blocky display face, and a "pressed game button" interaction language, in place of the pastel/bubble aesthetic.

## Sources
- Local codebase: `MathForPreK/` (Capacitor Android app — `www/index.html`, `www/app.js`, `www/style.css` are the real UI source; `android/` is the native wrapper; `apk/` a built debug APK).
- GitHub: [shiblee86/Math-Pre-K-Android](https://github.com/shiblee86/Math-Pre-K-Android) — same app, mirrored. Explore further there for the full quiz-generation logic in `app.js` (50KB, all question types) if you need to extend this redesign into working code.

Neither source defines a formal design system or component library — the original is a single hand-written CSS file. Colors, type, and the full standard component set here (Button, Badge, etc.) were authored fresh for this redesign; the app's actual content (categories, trophies, SOAR activity list, screen structure) was carried over verbatim from `app.js`/`index.html`.

## Content fundamentals
- **Voice**: short, direct, second-person instructions read aloud to a 4–6 year old ("How many wheels do you see?", "Count each car carefully — one at a time!"). Praise is enthusiastic but plain: "Great job!", "Superstar!", "Good try!" — never sarcastic or cutesy-baby-talk.
- **Casing**: sentence case throughout; UI labels are short (1–3 words: "Save", "Levels", "Next").
- **Emoji**: used constantly in the source as inline iconography (🏎️🍔🦅⭐🔥🏆) — carried forward here but curated toward racing/mechanical imagery (🏎️🏁⚙️🚀) rather than the source's mixed food/hearts/rainbow set, and balanced with real icon components in UI chrome so it reads as an app, not a sticker sheet.
- **Numbers/units**: always written as words in prompts aimed at kids ("How many"), but scores/stats use numerals.
- **Personalization**: the shipped app hardcodes a child's name ("Safaan") into titles and result screens. This system is genericized for reuse — components and the UI kit use "Turbo Math" / no name — but that personalization pattern (kid's name appears in title, level names, praise) is worth keeping if you rebuild the real app.

## Visual foundations
- **Palette**: dark teal/graphite base (`--bg-app #0A1F1F`, surfaces stepping up to `--surface-raised`) replaces the source's purple `#1a0f2a`/pink `#ff69b4` combo. Primary action color is cyan (`--color-primary`), energetic CTAs use coral (`--color-accent`), rewards/stars use amber, success is mint-green, errors are red. No pink or purple anywhere.
- **Type**: display headlines in **Lilita One** (blocky, bold, still playful but less "bubble-letter" than the source's Baloo 2) — used for titles, level names, big numbers. Body/UI text in **Nunito Sans** — same family the source used for body text, kept because it's warm without being feminine.
- **Backgrounds**: flat dark surfaces, no gradients-as-decoration (the source leaned heavily on pink/purple/gold gradients for buttons and cards). Any gradient use here is restrained — a progress-bar fill, an achievement glow — never a whole-panel background.
- **Shape language**: moderate rounding (`--radius-md`/`lg`, 14–20px) instead of the source's very heavy "bubble" radius (40–80px). Pill shapes (`--radius-pill`) are reserved for badges, chips, and the score counter — not every surface.
- **Buttons/cards ("pressed" feel)**: kept the source's chunky bottom-shadow + translateY-on-press interaction (it reads as tactile/game-like and works well for small hands), but shadows are now a dim value of the button's own hue (e.g. a cyan button casts a `--cyan-600` shadow) instead of the source's near-black or magenta shadows.
- **Hover/press states**: hover = slight lift (`translateY(-3px)`) on cards, no color shift; press = shadow collapses to 2px and the element translates down into it. No opacity-based hover states.
- **Borders**: 2–4px solid borders in a lighter tint of the surface color, used to separate cards/tiles from the dark background rather than shadows alone.
- **Corner radius scale**: sm 8 / md 14 / lg 20 / xl 28 / pill 999.
- **Animation**: kept the source's snappy, springy easing (`--ease-snap`, a back-out cubic-bezier) for correct/wrong feedback and milestone pop-ins — appropriate for a young-kid game — but dropped the constant ambient animation (floating mascot, pulsing glows on idle elements) in favor of animation only as *feedback* to an action.
- **Imagery**: none provided by the source (it's emoji-only, no photography or illustration assets). No images were fabricated — see Iconography below.
- **Transparency/blur**: used sparingly for overlay scrims behind modals (`rgba(4,10,10,0.75)`) — not for surfaces or cards.

## Iconography
- The source app has **no icon system** — it is 100% emoji used as inline glyphs (🏠💾📂🔊🔁🏆⭐🔒 etc.), no SVGs, no icon font, no PNG icon set to copy in.
- This system substitutes **Lucide** (CDN, `unpkg.com/lucide`) for structural UI chrome — nav, control buttons, form-adjacent icons — matching the flat, medium-stroke style that reads as "modern app" rather than "sticker pack." This is a flagged substitution: **no icon assets exist in the source to copy**; if the real brand has a preferred icon set, swap it in `tokens/` usage.
- Emoji are kept for game content and rewards (level icons, trophies, answer objects to count) — that's inherent to the app's pedagogy (counting emoji objects) and its playful tone, just curated toward racing/mechanical subjects instead of the source's food/candy/heart mix.
- No logo exists anywhere in the source (package.json, HTML, APK metadata) — see Brand below.

## Brand
**No logo was provided or found in any source** (codebase, GitHub repo, or APK). Per design-system policy, no logo was invented. The wordmark specimen (`guidelines/brand-wordmark.html`) renders "TURBO MATH" in plain display type as the stand-in wherever a mark would go — replace with a real logo file if the customer provides one.

## Index
- `styles.css` — root stylesheet, imports everything below. Link this one file from any consumer.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css` (incl. radius/shadow/easing), `fonts.css` (Google Fonts import for Lilita One + Nunito Sans), `base.css` (resets, link colors).
- `components/core/` — `Button`, `IconButton`, `Badge`, `ProgressBar`.
- `components/cards/` — `MenuCard`, `LevelTile`.
- `components/game/` — `AnswerTile`, `QuizStatRow`.
- `components/navigation/` — `TopBar`, `QuickNav`.
- `components/feedback/` — `Modal`.
- `guidelines/` — foundation specimen cards (colors, type, spacing, radius, shadows, brand wordmark).
- `ui_kits/turbo-math-app/` — interactive click-through recreation: Home → Levels → Quiz → Result, built from the components above.
- `SKILL.md` — portable skill definition for use in Claude Code or elsewhere.
- `github.md` — source-repo sync record.

## Caveats
- No design source (Figma, style guide, or component library) exists for this brand — every token, component, and layout decision here is this redesign's own, informed only by the existing app's code and content. Treat this as a strong starting proposal, not a locked brand system.
- Font substitution: the source used Baloo 2 + Nunito (Google Fonts, not self-hosted, no font files in the repo). This system substitutes **Lilita One** for Baloo 2 (similarly blocky/bold, less "bubble/rounded-cute") and keeps **Nunito Sans** as the closest self-hostable relative of the source's Nunito. Flagging in case the customer wants different fonts.
- Icon substitution: Lucide (CDN) stands in for the source's emoji-only iconography — flagged above.
- The interactive UI kit covers the core play loop (Home/Levels/Quiz/Result) but not every screen in the 50KB `app.js` (SOAR activities, save/load, all ~13 question-type variants). Ask if you'd like those built out too.
