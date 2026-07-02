# Test Instructions: Trading Calendar

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: View Calendar and Filter by Event Type

**Setup:** Calendar loaded with sample events across all types: 3 earnings, 2 economic (1 high-impact, 1 medium), 2 dividends, 1 options expiration, 1 IPO

**Steps:**
1. Navigate to `/calendar`
2. All 5 event type chips are active by default
3. Stats bar shows correct totals
4. Click the "Earnings" chip to deactivate it

**Expected Results:**
- [ ] Earnings chip becomes visually inactive (dimmed, border changes)
- [ ] Amber earnings dots disappear from all calendar cells
- [ ] Event count on "Earnings" chip does not change (still shows total, but hidden)
- [ ] Event list panel no longer shows earnings events for selected day
- [ ] Other event types remain visible

**Steps (continued):**
5. Click "Earnings" chip again to re-activate

**Expected Results:**
- [ ] Earnings events reappear on calendar
- [ ] Chip returns to active styling

### Flow 2: Click Day Cell and Expand Event Detail

**Setup:** Day with 2 events: one earnings announcement (AAPL, in portfolio) and one economic release (NFP, high-impact)

**Steps:**
1. Click the calendar cell for that day
2. Event list panel updates to show the 2 events
3. Events sorted: economic event by time first, then earnings alphabetically
4. Click the NFP economic event row

**Expected Results:**
- [ ] Event row expands inline showing full economic detail
- [ ] Shows: indicator name "Nonfarm Payrolls", country flag (🇺🇸), release time with timezone
- [ ] Impact badge shows "High" in red
- [ ] Shows consensus estimate and prior value
- [ ] Other event remains collapsed

**Steps (continued):**
5. Click the AAPL earnings row

**Expected Results:**
- [ ] AAPL earnings detail expands
- [ ] Shows: company "Apple Inc.", ticker "AAPL", reporting timing (before/after market)
- [ ] Shows EPS estimate vs prior, revenue estimate vs prior
- [ ] "In Portfolio" badge visible
- [ ] NFP row collapses (only one expanded at a time, or both can be open — consistent behavior)

### Flow 3: Toggle "Portfolio Only" Filter

**Setup:** Calendar with mixed events; user holds AAPL and MSFT

**Steps:**
1. Enable "Portfolio Only" toggle
2. Calendar updates immediately

**Expected Results:**
- [ ] Only events related to AAPL and MSFT are shown on calendar
- [ ] All other event dots removed from calendar cells
- [ ] Stats bar counts update to reflect filtered view
- [ ] Event type chips remain visible but counts update

**Steps (continued):**
3. Disable "Portfolio Only" toggle

**Expected Results:**
- [ ] All events return to calendar
- [ ] Stats bar returns to full counts

### Flow 4: Navigate Calendar Months

**Steps:**
1. Click "Next >" arrow
2. Month advances (e.g., March → April)
3. Calendar header shows new month/year
4. Click "Today" button

**Expected Results:**
- [ ] Calendar returns to current month
- [ ] Today's date cell has pink-600 ring
- [ ] Selected day resets to today
- [ ] Event list panel shows today's events

### Flow 5: Month/Week View Toggle

**Steps:**
1. Click "Week" toggle in calendar header
2. Calendar switches to week view

**Expected Results:**
- [ ] 7-column week layout appears with more vertical space per day
- [ ] Event title snippets are visible alongside dots (not just dots)
- [ ] Economic events show release times
- [ ] Click "Month" toggle to return

**Expected Results:**
- [ ] Calendar returns to month view
- [ ] Day cells show up to 3 event dots with "+N more" overflow

## Empty State Tests

### Empty Day

**Setup:** Click a calendar day with no events

**Expected Results:**
- [ ] Event list panel shows "No events scheduled" message
- [ ] No event rows visible
- [ ] No errors or blank panels

### All Filters Disabled

**Setup:** User clicks all event type chips to deactivate them all

**Expected Results:**
- [ ] Calendar shows no event dots (all cells visually empty)
- [ ] Event list panel shows "No events match the selected filters. Try enabling more event types."
- [ ] "Reset filters" link is visible and clickable
- [ ] Clicking "Reset filters" re-enables all event type chips

### Loading State

**Setup:** Simulate slow API response

**Expected Results:**
- [ ] Stat cards show skeleton loading animation
- [ ] Calendar cells show skeleton placeholder dots
- [ ] Event list panel shows skeleton rows
- [ ] No errors during loading

### Error State

**Setup:** API returns 500 error

**Expected Results:**
- [ ] Shows "Unable to load calendar events. Please try again."
- [ ] Retry button visible and functional
- [ ] No broken layouts

## Component Tests

### Stats Bar

- [ ] "This Week" shows correct event count with type breakdown
- [ ] "Portfolio Events" count reflects only events affecting held positions
- [ ] "High Impact" counts only economic events with impact=high in next 7 days
- [ ] "Upcoming Dividends" shows total dividend income in next 30 days (monospace format)

### Event Type Filter Chips

- [ ] Each chip shows colored dot matching event type color
- [ ] Chip label is correct (Earnings, Economic, Dividends, Options, IPOs)
- [ ] Count badge shows number of visible events for that type
- [ ] Active chip has full color styling
- [ ] Inactive chip is dimmed/muted
- [ ] "Portfolio Only" toggle is separate from type chips

### Calendar Day Cells (Month View)

- [ ] Shows up to 3 event dots, color-coded by type
- [ ] "+N more" indicator when >3 events on a day
- [ ] Today's cell has pink-600 ring indicator
- [ ] Selected day cell has distinct background/border
- [ ] Days with portfolio events show subtle background tint
- [ ] Clicking a cell selects it and updates the event list panel

### Event List Rows

- [ ] Color-coded type indicator (left edge or dot)
- [ ] Time shown for time-specific events (economic releases)
- [ ] Title displayed
- [ ] Ticker shown when applicable (earnings, dividends)
- [ ] Impact badge shown for economic events (high/medium/low)
- [ ] Portfolio dot shown when event is relevant to held positions
- [ ] Clicking row expands inline detail

### Event Detail Expansions

**Earnings:**
- [ ] Company name and ticker
- [ ] Reporting timing (Before Market / After Market)
- [ ] EPS estimate and prior EPS
- [ ] Revenue estimate and prior revenue
- [ ] Confirmed/Estimated status badge
- [ ] "In Portfolio" badge if applicable

**Economic:**
- [ ] Indicator name and country flag
- [ ] Release date and time with timezone
- [ ] Impact badge (High=red, Medium=amber, Low=gray)
- [ ] Consensus estimate and prior value with unit
- [ ] Brief description

**Dividend:**
- [ ] Company name and ticker
- [ ] Ex-dividend date, record date, payment date
- [ ] Dividend amount and yield %
- [ ] Frequency (quarterly/annual/monthly)
- [ ] "In Portfolio" badge with expected payment amount

**Options:**
- [ ] Expiration date and type (Monthly/Weekly/Quarterly)
- [ ] Exchange name
- [ ] Affected open positions with current value and ITM/OTM status

**IPO:**
- [ ] Company name and expected ticker
- [ ] Exchange and expected listing date
- [ ] Pricing range
- [ ] Shares offered and estimated valuation
- [ ] Lead underwriters and industry
- [ ] Status badge (Upcoming/Pricing/Recent)

## Sample Test Data

```python
from datetime import date, datetime

today = date.today()

mock_earnings_event = {
    "id": "evt-001",
    "type": "earnings",
    "date": today.isoformat(),
    "ticker": "AAPL",
    "company": "Apple Inc.",
    "timing": "after_market",
    "eps_estimate": 2.10,
    "eps_prior": 1.99,
    "revenue_estimate": 124_500_000_000,
    "revenue_prior": 119_600_000_000,
    "confirmed": True,
    "in_portfolio": True,
}

mock_economic_event = {
    "id": "evt-002",
    "type": "economic",
    "date": today.isoformat(),
    "time": "13:30",
    "timezone": "UTC",
    "name": "Nonfarm Payrolls",
    "country": "US",
    "impact": "high",
    "consensus": 185000,
    "prior": 199000,
    "unit": "K",
    "description": "Monthly measure of US employment excluding farm workers.",
}

mock_dividend_event = {
    "id": "evt-003",
    "type": "dividend",
    "date": today.isoformat(),
    "ticker": "MSFT",
    "company": "Microsoft Corp.",
    "ex_date": today.isoformat(),
    "record_date": (today).isoformat(),
    "payment_date": (today).isoformat(),
    "amount": 0.75,
    "yield_pct": 0.7,
    "frequency": "quarterly",
    "in_portfolio": True,
    "expected_payment": 225.00,
}

mock_options_event = {
    "id": "evt-004",
    "type": "options",
    "date": today.isoformat(),
    "expiration_type": "monthly",
    "exchange": "CBOE",
    "affected_positions": [
        {"ticker": "AAPL", "contracts": 2, "value": 4200.00, "status": "ITM"},
    ],
}

mock_ipo_event = {
    "id": "evt-005",
    "type": "ipo",
    "date": today.isoformat(),
    "company": "TechCo Inc.",
    "expected_ticker": "TECH",
    "exchange": "NASDAQ",
    "price_range_low": 18.00,
    "price_range_high": 22.00,
    "shares_offered": 10_000_000,
    "estimated_valuation": 2_000_000_000,
    "underwriters": ["Goldman Sachs", "Morgan Stanley"],
    "industry": "Software",
    "status": "upcoming",
}

mock_empty_day_events = []
```
