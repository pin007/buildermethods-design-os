# Test Instructions: Trading Core

Framework-agnostic test-writing instructions. Adapt to your testing setup (pytest, Playwright, etc.).

## Overview

Trading Core covers: dashboard with portfolio stats, order management (3 tabs), order entry form, and approval workflow. Critical path — test thoroughly.

---

## User Flow Tests

### Flow 1: Create a New Order

**Scenario:** User creates a limit buy order from the dashboard.

#### Success Path

**Setup:**
- User is authenticated with an active portfolio ("US Equities", $47,231.89)
- IB broker is connected (status: connected)
- Instrument AAPL exists ($185.50, +$2.30 / +1.26%)

**Steps:**
1. User navigates to Dashboard (`/`)
2. User sees "Create Order" button (or triggers via Cmd+K → "New Order")
3. Order panel slides in from the right (480px wide)
4. User clicks "BUY" toggle (emerald color)
5. User types "AAPL" in the instrument search field
6. Autocomplete shows "Apple Inc. — AAPL" dropdown option
7. User selects AAPL
8. Symbol preview shows: "$185.50 +$2.30 (+1.26%)"
9. User clicks "Limit" tab
10. User enters quantity: "10"
11. User enters limit price: "184.00" (pre-filled with current price, user modifies)
12. Order summary shows: Estimated total "$1,840.00", Portfolio impact "3.89%" in amber
13. User clicks "Submit Order"

**Expected Results (risk >= 1%):**
- [ ] Order status becomes `pending_approval`
- [ ] Warning toast appears: "Order pending approval — requires review" (yellow, 5s)
- [ ] Order panel closes (or stays open, implementation choice)
- [ ] Dashboard "Pending Approvals" count increments by 1

#### Failure Path: Validation Error

**Setup:** Order panel is open

**Steps:**
1. User clicks "Submit Order" without entering quantity
2. Quantity field shows red border and error message "Quantity is required"
3. Form is NOT submitted

**Expected Results:**
- [ ] Error shown under quantity field: "Quantity is required" (red text)
- [ ] Submit button does not proceed
- [ ] No toast notification

#### Failure Path: Broker Error

**Setup:** Broker responds with an error after submission

**Steps:**
1. User submits a valid order
2. Broker returns an error

**Expected Results:**
- [ ] Order status becomes `failed`
- [ ] Error toast appears: relevant error message (red, 6s)
- [ ] Order appears in Order History with FAILED badge

---

### Flow 2: Approve a Pending Order

**Scenario:** User reviews and approves an order from the approval queue.

#### Success Path

**Setup:**
- Order "ord-001" exists: AAPL BUY 10 limit $184.00, status `pending_approval`
- `approvalContext.expiresAt` is 10 minutes in the future
- Recommendation "rec-001" is linked (82% confidence)

**Steps:**
1. User navigates to Orders (`/orders`)
2. User sees "Pending Approval" tab (default tab)
3. Table shows AAPL BUY 10 with: Risk 3.89% (amber badge), countdown "9:45" remaining
4. User clicks the row
5. Approval Card renders:
   - Section 1 "Order Details": "AAPL — Apple Inc.", "BUY" badge (emerald), "10 shares", "$184.00 limit", "~$1,840.00 estimated"
   - Section 2 "Risk Analysis": "3.89% portfolio impact" (amber), position size %, cash balance after
   - Section 3 "Market Context": current price $185.50, day change +$2.30, 52-week range
   - Section 4 "AI Recommendation": confidence 82% (green circular badge), reasoning text
6. User clicks the green "Approve" button

**Expected Results:**
- [ ] Success toast: "Order approved and submitted to broker" (green, 4s)
- [ ] Order status changes from `pending_approval` to `submitted`
- [ ] Order moves from Pending Approval tab to Open Orders tab
- [ ] Dashboard "Pending Approvals" count decrements by 1

#### Failure Path: Order Expires

**Setup:**
- Order exists with `approvalContext.expiresAt` in the past (or countdown reaches 0)

**Expected Results:**
- [ ] Countdown shows "0:00" in red with pulse animation
- [ ] Order auto-changes status to `expired`
- [ ] Order disappears from Pending Approval tab
- [ ] Error toast or notification: "Order ORD-001 expired — approval timeout" (red, 6s)

#### Failure Path: Reject Order

**Steps:**
1. User opens approval card
2. User clicks red "Reject" button
3. Optional rejection reason textarea appears
4. User types "Price moved too much, will wait"
5. User clicks "Confirm Rejection"

**Expected Results:**
- [ ] Info toast: "Order rejected" (blue, 4s)
- [ ] Order status changes to `rejected`
- [ ] Order moves to Order History with REJECTED badge
- [ ] `rejectionReason` stored: "Price moved too much, will wait"

---

### Flow 3: Create a Bracket Order

**Scenario:** User creates an advanced order with bracket (stop-loss + take-profit).

#### Success Path

**Steps:**
1. User opens order panel
2. User selects BUY, selects AAPL
3. User clicks "Advanced" tab
4. User enters quantity: 5, limit price: 184.00
5. User toggles "Attach Bracket" ON
6. Stop-loss price field appears: user enters "178.00"
7. Take-profit price field appears: user enters "195.00"
8. User submits

**Expected Results:**
- [ ] Parent order created (AAPL BUY 5 limit $184.00)
- [ ] Two child leg orders created: stop-loss at $178.00, take-profit at $195.00
- [ ] In Orders screen: bracket group shows as collapsible row
- [ ] Parent order on top, child legs indented below with connector line
- [ ] Child legs show: "Stop Loss" and "Take Profit" labels

---

## Empty State Tests

### Primary Empty State (No Broker Connected)

**Setup:** No brokers connected (`brokers = []`)

**Expected Results:**
- [ ] Dashboard shows empty state card
- [ ] Message: "Welcome to Trading Squad! Connect your broker to get started."
- [ ] Button "Connect Broker" is visible
- [ ] Clicking "Connect Broker" navigates to `/settings` (broker section)
- [ ] No stats cards rendered (no data to show)

### Orders Empty State

**Setup:** No orders exist in the database

**Expected Results:**
- [ ] Pending Approval tab: "No pending approvals. All clear!" + "View All Orders" link
- [ ] Open Orders tab: icon + "No orders found." + "Create Order" CTA
- [ ] Order History tab: icon + "No orders found. Your order history will appear here." + "Create Order" CTA

### After Approval — Empty Pending Tab

**Setup:** Last pending order was just approved

**Expected Results:**
- [ ] Pending Approval tab immediately shows empty state
- [ ] "No pending approvals. All clear!" message appears
- [ ] Orders count in tab badge updates to 0

---

## Component Tests

### Dashboard Stat Cards

**Renders correctly:**
- [ ] "Portfolio Value" label with `trending-up` icon (pink-400 color)
- [ ] Value "$47,231.89" in monospace font (text-2xl font-mono)
- [ ] Day P&L "+$1,234.56" in emerald if positive, red if negative
- [ ] Day P&L % "+2.68%" in emerald if positive, red if negative
- [ ] "Pending Approvals" shows count badge (pink-600 background)

### Order Status Badges

**Renders with correct colors:**
- [ ] `pending_approval` → amber text + amber border
- [ ] `filled` → emerald text + emerald border
- [ ] `rejected` → red text + red border
- [ ] `cancelled` → zinc-500 text, no border
- [ ] `partially_filled` → teal text + teal border

### Countdown Timer

- [ ] Shows MM:SS format (e.g., "14:23")
- [ ] Turns red when < 5 minutes remaining
- [ ] Pulses/animates when < 5 minutes remaining
- [ ] Shows "Expired" when countdown reaches 0
- [ ] Auto-triggers order expiry at 0

### Approval Card

- [ ] All 4 sections render with appropriate data
- [ ] AI Recommendation section only appears when `recommendation` prop provided
- [ ] Risk impact > 5% shows value in red
- [ ] Confidence badge: green >= 75%, yellow 50-74%, gray < 50%
- [ ] Approve button is emerald, Reject button is red

### AI Provenance Chip

- [ ] Renders the confidence gauge (0–100), the source badge (strategy name or "Market Analyst"), and the model/version tag when a `recommendation` is provided
- [ ] Reasoning disclosure is collapsed by default; activating it expands to reveal the structured reasoning + target prices, and activating it again collapses them
- [ ] Renders wherever an AI Recommendation appears (e.g. the approval card's "AI Recommendation" section) without regressing when `recommendation` is absent

---

## Edge Cases

- [ ] Very long instrument names truncate with ellipsis in table cells
- [ ] Portfolio impact exactly at 1% boundary shows yellow (not green, not red)
- [ ] Order with `amendedFields` shows AMENDED badge with changed fields visible
- [ ] Bracket order: cancelling parent order also cancels all child legs
- [ ] OCO behavior: when stop-loss fills, take-profit shows CANCELLED
- [ ] Order table handles 50+ orders with correct pagination
- [ ] Countdown timer starts from `approvalContext.expiresAt`, not from component mount time

---

## Sample Test Data

```python
# Populated state
mock_order_pending = {
    "id": "ord-001",
    "symbol": "AAPL",
    "instrument_name": "Apple Inc.",
    "side": "BUY",
    "order_type": "limit",
    "quantity": 10,
    "limit_price": 184.00,
    "status": "pending_approval",
    "broker_short_name": "IB",
    "time_in_force": "DAY",
    "created_at": "2025-01-20T14:30:00Z",
    "approval_context": {
        "expires_at": "2025-01-20T14:45:00Z",
        "risk_analysis": {
            "portfolio_impact_percent": 3.89,
            "risk_level": "medium",
            "warnings": []
        }
    }
}

mock_order_filled = {
    "id": "ord-003",
    "symbol": "AAPL",
    "side": "BUY",
    "quantity": 20,
    "status": "filled",
    "fill_price": 182.48,
    "filled_quantity": 20,
}

# Empty state
mock_empty_orders = []

# Error state
mock_broker_error = {"status": 500, "message": "Broker connection refused"}
```
