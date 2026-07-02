# Settings & Operations Specification

## Overview
Settings & Operations is the centralized configuration hub for the Trading Squad platform. It presents a card-based overview of 10 settings categories — each card shows a summary status (e.g., "2 brokers connected", "Risk limits active") and links to a dedicated detail page. Detail pages use form-based layouts with inline validation, masked secrets with reveal/rotate controls, and live connection status where applicable.

## Screen Designs

1. **Settings Overview** — Card grid showing all 10 categories with status summaries and quick-action links
2. **Broker Gateways** — Connection config for IB and Binance with live status dashboard (latency, heartbeat, circuit breaker state), test connection button, masked API keys
3. **Market Data Pipeline** — Data source list with enable/disable toggles, priority drag-to-reorder, fetch schedules, quality thresholds, retention tier config, tracked instruments editor
4. **Portfolio & Currency** — Base currency selector, supported currencies, benchmark config, margin alert thresholds, reconciliation settings
5. **Risk Management** — Slider/input controls for position size limit, concentration limit, daily loss limit, max drawdown, correlation threshold, circuit breaker config, monitoring interval
6. **Tax Configuration** — Tax method, rate, exemption period, CNB sync settings, currency list, report format toggles, retention period
7. **Strategy & Backtesting** — Evaluation interval, default risk/position params, backtesting defaults (capital, commission, slippage, execution model), walk-forward config, report format
8. **Intelligence Sources** — Sub-sections for Guru Tracker (SEC, dark pool, analyst, whale, options flow toggles and intervals), Market Analyst (schedule, thresholds, scoring weights)
9. **Trade Journal** — Pre/post trade note requirements toggle, review prompt delay, scoring dimension weights, behavioral detection thresholds, review schedule
10. **Notifications & Alerts** — Channel configuration (email, Slack, Discord, SMS, PWA push) with masked credentials, quiet hours, severity threshold, per-alert-type subscription matrix, rate limits
11. **Calendar & Display** — Trading calendar providers, refresh schedules, alert timing, economic calendar countries, display timezone, theme toggle, dashboard refresh interval

## User Flows
- User opens Settings and sees the overview grid with all 10 category cards showing current status summaries
- User clicks a category card to drill into that category's detail page
- Each detail page has a breadcrumb (Settings > Category Name) and a "Back to Settings" link
- User edits settings inline with form controls (inputs, toggles, sliders, selects, drag-to-reorder)
- Sensitive fields (API keys, VAPID keys, webhook URLs) show masked values with a reveal toggle and "Rotate Key" action
- Broker Gateways page shows live connection indicators (green/amber/red), latency, last heartbeat, and a "Test Connection" button per broker
- Changes are saved via explicit "Save Changes" button at the bottom of each detail page (not auto-save)
- Unsaved changes trigger a confirmation dialog if user navigates away
- Validation errors appear inline next to the offending field
- Success/error toast notifications on save

## UI Requirements
- Overview page: Responsive card grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each overview card shows: category icon, category name, 1-2 line status summary, optional badge (e.g., warning count)
- Detail pages: Form sections with clear group headings, consistent label/input alignment
- Masked secret fields: Input shows dots with eye icon toggle to reveal, "Rotate" button to generate new
- Broker status dashboard: Connection dot (green/amber/red), latency value, last heartbeat timestamp, "Test Connection" button with loading state
- Risk management: Sliders with numeric input alongside for precision, visual indicator showing current vs. default
- Data source priority: Drag-to-reorder list with grip handles
- Notification subscription matrix: Table with alert types as rows and channels as columns, checkbox cells
- All forms follow the Obsidian Forge design system — zinc backgrounds, pink-600 accents, DM Sans typography
- Breadcrumb navigation on detail pages (Home > Settings > [Category])

## Configuration
- shell: true
