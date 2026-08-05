Chunky primary-action button with a colored pressed-shadow ("game button") feel — use for CTAs, quiz controls, and menu actions.

```jsx
<Button variant="primary" size="md" onClick={go}>Start</Button>
<Button variant="accent" icon={<Icon/>}>Play</Button>
<Button variant="reward" size="lg">Claim ⭐</Button>
```

Variants: `primary` (cyan, main CTA), `accent` (coral, energetic highlight), `ghost` (neutral surface, secondary), `reward` (amber, stars/trophies). Sizes: `sm`/`md`/`lg`. Supports `disabled` and a leading `icon`.
