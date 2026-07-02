# Trade Journal

## Overview

The trader's reflection and improvement hub. Full CRUD journaling with pre-trade and post-trade reviews, process scoring across five dimensions, portfolio-scoped analytics, and behavioral pattern detection. Core insight: separating process quality from outcome quality — a good process can have bad outcomes (unlucky) and vice versa.

## Screens

1. **Dashboard** (`/journal`) — Stats, recent entries, behavioral alerts, habit score gauges
2. **Entries** (`/journal/entries`) — 3 tabs: Needs Review, All Entries, Starred
3. **Entry Detail** — Full entry view with radar chart for process scores
4. **Entry Editor** — Create/edit form with pre-trade, post-trade, and scoring sections
5. **Analytics** (`/journal/analytics`) — Performance, Process Scores, Attribution sub-tabs
6. **Behavioral Patterns** (`/journal/behavioral`) — Pattern detection with habit gauges
7. **Weekly Review** (`/journal/weekly`) — Weekly summary, goals, focus areas

## User Flows

- View dashboard with habit score gauges and behavioral alerts
- Create journal entry from "Needs Review" (trade data auto-populated)
- Create standalone journal entry (link to existing trade)
- Edit/delete existing entries (Level 3 confirmation for delete)
- Star/unstar entries for quick reference
- Browse entries with portfolio grouping and multi-filter
- View performance analytics per portfolio with process vs outcome quadrant
- View attribution breakdown by strategy, day of week, time of day
- Review behavioral patterns with P&L impact and actionable recommendations
- Complete weekly review and set next week's focus areas

## Design Decisions

- Process scores: 5 dimensions rated 1-5 via clickable dots (not sliders)
- Overall score = average of 5 dimensions (auto-calculated)
- All 5 process scores are REQUIRED to save an entry
- Process vs outcome quadrant threshold: process >= 3.5 is "high", P&L > 0 is "high outcome"
- Behavioral patterns are cross-portfolio (no portfolio filter on Behavioral screen)
- Weekly review is per-portfolio or "All Portfolios"
- System banner for unjournaled trades (from shell, not rendered by section)

## Visual References

- `dashboard-light.png` / `dashboard-dark.png` — Journal dashboard
- `entries-light.png` / `entries-dark.png` — Entries list (Needs Review tab)
- `entrydetail-light.png` / `entrydetail-dark.png` — Entry detail view
- `editor-light.png` / `editor-dark.png` — Entry editor
- `analytics-light.png` / `analytics-dark.png` — Analytics screen
- `behavioral-light.png` / `behavioral-dark.png` — Behavioral patterns
- `review-light.png` / `review-dark.png` — Weekly review

## Callback Reference

| Action | Description |
|--------|-------------|
| Journal this trade | Open editor pre-filled with closed trade data |
| Save entry | Create/update entry, show success toast |
| Delete entry | Level 3 confirmation, then delete |
| Star/unstar | Toggle starred state |
| Acknowledge pattern | Mark behavioral pattern as reviewed |
| Save weekly focus | Persist focus areas for next week |

## Toast Variants

```python
ui.notify('Journal entry saved', type='positive', timeout=4000)
ui.notify('Journal entry updated', type='positive', timeout=4000)
ui.notify('Journal entry deleted', type='info', timeout=4000)
ui.notify('Pattern acknowledged', type='positive', timeout=4000)
ui.notify('Weekly focus saved', type='positive', timeout=4000)
ui.notify('Save failed: <error>', type='negative', timeout=6000)
```
