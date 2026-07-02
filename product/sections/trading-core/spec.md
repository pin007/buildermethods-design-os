# Trading Core Specification

## Overview
Trading Core is the command center for order execution and portfolio monitoring. It provides a trading-focused dashboard showing real-time portfolio health and pending actions, a tab-based orders screen for managing the full order lifecycle (entry, approval, tracking, history), and the order entry form rendered inside the shell's global slide-over panel.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Trading Core MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Breadcrumbs
All screens render breadcrumbs via the shell's `breadcrumb` prop. Breadcrumb paths use Home icon for root, clickable parents, current page in zinc-500 (non-clickable):
- Dashboard: `Home > Dashboard`
- Orders — Pending Approval tab: `Home > Orders > Pending Approval`
- Orders — Open Orders tab: `Home > Orders > Open Orders`
- Orders — Order History tab: `Home > Orders > Order History`
- Order Detail: `Home > Orders > {Active Tab} > {Order ID}`
- Approval Review: `Home > Orders > Pending Approval > Review #{Order ID}`

### Order Panel (Slide-Over)
The New Order form renders as **content only** inside the shell's `OrderPanel` component (via `AppShell.orderPanelContent` prop). The section MUST NOT render its own:
- Panel container, backdrop, or overlay
- Header bar (icon, title, minimize/close buttons)
- Minimize-to-64px-tab behavior
- Slide-in/out animation

All of the above are provided by the shell's `OrderPanel` (see shell spec § Order Panel). The section renders only: BUY/SELL toggle, instrument search, order type tabs, form fields, validation, order summary, and submit button.

### Toast Notifications
All user-facing notifications use the shell's toast API (`toastRef.current()`). No inline notification rendering within section components. Toast variants:
- Order submitted: success (green, 4s)
- Order pending approval: warning (yellow, 5s)
- Order approved: success (green, 4s)
- Order rejected: info (blue, 4s)
- Submission error: error (red, 6s)

### System Banners
Pending approval alerts use the shell's `SystemBanner` component (yellow variant with "Review" link). The section does NOT render its own persistent approval banners — those come from the shell.

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, side panels
- Tablet (768px–1023px): Condensed layouts, collapsible sections
- Mobile (<768px): Single-column, full-width overlays, stacked cards

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

## User Flows
- View dashboard with portfolio value, day P&L, cash available, pending approvals count, open orders, and recent fills
- Create a new order via shell's slide-over panel (contextual buttons, command palette "New Order" action, or Cmd+N): select action (BUY/SELL), search instrument, view symbol preview, select order type, enter quantity/price, review risk and order summary, submit
- Approve a recommendation: open approval card from pending orders or dashboard banner — review order details, risk analysis, market context, and AI reasoning — approve, reject (with optional reason), or modify parameters
- Monitor open orders with real-time status updates, cancel or amend active orders (quantity, limit price, stop price, time-in-force)
- Amend an open order: click "Amend" to open the order panel pre-filled with current values, modify fields, and submit the amendment
- Create a bracket order: select the Advanced tab, enable "Attach Bracket", set stop-loss and/or take-profit prices. Child legs are submitted alongside the parent order. OCO behavior: when one child leg fills, the other is automatically cancelled
- Cancel a bracket order group: cancelling the parent order cancels all child legs. Individual child legs can also be cancelled or amended independently
- Review order history filtered by date, instrument, or status — click to see summary with collapsible event timeline (CREATED, APPROVED, SUBMITTED, ACKNOWLEDGED, FILLED)
- Handle approval timeout: pending approvals show a 15-minute countdown timer, auto-rejected on expiry with notification

## UI Requirements

### Dashboard
- Stat cards follow standard anatomy: semantic icon, label (secondary text), large monospace value (h2), change indicator with semantic coloring
- Cards: portfolio value, day P&L, cash available, pending approvals (with count badge linking to Orders), open orders summary
- Recent fills/activity list (last 5 events)
- Dashboard does NOT include positions table or equity curve (those belong in Portfolio & Positions — intentional deviation from UX reference docs)
- Real-time value changes flash green (increase) or red (decrease) for 300ms, then fade back
- Loading states use skeleton screens (not spinners) for all data-dependent components
- Empty state (no broker connected): icon, "Welcome to Trading Squad! Connect your broker to get started.", "Connect Broker" CTA

### Orders Screen
- 3 tabs: Pending Approval, Open Orders, Order History
- Pending Approval tab: sortable table of orders awaiting approval with instrument, side, quantity, risk %, time remaining — click opens approval card
- Pending Approval empty state: icon, "No pending approvals. All clear!", "View All Orders" link
- Open Orders tab: live-updating sortable table with cancel and amend actions per order
- Order History tab: completed/cancelled/rejected/expired orders with date range, instrument, and status filters. Pagination at 50 rows per page
- Orders empty state: icon, "No orders found. Your order history will appear here.", "Create Order" CTA
- Order table columns: order ID, instrument, side (BUY/SELL color-coded), type, quantity, price, status badge, broker (IB/Binance badge), time-in-force, created timestamp
- Pending Approval tab adds two extra columns: Risk % (color-coded: green < 1%, yellow 1–5%, red > 5%) and Time Remaining (countdown from expiresAt, red + pulse when < 5 min)
- All table columns are sortable (click header to toggle asc/desc) with sort indicator arrows. Default sort: Created descending
- Order status states (12 states with color-coded badges):
  - DRAFT (gray) — order created but not yet submitted
  - PENDING_APPROVAL (yellow) — awaiting human approval
  - APPROVED (blue) — approved, ready for submission
  - SUBMITTED (blue) — sent to broker
  - ACKNOWLEDGED (blue) — broker confirmed receipt
  - PARTIALLY_FILLED (teal) — some quantity executed
  - FILLED (green) — fully executed
  - CANCELLED (gray) — cancelled by user
  - REJECTED (red) — rejected by approver or broker
  - EXPIRED (gray) — time-in-force expired or approval timed out
  - AMENDED (blue) — order modified (quantity, price, or TIF)
  - FAILED (red) — broker execution error
- Bracket orders display as a collapsible group row: parent order on top, child legs (stop-loss, take-profit) indented below with a visual connector line. Group status derived from parent status
- Order detail: summary view (status, fill price, quantity, commission, broker) with collapsible event sourcing timeline showing all state transitions with timestamps
- Amend order: clicking "Amend" on an open order opens the shell's Order Panel pre-filled with current order values (instrument, side, type, quantity, price, TIF). User modifies fields and submits as an amendment. For bracket orders, individual legs can be amended separately
- Real-time updates: order status, fill notifications, and P&L values update live via WebSocket
- Broker indicator on each order showing routing destination (IB or Binance)

### New Order Form (Content Only — Rendered Inside Shell's OrderPanel)
- BUY/SELL toggle: large buttons with semantic colors (green=BUY, red=SELL), default BUY
- Instrument search: autocomplete input (debounced 300ms), shows company name + ticker in dropdown
- Symbol preview card: after selection, display current price and day change
- Order type selector: tab-based interface for Market, Limit, Stop, and Advanced orders. Tab selection dynamically shows/hides relevant form fields
- Advanced tab: provides time-in-force selector (DAY/GTC/GTD/IOC/FOK — default DAY) and bracket order fields alongside standard order fields
- Bracket order entry (under Advanced tab): toggle "Attach Bracket" to reveal stop-loss price and take-profit price fields. Both are optional — user can set one or both. When both are set, the child legs operate as OCO (One-Cancels-Other): when stop-loss fills, take-profit is automatically cancelled, and vice versa. Bracket fields are only available for Limit and Market order types
- Quantity input (number, min=1), limit/stop price fields (conditional on order type, pre-filled with current price for limit orders)
- Inline validation: red border + error message on invalid fields, validate on blur
- Real-time order summary section (within the form):
  - Estimated total
  - Commission
  - Portfolio impact % (color-coded: green < 1%, yellow 1-5%, red > 5%)
  - Risk level badge (Low/Medium/High)
  - Available balance after order
  - Pre-trade warnings for potential wash sales or tax implications (e.g., selling before 3-year Czech tax exemption)
- Order form pre-fills symbol when launched from position context. Defaults: BUY action, DAY time-in-force, current market price for limit orders
- Closing the panel (handled by shell) prompts confirmation if form has unsaved changes. Form communicates dirty state to shell via `onDirtyChange` callback
- Mobile: panel becomes full-width overlay (handled by shell's responsive behavior)
- Accessibility: focus trap managed by shell's OrderPanel. Form manages its own field tab order and ARIA labels
- Notifications on submit use shell's toast API

### Approval Card
- Centered approval card layout, max-width 800px — all context visible on one screen (no scrolling on desktop)
- Structured into 4 sections:
  1. **Order Details:** instrument (symbol + company name), action (BUY/SELL badge), quantity, limit price (if applicable), estimated total
  2. **Risk Analysis:** portfolio impact % (highlighted red if >5%), position size % (concentration risk), cash balance impact, position limits
  3. **Market Context:** current price, day change, 52-week range, recent volatility
  4. **AI Recommendation** (if order originated from recommendation): confidence score, reasoning, target prices
- Approve button (green, success variant) / Reject button (red, danger variant) — large, full-width on mobile
- Optional rejection reason: collapsible text area field
- 15-minute countdown timer, auto-rejected on expiry
- Loading state during submission (button loading state + disabled form)
- Notifications use shell's toast API: "Order approved and submitted to broker" (green) or "Order rejected" (gray)

## Configuration
- shell: true
