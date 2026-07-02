# Alerts

## Overview

Centralized alert management and escalation hub following the Prometheus AlertManager mental model. Individual components (broker, market data, risk, strategy, portfolio) trigger alerts; this section handles viewing, acknowledging, routing, silencing, and inhibition.

## Screens

1. **Alerts Dashboard** (`/alerts`) — Single page with 4-tab interface

## User Flows

- View all active alerts grouped by severity (critical first), with source badges and timestamps
- Acknowledge alerts to signal awareness without silencing them
- Silence alerts matching specific label criteria for a time window (e.g., during maintenance)
- View recently resolved alerts (collapsible section)
- Configure alert routes defining how alerts reach the user (email, Slack, push) with grouping rules
- Configure inhibition rules: suppress target alerts when source alerts are firing
- Enable/disable individual routes and inhibition rules
- Create silences with label matchers, duration, and comment explaining why
- Expire active silences early when maintenance is complete

## Design Decisions

- Severity priority: Critical (red) > Warning (amber) > Info (blue) — sorted this way in active list
- Source badges have specific colors: broker=violet, market-data=sky, risk=red, strategy=amber, portfolio=emerald, system=zinc
- Label matchers displayed as small colored pills (e.g., `alertname="BrokerDisconnected"`)
- Acknowledged alerts remain visible but are dimmed with who/when info
- Silences require a comment field explaining why — this is mandatory
- Inhibitions are directional: source alerts inhibit target alerts when both match AND equal labels match

## Visual References

- `dashboard-light.png` / `dashboard-dark.png` — Active Alerts tab view

## Callback Reference

| Action | Description |
|--------|-------------|
| Acknowledge alert | Mark as seen, show who/when, keep in list (dimmed) |
| Silence alert | Open silence form pre-filled with alert's labels |
| Expire silence | Cancel active silence early, alerts resume |
| Create route | Add routing rule to receive notifications |
| Toggle route/inhibition | Enable/disable without deleting |

## Toast Variants (not specified in spec — use reasonable defaults)

```python
ui.notify('Alert acknowledged', type='positive', timeout=4000)
ui.notify('Silence created', type='positive', timeout=4000)
ui.notify('Silence expired', type='info', timeout=4000)
ui.notify('Route saved', type='positive', timeout=4000)
ui.notify('Inhibition rule saved', type='positive', timeout=4000)
```
