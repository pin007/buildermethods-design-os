# Test Instructions: Market Data

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: View Pipeline Health Overview

**Setup:** 4 data sources configured (Yahoo=connected, IB=connected, Finnhub=degraded, Binance=disconnected)

**Steps:**
1. Navigate to `/market-data`
2. See 4 stat cards at top
3. See 4 source cards below

**Expected Results:**
- [ ] "Active Data Sources" card shows "2 / 4"
- [ ] Yahoo Finance card has green status dot and "Connected" label
- [ ] Finnhub card has amber dot and "Degraded" label (amber color)
- [ ] Binance card has red dot and "Disconnected" label (red color)
- [ ] IB and Binance cards show "Real-time" badge (emerald)
- [ ] Yahoo and Finnhub cards show "Scheduled" badge (zinc)

### Flow 2: Add Instrument Subscription

**Setup:** Source detail for Yahoo Finance open, Instruments tab

**Steps:**
1. Click "Add Instrument" button
2. Modal opens with search field, interval checkboxes
3. Type "NVDA" in search
4. Autocomplete shows "NVIDIA Corporation — NVDA"
5. Select NVDA
6. Check interval "1d" (default), also check "1h"
7. Click "Subscribe"

**Expected Results:**
- [ ] Toast: "Instrument subscription added" (green, 4s)
- [ ] NVDA appears in instruments table
- [ ] Tracked Intervals shows badges "1d" and "1h"
- [ ] Modal closes

### Flow 3: Trigger and Monitor Backfill

**Steps:**
1. Click "Backfill" on AAPL row in instruments table
2. Backfill modal opens: date range pickers, interval selector, priority selector
3. Set start date to 1 year ago, interval "1d", priority "Normal"
4. Shows estimated duration "~2 minutes"
5. Click "Start Backfill"

**Expected Results:**
- [ ] Toast: "Backfill triggered" (blue, 4s)
- [ ] Active backfill tasks section appears at top of Fetch History tab
- [ ] Task shows: task ID, instrument "AAPL", progress bar 0%, "Cancel" button
- [ ] Progress bar updates as backfill proceeds

## Empty State Tests

### No Data Sources Configured

**Expected Results:**
- [ ] Overview shows empty state
- [ ] Message: "No data sources configured. Set up your market data connections to get started."
- [ ] "Configure Sources" button visible, navigates to Settings

### Source Has No Instruments

**Expected Results:**
- [ ] Instruments tab shows empty state
- [ ] Message: "No instruments tracked from this source. Add instruments to start collecting data."
- [ ] "Add Instrument" CTA visible

### No Corporate Actions

**Expected Results:**
- [ ] Corporate actions screen shows empty state
- [ ] Message: "No corporate actions detected. Actions like stock splits and dividends will appear here automatically."
- [ ] No CTA (informational only)

### All Quality Checks Passing

**Expected Results:**
- [ ] Data quality screen shows empty state
- [ ] Message: "All data quality checks passing. No issues to report."
- [ ] No CTA

## Sample Test Data

```python
mock_source = {
    "id": "yahoo-finance",
    "name": "Yahoo Finance",
    "status": "connected",
    "last_fetch": "2025-01-20T22:00:00Z",
    "error_rate_24h": 0.5,
    "tracked_instruments": 45,
    "next_fetch": "2025-01-21T22:00:00Z",
    "real_time": False,
}

mock_instrument = {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asset_type": "stock",
    "tracked_intervals": ["1d"],
    "coverage_start": "2020-01-01",
    "coverage_end": "2025-01-20",
    "data_points": 1256,
    "gaps": 0,
    "last_fetched": "2025-01-20T22:01:35Z",
    "freshness": "fresh",
}

mock_corporate_action = {
    "id": "ca-001",
    "instrument": "NVDA",
    "action_type": "split",
    "action_date": "2024-06-10",
    "details": "10:1 split",
    "status": "adjusted",
}

mock_quality_alert = {
    "instrument": "BTC-USDT",
    "source": "binance",
    "alert_type": "outlier",
    "severity": "warning",
    "detected_at": "2025-01-20T14:30:00Z",
    "details": "Price jump of 52% in single bar on 2025-01-15",
    "acknowledged": False,
}
```
