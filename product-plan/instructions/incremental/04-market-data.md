# Milestone 4: Market Data

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-3 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement Market Data — the operational control center for the platform's data pipeline.

## Overview

Market Data provides a health overview of all connected data sources (Yahoo Finance, Interactive Brokers, Finnhub, Binance), lets users manage instrument subscriptions grouped by source, trigger backfills and force-refreshes, monitor data quality metrics, and review a corporate actions audit log.

**Key Functionality:**
- Pipeline health overview with 4 data source vendor cards
- Source detail with instrument management, fetch history, and quality metrics
- Data quality monitoring dashboard with outlier review and bulk acknowledge
- Corporate actions audit log with re-adjustment capability
- Real-time status updates via WebSocket or polling

## Recommended Approach: Test-Driven Development

See `product-plan/sections/market-data/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Overview (`/market-data`)

**Stat cards (4-column):**
- Total Tracked Instruments (database icon)
- Active Data Sources (e.g., "3 / 4", server icon)
- Data Freshness (percentage of instruments with data < 1h old, schedule icon)
- Quality Alerts count (warning icon, links to `/market-data/quality`)

**Data Source Cards** (4 vendors, 4-column grid on desktop, 2-column tablet):
Each card shows:
- Source name + icon (Yahoo Finance, Interactive Brokers, Finnhub, Binance)
- Connection status dot: green=connected, amber=degraded, red=disconnected
- Status label: "Connected" / "Degraded" / "Disconnected" (matching color)
- Last successful fetch (relative time, absolute in tooltip)
- Error rate last 24h (% with color: green<1%, yellow 1-5%, red>5%)
- Tracked instruments count
- Next scheduled fetch timestamp
- Real-time capability badge: "Real-time" (emerald) for IB/Binance, "Scheduled" (zinc) for Yahoo/Finnhub
- Click card navigates to `/market-data/sources/{sourceId}`

**Recent Corporate Actions** (compact list, last 5):
- Instrument, type badge (Split=blue, Dividend=emerald, Ticker Change=amber), date, status
- "View All" link → `/market-data/corporate-actions`
- Empty: "No corporate actions detected recently."

**Recent Data Quality Alerts** (compact list, last 5):
- Instrument, alert type, severity badge, timestamp
- "View All" link → `/market-data/quality`
- Empty: "All data quality checks passing."

Real-time: source status and quality alerts update live.
Skeleton loading states.
Empty state (no sources): "No data sources configured." + "Configure Sources" CTA → Settings.

### Screen 2: Source Detail (`/market-data/sources/{sourceId}`)

**Header:** Source name, large connection status indicator, source description, "Force Refresh All" button (secondary).

**Configuration card:** Fetch schedule (human-readable cron, e.g., "Daily at 23:00 EST"), supported intervals, rate limits.

**Tab bar:** Instruments | Fetch History | Quality

#### Instruments Tab

Sortable table (50 rows per page):
- Symbol + company name
- Asset Type badge (Stock/Crypto)
- Tracked Intervals (small badges: 1d, 1h, 5m, 1m)
- Coverage Start (monospace date)
- Coverage End (monospace date)
- Data Points (monospace count)
- Gaps (monospace, red if > 0, emerald "0" otherwise)
- Last Fetched (relative, amber if > 1h stale, red if > 24h)
- Freshness dot (green=fresh, amber=stale, red=very stale)
- Actions: Backfill, Refresh, Remove buttons

**Add Instrument** button → modal with instrument search, interval checkboxes (1d/1h/5m/1m, default 1d), optional backfill date range, "Subscribe" button.

**Remove:** confirmation modal — "Stop tracking {symbol} from {source}? Historical data will be retained."

**Backfill:** popover/modal with date range picker, interval selector, priority (Normal/High), estimated duration, "Start Backfill" button.

**Refresh:** immediate fetch, loading spinner on row, toast on completion.

Filters: symbol search, asset type dropdown, freshness filter.

#### Fetch History Tab

Active backfill tasks at top (if any): progress bar, task ID, instrument, estimated time, "Cancel".

Timeline of last 100 fetch operations:
- Timestamp (monospace)
- Operation type badge: Scheduled (zinc), Manual (primary), Backfill (info/blue), Retry (warning/amber)
- Instruments affected (count)
- Data points fetched (monospace)
- Duration (monospace, e.g., "2.3s")
- Status badge: Success (emerald), Partial (amber), Failed (red)
- Error message (red inline for failed)
- "Retry" button on failed entries

Filters: status filter, date range.

#### Quality Tab

Per-instrument quality metrics:
- Symbol
- OHLCV Validity % (green>99%, yellow 95-99%, red<95%)
- Outliers Detected (count, "Review" link if > 0)
- Gaps Filled count
- Last Validated (timestamp)
- Quality Score (composite %, green>95%, yellow 80-95%, red<80%)
- Status badge: Healthy (emerald), Warning (amber), Critical (red)

Outlier review: expandable — flagged data points with date, expected range, actual value, Acknowledge/Dismiss actions.
Bulk acknowledge button.

### Screen 3: Corporate Actions (`/market-data/corporate-actions`)

Sortable audit log table (50 per page):
- Detection Date (monospace)
- Instrument (symbol + company name)
- Action Type badge: Split (blue), Dividend (emerald), Ticker Change (amber)
- Action Date (monospace)
- Details (split ratio, dividend amount, old→new ticker)
- Source badge (Yahoo, IB, etc.)
- Adjustment Status badge: Adjusted (emerald), Pending (amber), Failed (red), Not Required (zinc)
- Actions: "Re-adjust" on Failed, "View Details" expandable

Expandable row: full details, affected positions, adjustment history.
Re-adjust: confirmation modal → triggers recalculation, toast on completion.

Filters: instrument search, action type dropdown, status dropdown, date range.

### Screen 4: Data Quality (`/market-data/quality`)

**Stat cards:** Overall Quality Score, Instruments with Warnings, Outliers Pending Review, Gaps Filled (last 30 days).

**Quality alerts table:**
- Instrument, Source badge, Alert Type badge (Outlier=red, Gap Filled=amber, OHLCV Invalid=red, Stale Data=amber), Severity badge (Critical=red, Warning=amber, Info=blue), Detected At (monospace), Details text, Acknowledged (checkbox/badge)
- Actions: Acknowledge, View Data (links to source detail quality tab)

Multi-select checkboxes with "Acknowledge Selected" bulk action.
Default sort: Detected At descending, unacknowledged first.

## Files to Reference

- `product-plan/sections/market-data/README.md`
- `product-plan/sections/market-data/tests.md`
- `product-plan/sections/market-data/overview-light.png`
- `product-plan/sections/market-data/sourcedetail-light.png`
- `product-plan/sections/market-data/corporateactions-light.png`
- `product-plan/sections/market-data/dataquality-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Overview shows 4 source cards with connection status dots
- [ ] Source detail has 3-tab interface (Instruments, Fetch History, Quality)
- [ ] Add Instrument modal works with search and interval selection
- [ ] Backfill modal queues task and shows progress indicator
- [ ] Refresh action triggers immediate fetch with loading state
- [ ] Corporate actions table with expandable rows
- [ ] Re-adjust action triggers recalculation
- [ ] Data quality table with bulk acknowledge
- [ ] Real-time status updates (polling or WebSocket)
- [ ] Empty states display correctly
- [ ] Responsive on mobile
