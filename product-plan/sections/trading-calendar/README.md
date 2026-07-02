# Trading Calendar

## Overview

Trading Calendar aggregates market-moving events into a unified calendar view. It displays earnings announcements, economic data releases (FOMC, NFP, CPI, GDP), dividend ex-dates, options expirations, and upcoming IPOs — helping traders plan positions around important dates and avoid surprises from scheduled events.

## Screens

1. **Calendar Dashboard** (`/calendar`) — Single-screen combining stats, filters, calendar grid, and event list panel

## User Flows

- View unified month/week calendar with all event types color-coded by category
- Filter events by type (earnings, economic, dividend, options, IPO) using toggle chips
- Filter events by impact level (high, medium, low) for economic events only
- Toggle "Portfolio Only" to show only events relevant to held positions
- Click a calendar day cell to load that day's events in the event list panel
- Click an event row to expand inline detail (varies by event type)
- Navigate between months/weeks using Prev/Next arrows and "Today" button
- View portfolio alerts at top: earnings for held stocks, approaching ex-dividend dates, options expiring soon

## Design Decisions

### Event Type Colors
- **Earnings** — amber (yellow-gold)
- **Economic** — blue (sky/indigo)
- **Dividends** — emerald (green)
- **Options** — purple (violet)
- **IPOs** — pink (matches brand accent)

### Economic Impact Level Colors
- **High** — red (`bg-red-500/10 text-red-400`)
- **Medium** — amber (`bg-amber-500/10 text-amber-400`)
- **Low** — zinc (`bg-zinc-800 text-zinc-400`)

### Calendar Behavior
- Month view: day cells show up to 3 event dots + "+N more" overflow indicator
- Week view: more vertical space, event title snippets alongside dots
- Today highlighted with pink-600 ring
- Days with portfolio events show subtle background tint
- Default selected day = today; shows today's events in the panel

### Event List Panel
- Events sorted by time (morning first), then alphabetically
- Each row: colored type indicator, time (if applicable), title, ticker (if applicable), impact badge, portfolio dot
- Click event row to expand inline detail (no separate page)

### Stats Bar
- This Week: event count with type breakdown
- Portfolio Events: events affecting held positions
- High Impact: count of high-impact economic events in next 7 days
- Upcoming Dividends: total expected dividend income in next 30 days (monospace value)

## Visual References

- `dashboard-light.png` / `dashboard-dark.png` — Main calendar view with event list
- `dismissed-light.png` / `dismissed-dark.png` — Dismissed/hidden events state

## Callback Reference

| Action | Description |
|--------|-------------|
| Navigate month/week | Move calendar forward/backward |
| Toggle event type filter | Show/hide events of a specific type |
| Toggle Portfolio Only | Filter to portfolio-relevant events only |
| Click day cell | Load that day's events in panel |
| Expand event detail | Show full detail for a calendar event |
| Dismiss event | Hide a specific event from the calendar |
| Create price alert | Set alert for a specific event/ticker |

## Toast Variants

```python
ui.notify('Alert created', type='positive', timeout=4000)
ui.notify('Alert removed', type='info', timeout=4000)
```

## States

- **Loading**: skeleton screens for stats, calendar cells, and event list
- **Empty day**: "No events scheduled" in event list panel
- **Empty filters**: "No events match the selected filters. Try enabling more event types." with reset link
- **Error**: "Unable to load calendar events. Please try again." with retry button
