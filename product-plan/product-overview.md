# Trading Squad — Product Overview

## Summary

An AI-powered algorithmic trading platform for personal trading across stocks, options, and cryptocurrencies. It combines rule-based trading strategies with AI-enhanced market analysis to execute systematic, auditable trades while maintaining strict risk controls and Czech Republic tax compliance.

## Problems & Solutions

- **Fragmented Multi-Broker Trading** — Unified portfolio view aggregating positions across Interactive Brokers and Binance with real-time P&L tracking, multi-asset support, and consolidated performance metrics.
- **Manual Trade Execution** — AI-assisted recommendations with risk-scored automated execution and human approval for high-impact trades, ensuring speed without sacrificing oversight.
- **Complex Tax Compliance (Czech Republic)** — Built-in FIFO cost basis tracking, CNB exchange rate integration, 3-year holding period exemption monitoring, and automated tax report generation with 10-year audit trails.
- **Lack of Trading Discipline** — Post-trade journaling with behavioral pattern detection to identify good and bad habits, process scoring, and rolling 30-day trend analysis.
- **No Systematic Risk Management** — Pre-trade risk validation, position limits, circuit breakers, daily loss limits, and real-time exposure monitoring prevent costly mistakes before they happen.

## Key Features

- Multi-broker portfolio management (Interactive Brokers + Binance)
- AI market analysis with transparent reasoning and confidence scores
- Rule-based and ML-enhanced trading strategies
- Risk-based order approval workflow (auto-execute < 1%, manual approval >= 1%)
- Real-time P&L, exposure monitoring, and alerts
- FIFO cost basis and Czech tax compliance with 10-year audit trail
- Trade journaling with behavioral pattern detection
- Backtesting framework with walk-forward optimization
- Guru/whale activity tracking and signal generation
- Dark-first professional UI with the Obsidian Forge design system

## Planned Sections

1. **Trading Core** — Order entry, order approval workflow, order history, and real-time execution across brokers.
2. **Portfolio & Positions** — Multi-portfolio management, positions table, watchlists, dividends, benchmark comparison, margin/buying power, and tax status.
3. **Market Data** — Pipeline health dashboard, data source overview, instrument subscriptions, data quality monitoring, corporate actions log.
4. **Market Intelligence** — AI-powered market analysis, guru/whale tracking, sentiment analysis, and trade recommendations with transparent reasoning.
5. **Strategy Engine** — Backtesting framework, strategy configuration, walk-forward optimization, and performance analytics.
6. **Trade Journal** — Post-trade journaling, behavioral pattern detection, process scoring, and rolling trend analysis.
7. **Settings & Operations** — Broker gateway management, data pipeline configuration, system health monitoring, user preferences, notifications, appearance, and tax settings.
8. **Alerts** — Centralized alert management, routing, silencing, and inhibition — similar to Prometheus AlertManager.
9. **Trading Calendar** — Calendar aggregating earnings announcements, economic releases (FOMC, NFP, CPI, GDP), dividend ex-dates, options expirations, and upcoming IPOs.

## Data Model

Core entities (see `data-shapes/overview.ts`):
- **Order** — Order lifecycle with 12 status states, bracket support, OCO child legs
- **Instrument** — Tradeable instrument with real-time price data
- **Portfolio** — Portfolio with broker association and dashboard stats
- **Broker** — Connected broker (Interactive Brokers, Binance) with status
- **Recommendation** — AI-generated trade recommendation with reasoning
- **Trade** — Executed trade record for journaling and tax tracking
- **OrderEvent** — Event sourcing for full order lifecycle audit trail

## Design System

**Obsidian Forge** — dark-first professional trading aesthetic:

**Colors:**
- Primary: `pink-600` (#db2777) — buttons, accents, active states
- Secondary: `emerald` — positive indicators, success states
- Neutral: `zinc` — backgrounds (zinc-950), borders (zinc-800), text hierarchy

**Typography:**
- Heading/Body: DM Sans (Google Fonts)
- Monospace (all numeric/trading data): JetBrains Mono

**Key design rules:**
- Background: `zinc-950` (main), `zinc-900` (cards), `zinc-800` (borders)
- Active nav item: `pink-600` left border + `pink-600/10` background + `pink-400` text
- All numeric trading data uses `font-mono`
- Minimum font size: 12px (`text-xs`) — never smaller
- Focus indicators: 2px `pink-600` outline with 4px offset on `focus-visible`

## Implementation Sequence

Build this product milestone by milestone:

1. **Shell** — Design tokens and application shell
2. **Trading Core** — Dashboard, orders management, order entry, approval workflow
3. **Portfolio & Positions** — Portfolio overview, positions, watchlists, dividends, performance
4. **Market Data** — Pipeline health, data sources, quality monitoring, corporate actions
5. **Market Intelligence** — Recommendations, sentiment, guru tracker, research schedule
6. **Strategy Engine** — Strategy library, backtesting, walk-forward optimization, comparison
7. **Trade Journal** — Dashboard, entries, analytics, behavioral patterns, weekly review
8. **Settings & Operations** — All 10 settings categories with full configuration forms
9. **Alerts** — Alert management, silences, routes, inhibition rules
10. **Trading Calendar** — Unified calendar with event types, filters, and portfolio integration

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.
