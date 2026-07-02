# Typography — Trading Squad / Obsidian Forge

## Font Stack

| Role | Font | Fallback |
|------|------|---------|
| Headings | DM Sans | ui-sans-serif, system-ui, sans-serif |
| Body | DM Sans | ui-sans-serif, system-ui, sans-serif |
| Monospace (all numeric data) | JetBrains Mono | 'Fira Code', 'Cascadia Code', ui-monospace, monospace |

## Google Fonts Import

### HTML `<head>` method

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS `@import` method

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

### NiceGui method

```python
# In your main app setup or page function:
ui.add_head_html('''
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body, * { font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif; }
  .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
</style>
''')
```

## Typography Scale

Minimum font size is **12px (`text-xs`)**. Never use `text-[10px]`, `text-[11px]`, or `text-[9px]`.

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs font-medium` | 12px | 500 | Labels, badges, nav group headers |
| `text-sm` | 14px | 400 | Secondary text, table cells, form labels |
| `text-base` | 16px | 400 | Body text, form inputs |
| `text-lg font-semibold` | 18px | 600 | Card titles, section headers |
| `text-xl font-bold` | 20px | 700 | Screen titles |
| `text-2xl font-bold font-mono` | 24px | 700 | Stat card values (monospace) |
| `text-3xl font-bold font-mono` | 30px | 700 | Hero values |

## Monospace Usage Rule

**All numeric and trading data must use `font-mono` (JetBrains Mono):**

- Portfolio values, P&L amounts
- Order prices, quantities
- Percentages and ratios
- Timestamps and dates in tables
- Order IDs and instrument symbols
- Confidence scores
- All metric values in stat cards

```python
# NiceGui examples
ui.label('$47,231.89').classes('text-2xl font-mono font-bold text-zinc-50')
ui.label('+$1,234.56').classes('text-sm font-mono text-emerald-400')
ui.label('-2.3%').classes('text-sm font-mono text-red-400')
ui.label('AAPL').classes('text-sm font-mono font-semibold text-zinc-100')
```

## Font Weights

- **300** — Light: rarely used, only for very large display text
- **400** — Regular: body text, secondary information
- **500** — Medium: labels, nav items, button text
- **600** — Semibold: card titles, column headers
- **700** — Bold: stat values, screen titles, important data

## Letter Spacing

Nav group labels use wide tracking: `tracking-wide` or `tracking-widest` with uppercase and `text-xs`.

```html
<span class="text-xs font-medium uppercase tracking-wide text-zinc-500">Overview</span>
```
