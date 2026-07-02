# Test Instructions: Strategy Engine

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: Create a New Strategy

**Steps:**
1. Navigate to `/strategies`, click "New Strategy"
2. Step 1: Enter name "My Trend Strategy", select "Trend Following" type card
3. Click "Next" → Step 2: Parameters form shows SMA fast/slow, RSI threshold fields
4. Fill in parameters, click "Next"
5. Step 3: Exit strategies — enable Stop Loss, set 5%, enable Take Profit, set 15%
6. Steps 4-7: add AAPL instrument, set risk 1%, schedule daily 09:35 ET, review and save

**Expected Results:**
- [ ] Strategy appears in list after save
- [ ] Toast: "Strategy saved" (green, 4s)
- [ ] Card shows "Trend Following" badge (blue)
- [ ] Strategy is active by default (pink-600 left border)

### Flow 2: Run and View Backtest

**Setup:** Strategy "My Trend Strategy" exists

**Steps:**
1. Open strategy detail, Backtest History tab
2. Click "Run Backtest"
3. Modal opens: set date range "3Y", capital "$100,000", execution model "Simple"
4. Click "Run Backtest" in modal

**Expected Results:**
- [ ] Toast: "Backtest queued" (blue, 4s)
- [ ] Backtest appears in history table with RUNNING badge (blue, animated)
- [ ] Progress bar shows estimated time remaining
- [ ] When complete: COMPLETED badge (green)
- [ ] Toast: "Backtest completed" (green, 4s)
- [ ] Clicking row opens full results view

### Flow 3: View Backtest Results

**Setup:** Completed backtest with PASS result (Sharpe 1.8, CAGR 22%)

**Expected Results:**
- [ ] Executive summary shows "PASS" badge in emerald
- [ ] 6 stat cards show: CAGR "22.0%", Sharpe "1.80", etc. (monospace)
- [ ] Equity curve chart renders with pink-600 strategy line and zinc-400 benchmark
- [ ] Monthly returns heatmap shows green/red cells
- [ ] Drawdown chart shows red area below zero
- [ ] Trade log table shows all trades with correct P&L colors

## Empty State Tests

### No Strategies

**Expected Results:**
- [ ] Strategy list shows empty state
- [ ] Message: "No strategies configured yet. Create your first strategy to start backtesting."
- [ ] "Create Strategy" CTA visible

### Strategy With No Backtests

**Expected Results:**
- [ ] Backtest History tab shows empty state
- [ ] "Run Backtest" button still visible at top
- [ ] Empty message appropriate to this state

## Sample Test Data

```python
mock_strategy = {
    "id": "strat-001",
    "name": "Trend Following v2",
    "type": "trend_following",
    "is_active": True,
    "instruments": ["AAPL", "MSFT", "GOOGL"],
    "schedule": "Daily at 09:35 ET",
    "last_backtest": {
        "sharpe": 1.82,
        "cagr": 0.224,
        "max_drawdown": -0.143,
    },
}

mock_backtest_result = {
    "id": "bt-001",
    "status": "completed",
    "date_range": "2022-01-01 to 2025-01-01",
    "sharpe": 1.82,
    "cagr": 0.224,
    "max_drawdown": -0.143,
    "win_rate": 0.58,
    "profit_factor": 1.74,
    "total_trades": 147,
    "recommendation": "PASS",
}

mock_empty_strategies = []
```
