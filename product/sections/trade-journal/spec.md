# Trade Journal Specification

## Overview
Trade Journal is the trader's reflection and improvement hub. It provides full CRUD journaling with pre-trade and post-trade reviews, process scoring across five dimensions, portfolio-scoped performance analytics with attribution, and cross-portfolio behavioral pattern detection that flags destructive habits. The core insight: separating process quality from outcome quality — a good process can have bad outcomes (unlucky) and bad process can have good outcomes (lucky).

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Trade Journal MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Toast Notifications
All user-facing notifications use the shell's toast API (`toastRef.current()`). No inline notification rendering within section components. Toast variants:
- Journal entry saved: success (green, 4s)
- Journal entry updated: success (green, 4s)
- Journal entry deleted: info (blue, 4s)
- Save error: error (red, 6s)
- Pattern acknowledged: success (green, 4s)
- Weekly focus saved: success (green, 4s)

### System Banners
Unjournaled trades alert uses the shell's `SystemBanner` component (yellow variant with "Review" link pointing to Needs Review tab). The section does NOT render its own persistent banners — those come from the shell.

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, side panels
- Tablet (768px–1023px): Condensed layouts, collapsible sections
- Mobile (<768px): Single-column, full-width overlays, stacked cards

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

## User Flows
- View journal dashboard with summary stats (total entries, avg process score, journal completion rate, entries this week), recent entries, process score trend sparkline, active behavioral alerts, and habit score gauges
- Create a journal entry for a completed trade: fill pre-trade thesis (entry criteria, target/stop, confidence, market conditions, emotional state), post-trade review (what worked/didn't, lessons learned, emotional state, would take again), process scores (5 dimensions, 1-5 scale), tags, and related trades
- Edit an existing journal entry to update any section (pre-trade, post-trade, scores, tags, attachments)
- Delete a journal entry with confirmation modal (Level 3 destructive action)
- View journal entry detail: full entry with pre-trade thesis, post-trade review, process scores radar chart, trade outcome summary, tags, related trades, and attachments
- Star/unstar entries to bookmark important trades for later reference
- Browse and filter journal entries by portfolio, date range, instrument, strategy, tags, process score range, and outcome (win/loss) — with portfolio grouping as default view
- View "Needs Review" entries: trades that have been closed but not yet journaled, grouped by portfolio
- View performance analytics filtered by portfolio: win rate, profit factor, Sharpe ratio, Sortino ratio, max drawdown, average holding period
- View process score analytics per portfolio: score trends over time, per-dimension breakdown, process-vs-outcome quadrant chart (high process/high outcome, high process/low outcome, low process/high outcome, low process/low outcome)
- View performance attribution per portfolio: breakdown by strategy, day of week, and time of day
- View behavioral patterns across all portfolios: detected patterns (revenge trading, overtrading, position sizing drift, FOMO, fear patterns, stubbornness) with severity, occurrence count, P&L impact, and actionable recommendations
- View habit scores (cross-portfolio): consistency, emotional control, risk discipline, patience — each 0-100 with trend direction
- View weekly review: current week summary (trades, P&L, win rate, avg process score), best/worst trades, patterns detected, goals progress (target vs actual), and focus areas for next week

## UI Requirements

### Journal Dashboard
- Stat cards follow standard anatomy: semantic icon, label (secondary text), large monospace value (h2), change indicator with semantic coloring
- Cards: total journal entries, avg process score (with trend arrow), journal completion rate (journaled / total closed trades as percentage), entries this week
- Recent entries list (last 5) showing instrument, side, P&L, process score, and date — click navigates to detail
- Process score trend: sparkline chart showing 30-day rolling average
- Active behavioral alerts: banner cards for any moderate/high severity patterns with "View Details" link to Behavioral Patterns screen
- Habit score gauges: four circular progress indicators (consistency, emotional control, risk discipline, patience) — cross-portfolio, 0-100 scale
- Portfolio selector: dropdown to filter dashboard stats by portfolio or "All Portfolios"
- Loading states use skeleton screens (not spinners) for all data-dependent components
- Empty state (no journal entries): icon, "Start journaling your trades to track improvement over time.", "Create Entry" CTA

### Journal Entries Screen (3 tabs: Needs Review, All Entries, Starred)
- Portfolio grouping toggle: entries grouped by portfolio with collapsible portfolio headers showing portfolio name and entry count, or flat list view
- Needs Review tab: trades closed but not yet journaled, sorted by close date descending, with "Journal This Trade" CTA per row. Shows instrument, side, P&L, close date, portfolio. Empty state: icon, "All caught up! No trades waiting for review.", "View All Entries" link
- All Entries tab: full journal entry table with columns — date, instrument, side (BUY/SELL color-coded), portfolio, P&L (semantic color), process score (1-5 with color gradient), strategy, tags. All columns sortable, default sort: date descending
- Starred tab: bookmarked entries for quick reference, same columns as All Entries. Empty state: icon, "Star important entries to find them quickly.", "View All Entries" link
- Filters: portfolio (multi-select), date range picker, instrument search, strategy dropdown, tags (multi-select), process score range (1-5 slider), outcome (Win/Loss/All)
- Pagination at 50 rows per page
- Click row to navigate to journal entry detail
- Inline actions per row: Edit (pencil icon), Delete (trash icon with confirmation), Star/Unstar (star icon toggle)
- Delete confirmation: Level 3 modal — "Are you sure you want to delete this journal entry for {instrument}? This action cannot be undone." with Cancel (secondary) and Delete (danger) buttons
- Real-time updates: new unjournaled trades appear in Needs Review tab via WebSocket

### Journal Entry Detail
- Trade summary card: instrument (symbol + company name), side (BUY/SELL badge), entry/exit dates, entry/exit prices, quantity, P&L (semantic color), P&L %, holding period, portfolio name, broker badge (IB/Binance), strategy
- Pre-trade section (card): thesis, entry criteria, target price, planned stop-loss, risk/reward ratio, position size rationale, confidence level (1-5 displayed as dots), market conditions badge, emotional state before badge
- Post-trade section (card): what worked, what didn't work, lessons learned, emotional state after badge, would take again (Yes/No badge)
- Process scores section (card): radar chart showing all 5 dimensions (discipline, emotional management, risk management, entry quality, exit quality) with overall score displayed prominently. Individual dimension scores shown as labeled horizontal bars
- Tags displayed as badge pills; related trades shown as linked cards (click navigates to that entry's detail)
- Attachments section: uploaded charts/screenshots displayed as thumbnails with lightbox view on click
- Action buttons: Edit (primary, opens editor), Delete (danger, with Level 3 confirmation modal), Star/Unstar toggle (ghost)
- Back navigation via the browser Back button (shell integrates with browser history)
- Empty sections (e.g., no pre-trade data) show subtle placeholder: "No pre-trade notes recorded" with "Edit to add" link

### Journal Entry Editor
- Accessible from: "Create Entry" CTA on dashboard, "Journal This Trade" on Needs Review tab, "Edit" on entry detail or entries table row
- When creating from "Needs Review": trade summary auto-populated from trade data (instrument, side, prices, P&L, dates, portfolio) — read-only display at top of form
- When creating standalone: trade selector (search by instrument or trade ID) to link to an existing trade, with portfolio context shown
- Pre-trade section (collapsible, expanded by default on create):
  - Thesis (textarea)
  - Entry criteria (textarea)
  - Target price (number input, currency formatted)
  - Planned stop-loss (number input, currency formatted)
  - Risk/reward ratio (auto-calculated from target/stop vs entry price, or manual override)
  - Position size rationale (textarea)
  - Confidence level (1-5 interactive selector — clickable dots)
  - Market conditions (select: trending, ranging, volatile, calm, uncertain)
  - Emotional state before (select: calm, confident, anxious, excited, fearful, neutral, frustrated)
- Post-trade section (collapsible, expanded by default on create):
  - What worked (textarea)
  - What didn't work (textarea)
  - Lessons learned (textarea)
  - Emotional state after (select: satisfied, disappointed, relieved, frustrated, neutral, regretful, proud)
  - Would take again (toggle: Yes/No)
- Process scores section (always visible):
  - Five 1-5 selectors (clickable dots) for: discipline, emotional management, risk management, entry quality, exit quality
  - Overall score auto-calculated as average, displayed prominently
  - Tooltip on each dimension explaining what it measures
- Tags: multi-select with typeahead from existing tags, or create new tag inline
- Related trades: search and link to other trade IDs (shows instrument + date preview)
- Attachments: drag-and-drop or click-to-upload area for charts/screenshots (max 10MB per file, image types only)
- Inline validation on blur; required fields: all five process scores are required, at least one of pre-trade or post-trade section must have content
- Save button (primary), Cancel button (secondary) — cancel prompts confirmation if form has unsaved changes
- Notifications via shell's toast API: "Journal entry saved" (success), "Journal entry updated" (success), save error (error)

### Analytics Screen (3 sub-tabs: Performance, Process Scores, Attribution)
- Global portfolio filter at screen level: dropdown to select portfolio or "All Portfolios" — filters all three sub-tabs
- Period selector: 1M, 3M, 6M, 1Y, YTD, ALL — applies to all sub-tabs
- Loading states use skeleton screens for all charts and metric cards

- **Performance sub-tab:**
  - Metric cards (4-column grid on desktop, 2-column on tablet, 1-column on mobile): total trades, winning trades, losing trades, win rate %, average win, average loss, win/loss ratio, profit factor, total P&L, Sharpe ratio, Sortino ratio, max drawdown %, max drawdown days, average holding period
  - Win rate trend chart: line chart showing monthly win rate over selected period
  - P&L distribution: histogram bucketed by return percentage
  - Cumulative P&L: area chart showing running total P&L over time
  - All charts use brand chart palette (primary magenta for main series)

- **Process Scores sub-tab:**
  - Overall average score card with trend indicator (arrow up/down/flat)
  - Per-dimension breakdown: radar chart or horizontal bar chart showing discipline, emotional management, risk management, entry quality, exit quality — with overall average line
  - Process score trend: line chart showing monthly averages per dimension over selected period
  - Process vs Outcome quadrant chart: 2x2 matrix with trade count in each quadrant:
    - Top-right: "Skilled" — high process, high outcome (green tint)
    - Top-left: "Unlucky" — high process, low outcome (yellow tint)
    - Bottom-right: "Lucky" — low process, high outcome (yellow tint)
    - Bottom-left: "Needs Work" — low process, low outcome (red tint)
  - Threshold for high/low: process score >= 3.5 is "high", P&L > 0 is "high outcome"

- **Attribution sub-tab:**
  - By strategy: table showing strategy name, trade count, win rate %, profit factor, total P&L — sorted by P&L descending. Rows color-coded by profitability
  - By day of week: grouped bar chart showing win rate and average P&L per weekday (Monday through Friday)
  - By time of day: grouped bar chart showing win rate and average P&L by market session (market open 09:00-11:00, mid-day 11:00-14:00, market close 14:00-16:00)

### Behavioral Patterns Screen
- Cross-portfolio view — no portfolio filter. Behavioral analysis spans all trading activity to detect holistic behavioral tendencies
- Period selector: 1M, 3M, 6M — lookback window for pattern detection (default: 3M)
- Detected patterns section: card per pattern showing:
  - Pattern name with icon (revenge trading, overtrading, position sizing drift, FOMO, fear patterns, stubbornness)
  - Severity badge (low = green, moderate = yellow, high = red)
  - Occurrence count in lookback period
  - Description of what was detected (e.g., "Entered 5 trades within 30 minutes of a loss")
  - P&L impact (semantic color — how much these patterns cost)
  - Actionable recommendation (e.g., "Implement 1-hour cooldown after losses")
  - "Acknowledge" button — acknowledged patterns move to bottom section, grayed out, with acknowledged timestamp
- Habit scores section: four gauge/circular progress indicators (0-100 scale):
  - Consistency, Emotional Control, Risk Discipline, Patience
  - Each shows current score, trend direction (up/down/flat arrow), and a 90-day sparkline
  - Color-coded: 0-40 red, 41-60 yellow, 61-80 green, 81-100 bright green
- Improvement focus areas: prioritized list of 2-3 actionable items based on lowest habit scores and highest-severity patterns. Each item links to relevant journal entries or pattern details
- Empty state: icon, "No behavioral patterns detected. Keep trading consistently to build your behavioral profile."

### Weekly Review Screen
- Current week review displayed by default; previous weeks accessible via week picker (prev/next arrows + calendar dropdown)
- Week summary card: date range (Mon–Sun), total trades, P&L (semantic color), win rate %, average process score
- Best trade card: instrument, P&L, process score — click navigates to journal entry detail
- Worst trade card: instrument, P&L, process score — click navigates to journal entry detail
- Patterns this week: list of any behavioral patterns flagged during the week (links to Behavioral Patterns screen)
- Goals progress: table showing each goal with columns — goal name, target value, actual value, status badge:
  - Met: green badge
  - Close (within 10% of target): yellow badge
  - Missed: red badge
  - Default goals: win rate target, max daily loss, process score target
- Focus for next week: editable list of 2-3 focus areas. Auto-suggested from behavioral analysis but user can customize. Save button persists focus items
- Portfolio filter: dropdown to scope the weekly review to a specific portfolio or "All Portfolios"
- Empty state (no trades this week): icon, "No trades this week. Review will populate as you trade."
- Weeks with no review data show: "No review available for this week."

## Configuration
- shell: true
