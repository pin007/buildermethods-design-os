# Strategy Engine

## Overview

Hub for building, testing, and evaluating trading strategies before deploying with real capital. Provides a strategy library for managing configured strategies, a backtesting workspace with realistic execution costs, walk-forward optimization to prevent overfitting, and side-by-side strategy comparison with benchmark overlays.

## Screens

1. **Strategy List** (`/strategies`) — Card grid with key metrics, active toggle, sort/filter
2. **Strategy Detail** (`/strategies/{id}`) — Config, Backtest History, Walk-Forward History tabs
3. **New/Edit Strategy** — 7-step full-page form
4. **Backtest Results** — Full results view with equity curve, heatmap, trade log
5. **Walk-Forward Results** — Window-by-window results with parameter stability chart
6. **Strategy Comparison** (`/strategies/compare`) — Side-by-side metrics and overlaid equity curves

## User Flows

- View all strategies in a card grid with key performance metrics
- Create a strategy via 7-step form: type, parameters, exits, instruments, position sizing, schedule, review
- Edit an existing strategy (same 7-step form, pre-filled)
- Activate/deactivate strategies via toggle
- Run backtests with configurable date range, capital, execution model, and slippage
- View full backtest results: executive summary, 6 metric cards, equity curve, drawdown, monthly heatmap, trade log
- Run walk-forward optimization to detect overfitting
- Compare 2-4 strategies side by side with overlaid equity curves

## Design Decisions

- Strategy types: Trend Following (blue), Mean Reversion (amber), Composite (purple)
- Active strategies have pink-600 left border accent; inactive are dimmed
- Backtest status states: QUEUED (gray), RUNNING (blue + animated progress), COMPLETED (green), FAILED (red)
- Overfitting risk badge based on OOS/IS Sharpe ratio: Low/Medium/High
- System-default strategies cannot be deleted, only disabled
- Monthly returns heatmap: green=positive, red=negative, intensity by magnitude

## Visual References

- `strategy-list-light.png` / `strategy-list-dark.png` — Strategy list with cards
- `strategy-detail-light.png` / `strategy-detail-dark.png` — Strategy detail configuration tab
- `strategy-detail-backtests-light.png` / `-dark.png` — Backtest history tab
- `strategy-detail-walkforward-light.png` / `-dark.png` — Walk-forward history tab
- `backtest-results-light.png` / `-dark.png` — Equity curve results
- `backtest-results-monthly-light.png` / `-dark.png` — Monthly returns heatmap
- `backtest-results-drawdown-light.png` / `-dark.png` — Drawdown chart
- `backtest-results-distribution-light.png` / `-dark.png` — Trade distribution
- `walkforward-results-light.png` / `-dark.png` — Walk-forward results
- `strategy-comparison-light.png` / `-dark.png` — Comparison view

## Callback Reference

| Action | Description |
|--------|-------------|
| Toggle active | Enable/disable strategy for Trading Advisor evaluation |
| Run backtest | Open configuration modal, queue backtest on submit |
| View backtest results | Navigate to results view for selected run |
| Run walk-forward | Open configuration modal, queue optimization |
| Compare strategies | Open comparison view with selected strategies |
| Save strategy | Save configuration, validate all 7 steps first |
