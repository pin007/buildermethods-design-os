# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture (e.g., Python dataclasses or Pydantic models).

## Entities

- **User** — Authenticated person with a role (Trader, Assistant, Viewer) (used in: shell, settings-and-operations)
- **Portfolio** — Named collection of positions and cash across brokers (used in: portfolio-and-positions, trading-core)
- **Broker** — Connected trading platform (Interactive Brokers, Binance) (used in: settings-and-operations, portfolio-and-positions)
- **Instrument** — Tradable asset with canonical symbol (used in: trading-core, market-data, portfolio-and-positions)
- **Position** — Ownership of an instrument in a portfolio at a broker (used in: portfolio-and-positions, trading-core)
- **CashBalance** — Available cash per portfolio/broker/currency (used in: portfolio-and-positions)
- **Order** / **OrderEvent** — Event-sourced order and its lifecycle audit trail (used in: trading-core)
- **Trade** — Immutable execution record (used in: trading-core, trade-journal)
- **CostLot** / **LotMatch** — FIFO cost basis and sale matching for Czech tax (used in: portfolio-and-positions)
- **Recommendation** — AI trade suggestion with provenance metadata for explainable-AI display (used in: market-intelligence, trading-core)
- **Strategy** / **Backtest** — Strategy config and historical simulation (used in: strategy-engine)
- **MarketData** — OHLCV time-series candles (used in: market-data)
- **Watchlist** — Monitored instrument list (used in: portfolio-and-positions, market-intelligence)
- **JournalEntry** — Post-trade reflection with process scores (used in: trade-journal)
- **Dividend** / **ExchangeRate** — Income events and CNB rates for CZK tax (used in: portfolio-and-positions)
- **Alert** — Notification with routing/silencing/inhibition (used in: alerts)
- **CalendarEvent** — Scheduled market event (earnings, releases, expirations) (used in: trading-calendar)
- **ReconciliationLog** — Daily broker-to-database reconciliation (used in: settings-and-operations)

See `product/data-shape/data-shape.md` in the design source for full entity descriptions and relationships.

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions (data shapes **and** component Props):

- `sections/trading-core/types.ts`
- `sections/portfolio-and-positions/types.ts`
- `sections/market-data/types.ts`
- `sections/market-intelligence/types.ts`
- `sections/strategy-engine/types.ts`
- `sections/trade-journal/types.ts`
- `sections/settings-and-operations/types.ts`
- `sections/alerts/types.ts`
- `sections/trading-calendar/types.ts`

## Combined Reference

See `overview.ts` for the core entity types aggregated in one file (enums, unions, and the shared trading/portfolio/tax entities). The Props interfaces stay in each section's own `types.ts`.
