# Trading Core

## Overview

Trading Core is the command center for order execution and portfolio monitoring. It provides a trading-focused dashboard showing real-time portfolio health and pending actions, a tab-based orders screen for managing the full order lifecycle (entry, approval, tracking, history), and the order entry form rendered inside the shell's global slide-over panel.

## Screens

1. **Dashboard** (`/`) — Portfolio stats, pending approvals, recent fills
2. **Orders** (`/orders`) — 3-tab screen: Pending Approval, Open Orders, Order History
3. **Order Entry** (shell slide-over) — New order form (rendered inside the 480px right panel)
4. **Approval Card** (`/orders/pending/{id}`) — Review and approve/reject pending orders

## User Flows

- View dashboard with portfolio value, day P&L, cash available, pending approvals count, open orders, and recent fills
- Create a new order via the shell's slide-over panel: select BUY/SELL, search instrument, select order type, enter quantity/price, review risk summary, submit
- Approve a pending order: review order details, risk analysis, market context, and AI reasoning — approve, reject (with optional reason), or close
- Monitor open orders with real-time status updates, cancel or amend active orders
- Create a bracket order (Advanced tab): set stop-loss and/or take-profit prices — child legs operate as OCO
- Review order history filtered by date, instrument, or status
- Handle approval timeout: pending approvals show 15-minute countdown, auto-rejected on expiry

## Design Decisions

- Dashboard does NOT include positions table or equity curve — those belong in Portfolio & Positions
- Order entry form is content-only rendered inside the shell's slide-over panel — it never renders its own panel chrome
- Real-time value changes flash green/red for 300ms
- Bracket orders display as collapsible group rows with indented child legs

## Data Used

**Entities:** `Order`, `OrderEvent`, `Trade`, `Portfolio`, `Instrument`, `Broker`, `Recommendation`, `RecentActivity`, `DashboardStats`, `RiskAnalysis`

**From data model:** All core trading entities

## Visual References

See screenshots in this folder:
- `dashboard-light.png` / `dashboard-dark.png` — Trading dashboard
- `orders-light.png` / `orders-dark.png` — Orders screen with tabs
- `neworder-light.png` / `neworder-dark.png` — Order entry form
- `approval-light.png` / `approval-dark.png` — Approval card

## Components Provided (Visual Reference Only)

These React components show the target design. Rebuild them in NiceGui Python:

- `TradingDashboard` — Main dashboard with stat cards and activity feed
- `OrdersScreen` — Tabbed orders management (Pending, Open, History)
- `NewOrderForm` — Order entry form (BUY/SELL toggle, instrument search, order types, bracket)
- `ApprovalCard` — Order approval review card
- `OrderStatusBadge` — Status badge with 12 states and semantic colors
- `StatCard` — Reusable stat card (icon, label, monospace value, change indicator)

## Callback Reference

| Action | Description |
|--------|-------------|
| Review approval | Navigate to approval card for a pending order |
| Create order | Open shell's order panel |
| View orders | Navigate to orders screen |
| Approve order | Submit approval, show success toast |
| Reject order | Submit rejection with optional reason, show info toast |
| Amend order | Open order panel pre-filled with existing order values |
| Cancel order | Cancel open order, show confirmation |
| Connect broker | Navigate to Settings > Broker Gateways |

## NiceGui Implementation Notes

```python
# Stat card pattern
def stat_card(label: str, value: str, icon: str, change: str = None, positive: bool = True):
    with ui.card().classes('flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4'):
        with ui.row().classes('items-center gap-2 mb-2'):
            ui.icon(icon).classes('text-pink-400 text-[18px]')
            ui.label(label).classes('text-zinc-400 text-sm')
        ui.label(value).classes('text-2xl font-mono font-bold text-zinc-50')
        if change:
            color = 'text-emerald-400' if positive else 'text-red-400'
            ui.label(change).classes(f'text-xs font-mono {color} mt-1')

# Order status badge
STATUS_COLORS = {
    'pending_approval': 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    'filled': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    'rejected': 'bg-red-500/10 text-red-400 border border-red-500/30',
    'cancelled': 'bg-zinc-800 text-zinc-500',
    # ... etc.
}

def order_status_badge(status: str):
    classes = STATUS_COLORS.get(status, 'bg-zinc-800 text-zinc-400')
    ui.label(status.replace('_', ' ').upper()).classes(
        f'{classes} text-xs font-medium px-2 py-0.5 rounded-full'
    )
```
