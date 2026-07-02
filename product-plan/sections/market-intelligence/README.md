# Market Intelligence

## Overview

AI-powered analysis hub surfacing actionable trading opportunities from multiple signal sources. Provides a summary dashboard, unified recommendations feed, sentiment analysis, guru/whale tracker, and research schedule management. All recommendations feature transparent reasoning with confidence scores and one-click order creation.

## Screens

1. **Intelligence Dashboard** (top of `/market-analysis`) — 4 stat cards: recommendations count, sentiment score, next research run, top guru move
2. **Recommendations Tab** — Unified feed with expandable cards, on-demand analysis bar
3. **Sentiment Tab** — Gauge, sector chart, asset class cards, top movers, news feed
4. **Guru Tracker Tab** — Institutional/whale trade feed with guru management
5. **Research Schedule Tab** — Automated research job management

## User Flows

- Scan intelligence dashboard for high-level market overview
- Browse recommendations from AI Research and Trading Advisor signals
- Expand recommendation to see full reasoning, scoring breakdown, target prices, and chart
- Accept recommendation → shell order panel pre-filled with instrument, action, targets
- Dismiss or snooze recommendations
- Monitor market sentiment via gauge and sector breakdown
- Pin instruments to sentiment watchlist and set threshold alerts
- Track guru trades and "follow" them via shell order panel
- Add institutional investors or crypto whale wallets for tracking
- Manage automated research jobs (create, edit, run, disable)

## Design Decisions

- On-demand analysis provides Quick (technical, <2s) or Full (technical+sentiment+correlation, <5s)
- Confidence badge: green>=75% (clear signal), yellow 50-74% (weak signal), gray<50% (noise)
- Sentiment gauge: 0=extreme bearish (red), 100=extreme bullish (green), 35-64=neutral (yellow)
- Research jobs: system-default jobs (Daily Stock Research, Crypto High Cap) can be disabled but not deleted
- Shell's order panel is used for "Create Order" and "Follow Trade" — section never renders its own

## AI Provenance Chip

A reusable component rendered consistently across recommendation lists and any surface that presents an AI recommendation. It makes every AI-originated suggestion auditable at a glance:

- **Confidence gauge** — 0–100 score using the same color thresholds as the Confidence badge (green>=75, yellow 50-74, gray<50)
- **Source badge** — attribution to the originating strategy name or "Market Analyst"
- **Model/version tag** — the model and version that produced the recommendation (e.g. `gpt-4o · v2.3`)
- **Reasoning disclosure** — expandable panel revealing structured reasoning and target prices; collapsed by default

Always render this chip rather than ad-hoc confidence/source markup so provenance stays uniform across every recommendation surface.

## Visual References

- `recommendations-light.png` / `recommendations-dark.png` — Recommendations tab with expanded card
- `sentiment-light.png` / `sentiment-dark.png` — Sentiment analysis view
- `guru-tracker-light.png` / `guru-tracker-dark.png` — Guru tracker feed
- `research-schedule-light.png` / `research-schedule-dark.png` — Job management

## Callback Reference

| Action | Description |
|--------|-------------|
| Accept recommendation | Open shell order panel pre-filled with symbol, action, entry/TP/SL |
| Dismiss recommendation | Remove from feed, toast info "Recommendation dismissed" |
| Snooze 24h | Hide for 24 hours, toast info |
| Follow guru trade | Open shell order panel pre-filled with instrument and matching side |
| Add guru | Search institutional investors or paste wallet address |
| Create research job | Open create form, queue on save |
| Run now | Trigger ad-hoc run with universe and threshold confirmation |

## Toast Variants

```python
ui.notify('Recommendation dismissed', type='info', timeout=4000)
ui.notify('Recommendation snoozed for 24 hours', type='info', timeout=4000)
ui.notify('On-demand analysis started', type='info', timeout=4000)
ui.notify('On-demand analysis complete — results added to feed', type='positive', timeout=4000)
ui.notify('Guru added to tracking', type='positive', timeout=4000)
ui.notify('Research job created', type='positive', timeout=4000)
ui.notify('Research job failed: <error>', type='negative', timeout=6000)
```
