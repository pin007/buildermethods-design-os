# Test Instructions: Market Intelligence

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: Accept a Recommendation

**Setup:** 3 recommendations in feed (2 AI Research, 1 Strategy Signal)

**Steps:**
1. Navigate to `/market-analysis`
2. Recommendations tab shows cards sorted by confidence
3. Top card: AAPL BUY, 82% confidence (green badge), "AI Research" source
4. Click the card to expand it
5. See reasoning: technical signals (golden cross, RSI 58), sentiment (0.75), correlation
6. See target prices: Entry $184.00, Take-Profit $195.00 (+6%), Stop-Loss $178.00 (-3.3%)
7. Click "Create Order" (pink-600 button)

**Expected Results:**
- [ ] Shell order panel opens (480px from right)
- [ ] Panel is pre-filled: symbol="AAPL", action=BUY, type=limit, price=184.00, SL=178.00, TP=195.00
- [ ] Recommendation status changes to ACCEPTED (emerald badge)
- [ ] Toast: "Recommendation accepted" (green, 4s)

### Flow 2: Add a Guru for Tracking

**Steps:**
1. Click "Add Guru" button in guru summary row
2. Modal opens with search field and wallet address field
3. Type "Berkshire" in search
4. Autocomplete shows "Berkshire Hathaway — Warren Buffett"
5. Select it (type auto-detected as Institutional)
6. "Alert me on any trade" checkbox is checked by default
7. Click "Add & Track"

**Expected Results:**
- [ ] Toast: "Guru added to tracking" (green, 4s)
- [ ] Berkshire Hathaway chip appears in guru summary row
- [ ] Feed immediately shows available trades for this guru (if any)

### Flow 3: Create a Research Job

**Steps:**
1. Navigate to Research Schedule tab
2. Click "Create Job" button
3. Modal opens with form fields
4. Enter name "Weekly Crypto Analysis"
5. Select "Daily at specific time", set "06:00", timezone "UTC"
6. Select universe "Watchlist"
7. Set confidence threshold "7.5"
8. Set max results "15"
9. Click "Create Job"

**Expected Results:**
- [ ] Toast: "Research job created" (green, 4s)
- [ ] New job card appears in the grid
- [ ] Card shows: "Weekly Crypto Analysis", schedule "Daily at 06:00 UTC", status "Idle"
- [ ] Edit and Delete buttons available (no System badge)

## Empty State Tests

### No Recommendations

**Expected Results:**
- [ ] Empty state shows in recommendations tab
- [ ] Lightbulb icon visible
- [ ] Message: "No recommendations available. Our AI is analyzing markets — check back soon."
- [ ] "Run Analysis" CTA visible

### No Gurus Tracked

**Expected Results:**
- [ ] Empty state shows in Guru Tracker tab
- [ ] Users icon visible
- [ ] Message: "Start tracking institutional investors and crypto whales to see their notable trades."
- [ ] "Add Your First Guru" CTA visible

### No Research Jobs

**Expected Results:**
- [ ] Empty state shows in Research Schedule tab
- [ ] Clock icon visible
- [ ] Message: "No research jobs configured yet."
- [ ] "Create Research Job" CTA visible

## Component Tests

### Confidence Badge

- [ ] Score 82% → green circular badge
- [ ] Score 65% → green circular badge
- [ ] Score 74% → yellow circular badge (between 50-74)
- [ ] Score 45% → gray circular badge

### Sentiment Gauge

- [ ] Score 75 → green gauge zone
- [ ] Score 50 → yellow gauge zone
- [ ] Score 25 → red gauge zone
- [ ] Score displayed in center in monospace font

### Recommendation Status Badges

- [ ] ACTIVE → blue
- [ ] ACCEPTED → emerald
- [ ] DISMISSED → zinc
- [ ] SNOOZED → amber
- [ ] EXPIRED → zinc with faded opacity

## Sample Test Data

```python
mock_recommendation = {
    "id": "rec-001",
    "symbol": "AAPL",
    "instrument_name": "Apple Inc.",
    "action": "BUY",
    "confidence": 82,
    "source": "ai_research",
    "reasoning_snippet": "Golden cross + positive sentiment (0.75)",
    "status": "active",
    "expiry": "2025-01-21T14:30:00Z",
    "target_prices": {"entry": 184.00, "profit": 195.00, "stop_loss": 178.00},
}

mock_guru = {
    "name": "Berkshire Hathaway",
    "type": "institutional",
    "enabled": True,
    "recent_trade_count": 3,
}

mock_empty_recommendations = []
mock_empty_gurus = []
```
