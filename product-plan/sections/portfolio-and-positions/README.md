# Portfolio & Positions

## Overview

Consolidated view of all investment portfolios and their underlying holdings. Aggregated overview screen showing total net worth, combined equity curve, and allocation across all portfolios, with a portfolio list to drill into. The detail screen shows summary stats, equity curve, and tab-based navigation into Positions, Watchlists, Dividends, and Performance.

## Screens

1. **Portfolio Overview** (`/portfolios`) — Aggregated stats, combined equity curve, allocation chart, portfolio list
2. **Portfolio Detail** (`/portfolios/{id}`) — Per-portfolio stats, equity curve, 4-tab interface

## User Flows

- View aggregated portfolio overview: total net worth, combined equity curve, allocation chart, portfolio list
- Drill into portfolio positions: sortable table with real-time prices, P&L, tax status, FIFO lot detail
- Manage watchlists: create/rename/delete, add instruments with notes, set price alerts
- Track dividend income: income summaries, history with CZK amounts, upcoming ex-dates
- Compare performance against benchmarks with attribution analysis
- Monitor margin and buying power with alert thresholds
- Quick-trade from positions via the shell's order panel

## Design Decisions

- Tax-Exempt badge for positions >= 3 years held (Czech Republic 3-year exemption rule)
- FIFO lots expanded inline on row click (no separate page)
- Trade/Close buttons delegate to shell's order panel — section never renders its own order UI
- Allocation chart has 3 view modes: By Asset, By Broker, By Portfolio
- Real-time price updates flash green/red for 300ms on change
- DividendsTab shows both USD and CZK amounts (CNB exchange rate integration)

## Data Used

**Entities:** `Portfolio`, `DashboardStats`, `Position`, `FifoLot`, `Watchlist`, `WatchlistItem`, `DividendRecord`, `PerformanceData`

## Visual References

- `overview-light.png` / `overview-dark.png` — Portfolio overview screen
- `detail-light.png` / `detail-dark.png` — Portfolio detail with positions tab

## Callback Reference

| Action | Description |
|--------|-------------|
| Trade position | Open shell order panel pre-filled BUY for the position instrument |
| Close position | Open shell order panel pre-filled SELL for full quantity |
| Create watchlist | Show form/modal for new watchlist name |
| Add to watchlist | Add instrument search result to selected watchlist |
| Remove from watchlist | Confirm then remove instrument from watchlist |
| Set price alert | Inline form for upper/lower trigger prices |

## NiceGui Implementation Notes

```python
# Portfolio list table row
def portfolio_row(portfolio: dict, on_click):
    with ui.row().classes('items-center w-full p-3 hover:bg-zinc-800/50 cursor-pointer rounded').on('click', on_click):
        ui.label(portfolio['name']).classes('flex-1 text-zinc-100 text-sm font-medium')
        ui.label(f"${portfolio['total_value']:,.2f}").classes('text-zinc-100 font-mono text-sm w-32 text-right')
        pnl = portfolio['day_pnl']
        color = 'text-emerald-400' if pnl >= 0 else 'text-red-400'
        ui.label(f"{'+'if pnl>=0 else ''}{pnl:,.2f}").classes(f'font-mono text-sm {color} w-28 text-right')

# Tax status badge
def tax_status_badge(days_held: int):
    if days_held >= 1095:  # 3 years = ~1095 days
        ui.label('Tax-Exempt').classes('bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full')
    else:
        days_remaining = 1095 - days_held
        ui.label('Taxable').classes('bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded-full') \
            .tooltip(f'{days_remaining} days until tax exemption')
```
