# Test Instructions: Portfolio & Positions

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: View Portfolio Overview

**Setup:** 2 portfolios ("US Equities" $47,231.89, "Crypto" $12,850.00)

**Steps:**
1. Navigate to `/portfolios`
2. See stat cards with aggregated totals
3. See portfolio list table with 2 rows

**Expected Results:**
- [ ] Total Net Worth shows "$60,081.89"
- [ ] Day P&L card shows combined value with emerald/red color
- [ ] Portfolio list shows both portfolio rows
- [ ] Clicking "US Equities" row navigates to `/portfolios/port-1`

### Flow 2: View Positions with FIFO Lot Detail

**Setup:** Portfolio "port-1" with AAPL position (20 shares, 2 lots)

**Steps:**
1. Navigate to `/portfolios/port-1`
2. Positions tab shows by default
3. AAPL row visible with current price, P&L, tax badge
4. Click AAPL row to expand

**Expected Results:**
- [ ] FIFO lots table appears with 2 lot rows
- [ ] Each lot shows: acquisition date, quantity, cost basis, current value, P&L
- [ ] Tax-Exempt badge shows for lot > 3 years old
- [ ] Trade/Close quick action buttons visible in expanded row

### Flow 3: Add Instrument to Watchlist

**Setup:** Watchlist "Tech Stocks" exists with 3 instruments

**Steps:**
1. Navigate to Watchlists tab
2. Select "Tech Stocks" from dropdown
3. See existing instruments in table
4. Type "GOOGL" in quick-add search
5. Click "Add"

**Expected Results:**
- [ ] Toast: "Instrument added to watchlist" (green, 4s)
- [ ] GOOGL appears in the table immediately
- [ ] Live price shows for GOOGL
- [ ] Remove button visible on GOOGL row

## Empty State Tests

### No Portfolios (First Time User)

**Expected Results:**
- [ ] Empty state shows on `/portfolios`
- [ ] Message: "Welcome to Trading Squad! Connect your broker to get started."
- [ ] "Connect Broker" button visible and navigates to settings

### Portfolio Has No Positions

**Expected Results:**
- [ ] Positions tab shows empty state
- [ ] Message: "No positions yet. Create your first order to start building your portfolio."
- [ ] "New Order" CTA opens the shell order panel

### Watchlist Has No Items

**Expected Results:**
- [ ] Empty state shows in watchlist instruments area
- [ ] Message: "This watchlist is empty. Add instruments to start tracking."
- [ ] Search input is focused/highlighted

### No Watchlists

**Expected Results:**
- [ ] Empty state in Watchlists tab
- [ ] Message: "Create a watchlist to track instruments you're interested in."
- [ ] "New Watchlist" button visible

## Accessibility Checks

- [ ] Tax Status badge has tooltip with days-held info
- [ ] Price alert bell icons have aria-labels
- [ ] Expandable rows use aria-expanded
- [ ] All table columns have proper headers

## Sample Test Data

```python
mock_portfolio = {
    "id": "port-1",
    "name": "US Equities",
    "total_value": 47231.89,
    "day_pnl": 1234.56,
    "day_pnl_percent": 2.68,
    "cash_available": 8420.00,
}

mock_position = {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "quantity": 20,
    "avg_price": 182.48,
    "current_price": 185.50,
    "market_value": 3710.00,
    "pnl": 60.40,
    "pnl_percent": 1.66,
    "weight_percent": 7.85,
    "days_held": 366,
    "broker": "IB",
}

mock_empty_positions = []
mock_empty_watchlists = []
```
