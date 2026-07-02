# Milestone 8: Settings & Operations

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-7 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement Settings & Operations — the centralized configuration hub for the entire platform.

## Overview

Presents a card-based overview of 10 settings categories, each with a status summary and link to a dedicated detail page. Detail pages use form-based layouts with inline validation, masked secrets with reveal/rotate controls, and live connection status where applicable.

**Key Functionality:**
- Settings overview grid with 10 category cards and status summaries
- 10 detail pages covering all platform configuration areas
- Masked API keys and credentials with reveal/rotate controls
- Live broker connection status dashboard with latency and test connection
- Drag-to-reorder data source priority
- Notification subscription matrix (alert types × channels checkboxes)
- All changes via explicit "Save Changes" button (no auto-save)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/settings-and-operations/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Settings Overview (`/settings`)

**Responsive card grid** (3-col desktop, 2-col tablet, 1-col mobile).

Each card shows: category icon, category name, 1-2 line status summary, optional warning badge.

10 categories:
1. **Broker Gateways** — "2 brokers connected" / warning if disconnected
2. **Market Data Pipeline** — "4 data sources active" / warning if any issues
3. **Portfolio & Currency** — "USD base currency, 3 currencies tracked"
4. **Risk Management** — "Risk limits active, daily loss limit $500"
5. **Tax Configuration** — "Czech Republic, FIFO method, 3-year exemption"
6. **Strategy & Backtesting** — "Default capital $100,000, 0.1% commission"
7. **Intelligence Sources** — "3 guru sources, Daily Stock Research active"
8. **Trade Journal** — "Pre+post notes required, 1h review delay"
9. **Notifications & Alerts** — "Email + Slack configured, quiet hours active"
10. **Calendar & Display** — "Dark mode, CET timezone, 5min refresh"

Click any card → detail page.

### Screen 2: Broker Gateways (`/settings/broker-gateways`)

For each broker (IB, Binance):

**Live status dashboard:**
- Connection dot (green/amber/red)
- Latency value (monospace, e.g., "12ms")
- Last heartbeat timestamp (monospace, relative)
- Circuit breaker state badge

**Test Connection button** (with loading state on click, shows result inline).

**Configuration form:**
- Host/port inputs
- API key (masked: dots with eye icon toggle to reveal, "Rotate" button to generate new)
- Secret/token (masked)
- Account number (masked)
- SSL toggle, TLS version selector

**Save Changes button** at bottom. Unsaved changes prompt confirmation on navigate away.

### Screen 3: Market Data Pipeline (`/settings/market-data`)

**Data source list** with priority (drag-to-reorder with grip handles):
- Source name + enable/disable toggle
- Fetch schedule summary
- Quality threshold input (minimum data quality score to accept)

**Retention tier config:** hot tier days, warm tier months, cold tier enabled toggle.

**Tracked instruments editor:** add/remove instruments globally, intervals per instrument.

### Screen 4: Risk Management (`/settings/risk-management`)

Slider/input pairs for all risk parameters:
- Position size limit % (slider 0.5-10%, default 5%)
- Concentration limit % (slider 5-30%, default 20%)
- Daily loss limit $ (numeric input)
- Max drawdown % (slider 5-50%, default 25%)
- Correlation threshold (slider 0-1, default 0.7)
- Monitoring interval (minutes, select)

**Circuit breaker config:** trigger threshold %, cooldown period, auto-resume toggle.

Visual indicator showing current vs. default for each slider.

### Screen 5: Tax Configuration (`/settings/tax`)

- Tax method selector (FIFO — currently only option)
- Tax rate % (input)
- Exemption period (3 years, read-only info)
- CNB exchange rate sync settings (enabled toggle, sync interval, last sync timestamp)
- Tracked currencies list (add/remove)
- Report format toggles
- Audit retention period selector

### Screen 6-10: Remaining Detail Pages

Following the same pattern (form sections with clear headings, consistent label/input alignment):

- **Strategy & Backtesting** — Evaluation interval, default parameters, backtesting defaults
- **Intelligence Sources** — Guru tracker toggles, Market Analyst schedule and thresholds
- **Trade Journal Settings** — Pre/post note requirements, review delay, scoring dimension weights
- **Notifications & Alerts** — Channel config (email, Slack, Discord, SMS, push) with masked credentials, quiet hours, severity threshold, **subscription matrix** (alert types × channels table with checkbox cells), rate limits
- **Calendar & Display** — Trading calendar providers, timezones, theme toggle, refresh intervals

### Masked Field Pattern

Masked field pattern: Input shows dots (•••) with an eye icon toggle to reveal the value, plus a "Rotate" button to regenerate the key. Use `font-mono` for the masked display.

### Unsaved Changes Guard

Before navigating away from any settings page with unsaved changes, show a confirmation dialog: "You have unsaved changes. Leave without saving?" with "Cancel" (secondary) and "Leave Without Saving" (danger) buttons. Track dirty state via form change handlers.

## Files to Reference

- `product-plan/sections/settings-and-operations/README.md`
- `product-plan/sections/settings-and-operations/tests.md`
- Screenshots: `settings-overview-light.png`, `broker-gateways-light.png`, `risk-management-light.png`, `notifications-alerts-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Settings overview grid renders all 10 category cards
- [ ] Each card status summary shows real data
- [ ] Broker Gateways: live status dots, test connection button, masked fields
- [ ] Masked fields reveal/hide on eye icon click, rotate generates new key
- [ ] Market Data Pipeline: drag-to-reorder data source priority
- [ ] Risk Management: sliders with numeric inputs and default indicators
- [ ] Notification subscription matrix table renders with checkboxes
- [ ] All "Save Changes" buttons work with success/error toasts
- [ ] Unsaved changes guard prompts on navigate away
- [ ] Inline validation shows errors next to fields
- [ ] Responsive on mobile
