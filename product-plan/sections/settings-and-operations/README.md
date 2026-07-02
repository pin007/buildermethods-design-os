# Settings & Operations

## Overview

Centralized configuration hub for the Trading Squad platform. Card-based overview of 10 settings categories, each with a status summary and dedicated detail page. Detail pages use form-based layouts with inline validation, masked secrets with reveal/rotate controls, and live connection status where applicable.

## Screens

1. **Settings Overview** (`/settings`) — 10 category cards with status summaries
2. **Broker Gateways** (`/settings/broker-gateways`) — IB and Binance connection config, live status
3. **Market Data Pipeline** (`/settings/market-data`) — Data sources, priority, retention
4. **Portfolio & Currency** (`/settings/portfolio`) — Base currency, benchmarks, margin alerts
5. **Risk Management** (`/settings/risk`) — Position limits, circuit breakers, monitoring
6. **Tax Configuration** (`/settings/tax`) — Czech tax settings, CNB sync, report format
7. **Strategy & Backtesting** (`/settings/strategy`) — Evaluation and backtesting defaults
8. **Intelligence Sources** (`/settings/intelligence`) — Guru tracker, market analyst config
9. **Trade Journal** (`/settings/journal`) — Journal requirements, scoring weights, behavioral thresholds
10. **Notifications & Alerts** (`/settings/notifications`) — Channel config, subscription matrix, quiet hours
11. **Calendar & Display** (`/settings/calendar`) — Timezone, theme, refresh intervals

## User Flows

- View all settings categories with current status summaries
- Click category card to drill into detail page
- Edit settings inline with form controls
- Masked secrets: reveal with eye icon, rotate with "Rotate" button
- Live broker status: green/amber/red dot, latency, last heartbeat, "Test Connection"
- Drag-to-reorder data source priority with grip handles
- Save changes via explicit "Save Changes" button (no auto-save)
- Unsaved changes: confirmation dialog when navigating away
- Inline validation errors appear next to offending fields

## Design Decisions

- No auto-save — all changes require explicit "Save Changes" action
- Masked fields show dots (not actual value) by default
- Broker status dashboard is live (polling every 30s or WebSocket)
- Drag-to-reorder for data source priority (not just up/down buttons)
- Notification subscription matrix: alert types as rows, channels as columns, checkboxes at intersections
- Risk management sliders include visual indicator of current vs. default value
- Colorblind-safe P&L palette (Calendar & Display) — a toggle that sets `data-palette="cvd"` on the app root, swapping the default green/red profit-loss colors for a blue/orange pair distinguishable under red-green color-vision deficiency (deuteranopia/protanopia). Directional up/down icons are always shown so meaning never depends on color alone.

## Visual References

- `settings-overview-light.png` / `-dark.png` — Category card grid
- `broker-gateways-light.png` / `-dark.png` — Broker connection config
- `market-data-pipeline-light.png` / `-dark.png` — Data pipeline config
- `portfolio-currency-light.png` / `-dark.png` — Portfolio & currency settings
- `risk-management-light.png` / `-dark.png` — Risk parameters with sliders
- `tax-configuration-light.png` / `-dark.png` — Tax config form
- `strategy-backtesting-light.png` / `-dark.png` — Strategy defaults
- `intelligence-sources-light.png` / `-dark.png` — Intelligence config
- `trade-journal-settings-light.png` / `-dark.png` — Journal settings
- `notifications-alerts-light.png` / `-dark.png` — Notification matrix
- `calendar-display-light.png` / `-dark.png` — Calendar & display

## Toast Variants

```python
ui.notify('Settings saved', type='positive', timeout=4000)
ui.notify('Save failed: <error>', type='negative', timeout=6000)
ui.notify('Connection test successful: 12ms latency', type='positive', timeout=4000)
ui.notify('Connection test failed: Connection refused', type='negative', timeout=6000)
ui.notify('API key rotated', type='info', timeout=4000)
```
