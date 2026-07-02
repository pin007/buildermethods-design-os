# Alerts Specification

## Overview
Centralized alert management and escalation hub. Individual components (broker gateways, market data pipeline, risk management, strategy engine, portfolio manager) are responsible for triggering their own alerts. This section is responsible for viewing all alerts in one place, acknowledging them, and configuring how alerts escalate — routing, silencing, and inhibition. The mental model follows Prometheus AlertManager: alerts flow in from sources, get grouped and routed to receivers, can be silenced during maintenance, and can be inhibited when more severe related alerts are already firing.

## User Flows
- View all active (firing) alerts grouped by source, with severity indicators and timestamps
- Acknowledge alerts to signal awareness without silencing them
- Silence alerts matching specific label criteria for a time window (e.g., during maintenance)
- View recently resolved alerts to understand what happened and when
- Configure alert routes: define how alerts reach the user (email, Slack, push notification, in-app) based on label matchers, with grouping and repeat intervals
- Configure inhibition rules: suppress target alerts when source alerts are firing (e.g., suppress stale data warnings when the data provider itself is down)
- Enable/disable individual routes and inhibition rules without deleting them
- Create new silences with label matchers, duration, and a comment explaining why
- Expire active silences early when maintenance is complete

## UI Requirements
- Pattern A header (top-level nav item in Overview group): Category "Overview", Title "Alerts"
- Summary stat cards: Firing count, Critical count, Silenced count, Resolved in last 24h
- Tabbed interface: Active Alerts | Silences | Routes | Inhibitions
- Active Alerts tab: List of alerts sorted by severity (critical first), then by start time. Each alert shows severity badge, source badge, summary, relative timestamp, and action buttons (Acknowledge, Silence). Acknowledged alerts show who acknowledged and when. Silenced alerts show which silence matched. Recently resolved alerts in a separate collapsible section below.
- Silences tab: List of active and pending silences with matchers displayed as label pills, time remaining, matched alert count, and Expire/Edit actions. Create New Silence button.
- Routes tab: List of routing rules with receiver badge, matchers as label pills, timing configuration (group wait, interval, repeat), enable/disable toggle, and last delivered timestamp. Create New Route button.
- Inhibitions tab: List of inhibition rules with source/target matcher display, equal labels, enable/disable toggle, suppressed count. Create New Rule button.
- Severity color coding: critical = red, warning = amber, info = blue
- Source badges: broker = violet, market-data = sky, risk = red, strategy = amber, portfolio = emerald, system = zinc
- Empty states for each tab when no items exist
- Mobile responsive: tabs stack or scroll horizontally, alert cards stack vertically

## Configuration
- shell: true
