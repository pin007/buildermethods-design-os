# Strategy Engine Specification

## Overview
Strategy Engine is the hub for building, testing, and evaluating trading strategies before deploying them with real capital. It provides a strategy library for managing configured strategies (trend following, mean reversion, composite master-slave patterns), a backtesting workspace for running strategies against historical data with realistic execution costs, walk-forward optimization to prevent overfitting, and side-by-side strategy comparison with benchmark overlays.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Strategy Engine MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Toast Notifications
All user-facing notifications use the shell's toast API. Toast variants:
- Backtest queued: info (blue, 4s)
- Backtest completed: success (green, 4s)
- Backtest failed: error (red, 6s)
- Walk-forward optimization started: info (blue, 4s)
- Walk-forward optimization completed: success (green, 5s)
- Strategy saved: success (green, 4s)
- Strategy activated/deactivated: info (blue, 4s)
- Validation error: error (red, 6s)

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, side-by-side comparisons
- Tablet (768px-1023px): Condensed layouts, stacked charts
- Mobile (<768px): Single-column, collapsible metric panels, horizontal-scroll tables

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

All numeric table columns and live metric values (Sharpe, CAGR, max drawdown, prices, P&L, returns, trade-log figures) use tabular figures (`font-variant-numeric: tabular-nums` via the `.tabular` utility) so digits align vertically across rows and metric cards. Data cards and grids (metric stat cards, comparison tables, trade logs, walk-forward windows) reflow at their own component width using Tailwind v4 container queries (`@container` on the wrapper, `@sm:`/`@lg:` variants on children) rather than the viewport, so side-by-side comparison panels collapse cleanly within the shell.

## User Flows
- View all strategies in a card grid showing strategy name, type badge, assigned instruments, active/inactive status, last backtest summary (Sharpe, CAGR, max drawdown), and schedule info
- View strategy detail: full configuration including entry strategy type, parameters, exit strategies (stop-loss, take-profit, trailing-stop, break-even), assigned instruments, position sizing rules, evaluation schedule, and backtest history
- Create a new strategy: pick strategy type (Trend Following, Mean Reversion, Composite), configure parameters, assign instruments, set position sizing rules, configure exit strategies, set evaluation schedule, save
- Edit an existing strategy: modify parameters, instruments, exit strategies, or schedule — changes are saved immediately and marked as "unsaved until next backtest"
- Activate/deactivate a strategy: toggle the active state, which controls whether the Trading Advisor evaluates it on schedule
- Run a backtest: select date range, initial capital, commission model, slippage model (Simple/Volume-Based/Spread-Based), data granularity (Daily/Hourly/Minute), enable/disable indicator snapshots, then submit — shows progress indicator while running
- View backtest results: executive summary (pass/fail/review recommendation), key metrics (CAGR, Sharpe, Sortino, max drawdown, win rate, profit factor, total trades), equity curve chart with benchmark overlay, drawdown chart, monthly returns heatmap, trade distribution histogram, and scrollable trade log with indicator snapshots
- Run walk-forward optimization: configure training window, validation window, step size, and parameter grid — shows progress (current window / total windows) while running
- View walk-forward results: window-by-window results table (train period, validation period, best params, validation Sharpe, validation return), aggregated metrics (average validation Sharpe, average validation return), overfitting detection indicator, parameter stability chart
- Compare strategies: select 2-4 backtest results, view side-by-side metrics table (ranked by Sharpe), overlaid equity curves, and benchmark comparison for each
- View benchmark comparison: strategy vs SPY, Buy-and-Hold — showing alpha, beta, excess Sharpe, information ratio

## UI Requirements

### Strategy List (Main View)
- Card grid layout (2 columns desktop, 1 column mobile)
- Each card shows: strategy name, type badge (color-coded: Trend Following = blue, Mean Reversion = amber, Composite = purple), active/inactive toggle, instrument chips, last backtest date, key metrics (Sharpe ratio, CAGR, max drawdown in monospace), schedule summary (e.g., "Daily at 09:35 ET")
- Active strategies have a subtle left-border accent (pink-600), inactive strategies are dimmed
- Sort options: Name, Last Backtest, Sharpe Ratio, CAGR
- Filter by: type, active/inactive, instrument
- "New Strategy" button (primary action) in top-right
- Empty state: icon, "No strategies configured yet. Create your first strategy to start backtesting.", "Create Strategy" CTA
- Loading states use skeleton screens (not spinners) for all data-dependent components

### Strategy Detail
- Tabbed layout with 3 tabs: Configuration, Backtest History, Walk-Forward History
- **Configuration tab:**
  - Read-only display of strategy configuration with "Edit" button to enter edit mode
  - Entry strategy section: type, parameters displayed as key-value pairs in a clean grid (parameter name, value, description)
  - Exit strategies section: collapsible cards for each exit strategy (Stop Loss, Take Profit, Trailing Stop, Break Even) showing their parameters
  - Instruments section: chip list of assigned instruments with add/remove capability in edit mode
  - Position sizing section: risk-per-trade %, max position %, volatility adjustment toggle
  - Schedule section: enabled toggle, frequency, time, timezone
  - Composite strategy visualization: visual diagram showing master (entry) strategy connected to slave (exit) strategies with their priority order
- **Backtest History tab:**
  - Table of past backtests sorted by date descending: backtest ID, date range, initial capital, Sharpe, CAGR, max drawdown, total trades, status (completed/failed/running), duration
  - Click row to open full backtest results view
  - "Run Backtest" button at top
  - Running backtests show animated progress bar with estimated time remaining
- **Walk-Forward History tab:**
  - Table of past walk-forward optimizations: optimization ID, date range, windows count, avg validation Sharpe, avg validation return, status, duration
  - Click row to open full walk-forward results view
  - "Run Walk-Forward" button at top

### New Strategy / Edit Strategy
- Step-by-step form (not a modal — full page):
  - Step 1: Basic Info — name, type selection (cards with icons and descriptions for each type)
  - Step 2: Parameters — dynamic form fields based on selected strategy type, with defaults pre-filled and tooltips explaining each parameter
  - Step 3: Exit Strategies — toggle each exit strategy on/off, configure parameters for enabled ones. For Composite type, show priority ordering with drag handles
  - Step 4: Instruments — search and add instruments (autocomplete), display as removable chips
  - Step 5: Position Sizing — risk-per-trade slider (0.5%-5%, default 1%), max position slider (5%-30%, default 10%), volatility adjustment toggle
  - Step 6: Schedule — enable/disable, frequency selector (Daily/Interval), time picker, timezone selector
  - Step 7: Review & Save — summary of all settings, "Save Strategy" button
- Back/Next navigation between steps, step indicator at top
- Inline validation on each step before proceeding
- For edit mode: pre-fill all fields with current values, skip to any step directly

### Backtest Configuration (Modal)
- Launched from strategy detail "Run Backtest" button
- Compact modal with sections:
  - Date range: start/end date pickers, preset buttons (1Y, 2Y, 3Y, 5Y, Max)
  - Capital: initial capital input (default $100,000)
  - Execution model: radio buttons (Simple, Volume-Based, Spread-Based) with brief description for each
  - Data granularity: radio buttons (Daily, Hourly, Minute) with note about expected duration
  - Commission: percentage input (default 0.1%)
  - Slippage: percentage input (default 0.05%) — disabled when execution model is Volume-Based or Spread-Based
  - Indicator snapshots: toggle (default off) with storage warning
  - Benchmarks: checkboxes (Buy-and-Hold always on, SPY, QQQ, BTC)
- "Run Backtest" submit button with estimated duration display
- Validation: start date < end date, minimum 1 year of data

### Backtest Results View
- Top section: executive summary card with pass/fail/review badge (green/red/yellow), strategy name, test period, key recommendation
- Stat cards row (6 cards): CAGR, Sharpe Ratio, Sortino Ratio, Max Drawdown, Win Rate, Profit Factor — each with value, benchmark comparison indicator (arrow up/down vs SPY), and color coding (green = good, red = concerning)
- Charts section (tabs or scrollable):
  - Equity Curve: line chart with strategy line (pink-600) and benchmark overlay (zinc-400 dashed), log scale toggle
  - Drawdown: area chart showing underwater equity (red-fill below zero line)
  - Monthly Returns Heatmap: grid of months x years, color-coded cells (green = positive, red = negative, intensity by magnitude)
  - Rolling Sharpe: line chart showing 12-month rolling Sharpe ratio over time
  - Trade Distribution: histogram of trade P&L with bell curve overlay
- Benchmark Comparison section: table showing strategy vs each benchmark with alpha, beta, excess Sharpe, information ratio, max drawdown comparison
- Trade Log section: sortable, paginated table (50 rows per page) with columns: trade #, entry date, exit date, instrument, direction (LONG/SHORT badge), quantity, entry price, exit price, P&L (color-coded), return %, holding days
  - Expandable rows showing indicator snapshots at entry and exit (if captured): indicator name, entry value, exit value displayed in a mini key-value grid
- Anti-pattern warnings: if any pitfall is detected (possible overfitting, low trade count, high drawdown), show warning banner at top with specific issue and recommendation

### Walk-Forward Configuration (Modal)
- Launched from strategy detail "Run Walk-Forward" button
- Fields:
  - Date range: start/end date pickers (same as backtest)
  - Training window: months input (default 12)
  - Validation window: months input (default 3)
  - Step size: months input (default 3)
  - Parameter grid: dynamic key-value inputs for each strategy parameter, each accepting comma-separated values (e.g., "20, 50, 100" for sma_fast)
  - Total iterations display (auto-calculated: param combos x windows)
  - Estimated duration display
- "Run Optimization" submit button

### Walk-Forward Results View
- Summary section: aggregated validation Sharpe, aggregated validation return, total windows, overfitting risk indicator (Low/Medium/High badge based on OOS/IS Sharpe ratio)
- Windows table: each row shows train start, train end, validation start, validation end, best parameters (collapsed JSON), validation Sharpe, validation return — sortable by any column
- Parameter stability chart: line chart showing how each optimal parameter changes across windows (stable = good, volatile = potential overfitting)
- Expandable window detail: clicking a window row shows the full backtest metrics for that specific validation window

### Strategy Comparison View
- Accessed from strategy list ("Compare" button) or by selecting multiple backtests
- Selection: checkboxes on strategy list or backtest history, 2-4 strategies, "Compare Selected" button
- Comparison table: rows = metrics (CAGR, Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor, Total Trades, Avg Holding Period), columns = selected strategies, best value in each row highlighted (green background)
- Overlaid equity curves chart: multiple colored lines (using chart palette from brand manual: magenta, emerald, sky, amber), legend with strategy names, normalized to starting value of 100
- Benchmark overlay toggle for SPY line
- Ranking summary: ordered list of strategies by Sharpe ratio with rank badges (#1, #2, etc.)

### Backtest Status States
- QUEUED (gray) — waiting for available worker
- RUNNING (blue, animated) — currently executing with progress percentage
- COMPLETED (green) — results available
- FAILED (red) — execution error with error message

## Configuration
- shell: true
