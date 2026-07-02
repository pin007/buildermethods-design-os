# Market Data

## Overview

The operational control center for the platform's data pipeline. Provides health overview of connected data sources (Yahoo Finance, Interactive Brokers, Finnhub, Binance), manages instrument subscriptions, triggers backfills and force-refreshes, monitors data quality metrics, and reviews corporate actions audit log.

## Screens

1. **Overview** (`/market-data`) — Pipeline stats, 4 source cards, recent corporate actions, recent quality alerts
2. **Source Detail** (`/market-data/sources/{id}`) — Instruments, Fetch History, Quality tabs per source
3. **Corporate Actions** (`/market-data/corporate-actions`) — Full corporate actions audit log
4. **Data Quality** (`/market-data/quality`) — All quality alerts across all sources

## User Flows

- View pipeline health: stat cards, 4 data source cards with connection status
- Drill into a data source: instruments table, fetch history timeline, quality metrics
- Add/remove instrument subscriptions with interval selection
- Trigger backfills with date range, interval, and priority
- Force-refresh individual instruments or entire source
- Retry failed fetch operations
- Review and acknowledge data quality alerts (outliers, gaps, OHLCV invalids)
- Browse and re-trigger corporate action adjustments

## Design Decisions

- Connection status uses semantic dots: green=connected, amber=degraded, red=disconnected
- "Real-time" capability badge for IB and Binance; "Scheduled" for Yahoo and Finnhub
- Freshness colors: fresh=green (< 1h), stale=amber (1-24h), very stale=red (>24h)
- Quality scores: green>95%, yellow 80-95%, red<80%
- Backfill progress shown inline (task ID, progress bar, estimated time remaining)

## Visual References

- `overview-light.png` / `overview-dark.png` — Pipeline health overview
- `sourcedetail-light.png` / `sourcedetail-dark.png` — Source detail with instruments tab
- `corporateactions-light.png` / `corporateactions-dark.png` — Corporate actions log
- `dataquality-light.png` / `dataquality-dark.png` — Data quality monitoring

## Callback Reference

| Action | Description |
|--------|-------------|
| Click source card | Navigate to source detail |
| Add instrument | Open modal, subscribe instrument with selected intervals |
| Remove instrument | Confirm modal, stop fetching (retain data) |
| Backfill | Queue backfill task, show progress |
| Force refresh | Trigger immediate fetch, loading state on row |
| Retry failed fetch | Re-attempt failed fetch operation |
| Acknowledge quality alert | Mark warning as reviewed |
| Re-adjust corporate action | Trigger recalculation of price adjustments |

## Toast Variants

```python
ui.notify('Backfill triggered', type='info', timeout=4000)
ui.notify('Backfill completed', type='positive', timeout=4000)
ui.notify('Force refresh completed', type='positive', timeout=4000)
ui.notify('Instrument subscription added', type='positive', timeout=4000)
ui.notify('Instrument subscription removed', type='positive', timeout=4000)
ui.notify('Fetch retry triggered', type='info', timeout=4000)
ui.notify('Fetch failed: <error message>', type='negative', timeout=6000)
ui.notify('Corporate action re-triggered', type='info', timeout=4000)
```
