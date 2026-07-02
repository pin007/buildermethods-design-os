# Milestone 2: Trading Core

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications with user flows, requirements, and screenshots

**What you need to build:**
- Backend implementation with API endpoints and data layer
- Integration of provided React components with real data

**Critical guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist
- The components are props-based — focus on backend and data layer

---

## Goal

Implement the Trading Core — the command center for order execution and portfolio monitoring. This includes the dashboard, orders management, order entry form, and approval workflow.

## Overview

Trading Core provides a trading-focused dashboard showing real-time portfolio health and pending actions, a tab-based orders screen for managing the full order lifecycle (entry, approval, tracking, history), and the order entry form rendered inside the shell's global slide-over panel.

**Key Functionality:**
- Real-time portfolio dashboard (value, day P&L, cash, pending approvals)
- Three-tab orders management (Pending Approval, Open Orders, Order History)
- Order entry form with Market/Limit/Stop/Advanced order types and bracket orders
- Order approval workflow with risk analysis and 15-minute countdown timer
- Full 12-state order lifecycle with color-coded status badges
- Event sourcing timeline for complete order audit trail

## Recommended Approach: Test-Driven Development

Before implementing, write tests first based on the test specifications.

See `product-plan/sections/trading-core/tests.md` for detailed test-writing instructions.

## What to Implement

### Screen 1: Dashboard (`/`)

Stat cards in a 5-column responsive grid (5 desktop, 3 tablet, 1 mobile):
- Portfolio Value (monospace, icon: `trending-up`)
- Day P&L (green if positive, red if negative, monospace)
- Cash Available (monospace)
- Pending Approvals (with count badge, links to Orders tab)
- Open Orders (count)

Recent fills/activity list (last 5 events):
- Each row: symbol (monospace), side badge (BUY=emerald, SELL=red), amount, timestamp (relative)
- Click row navigates to order detail

Empty state (no broker connected): icon + "Welcome to Trading Squad! Connect your broker to get started." + "Connect Broker" CTA

Real-time updates: portfolio value and P&L flash green/red on change (300ms animation)

Loading states: skeleton screens (not spinners)

### Screen 2: Orders (`/orders`)

Three-tab interface: Pending Approval | Open Orders | Order History

**Pending Approval tab:**
- Sortable table: instrument (symbol + name), side badge, order type, quantity (monospace), limit price (monospace), risk % (color-coded: green<1%, yellow 1-5%, red>5%), time remaining (countdown, red+pulse <5min), actions
- Click row to open Approval Card
- Empty state: "No pending approvals. All clear!" + "View All Orders" link

**Open Orders tab:**
- Sortable live-updating table: order ID (monospace), instrument, side badge, type, quantity (monospace), price (monospace), status badge, broker badge (IB=blue, Binance=amber), TIF, created (monospace)
- Row actions: Cancel button, Amend button (opens order panel pre-filled)
- Bracket orders: collapsible group row — parent on top, child legs indented with connector line
- Empty state: "No open orders." + "Create Order" CTA

**Order History tab:**
- Filterable table: date range picker, instrument search, status filter dropdown
- Same columns as open orders + fill price column
- Expandable rows: event sourcing timeline (status badges + timestamps + messages)
- Pagination: 50 rows per page

**All tabs:**
- Default sort: Created descending
- All columns sortable (click header, sort indicator arrows)
- Column: broker badge (IB in blue `bg-blue-500/10 text-blue-400`, Binance in amber `bg-amber-500/10 text-amber-400`)

### Screen 3: Order Entry Form (inside shell's slide-over panel)

Render form content inside the 480px right panel. The panel chrome (header, minimize, close) is provided by the shell.

**BUY/SELL Toggle:** Large buttons — BUY in emerald, SELL in red. Default: BUY.

**Instrument search:** Autocomplete input with debounce (300ms). Shows company name + ticker in dropdown. After selection: show symbol preview card with current price and day change.

**Order type selector:** Tab-based (Market | Limit | Stop | Advanced)
- Market: quantity only
- Limit: quantity + limit price (pre-filled with current price)
- Stop: quantity + stop price
- Advanced: all fields + time-in-force selector (DAY/GTC/GTD/IOC/FOK) + bracket order toggle

**Bracket order (Advanced tab only):**
- "Attach Bracket" toggle
- Stop-loss price input (optional)
- Take-profit price input (optional)
- When both set: OCO behavior (when one fills, other cancels)

**Real-time order summary (always visible):**
- Estimated total (monospace)
- Commission (monospace)
- Portfolio impact % (green<1%, yellow 1-5%, red>5%)
- Risk level badge (Low/Medium/High)
- Available balance after order (monospace)
- Pre-trade warnings (wash sale, tax implications)

**Inline validation:** red border + error message on invalid fields, validate on blur.

**Submit:** Creates order; if risk >= 1% → status becomes `pending_approval` + warning toast; if risk < 1% → auto-approved → success toast.

### Screen 4: Approval Card (`/orders/pending/{id}`)

Centered card layout (max-width 800px), 4 sections:

1. **Order Details:** instrument (symbol + company name), BUY/SELL badge, quantity, limit price, estimated total
2. **Risk Analysis:** portfolio impact % (red if >5%), position size %, cash balance impact, warnings list
3. **Market Context:** current price, day change (green/red), 52-week range, recent volatility
4. **AI Recommendation** (if order from recommendation): confidence score (circular badge), reasoning text, target prices (entry/profit/stop)

**Actions:** Approve button (emerald, full-width on mobile) + Reject button (red, with optional reason textarea)

**Countdown timer:** 15-minute countdown from `approvalContext.expiresAt` — red + pulse animation when <5min; auto-reject on expiry with error toast.

### Order Status Badges (12 states)

| Status | Label | Tailwind Classes |
|--------|-------|-----------------|
| `draft` | DRAFT | `bg-zinc-800 text-zinc-400` |
| `pending_approval` | PENDING APPROVAL | `bg-amber-500/10 text-amber-400 border border-amber-500/30` |
| `approved` | APPROVED | `bg-blue-500/10 text-blue-400 border border-blue-500/30` |
| `submitted` | SUBMITTED | `bg-blue-500/10 text-blue-400` |
| `acknowledged` | ACKNOWLEDGED | `bg-blue-500/10 text-blue-400` |
| `partially_filled` | PARTIALLY FILLED | `bg-teal-500/10 text-teal-400 border border-teal-500/30` |
| `filled` | FILLED | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/30` |
| `cancelled` | CANCELLED | `bg-zinc-800 text-zinc-500` |
| `rejected` | REJECTED | `bg-red-500/10 text-red-400 border border-red-500/30` |
| `expired` | EXPIRED | `bg-zinc-800 text-zinc-500` |
| `amended` | AMENDED | `bg-blue-500/10 text-blue-400` |
| `failed` | FAILED | `bg-red-500/10 text-red-400 border border-red-500/30` |

## Files to Reference

- `product-plan/sections/trading-core/README.md` — Feature overview and design intent
- `product-plan/sections/trading-core/tests.md` — Test-writing instructions
- `product-plan/sections/trading-core/sample-data.json` — Sample data
- `product-plan/sections/trading-core/dashboard-light.png` — Dashboard visual reference
- `product-plan/sections/trading-core/orders-light.png` — Orders screen visual reference
- `product-plan/sections/trading-core/neworder-light.png` — Order entry visual reference
- `product-plan/sections/trading-core/approval-light.png` — Approval card visual reference

## Expected User Flows

### Flow 1: Create and Submit an Order

1. User clicks "Create Order" or Cmd+K → "New Order"
2. Shell opens the 480px slide-over order panel from the right
3. User selects BUY, searches for "AAPL", selects Apple Inc.
4. Symbol preview shows current price $185.50, +$2.30 (+1.26%)
5. User selects "Limit" tab, enters quantity 10, limit price 184.00
6. Order summary updates: Estimated total $1,840.00, Portfolio impact 3.89% (amber)
7. User clicks "Submit Order"
8. **Outcome:** If risk >= 1%: order status `pending_approval`, warning toast "Order pending approval — requires review"; if risk < 1%: `approved` → `submitted`, success toast "Order submitted to IB"

### Flow 2: Review and Approve a Pending Order

1. Dashboard shows "2 Pending Approvals" card with pink badge
2. User clicks the card to navigate to Orders screen, Pending Approval tab
3. User sees AAPL BUY 10 with Risk 3.89% (amber), countdown timer 14:23 remaining
4. User clicks the row to open the Approval Card
5. Card shows: Order Details, Risk Analysis (3.89% portfolio impact), Market Context (AAPL $185.50), AI Recommendation (82% confidence, reasoning)
6. User clicks green "Approve" button
7. **Outcome:** Toast "Order approved and submitted to broker", order moves to Open Orders tab with status `submitted`

### Flow 3: View Order History with Event Timeline

1. User navigates to Orders → Order History tab
2. User sees AAPL BUY 20 FILLED at $182.48 in the table
3. User clicks the row to expand it
4. Event timeline shows: DRAFT → APPROVED (auto, risk 0.77%) → SUBMITTED → ACKNOWLEDGED → FILLED at $182.48
5. **Outcome:** Full audit trail visible with timestamps for every state transition

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Dashboard renders with real portfolio data and stat cards
- [ ] Dashboard real-time value changes flash green/red (300ms)
- [ ] Orders screen has working 3-tab interface
- [ ] All 12 order status badges render with correct colors
- [ ] Pending Approval tab shows countdown timers
- [ ] Order entry form submits and creates orders
- [ ] Bracket order toggle shows/hides stop-loss and take-profit fields
- [ ] Risk < 1% auto-approves; risk >= 1% goes to pending_approval
- [ ] Approval card shows all 4 sections with real data
- [ ] Approve/reject actions work and show toasts
- [ ] Order history tab filterable and shows event timeline on expand
- [ ] Amend order pre-fills the order panel
- [ ] Empty states display properly
- [ ] Matches the visual design (check screenshots)
- [ ] Responsive on mobile
