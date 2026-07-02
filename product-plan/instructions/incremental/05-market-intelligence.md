# Milestone 5: Market Intelligence

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-4 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement Market Intelligence — the AI-powered analysis hub for actionable trading opportunities.

## Overview

Surfaces actionable trading opportunities from multiple signal sources: AI market analysis recommendations, sentiment dashboard with FinBERT scoring, guru/whale activity tracker, and research schedule management. All recommendations feature transparent reasoning with confidence scores, technical indicators, and one-click order creation via the shell's slide-over panel.

**Key Functionality:**
- 4-stat intelligence dashboard (active recommendations, sentiment gauge, next research run, top guru move)
- Unified recommendations feed (Market Analyst + Trading Advisor signals) with expandable cards
- Sentiment tab: gauge, sector chart, asset class comparison, top movers, news feed with FinBERT scores
- Guru tracker: institutional/whale trade feed, guru management, per-guru alerts
- Research schedule: job cards with schedules, run-now, create/edit/delete jobs

## Recommended Approach: Test-Driven Development

See `product-plan/sections/market-intelligence/tests.md` for test-writing instructions.

## What to Implement

### Intelligence Dashboard (top section of `/market-analysis`)

4 stat cards:
1. **Active Recommendations:** count + "N new" badge. Links to Recommendations tab.
2. **Market Sentiment:** gauge score 0-100, semantic coloring (green>=65, yellow 35-64, red<35). Links to Sentiment tab.
3. **Next Research Run:** countdown + job name. Shows "Running..." with spinner when active. Links to Research Schedule tab.
4. **Top Guru Move:** latest notable trade. Links to Guru Tracker tab.

### Recommendations Tab

**On-demand analysis bar:** "Analyze any instrument..." search with Quick/Full toggle.

**Recommendation cards (collapsed):**
- Instrument (symbol monospace bold + company name)
- Action badge: BUY (emerald) / SELL (red)
- Confidence circular badge: green>=75%, yellow 50-74%, gray<50%
- Source badge: "AI Research" (brain icon) / "Strategy Signal" (flask icon)
- Reasoning snippet (one line)
- Expiry countdown
- Created timestamp (relative)

**Expanded card detail** (click to expand, chevron rotates):
- Transparent reasoning: technical signals (chart icon), sentiment (newspaper icon), portfolio correlation (git-branch icon)
- Scoring breakdown: horizontal stacked bar (technical 50%, sentiment 30%, diversification 20%)
- Target prices 3-column: Entry, Take-Profit, Stop-Loss — each with distance from current price
- Interactive chart (candlestick with SMA overlays, 300px height on desktop, hidden on mobile by default)
- Strategy context (for Trading Advisor signals)
- Actions: "Create Order" (pink-600 primary, opens shell order panel pre-filled), "Dismiss", "Snooze 24h"

**Recommendation states:** ACTIVE (blue), ACCEPTED (emerald), DISMISSED (zinc), SNOOZED (amber), EXPIRED (zinc, faded)

**Filters:** Source (AI Research/Strategy Signal/All), Action (BUY/SELL/All), instrument search, confidence slider.

**Pagination:** 20 per page, "Load more" button.

Empty state: "No recommendations available. Our AI is analyzing markets — check back soon." + "Run Analysis" CTA.

### Sentiment Tab

**Market sentiment gauge:** Large circular gauge (200px, 0-100 scale). Color zones: red 0-34, yellow 35-64, green 65-100. Score displayed in center (monospace bold).

**Sentiment by sector:** Horizontal bar chart, sectors sorted by score descending. Bars color-coded by score.

**Asset class comparison:** Side-by-side cards: Stocks vs Crypto — each with score, 24h trend arrow, article count.

**Top movers table** (split into Most Bullish / Most Bearish, 5 each):
- Instrument, sentiment score (monospace), 24h change (arrow + delta), article count, sparkline, "Watch" button

**Sentiment watchlist** (collapsible): pinned instruments with live scores and alert indicators.

**Active alerts panel** (collapsible): configured threshold alerts with edit/delete/toggle.

**News feed:** headlines with source, timestamp, FinBERT sentiment badge (Positive=emerald, Negative=red, Neutral=zinc), instrument tags.

**Manage Sources** panel (opened via button): enable/disable news feeds, source health status.

### Guru Tracker Tab

**Guru summary row** (horizontally scrollable): tracked guru chips with avatar, name, trade count badge. Click to filter feed. "Add Guru" button at end.

**Trade feed cards:**
- Guru name + type icon (building/landmark/bitcoin)
- Instrument (symbol monospace + company name)
- Action badge: BUY (emerald), SELL (red), INCREASE (emerald), DECREASE (amber)
- Trade size (shares + dollar value, monospace)
- Date filed/detected
- Change vs prior holding (e.g., "+15% position increase")
- Source badge ("SEC 13F Filing" / "On-Chain Analysis")
- "Follow Trade" button → opens shell order panel

**Add Guru modal:** name search (institutional/hedge funds) OR wallet address (crypto), type selector, display name, "Alert me" checkbox.

**Per-guru alerts modal:** trigger rules (any trade, specific instruments, size threshold, action filter).

**Empty state:** "Start tracking institutional investors and crypto whales to see their notable trades." + "Add Your First Guru" CTA.

### Research Schedule Tab

**Job cards grid** (3-col desktop, 2-col tablet, 1-col mobile):
- Job name, schedule ("Daily at 06:00 ET"), status badge (Idle/Running/Error/Disabled), last run + duration, next run countdown, results summary, enabled toggle, system badge
- Actions: "Run Now", "Edit", "Delete" (disabled for system jobs)

**Create/Edit Job modal:**
- Job name, schedule type (Daily/Interval), time/timezone OR interval hours
- Instrument universe (Full Market/Watchlist/Custom with searchable chip list)
- Confidence threshold (1.0-10.0), max results (1-50), enabled checkbox

**Running state:** card pulses, "Running" badge with spinner, elapsed time counter, "Cancel Run" link.

**Job history** (collapsible per card): last 10 runs with status, duration, opportunities published.

Empty state: "No research jobs configured yet." + "Create Research Job" CTA.

## Files to Reference

- `product-plan/sections/market-intelligence/README.md`
- `product-plan/sections/market-intelligence/tests.md`
- `product-plan/sections/market-intelligence/recommendations-light.png`
- `product-plan/sections/market-intelligence/sentiment-light.png`
- `product-plan/sections/market-intelligence/guru-tracker-light.png`
- `product-plan/sections/market-intelligence/research-schedule-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Intelligence dashboard 4 stat cards render
- [ ] Recommendations feed with expandable cards
- [ ] Confidence badge color coding (green/yellow/gray)
- [ ] "Create Order" opens shell order panel pre-filled
- [ ] Dismiss and Snooze work with correct toasts
- [ ] Sentiment gauge renders with correct colors by score
- [ ] Guru tracker feed with Follow Trade action
- [ ] Add Guru modal with name search and wallet address input
- [ ] Research schedule job cards with run-now and create/edit/delete
- [ ] Running job shows pulse animation and elapsed timer
- [ ] All empty states display correctly
- [ ] Responsive on mobile (chart hidden by default)
