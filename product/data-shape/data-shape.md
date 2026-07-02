# Data Shape

## Entities

### User
An authenticated person who interacts with the platform. Has a role (Trader, Assistant, Viewer) that determines access level. Trader has full access, Assistant can read and perform emergency closures, Viewer is read-only.

### Portfolio
A named collection of positions and cash balances owned by a user. A user may have multiple portfolios (e.g., "Long-Term Holdings", "Active Trading", "Crypto"). Each portfolio aggregates assets across multiple brokers.

### Broker
A connected trading platform such as Interactive Brokers or Binance. Stores encrypted API credentials and connection status. Brokers are the source of truth for live positions and cash.

### Instrument
A tradable asset identified by a canonical symbol. Covers stocks, options, crypto, forex, and futures. Includes the human-readable ticker, full name, exchange, and base currency.

### Position
Ownership of a specific instrument within a portfolio, held at a specific broker. Tracks quantity, cost basis, and acquisition date. Status is either Open or Closed. The acquisition date is critical for the 3-year Czech tax exemption.

### CashBalance
Available cash within a portfolio at a specific broker in a specific currency. Updated after trades, dividends, and deposits/withdrawals.

### Order
A request to buy or sell an instrument. Supports market, limit, stop-loss, bracket, and trailing stop types. Lifecycle is fully event-sourced — every state change is recorded as an OrderEvent for complete auditability.

### OrderEvent
An immutable record of a single state change in an order's lifecycle (created, submitted, partial fill, filled, completed, cancelled, rejected, amended). Contains a JSON payload with event-specific data. Forms the audit trail for compliance.

### Trade
An immutable record of an executed transaction. Created when an order fills (partially or fully). Contains price, quantity, commission, and all data needed for tax reporting. Links back to its originating order and the resulting position.

### CostLot
A FIFO cost basis lot created by a purchase trade. Tracks original and remaining quantity, per-unit cost in both original currency and CZK (using the CNB exchange rate on purchase date). Used to calculate realized gains when shares are sold.

### LotMatch
An audit record linking a sale trade to one or more cost lots consumed by that sale (FIFO order). Records the matched quantity, proceeds in CZK, cost basis in CZK, realized gain/loss, holding period in days, and whether the 3-year tax exemption applies.

### Recommendation
An AI-generated trade suggestion produced by a strategy or the market analyst. Includes the proposed action, quantity, confidence score, risk score, and transparent reasoning. Status progresses from pending approval through approved/rejected to executed or expired.

### Strategy
A trading strategy configuration defining entry/exit rules, indicators, position sizing, and risk parameters. Strategies are named, typed (trend following, mean reversion, etc.), and can be activated or deactivated without restart.

### Backtest
A historical simulation of a strategy over a date range, producing performance metrics (return, drawdown, Sharpe, win rate) and an equity curve. Supports walk-forward optimization where the strategy is tuned on in-sample data and validated on out-of-sample periods.

### MarketData
OHLCV (open, high, low, close, volume) time series candles for an instrument. Stored in a time series database with multiple timeframes (1min, 5min, 15min, 1hour, 1day) and data sources (IB, Binance, Yahoo, Finnhub).

### Watchlist
A named list of instruments a user is monitoring for potential entry. Users can have multiple watchlists (e.g., "Tech Stocks", "Earnings This Week"). Items can include short notes and optional price alerts. Watchlists feed into the market analyst for focused analysis.

### JournalEntry
A post-trade reflection attached to a completed trade. Captures pre-trade setup (thesis, entry criteria, risk/reward, emotional state) and post-trade review (what worked, lessons learned). Includes process scores for discipline, emotional management, risk management, entry quality, and exit quality.

### Dividend
A taxable income event from a held position. Records gross amount, withholding tax, ex-date, pay-date, and the CNB exchange rate conversion to CZK. Subject to the same 10-year retention and tax reporting requirements as realized trade gains. Tracks DRIP reinvestment shares separately for accurate cost basis.

### ExchangeRate
A daily CNB (Czech National Bank) exchange rate for converting foreign currencies to CZK. Fetched daily and stored historically. Used by CostLot, LotMatch, and Dividend for tax calculations.

### Alert
A notification triggered by price levels, risk thresholds, system events, or margin warnings. Delivered through multiple channels (in-app, push, email, Slack, Discord). Includes severity level and acknowledgment status. Alerts can be routed, silenced, or inhibited by grouping rules.

### CalendarEvent
A scheduled market event that may affect holdings or trading decisions — earnings announcements, economic releases (FOMC, NFP, CPI, GDP), dividend ex-dates and pay-dates, options expirations, and upcoming IPOs. Each event has a category, an impact level, a scheduled date, and optional links to the instruments or positions it affects.

### ReconciliationLog
A record of daily broker-to-database position and cash reconciliation. Tracks whether reconciliation succeeded or found discrepancies, with details of any mismatches and their resolution status.

## Relationships

- User has many Portfolios
- Portfolio contains many Positions
- Portfolio contains many CashBalances
- Position belongs to a Portfolio, a Broker, and an Instrument
- Position generates many Trades
- Position receives many Dividends
- CashBalance belongs to a Portfolio and a Broker
- Order belongs to a Portfolio and targets an Instrument
- Order logs many OrderEvents
- Order produces one or more Trades
- Trade belongs to an Order and a Position
- Trade creates a CostLot (for purchases)
- CostLot is consumed by many LotMatches (for sales, FIFO order)
- LotMatch links a sale Trade to a CostLot
- Strategy generates many Recommendations
- Strategy has many Backtests
- Recommendation targets an Instrument within a Portfolio
- Recommendation may become an Order (when approved or auto-executed)
- User has many Watchlists
- Watchlist contains many Instruments
- JournalEntry belongs to a Trade
- Dividend belongs to a Position and uses an ExchangeRate for CZK conversion
- CostLot uses an ExchangeRate for CZK conversion
- LotMatch uses an ExchangeRate for CZK conversion
- CalendarEvent relates to one or more Instruments (and, through them, affected Positions)
- Alert may reference a CalendarEvent, Position, Order, or Broker as its source
- ReconciliationLog belongs to a Broker

**Key tax chain:** Trade/Dividend --> CostLot --> LotMatch --> ExchangeRate --> CZK tax report (all with 10-year data retention)
