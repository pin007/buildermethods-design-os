  butt# Market Data Specification

## Overview
Market Data is the operational control center for the platform's data pipeline. It provides a health overview of all connected data sources (Yahoo Finance, Interactive Brokers, Finnhub, Binance), lets users manage instrument subscriptions grouped by source, trigger backfills and force-refreshes, monitor data quality metrics, and review a corporate actions audit log. Interactive charting and analysis live in Market Intelligence — this section focuses on ensuring the data feeding the platform is healthy, complete, and accurate.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Market Data MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Order Panel (Slide-Over)
Not directly used by Market Data. No order entry triggers from this section.

### Toast Notifications
All user-facing notifications use the shell's toast API (`toastRef.current()`). No inline notification rendering within section components. Toast variants:
- Backfill triggered: info (blue, 4s)
- Backfill completed: success (green, 4s)
- Force refresh completed: success (green, 4s)
- Instrument subscription added: success (green, 4s)
- Instrument subscription removed: success (green, 4s)
- Fetch retry triggered: info (blue, 4s)
- Fetch failed: error (red, 6s)
- Corporate action adjustment re-triggered: info (blue, 4s)

### System Banners
No section-specific persistent banners. All system-level banners (pending approvals, broker disconnected) come from the shell.

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, source cards in row
- Tablet (768px–1023px): Condensed layouts, source cards 2-column grid
- Mobile (<768px): Single-column, stacked cards, full-width tables with horizontal scroll

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

All numeric table columns and live values (data-point counts, gap counts, durations, coverage dates, quality/validity percentages, error rates) use tabular figures (`font-variant-numeric: tabular-nums` via the `.tabular` utility) so digits align vertically down each column. Data cards and grids (pipeline stat cards, source cards, instrument/fetch-history/quality tables) reflow at their own component width using Tailwind v4 container queries (`@container` on the wrapper, `@sm:`/`@lg:` variants on children) rather than the viewport, so source-card grids and tables collapse cleanly within the shell's layouts.

## User Flows
- View pipeline health overview: stat cards showing total tracked instruments, active sources, data freshness score, and recent quality alerts count — data source cards below showing each vendor's connection status, last successful fetch, error rate, and next scheduled fetch
- Drill into a data source: click a source card to see its tracked instruments, fetch schedule, recent fetch history timeline, per-instrument data coverage (date ranges, intervals available, gaps), and operational controls
- Add an instrument subscription: from source detail, click "Add Instrument", search by ticker or company name, select from results, choose intervals to track (1d, 1h, 5m, 1m) — instrument begins tracking immediately
- Remove an instrument subscription: click "Remove" on an instrument row, confirm via modal, data is retained but fetching stops
- Trigger a backfill: from source detail, select an instrument, specify date range and interval, submit — backfill task queued with progress indicator (task ID, estimated duration, percentage complete)
- Force-refresh stale data: click "Refresh" on a source or individual instrument to trigger an immediate fetch outside the regular schedule
- Retry a failed fetch: from fetch history, click "Retry" on a failed entry to re-attempt the operation
- Monitor data quality: view a dashboard of outlier flags, gap-fill events, OHLCV validation failures, and data freshness per instrument — acknowledge warnings to mark them reviewed
- Review corporate actions: browse audit log of detected splits, dividends, and ticker changes with detection date, adjustment status, and source — re-trigger adjustments if needed
- Handle data source outage: source card turns red with error details, user can attempt manual reconnection or view error history

## UI Requirements

### Overview Screen (`/market-data`)
- Pipeline summary stat cards at top:
  - Total tracked instruments (count, icon: database)
  - Active data sources (count out of total, e.g., "3 / 4", icon: server)
  - Data freshness (percentage of instruments with data less than 1 hour old, icon: schedule)
  - Quality alerts (count of unacknowledged warnings, icon: warning, links to Data Quality view)
- Stat cards follow standard anatomy: semantic icon, label (secondary text), large monospace value (h2), change indicator with semantic coloring
- Data source cards below stats (one card per vendor, 4-column grid on desktop, 2-column on tablet, stacked on mobile):
  - Source name and logo/icon (Yahoo Finance, Interactive Brokers, Finnhub, Binance)
  - Connection status indicator: green dot = connected, amber dot = degraded, red dot = disconnected
  - Status label: "Connected", "Degraded", "Disconnected" with matching semantic color
  - Last successful fetch timestamp (relative: "2 min ago", absolute in tooltip)
  - Error rate (last 24h): percentage with semantic coloring (green < 1%, yellow 1-5%, red > 5%)
  - Tracked instruments count for this source
  - Next scheduled fetch timestamp
  - Real-time capability badge: "Real-time" (green) for IB and Binance, "Scheduled" (neutral) for Yahoo and Finnhub
  - Click card to navigate to source detail
- Recent corporate actions section below source cards:
  - Last 5 corporate actions in a compact list (instrument, type badge, date, status)
  - "View All" link navigates to `/market-data/corporate-actions`
  - Empty state: "No corporate actions detected recently."
- Recent data quality alerts section:
  - Last 5 quality alerts in a compact list (instrument, alert type, severity badge, timestamp)
  - "View All" link navigates to `/market-data/quality`
  - Empty state: "All data quality checks passing."
- Real-time status updates via WebSocket: source connection status, fetch completions, and quality alerts update live
- Loading states use skeleton screens (not spinners) for all data-dependent components
- Empty state (no sources configured): icon, "No data sources configured. Set up your market data connections to get started.", "Configure Sources" CTA (links to Settings)

### Source Detail Screen (`/market-data/sources/{sourceId}`)
- Source header: source name, connection status indicator (large), description of source capabilities (e.g., "Historical daily OHLCV, no real-time streaming"), "Force Refresh All" button (secondary variant)
- Source configuration summary card: fetch schedule (cron expression in human-readable format, e.g., "Daily at 23:00 EST"), supported intervals, rate limits, fallback sources
- Tab bar below header: Instruments | Fetch History | Quality

#### Instruments Tab (Default)
- Sortable instruments table for this source with columns:
  - Symbol (text + company name subtitle)
  - Asset Type (badge: Stock / Crypto)
  - Tracked Intervals (badge group: 1d, 1h, 5m, 1m — each as a small badge)
  - Coverage Start (date, monospace — earliest data point available)
  - Coverage End (date, monospace — latest data point available)
  - Data Points (count, monospace)
  - Gaps (count, red if > 0, green "0" otherwise)
  - Last Fetched (relative timestamp, amber if > 1 hour stale, red if > 24 hours)
  - Freshness (status dot: green = fresh, amber = stale, red = very stale)
  - Actions (Backfill, Refresh, Remove buttons)
- All columns sortable (click header to toggle asc/desc) with sort indicator arrows. Default sort: Symbol ascending
- Filters: search input (symbol, company name), asset type dropdown, freshness filter (All, Fresh, Stale, Very Stale)
- Clear filters button when any filter is active
- Pagination: 50 rows per page. "Showing 1-50 of N instruments" with Previous/Next navigation
- "Add Instrument" button (primary variant) above table — opens inline form or modal:
  - Instrument search input (autocomplete, debounced 300ms)
  - Interval selection: checkboxes for 1d, 1h, 5m, 1m (default: 1d checked)
  - Optional: backfill date range (start date, defaults to 1 year ago)
  - "Subscribe" button to confirm
- Remove instrument: click "Remove" → confirmation modal ("Stop tracking {symbol} from {source}? Historical data will be retained.")
- Backfill action: click "Backfill" → inline popover or modal:
  - Date range picker (start date, end date)
  - Interval selector (1d, 1h, 5m, 1m)
  - Priority selector (Normal, High)
  - "Start Backfill" button
  - Shows estimated duration before confirming
- Refresh action: click "Refresh" → triggers immediate fetch, shows loading spinner on the row, toast on completion
- Empty state: icon, "No instruments tracked from this source. Add instruments to start collecting data.", "Add Instrument" CTA

#### Fetch History Tab
- Timeline view of recent fetch operations for this source (last 100 entries):
  - Timestamp (monospace)
  - Operation type badge: "Scheduled" (neutral), "Manual" (primary), "Backfill" (info), "Retry" (warning)
  - Instruments affected (count or list if small)
  - Data points fetched (count, monospace)
  - Duration (monospace, e.g., "2.3s")
  - Status badge: "Success" (green), "Partial" (yellow), "Failed" (red)
  - Error message (red text, shown inline for failed entries)
  - Actions: "Retry" button on failed entries
- Filters: status filter (All, Success, Failed, Partial), date range picker
- Default sort: timestamp descending (most recent first)
- Pagination: 50 rows per page
- Active backfill tasks section at top (if any running):
  - Task ID, instrument, date range, interval, progress bar (percentage), estimated time remaining, "Cancel" button
- Empty state: "No fetch history yet. Data will appear here once the first scheduled fetch runs."

#### Quality Tab
- Per-instrument data quality metrics for this source:
  - Symbol
  - OHLCV Validity (percentage of bars passing OHLCV relationship checks, green > 99%, yellow 95-99%, red < 95%)
  - Outliers Detected (count, with "Review" link if > 0)
  - Gaps Filled (count of forward-filled gaps)
  - Last Validated (timestamp)
  - Quality Score (composite percentage: green > 95%, yellow 80-95%, red < 80%)
  - Status badge: "Healthy" (green), "Warning" (yellow), "Critical" (red)
- Sortable by any column. Default sort: Quality Score ascending (worst first)
- Outlier review: click "Review" → expandable detail showing flagged data points with date, expected range, actual value, and "Acknowledge" / "Dismiss" actions
- Bulk acknowledge button for clearing reviewed warnings
- Empty state: "No quality metrics available yet. Data quality checks run automatically after each fetch."

### Corporate Actions Screen (`/market-data/corporate-actions`)
- Audit log table of all detected corporate actions:
  - Detection Date (monospace, timestamp)
  - Instrument (symbol + company name)
  - Action Type badge: "Split" (info/blue), "Dividend" (success/green), "Ticker Change" (warning/yellow)
  - Action Date (monospace, the date the corporate action takes/took effect)
  - Details (split ratio, dividend amount + currency, old→new ticker)
  - Source (badge: Yahoo, IB, etc.)
  - Adjustment Status badge: "Adjusted" (green), "Pending" (yellow), "Failed" (red), "Not Required" (neutral)
  - Actions: "Re-adjust" button (on Failed entries), "View Details" expandable
- All columns sortable. Default sort: Detection Date descending
- Filters: instrument search, action type dropdown (All, Split, Dividend, Ticker Change), status dropdown (All, Adjusted, Pending, Failed), date range picker
- Pagination: 50 rows per page
- Expandable row detail:
  - Full corporate action details (ratio, amounts, dates)
  - Affected positions (if any, with links to Portfolio & Positions)
  - Adjustment history: when adjustments were applied, which price records were modified, before/after values
- Re-adjust action: click "Re-adjust" → confirmation modal explaining what will be recalculated → triggers adjustment, shows toast on completion
- Empty state: icon, "No corporate actions detected. Actions like stock splits and dividends will appear here automatically.", no CTA

### Data Quality Screen (`/market-data/quality`)
- Quality overview stat cards:
  - Overall Quality Score (percentage, composite across all sources)
  - Instruments with Warnings (count, links to filtered list)
  - Outliers Pending Review (count)
  - Gaps Filled (last 30 days count)
- Quality alerts table (all instruments, all sources):
  - Instrument (symbol)
  - Source (badge)
  - Alert Type badge: "Outlier" (red), "Gap Filled" (yellow), "OHLCV Invalid" (red), "Stale Data" (amber)
  - Severity badge: "Critical" (red), "Warning" (yellow), "Info" (blue)
  - Detected At (timestamp, monospace)
  - Details (description of the issue, e.g., "Price jump of 52% in single bar on 2025-01-15")
  - Acknowledged (checkbox or badge: "Reviewed" green / "Unreviewed" neutral)
  - Actions: "Acknowledge", "View Data" (links to source detail quality tab)
- All columns sortable. Default sort: Detected At descending, unacknowledged first
- Filters: instrument search, source dropdown, alert type dropdown, severity dropdown, acknowledged toggle (Show All / Unreviewed Only)
- Pagination: 50 rows per page
- Bulk actions: "Acknowledge Selected" for multi-select
- Empty state: icon, "All data quality checks passing. No issues to report.", no CTA

## Phase 2 Features (Not in Scope)
- Automated data quality rules engine (user-defined thresholds and alerting rules)
- Data source performance benchmarking (latency comparison across sources)
- Custom fetch schedules per instrument (override global schedule)
- Data export (download OHLCV data as CSV for external analysis)
- Finnhub integration (listed as future in architecture spec)
- Data lineage visualization (trace data from source through pipeline to UI)
- Alerting integrations (email/push notifications for source outages or quality degradation)

## Configuration
- shell: true
