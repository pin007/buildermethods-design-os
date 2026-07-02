# Portfolio & Positions Specification

## Overview
Portfolio & Positions provides a consolidated view of all investment portfolios and their underlying holdings. It starts with an aggregated overview screen showing total net worth, combined equity curve, and allocation across all portfolios, with a portfolio list to drill into. The detail screen for a selected portfolio shows summary stats and equity curve at top, with tab-based navigation into Positions, Watchlists, Dividends, and Performance views.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Portfolio & Positions MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Breadcrumbs
All screens render breadcrumbs via the shell's `breadcrumb` prop. Breadcrumb paths use Home icon for root, clickable parents, current page in zinc-500 (non-clickable):
- Overview: `Home > Portfolios`
- Portfolio Detail (any tab): `Home > Portfolios > {Portfolio Name}`

### Order Panel (Slide-Over)
Positions table "Trade", "Close", and "Add" quick actions trigger the shell's `OrderPanel` with contextual pre-fill (instrument, side, quantity). The section MUST NOT render its own order entry UI — it delegates to the shell's panel via `AppShell.openOrderPanel({ symbol, side, quantity })`.

### Toast Notifications
All user-facing notifications use the shell's toast API (`toastRef.current()`). No inline notification rendering within section components. Toast variants:
- Watchlist created/updated: success (green, 4s)
- Instrument added to watchlist: success (green, 4s)
- Price alert triggered: warning (yellow, 5s)
- Data load error: error (red, 6s)

### System Banners
No section-specific persistent banners. All system-level banners (pending approvals, broker disconnected) come from the shell.

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, side panels
- Tablet (768px–1023px): Condensed layouts, collapsible sections
- Mobile (<768px): Single-column, full-width overlays, stacked cards

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

All numeric table columns (quantity, prices, market value, P&L, weight, dividend amounts) and live-updating values use tabular figures (`font-variant-numeric: tabular-nums` via the `.tabular` utility) so digits align vertically and don't shift width as they tick. Data cards and grids (stat cards, allocation panels, positions/dividends tables) reflow at their own component width using Tailwind v4 container queries (`@container` on the wrapper, `@sm:`/`@lg:` variants on children) rather than the viewport, so they collapse cleanly inside the shell's side panels and split layouts.

## User Flows
- View aggregated portfolio overview: total net worth across all portfolios, combined equity curve, combined allocation chart, and a list of individual portfolios with key metrics (name, value, P&L, positions count, cash balance) — click a portfolio to drill into its detail view
- Explore a portfolio's positions: sortable, filterable table with real-time prices, P&L, tax status badges, and expandable rows showing FIFO lots, acquisition details, and quick actions (Trade, Close, Set Alert)
- Manage watchlists: select a watchlist from dropdown, view instruments with current price, day change, notes, and alert status — create, rename, and delete watchlists, quick-add instruments with notes, set price alerts per item
- Track dividend income: view income summaries by period (monthly, quarterly, annual), dividend history table with ex-dates, pay-dates, amounts, withholding tax, and DRIP indicators — plus upcoming ex-date list and yield metrics per position
- Compare portfolio performance against benchmarks: select benchmark (SPY, NASDAQ, custom) and period (MTD, QTD, YTD, 1Y, 3Y, inception), view time-weighted returns chart, alpha percentage, and attribution analysis showing which positions drove over/under-performance
- Monitor margin and buying power: view margin used vs available, buying power, margin usage percentage, margin call distance, and alert thresholds
- Quick-trade from positions: click "Trade" on any position row to open the shell's order panel pre-filled with symbol, or "Close" to pre-fill a sell order for the full quantity

## UI Requirements

### Portfolio Overview Screen (`/portfolios`)
- Aggregated stat cards across all portfolios: total net worth, total day P&L, total cash balance, total unrealized P&L
- Stat cards follow standard anatomy: semantic icon, label (secondary text), large monospace value (h2), change indicator with semantic coloring
- Combined equity curve (ECharts line chart, responsive) showing total portfolio value over time with period selector (1M, 3M, 6M, YTD, 1Y, ALL)
- Combined allocation donut chart showing allocation by asset, by broker, or by portfolio (toggle between views)
- Portfolios list table below charts: name, total value, day P&L, day P&L %, positions count, cash balance — click row to navigate to portfolio detail
- Real-time value changes flash green (increase) or red (decrease) for 300ms, then fade back
- Loading states use skeleton screens (not spinners) for all data-dependent components
- Empty state (no portfolios): icon, "Welcome to Trading Squad! Connect your broker to get started.", "Connect Broker" CTA

### Portfolio Detail Screen (`/portfolios/{id}`)
- Summary stat cards for the selected portfolio: total value, day P&L, unrealized P&L, cash balance, margin available (if applicable)
- Equity curve chart for this portfolio (ECharts line chart) with period selector
- Tab bar below the stats/chart area: Positions | Watchlists | Dividends | Performance

### Positions Tab (Default)
- Sortable, filterable positions table with columns:
  - Symbol (text + company name subtitle)
  - Broker (IB/Binance badge)
  - Quantity (right-aligned, monospace)
  - Avg Price (right-aligned, monospace)
  - Current Price (right-aligned, monospace, live-updating)
  - Market Value (right-aligned, monospace)
  - P&L $ (right-aligned, monospace, green/red semantic)
  - P&L % (right-aligned, monospace, green/red semantic)
  - Weight % (right-aligned, monospace)
  - Tax Status (badge: "Taxable" red / "Tax-Exempt" green; tooltip shows days held and exemption date)
  - Actions (Trade, Close buttons)
- All columns sortable (click header to toggle asc/desc) with sort indicator arrows. Default sort: Weight descending
- Expandable rows (click row or chevron to expand):
  - FIFO lots table: acquisition date, quantity, cost basis per lot, current value, unrealized P&L per lot
  - Tax details: acquisition date, days held, 3-year exemption target date, cost basis method (FIFO)
  - Quick actions: Trade (opens order panel pre-filled with BUY), Close (opens order panel pre-filled with SELL for full quantity), Set Alert (future)
- Filters: search input (symbol, company name), broker dropdown, asset type dropdown (Stocks, Crypto, Options)
- Clear filters button when any filter is active
- Pagination: 50 rows per page. "Showing 1-50 of N positions" with Previous/Next navigation
- Real-time price and P&L updates via WebSocket with green/red flash (300ms)
- Empty state: icon, "No positions yet. Create your first order to start building your portfolio.", "New Order" CTA (opens shell order panel)

### Watchlists Tab
- Dropdown selector at top to pick a watchlist (e.g., "Tech Stocks", "Earnings This Week", "Watching for Entry")
- Action buttons next to dropdown: "New Watchlist" (opens inline create form or modal), "Rename", "Delete" (with confirmation modal)
- Instruments table for selected watchlist:
  - Symbol (text + company name)
  - Current Price (monospace, live-updating)
  - Day Change $ (monospace, green/red semantic)
  - Day Change % (monospace, green/red semantic)
  - Notes (truncated, full on hover/expand)
  - Alert Status (icon: bell if alert set, with trigger price in tooltip)
  - Actions: Edit (notes/alerts), Remove, Trade (opens shell order panel pre-filled)
- Quick-add row at bottom of table: instrument search input + optional notes field + "Add" button
- Price alerts per item: set upper and lower trigger prices. Alert status shows as bell icon with tooltip
- Real-time price updates via WebSocket
- Empty state (no watchlists): icon, "Create a watchlist to track instruments you're interested in.", "New Watchlist" CTA
- Empty state (watchlist has no items): icon, "This watchlist is empty. Add instruments to start tracking.", search input focused

### Dividends Tab
- Period selector: Monthly | Quarterly | Annual toggle, plus optional date range picker
- Income summary cards at top:
  - Total income for selected period (USD and CZK)
  - Portfolio dividend yield on cost %
  - Portfolio current yield %
  - Estimated annual income
- Dividends history table:
  - Instrument (symbol)
  - Ex-Date
  - Pay-Date
  - Amount Per Share (monospace)
  - Quantity (monospace)
  - Total USD (monospace)
  - Total CZK (monospace)
  - Withholding Tax (monospace)
  - DRIP (badge: "DRIP" if reinvested, empty otherwise)
- Sortable by any column. Default sort: Pay-Date descending
- Pagination: 50 rows per page
- Upcoming ex-dates section below the history table:
  - List of instruments with upcoming ex-dates (next 30 days)
  - Columns: instrument, ex-date, estimated amount per share, quantity held, estimated total
  - Sorted by ex-date ascending
- Yield metrics section (collapsible):
  - Per-position yield table: instrument, yield on cost %, current yield %, annual income USD, annual income CZK
- Empty state: icon, "No dividend history yet. Dividends will appear here as they are recorded.", no CTA

### Performance Tab
- **Benchmark Comparison** section:
  - Benchmark selector: dropdown with options (S&P 500 / SPY, NASDAQ / QQQ, custom symbol input, Cash / risk-free rate)
  - Period selector: MTD, QTD, YTD, 1Y, 3Y, Since Inception buttons
  - Time-weighted returns chart (ECharts line chart): two lines — portfolio return vs benchmark return over the selected period. Portfolio line uses primary magenta, benchmark line uses sky blue
  - Summary metrics: portfolio return %, benchmark return %, alpha % (outperformance, green if positive, red if negative)
  - Attribution analysis table: instrument, contribution to return %, sorted by absolute contribution descending. Shows which positions helped and which hurt performance
- **Margin & Buying Power** section (below benchmark, or hidden if account has no margin):
  - Stat cards: margin used, margin available, margin usage % (with progress bar, color-coded: green < 30%, yellow 30-50%, red > 50%), buying power, margin call distance %
  - Margin alert threshold indicator: shows configured threshold and whether alert is triggered
  - Margin call risk estimate: price move percentages that would trigger margin call for top holdings
- Empty state (no performance data): icon, "Not enough data to calculate performance. Check back after your portfolio has some history.", no CTA

## Phase 2 Features (Not in Scope)
- Options Greeks tracking: position-level and portfolio-level Greeks (delta, gamma, theta, vega), expiration calendar with assignment risk warnings, recalculation on market data ticks
- Export to CSV/PDF from positions and dividends tables
- Customizable dashboard layout (drag-and-drop widgets)
- Advanced charting within positions (sparklines per position)

## Configuration
- shell: true
