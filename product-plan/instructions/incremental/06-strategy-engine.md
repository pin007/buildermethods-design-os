# Milestone 6: Strategy Engine

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-5 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement the Strategy Engine — hub for building, testing, and evaluating trading strategies.

## Overview

Provides a strategy library for managing configured strategies (trend following, mean reversion, composite master-slave), a backtesting workspace with realistic execution costs, walk-forward optimization to prevent overfitting, and side-by-side strategy comparison with benchmark overlays.

**Key Functionality:**
- Strategy list card grid with key metrics and active/inactive toggle
- Strategy detail with Configuration, Backtest History, and Walk-Forward History tabs
- 7-step strategy creation/editing flow (full page, not modal)
- Backtest configuration modal and full results view with charts
- Walk-forward optimization configuration and results
- Strategy comparison view (2-4 strategies side by side)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/strategy-engine/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Strategy List (`/strategies`)

**Card grid** (2-col desktop, 1-col mobile). Each card shows:
- Strategy name (bold)
- Type badge: Trend Following (blue), Mean Reversion (amber), Composite (purple)
- Active/inactive toggle (active: pink-600 left border; inactive: dimmed)
- Instrument chips (first 3, "+N more" if many)
- Last backtest date
- Key metrics row (monospace): Sharpe, CAGR, Max Drawdown
- Schedule summary (e.g., "Daily at 09:35 ET")

Sort options: Name, Last Backtest, Sharpe Ratio, CAGR.
Filter by: type, active/inactive, instrument.
"New Strategy" button (primary, top-right).

Empty state: "No strategies configured yet." + "Create Strategy" CTA.

### Screen 2: Strategy Detail (`/strategies/{id}`)

3-tab layout: Configuration | Backtest History | Walk-Forward History

**Configuration tab:**
- Read-only config display with "Edit" button
- Entry strategy section: type, parameters as key-value grid
- Exit strategies: collapsible cards (Stop Loss, Take Profit, Trailing Stop, Break Even)
- Instruments: chip list (add/remove in edit mode)
- Position sizing: risk-per-trade %, max position %, volatility toggle
- Schedule: enabled toggle, frequency, time, timezone
- Composite visualization (for Composite type): diagram showing master → slave connections

**Backtest History tab:**
- Table: ID, date range, capital, Sharpe (monospace), CAGR (monospace), max drawdown (monospace), total trades, status badge, duration
- Click row → backtest results view
- "Run Backtest" button at top
- Running backtests: animated progress bar + estimated time

**Walk-Forward History tab:**
- Table: ID, date range, windows count, avg validation Sharpe, avg return, status, duration
- Click row → walk-forward results
- "Run Walk-Forward" button

### Screen 3: New/Edit Strategy (Full Page)

7-step flow with back/next navigation and step indicator at top:
1. **Basic Info:** name input, type selection cards (with icons and descriptions)
2. **Parameters:** dynamic form fields based on type, tooltips per parameter
3. **Exit Strategies:** toggle on/off each exit type, configure enabled ones. Composite: drag handles for priority ordering
4. **Instruments:** autocomplete search, removable chips
5. **Position Sizing:** risk-per-trade slider (0.5%-5%, default 1%), max position slider (5%-30%, default 10%), volatility toggle
6. **Schedule:** enable/disable, frequency (Daily/Interval), time picker, timezone selector
7. **Review & Save:** summary of all settings, "Save Strategy" button

Inline validation on each step before proceeding.
Edit mode: pre-fill fields, allow direct step navigation.

### Screen 4: Backtest Configuration (Modal)

Launched from strategy detail "Run Backtest":
- Date range with preset buttons (1Y, 2Y, 3Y, 5Y, Max)
- Initial capital (default $100,000)
- Execution model: Simple/Volume-Based/Spread-Based (radio)
- Data granularity: Daily/Hourly/Minute (radio, shows estimated duration)
- Commission % (default 0.1%)
- Slippage % (disabled when Volume-Based or Spread-Based selected)
- Indicator snapshots toggle (default off, storage warning)
- Benchmark checkboxes: Buy-and-Hold (always on), SPY, QQQ, BTC
- "Run Backtest" with estimated duration

### Screen 5: Backtest Results View

**Top:** executive summary card — PASS/FAIL/REVIEW badge (emerald/red/amber), test period, recommendation text.

**Stat cards row (6):** CAGR, Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor — each with benchmark comparison arrow (vs SPY) and semantic color.

**Anti-pattern warnings banner** (if detected): specific issue and recommendation.

**Charts (tabbed or scrollable):**
- Equity Curve: portfolio (pink-600) vs benchmarks (zinc-400 dashed), log scale toggle
- Drawdown: area chart, red fill below zero
- Monthly Returns Heatmap: grid month×year, green=positive, red=negative
- Rolling Sharpe: 12-month rolling Sharpe line chart
- Trade Distribution: histogram with bell curve overlay

**Benchmark Comparison table:** strategy vs each benchmark with alpha, beta, excess Sharpe, information ratio.

**Trade Log (paginated 50/page):** trade #, entry/exit dates, instrument, direction badge (LONG=blue/SHORT=red), quantity (monospace), entry price, exit price, P&L (semantic color), return %, holding days. Expandable rows for indicator snapshots.

### Screen 6: Walk-Forward Results View

**Summary:** aggregated validation Sharpe, return, total windows, overfitting risk badge (Low/Medium/High).

**Windows table:** train start, train end, validation start, validation end, best params (collapsed JSON), validation Sharpe, validation return.

**Parameter stability chart:** line chart showing how each optimal parameter varies across windows.

**Expandable window detail:** full metrics for each validation window.

### Screen 7: Strategy Comparison (`/strategies/compare`)

**Selection:** checkboxes on strategy list / backtest history, "Compare Selected" button (2-4 strategies).

**Comparison table:** metrics as rows, strategies as columns, best value in each row highlighted emerald.

**Overlaid equity curves:** normalized to 100, colored lines using chart palette (pink, emerald, sky, amber), legend.

**Benchmark overlay toggle** for SPY.

**Ranking summary:** ordered by Sharpe with rank badges (#1, #2, etc.).

## Files to Reference

- `product-plan/sections/strategy-engine/README.md`
- `product-plan/sections/strategy-engine/tests.md`
- `product-plan/sections/strategy-engine/strategy-list-light.png`
- `product-plan/sections/strategy-engine/strategy-detail-light.png`
- `product-plan/sections/strategy-engine/backtest-results-light.png`
- `product-plan/sections/strategy-engine/strategy-comparison-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Strategy list card grid renders with metrics and active toggle
- [ ] Strategy detail 3-tab interface works
- [ ] 7-step create/edit form with validation
- [ ] Backtest configuration modal launches backtest
- [ ] Backtest results show all charts (equity curve, drawdown, heatmap, distribution)
- [ ] Monthly returns heatmap renders correctly
- [ ] Walk-forward results table and parameter stability chart
- [ ] Strategy comparison view with overlaid equity curves
- [ ] Status badges (QUEUED, RUNNING animated, COMPLETED, FAILED)
- [ ] Backtest status indicator (RUNNING shows animated progress)
- [ ] Empty states for strategy list, backtest history, walk-forward history
- [ ] Responsive on mobile (charts stack, tables scroll horizontally)
