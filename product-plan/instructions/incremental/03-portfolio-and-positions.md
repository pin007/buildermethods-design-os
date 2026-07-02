# Milestone 3: Portfolio & Positions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-2 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement Portfolio & Positions — consolidated view of all investment portfolios and their holdings.

## Overview

Provides an aggregated overview screen showing total net worth, combined equity curve, and allocation across all portfolios, with a portfolio list to drill into. The detail screen shows summary stats, equity curve, and tab-based navigation into Positions, Watchlists, Dividends, and Performance.

**Key Functionality:**
- Aggregated portfolio overview with total net worth and combined allocation chart
- Per-portfolio positions table with real-time prices, P&L, tax status, and FIFO lot details
- Watchlist management with price alerts
- Dividend income tracking with CZK amounts and DRIP indicators
- Benchmark performance comparison with attribution analysis
- Margin and buying power monitoring

## Recommended Approach: Test-Driven Development

See `product-plan/sections/portfolio-and-positions/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Portfolio Overview (`/portfolios`)

**Stat cards (4-column grid):** Total Net Worth, Total Day P&L, Total Cash Balance, Total Unrealized P&L — each with monospace value, semantic P&L colors, and change indicator.

**Combined equity curve:** Line chart (ECharts/Plotly) showing total portfolio value over time with period selector (1M, 3M, 6M, YTD, 1Y, ALL). Primary pink-600 line.

**Combined allocation chart:** Donut chart with toggle: "By Asset" / "By Broker" / "By Portfolio".

**Portfolios list table:** Name, total value (monospace), day P&L (monospace, semantic), day P&L %, positions count, cash balance — click row navigates to `/portfolios/{id}`.

Real-time value changes: green/red flash (300ms) on update.

Empty state: "Welcome to Trading Squad! Connect your broker to get started." + "Connect Broker" CTA.

### Screen 2: Portfolio Detail (`/portfolios/{id}`)

**Header stat cards:** Total Value, Day P&L, Unrealized P&L, Cash Balance, Margin Available (if applicable).

**Equity curve:** ECharts line chart for this portfolio with period selector.

**Tab bar:** Positions | Watchlists | Dividends | Performance

### Positions Tab (Default)

Sortable, filterable table:
- Symbol (text + company name subtitle)
- Broker badge (IB=blue, Binance=amber)
- Quantity (monospace, right-aligned)
- Avg Price (monospace, right-aligned)
- Current Price (monospace, live-updating, flash on change)
- Market Value (monospace)
- P&L $ (monospace, emerald if positive, red if negative)
- P&L % (monospace, semantic color)
- Weight % (monospace)
- Tax Status badge: "Tax-Exempt" (emerald) if >= 3 years held, "Taxable" (red) otherwise. Tooltip shows days held and exemption target date.
- Actions: Trade button, Close button

**Expandable rows:** Click row to expand:
- FIFO lots table: acquisition date, quantity, cost basis per lot, current value, unrealized P&L
- Tax details: acquisition date, days held, 3-year exemption date, cost basis method (FIFO)
- Quick actions: Trade (opens shell order panel BUY pre-filled), Close (opens panel SELL pre-filled for full quantity)

**Filters:** Symbol search, broker dropdown, asset type dropdown. "Clear filters" when active.

**Pagination:** 50 rows per page.

Empty state: "No positions yet. Create your first order to start building your portfolio." + "New Order" CTA (opens shell order panel).

### Watchlists Tab

**Dropdown selector:** Pick watchlist (e.g., "Tech Stocks", "Earnings This Week"). Actions: New Watchlist, Rename, Delete (with confirmation).

**Instruments table:**
- Symbol + company name
- Current Price (monospace, live-updating)
- Day Change $ (monospace, semantic color)
- Day Change % (monospace, semantic color)
- Notes (truncated, tooltip on hover)
- Alert Status (bell icon if alert set, with trigger price tooltip)
- Actions: Edit, Remove, Trade

**Quick-add row** at bottom: search input + notes + "Add" button.

**Price alerts per item:** upper/lower trigger prices. Bell icon shows alert is set.

Empty state (no watchlists): "Create a watchlist to track instruments you're interested in." + "New Watchlist" CTA.

### Dividends Tab

**Period selector:** Monthly | Quarterly | Annual + date range picker.

**Summary cards:** Total income (USD + CZK), Yield on Cost %, Current Yield %, Estimated Annual Income.

**Dividends history table:** Instrument, Ex-Date, Pay-Date, Amount Per Share (monospace), Quantity (monospace), Total USD (monospace), Total CZK (monospace), Withholding Tax (monospace), DRIP badge.

**Upcoming ex-dates section:** Next 30 days, sorted by ex-date ascending.

### Performance Tab

**Benchmark Comparison:**
- Benchmark selector: SPY, QQQ, or custom symbol
- Period selector: MTD, QTD, YTD, 1Y, 3Y, Since Inception
- Time-weighted returns chart: portfolio (pink-600) vs benchmark (zinc-400 dashed)
- Summary: Portfolio return %, Benchmark return %, Alpha % (emerald if positive, red if negative)
- Attribution table: instrument, contribution to return %, sorted by absolute contribution descending

**Margin & Buying Power** (if margin account):
- Stat cards: Margin Used, Margin Available, Margin Usage % (progress bar: green<30%, yellow 30-50%, red>50%), Buying Power, Margin Call Distance %

## Files to Reference

- `product-plan/sections/portfolio-and-positions/README.md` — Overview
- `product-plan/sections/portfolio-and-positions/tests.md` — Test instructions
- `product-plan/sections/portfolio-and-positions/overview-light.png` — Portfolio overview visual
- `product-plan/sections/portfolio-and-positions/detail-light.png` — Portfolio detail visual

## Expected User Flows

### Flow 1: View Portfolio and Drill Into Positions

1. User navigates to `/portfolios`
2. Sees total net worth "$60,081.89", day P&L "+$914.56 (+1.54%)"
3. Combined equity curve shows portfolio growth over selected period
4. Portfolio list shows "US Equities" $47,231.89 and "Crypto" $12,850.00
5. User clicks "US Equities" row
6. Navigates to `/portfolios/port-1`, Positions tab shown by default
7. Table shows all positions with live prices, P&L, and tax status badges
8. **Outcome:** User can see full position breakdown for the portfolio

### Flow 2: Expand Position to See FIFO Lots

1. User clicks on AAPL position row
2. Row expands showing FIFO lots table
3. Lot 1: Acquired 2022-01-15, 20 shares @ $182.48, value $3,710, P&L +$60.04
4. Tax details: 1,101 days held, Tax-Exempt on 2025-01-15 (shown as badge)
5. **Outcome:** User sees cost basis breakdown and tax status per lot

### Flow 3: Manage Watchlist

1. User navigates to Portfolio detail → Watchlists tab
2. Selects "Tech Stocks" from dropdown
3. Table shows AAPL, MSFT, NVDA with live prices
4. User types "GOOGL" in the quick-add row, adds note "Watching for earnings"
5. Clicks "Add" button
6. **Outcome:** GOOGL appears in the watchlist, toast "Instrument added to watchlist" (green)

## Done When

- [ ] Tests written for key flows
- [ ] Portfolio overview renders with aggregated stats and equity curve
- [ ] Portfolio list table navigates to detail on row click
- [ ] Portfolio detail shows all 4 tabs
- [ ] Positions table loads with real data, sortable
- [ ] Tax Status badge shows correct state (Tax-Exempt / Taxable) based on holding period
- [ ] Position rows expand to show FIFO lots
- [ ] Trade/Close buttons open shell order panel pre-filled correctly
- [ ] Watchlist dropdown loads watchlists
- [ ] Dividends tab shows income summary and history
- [ ] Performance tab shows benchmark comparison chart
- [ ] Real-time price updates flash green/red
- [ ] Empty states display correctly
- [ ] Responsive on mobile
