# Trading Squad Design System — build conventions

A **dark-first** trading UI ("Obsidian Forge"): magenta brand accent, DM Sans for text, JetBrains Mono for all numbers/data. Components are React, props-driven, and styled with **Tailwind CSS v4 utility classes** (no CSS-in-JS, no styled-components). Import them from the bundle and compose with utility classes for your own layout.

## Setup — dark mode is the brand default
Dark styling is gated by a `.dark` class on an ancestor (`@custom-variant dark (&:is(.dark *))`). To render the intended brand look, put your design inside a dark root:

```jsx
<div className="dark bg-background text-foreground min-h-screen">
  {/* your composition */}
</div>
```

Light mode is fully supported too — omit `.dark` and the same tokens resolve to the warm-stone light palette. No theme Provider/context is needed; tokens are plain CSS variables applied by the stylesheet, so any component renders correctly as long as `styles.css` is loaded and a `.dark` ancestor (or not) sets the mode.

## Styling idiom — semantic Tailwind tokens (use these, don't invent hex)
Style with the design system's **semantic token utilities**, not raw hex. Core vocabulary (all are real Tailwind classes backed by the theme):

| Purpose | Classes |
|---|---|
| Surfaces | `bg-background` (app bg), `bg-card` (panels/cards), `bg-muted`, `bg-accent`, `bg-sidebar`, `bg-popover` |
| Text | `text-foreground` (primary), `text-muted-foreground` (secondary), `text-hint` (tertiary), `text-faint` (faintest), `text-card-foreground` |
| Brand accent (magenta) | `bg-primary`, `text-primary`, `text-primary-foreground`, `border-primary` |
| Lines | `border-border`, `border-primary` |
| Destructive | `bg-destructive`, `text-destructive` |
| Radius | `rounded-md`, `rounded-lg`, `rounded-xl` (driven by `--radius`) |

**Financial state colors** use Tailwind's built-in palette with `dark:` pairs, matching the components' own convention:
- Positive / gains → `text-emerald-600 dark:text-emerald-400`
- Negative / loss → `text-red-500 dark:text-red-400`
- Warning / caution → `text-amber-500 dark:text-amber-400`
- Neutral → `text-zinc-500`

**Typography**: DM Sans is the applied default for all UI text (no class needed); use **`font-mono`** (JetBrains Mono) for every number, price, quantity, percentage, and ID — this is a signature of the system. Tabular numerics read as monospace, e.g. `<span className="font-mono">$1,284,300</span>`.

**Semantic tokens are the enforced idiom** — the components themselves are written with them. Never write raw light/dark neutral pairs (`bg-white dark:bg-zinc-900`, `border-zinc-200 dark:border-zinc-800`); use the single semantic class (`bg-card`, `border-border`) — it theme-switches automatically. The `dark:` prefix is only needed for the financial state colors above.

## Where the truth lives
- `styles.css` (and its `@import` of `_ds_bundle.css`) is the full compiled stylesheet — every token definition and utility. Read it to confirm a class exists before using it.
- Each component ships `<Name>.d.ts` (its exact prop contract — the API you code against) and `<Name>.prompt.md` (usage notes + examples) under `components/<group>/<Name>/`.
- Components are grouped by product area: `trading-core`, `strategy-engine`, `market-data`, `market-intelligence`, `portfolio-and-positions`, `trade-journal`, `trading-calendar`, `alerts`, `settings-and-operations`, `shell`.

## Idiomatic example
```jsx
import { StatCard, OrderStatusBadge } from 'trading-squad-ds'
import { Wallet } from 'lucide-react'

<div className="dark bg-background text-foreground p-6">
  <div className="grid grid-cols-2 gap-4 max-w-2xl">
    <StatCard icon={Wallet} label="Portfolio Value" value="$1,284,300" change="+2.4% today" changeType="positive" />
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Last order</p>
      <p className="mt-2 font-mono text-2xl text-foreground">TSLA · 10 @ mkt</p>
      <div className="mt-2"><OrderStatusBadge status="filled" /></div>
    </div>
  </div>
</div>
```
Library components carry the design language; use the token utilities above for your own layout glue. Lucide icons (`lucide-react`) are the icon set throughout.
