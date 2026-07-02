# Milestone 9: Alerts

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-8 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement the Alerts section — centralized alert management and escalation hub.

## Overview

Centralized alert management following the Prometheus AlertManager mental model: alerts flow in from sources (broker, market data, risk, strategy, portfolio), get grouped and routed to receivers, can be silenced during maintenance, and inhibited when more severe related alerts are firing.

**Key Functionality:**
- Active alerts list grouped by source with severity indicators
- Silence management with label matchers and time windows
- Alert routing configuration (email, Slack, push) with grouping rules
- Inhibition rules to suppress alerts when related alerts are firing
- Acknowledge alerts and view recently resolved alerts

## Recommended Approach: Test-Driven Development

See `product-plan/sections/alerts/tests.md` for test-writing instructions.

## What to Implement

### Screen: Alerts (`/alerts`)

**Summary stat cards (4-column):** Firing count, Critical count, Silenced count, Resolved in last 24h.

**Tab bar:** Active Alerts | Silences | Routes | Inhibitions

### Active Alerts Tab

Sorted by severity (critical first), then by start time.

Each alert shows:
- Severity badge: Critical (red), Warning (amber), Info (blue)
- Source badge: broker (violet), market-data (sky), risk (red), strategy (amber), portfolio (emerald), system (zinc)
- Summary text (alert description)
- Relative timestamp ("5 minutes ago")
- Action buttons: "Acknowledge", "Silence"

**Acknowledged alerts:** show "Acknowledged by {user} at {time}" — dimmed but still visible.

**Silenced alerts:** show "Silenced by '{silence name}'" — visually distinct.

**Recently resolved section** (collapsible, below active list): resolved alerts from last 24h — instrument, summary, resolved timestamp, duration.

Empty state: icon, "No active alerts. All systems operational.", no CTA.

### Silences Tab

Active and pending silences:
- Matchers displayed as label pills (e.g., `alertname="BrokerDisconnected"`, `severity="critical"`)
- Time remaining (relative)
- Matched alert count
- Status badge: Active (blue), Pending (amber, not started yet), Expired (zinc)
- Actions: Expire (cancel early), Edit

**Create New Silence** button (top-right, primary):
- Form: label matchers (key=value pairs, add/remove rows), start time, end time (or duration), comment (required — explains why)
- Submit creates silence, shows success toast

Empty state: icon, "No active silences.", no CTA.

### Routes Tab

Routing rules defining how alerts reach the user:

Each rule:
- Receiver badge (email / Slack / Discord / in-app)
- Matchers as label pills
- Timing: group wait, group interval, repeat interval
- Enable/disable toggle
- Last delivered timestamp

**Create New Route** button (primary).

Route form: receiver type selector, label matchers, grouping fields, timing fields, continue toggle.

Empty state: icon, "No routing rules configured. Create routes to receive alert notifications.", no CTA.

### Inhibitions Tab

Rules to suppress target alerts when source alerts are firing:

Each rule:
- Source matchers (label pills) — alerts that trigger inhibition
- Target matchers (label pills) — alerts that get suppressed
- Equal labels — labels that must match for inhibition to apply
- Enable/disable toggle
- Suppressed count (how many currently suppressed by this rule)

**Create New Rule** button (primary).

Empty state: icon, "No inhibition rules configured.", no CTA.

### Severity & Source Colors

**Severity colors:**
| Severity | Classes |
|----------|---------|
| `critical` | `bg-red-500/10 text-red-400 border border-red-500/30` |
| `warning` | `bg-amber-500/10 text-amber-400 border border-amber-500/30` |
| `info` | `bg-blue-500/10 text-blue-400 border border-blue-500/30` |

**Source colors:**
| Source | Classes |
|--------|---------|
| `broker` | `bg-violet-500/10 text-violet-400` |
| `market-data` | `bg-sky-500/10 text-sky-400` |
| `risk` | `bg-red-500/10 text-red-400` |
| `strategy` | `bg-amber-500/10 text-amber-400` |
| `portfolio` | `bg-emerald-500/10 text-emerald-400` |
| `system` | `bg-zinc-800 text-zinc-400` |

## Files to Reference

- `product-plan/sections/alerts/README.md`
- `product-plan/sections/alerts/tests.md`
- `product-plan/sections/alerts/dashboard-light.png`
- `product-plan/sections/alerts/dashboard-dark.png`

## Done When

- [ ] Tests written and passing
- [ ] Stat cards show correct alert counts
- [ ] Active Alerts tab sorted by severity (critical first)
- [ ] Severity badges use correct colors
- [ ] Source badges use correct colors
- [ ] Acknowledge action shows acknowledged-by info
- [ ] Silence action opens create silence form with matcher pre-filled
- [ ] Silences tab shows matchers as label pills with time remaining
- [ ] Create Silence form validates comment is required
- [ ] Routes tab shows routing rules with enable/disable
- [ ] Inhibitions tab shows source/target matchers
- [ ] All 4 tabs have appropriate empty states
- [ ] Recently resolved collapsible section
- [ ] Mobile responsive (tabs scroll horizontally, cards stack)
