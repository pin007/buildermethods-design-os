# Test Instructions: Trade Journal

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: Journal a Trade from "Needs Review"

**Setup:** 3 closed trades not yet journaled in "US Equities" portfolio

**Steps:**
1. Navigate to `/journal/entries`
2. "Needs Review" tab is active by default
3. See AAPL BUY 20 closed, P&L +$124.00, close date yesterday
4. Click "Journal This Trade" on AAPL row
5. Editor opens with trade summary (read-only): AAPL, BUY, 20 shares, entry $182.48, exit $188.70
6. Fill in thesis, entry criteria in pre-trade section
7. Fill in what worked, lessons learned in post-trade section
8. Score all 5 dimensions: discipline=4, emotional=4, risk=5, entry=3, exit=4
9. Overall score shows "4.0" (auto-calculated)
10. Click "Save"

**Expected Results:**
- [ ] Toast: "Journal entry saved" (green, 4s)
- [ ] Entry moves from "Needs Review" to "All Entries"
- [ ] "Needs Review" count decrements by 1
- [ ] Entry appears in "All Entries" tab with process score "4.0" (green-ish)

### Flow 2: Delete a Journal Entry

**Steps:**
1. In "All Entries" tab, click trash icon on an entry
2. Level 3 confirmation modal appears
3. Modal reads: "Are you sure you want to delete this journal entry for AAPL? This action cannot be undone."
4. Click Cancel → entry still exists
5. Click trash again, click "Delete" (danger button)

**Expected Results:**
- [ ] Toast: "Journal entry deleted" (blue, 4s)
- [ ] Entry removed from table
- [ ] If it was the last entry, empty state appears

### Flow 3: View Process vs Outcome Quadrant

**Setup:** Multiple journal entries with varied process scores and P&L outcomes

**Steps:**
1. Navigate to `/journal/analytics`
2. Click "Process Scores" sub-tab
3. Process vs Outcome quadrant chart renders

**Expected Results:**
- [ ] 4 quadrants rendered: Skilled (top-right, emerald), Unlucky (top-left, amber), Lucky (bottom-right, amber), Needs Work (bottom-left, red)
- [ ] Trade count shown in each quadrant
- [ ] Threshold labels visible: "High Process >= 3.5", "P&L > 0 = High Outcome"

## Empty State Tests

### No Journal Entries Yet

**Expected Results:**
- [ ] Dashboard shows empty state
- [ ] Message: "Start journaling your trades to track improvement over time."
- [ ] "Create Entry" CTA visible

### All Trades Journaled (Needs Review Empty)

**Expected Results:**
- [ ] "Needs Review" tab shows empty state
- [ ] Icon visible
- [ ] Message: "All caught up! No trades waiting for review."
- [ ] "View All Entries" link visible

### No Starred Entries

**Expected Results:**
- [ ] "Starred" tab shows empty state
- [ ] Message: "Star important entries to find them quickly."
- [ ] "View All Entries" link visible

### No Behavioral Patterns Detected

**Expected Results:**
- [ ] Behavioral screen shows empty state
- [ ] Message: "No behavioral patterns detected. Keep trading consistently to build your behavioral profile."
- [ ] No CTA (informational)

## Component Tests

### Process Score Dots Selector (1-5)

- [ ] Clicking dot 3 sets score to 3 (dots 1-3 filled)
- [ ] Clicking dot 5 sets score to 5 (all dots filled)
- [ ] Overall score updates automatically as dimensions change
- [ ] Saving without all 5 scores shows validation error

### Delete Confirmation Level 3

- [ ] Modal contains instrument name in the message
- [ ] "Cancel" button closes modal without action
- [ ] "Delete" button is styled as danger (red)
- [ ] Pressing Escape closes modal

### Habit Score Gauges

- [ ] Score 80 → green gauge
- [ ] Score 55 → amber gauge
- [ ] Score 30 → red gauge
- [ ] Trend arrow shows direction (up/down/flat)

## Sample Test Data

```python
mock_journal_entry = {
    "id": "je-001",
    "trade_id": "ord-003",
    "instrument": "AAPL",
    "side": "BUY",
    "pnl": 124.00,
    "close_date": "2025-01-20",
    "portfolio": "US Equities",
    "process_scores": {
        "discipline": 4,
        "emotional_management": 4,
        "risk_management": 5,
        "entry_quality": 3,
        "exit_quality": 4,
    },
    "overall_score": 4.0,
    "starred": False,
    "tags": ["trend-follow", "earnings-play"],
}

mock_unjournaled_trade = {
    "id": "ord-004",
    "symbol": "MSFT",
    "side": "BUY",
    "quantity": 5,
    "entry_price": 413.00,
    "exit_price": 421.50,
    "pnl": 42.50,
    "close_date": "2025-01-19",
}

mock_behavioral_pattern = {
    "type": "revenge_trading",
    "severity": "moderate",
    "occurrences": 3,
    "description": "Entered 3 trades within 30 minutes of a loss in the last 30 days",
    "pnl_impact": -245.00,
    "recommendation": "Implement 1-hour cooldown after losses",
}

mock_empty_entries = []
mock_empty_unjournaled = []
```
