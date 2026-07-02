# Tailwind Color Configuration — Trading Squad

## Design System: Obsidian Forge

Dark-first professional trading aesthetic. All backgrounds are zinc-950 dark.

## Color Choices

- **Primary (Accent):** `pink` — Used for active nav states, primary buttons, focus rings, highlights
- **Secondary (Positive):** `emerald` — Used for profit, success states, positive indicators
- **Neutral:** `zinc` — Used for ALL backgrounds, borders, text hierarchy

## Background Hierarchy

```
zinc-950  — main app background, sidebar
zinc-900  — card backgrounds
zinc-800  — elevated elements, borders, table headers
zinc-700  — hover states, active backgrounds (non-primary)
zinc-600  — disabled text
zinc-500  — muted/secondary text, nav icons (inactive)
zinc-400  — secondary text
zinc-50   — primary text
```

## Usage Patterns

### Buttons

```
Primary:   bg-pink-600 hover:bg-pink-700 text-white
Secondary: bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700
Danger:    bg-red-600 hover:bg-red-700 text-white
Ghost:     hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100
```

### Cards

```
Standard card: bg-zinc-900 border border-zinc-800 rounded-lg p-4
Elevated card: bg-zinc-800 border border-zinc-700 rounded-lg p-4
```

### Navigation (Sidebar)

```
Nav item (inactive): text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50
Nav item (active):   text-pink-400 bg-pink-600/10 border-l-2 border-pink-600
Nav icon (inactive): text-zinc-500
Nav icon (active):   text-pink-400
Group label:         text-zinc-500 text-xs uppercase tracking-wide
```

### Status / Semantic Colors

```
Positive (profit/green): text-emerald-400  bg-emerald-500/10  border-emerald-500/30
Negative (loss/red):     text-red-400      bg-red-500/10      border-red-500/30
Warning (amber):         text-amber-400    bg-amber-500/10    border-amber-500/30
Info (blue):             text-blue-400     bg-blue-500/10     border-blue-500/30
Neutral (gray):          text-zinc-400     bg-zinc-800        border-zinc-700
```

### Order Status Badge Colors

```
DRAFT:            bg-zinc-800 text-zinc-400
PENDING_APPROVAL: bg-amber-500/10 text-amber-400 border border-amber-500/30
APPROVED:         bg-blue-500/10 text-blue-400 border border-blue-500/30
SUBMITTED:        bg-blue-500/10 text-blue-400
ACKNOWLEDGED:     bg-blue-500/10 text-blue-400
PARTIALLY_FILLED: bg-teal-500/10 text-teal-400 border border-teal-500/30
FILLED:           bg-emerald-500/10 text-emerald-400 border border-emerald-500/30
CANCELLED:        bg-zinc-800 text-zinc-500
REJECTED:         bg-red-500/10 text-red-400 border border-red-500/30
EXPIRED:          bg-zinc-800 text-zinc-500
AMENDED:          bg-blue-500/10 text-blue-400
FAILED:           bg-red-500/10 text-red-400 border border-red-500/30
```

### Data Badges

```
BUY side:  bg-emerald-500/10 text-emerald-400
SELL side: bg-red-500/10 text-red-400

IB broker badge:     bg-blue-500/10 text-blue-400
Binance broker badge: bg-amber-500/10 text-amber-400
```

### Numeric/Trading Data

All numeric trading data (prices, P&L, quantities, percentages) uses monospace font:

```
Monospace: font-mono
Positive P&L: text-emerald-400
Negative P&L: text-red-400
Neutral data: text-zinc-100
```

### Forms / Inputs

```
Input:       bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500
             focus:border-pink-600 focus:ring-1 focus:ring-pink-600
Input error: border-red-500 focus:border-red-500 focus:ring-red-500
Label:       text-zinc-400 text-sm
Error msg:   text-red-400 text-xs mt-1
```

### Focus Ring (all interactive elements)

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950
```

### Stat Cards (Dashboard Pattern)

```python
# NiceGui equivalent
def stat_card(label: str, value: str, icon: str, change: str = None, change_positive: bool = True):
    with ui.card().classes('flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4'):
        with ui.row().classes('items-center gap-2 mb-2'):
            ui.icon(icon).classes('text-pink-400 text-lg')
            ui.label(label).classes('text-zinc-400 text-sm')
        ui.label(value).classes('text-2xl font-mono font-bold text-zinc-50')
        if change:
            color = 'text-emerald-400' if change_positive else 'text-red-400'
            ui.label(change).classes(f'text-xs {color} mt-1')
```

## Chart Palette (ECharts / Plotly)

Use this color sequence for multi-series charts:

```
Series 1 (primary):   #db2777  (pink-600 — main portfolio line)
Series 2 (benchmark): #71717a  (zinc-500 dashed — benchmark overlay)
Series 3:             #10b981  (emerald-500)
Series 4:             #3b82f6  (blue-500)
Series 5:             #f59e0b  (amber-500)
Series 6:             #8b5cf6  (violet-500)
```

Drawdown chart fill: `rgba(239, 68, 68, 0.15)` (red-500 at 15% opacity)
Positive area fill: `rgba(16, 185, 129, 0.15)` (emerald-500 at 15% opacity)
