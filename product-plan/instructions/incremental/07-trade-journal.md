# Milestone 7: Trade Journal

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-6 complete

---

## About These Instructions

Rebuild all screens in React matching the design exactly. React components are visual reference only. Apply Tailwind via Tailwind utility classes, use the toast notification system for toasts, modal components for modals.

---

## Goal

Implement the Trade Journal — the trader's reflection and improvement hub.

## Overview

Full CRUD journaling with pre-trade and post-trade reviews, process scoring across five dimensions (discipline, emotional management, risk management, entry quality, exit quality), portfolio-scoped performance analytics, and cross-portfolio behavioral pattern detection. Core insight: separating process quality from outcome quality.

**Key Functionality:**
- Journal dashboard with summary stats, recent entries, behavioral alerts, habit gauges
- 3-tab entries screen (Needs Review, All Entries, Starred) with portfolio grouping
- Full journal entry detail with radar chart for process scores
- Journal entry editor: pre-trade thesis, post-trade review, 5-dimension scoring
- Analytics with Performance, Process Scores, and Attribution sub-tabs
- Behavioral patterns detection with severity badges and habit score gauges
- Weekly review with goals progress and focus areas

## Recommended Approach: Test-Driven Development

See `product-plan/sections/trade-journal/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Journal Dashboard (`/journal`)

**Stat cards (4):** Total Entries, Avg Process Score (with trend arrow), Journal Completion Rate (journaled/total closed as %), Entries This Week.

**Portfolio selector:** Dropdown to filter dashboard by portfolio or "All Portfolios".

**Recent entries list** (last 5): instrument (monospace), side badge, P&L (semantic color), process score (colored dots 1-5), date. Click → journal entry detail.

**Process score trend:** sparkline chart showing 30-day rolling average.

**Active behavioral alerts:** banner cards for moderate/high severity patterns — "View Details" link → Behavioral Patterns screen.

**Habit score gauges** (4 circular progress, 0-100): Consistency, Emotional Control, Risk Discipline, Patience.
- Colors: 0-40=red, 41-60=amber, 61-80=emerald, 81-100=bright emerald.

Skeleton loading states.
Empty state: "Start journaling your trades to track improvement over time." + "Create Entry" CTA.

### Screen 2: Journal Entries (`/journal/entries`)

**3 tabs:** Needs Review | All Entries | Starred

**Portfolio grouping toggle:** Group by portfolio (collapsible headers with portfolio name + count) or flat list.

**Needs Review tab:** Closed trades not yet journaled, sorted by close date descending. Each row: instrument, side badge, P&L (semantic), close date, portfolio name, "Journal This Trade" CTA per row.
Empty: "All caught up! No trades waiting for review." + "View All Entries" link.

**All Entries tab:** Full table — date, instrument, side badge, portfolio, P&L (semantic), process score (1-5 with color gradient), strategy, tags. Sortable, default: date descending.

**Starred tab:** Same columns as All Entries.
Empty: "Star important entries to find them quickly." + "View All Entries" link.

**Filters:** portfolio (multi-select), date range picker, instrument search, strategy dropdown, tags (multi-select), process score slider 1-5, outcome (Win/Loss/All).

**Inline actions per row:** Edit (pencil), Delete (trash with Level 3 confirmation), Star/Unstar (star toggle).

**Delete confirmation:** Level 3 modal — "Are you sure you want to delete this journal entry for {instrument}? This action cannot be undone." with Cancel and Delete (danger) buttons.

Pagination: 50 per page.

### Screen 3: Journal Entry Detail

**Trade summary card:** symbol + company name, BUY/SELL badge, entry/exit dates (monospace), entry/exit prices (monospace), quantity (monospace), P&L (semantic color), P&L % (semantic), holding period, portfolio name, broker badge, strategy name.

**Pre-trade section (card):** thesis, entry criteria, target price (monospace), planned stop-loss (monospace), risk/reward ratio (monospace), position size rationale, confidence level (1-5 dots), market conditions badge, emotional state before badge.

**Post-trade section (card):** what worked, what didn't work, lessons learned, emotional state after badge, would take again (Yes/No badge).

**Process scores section:** radar chart (5 dimensions), overall score displayed prominently. Horizontal bars for individual dimensions.

**Tags** (badge pills), **related trades** (linked cards), **attachments** (thumbnails with lightbox).

**Actions:** Edit (primary, opens editor), Delete (danger, Level 3 confirmation), Star/Unstar (ghost).

Empty sections: subtle placeholder "No pre-trade notes recorded" with "Edit to add" link.

### Screen 4: Journal Entry Editor

**Create from "Needs Review":** trade summary auto-populated (read-only) at top of form.

**Pre-trade section (collapsible):**
- Thesis (textarea), entry criteria (textarea), target price, planned stop-loss, risk/reward ratio (auto-calculated)
- Position size rationale (textarea)
- Confidence level (1-5 interactive dots)
- Market conditions (select: trending/ranging/volatile/calm/uncertain)
- Emotional state before (select: calm/confident/anxious/excited/fearful/neutral/frustrated)

**Post-trade section (collapsible):**
- What worked (textarea), what didn't (textarea), lessons learned (textarea)
- Emotional state after (select: satisfied/disappointed/relieved/frustrated/neutral/regretful/proud)
- Would take again (toggle Yes/No)

**Process scores (always visible, required):**
- 5 dimension selectors (1-5 clickable dots): discipline, emotional management, risk management, entry quality, exit quality
- Overall score auto-calculated as average
- Tooltips explaining each dimension

**Tags:** typeahead multi-select from existing tags, create inline.

**Related trades:** search by instrument or trade ID.

**Attachments:** drag-and-drop upload (max 10MB, image types only).

**Validation:** all 5 process scores required; at least one of pre-trade or post-trade section must have content.

### Screen 5: Analytics (`/journal/analytics`)

**Global portfolio filter** + **Period selector** (1M, 3M, 6M, 1Y, YTD, ALL) — applies to all 3 sub-tabs.

**Performance sub-tab:** 14 metric cards (total trades, win rate, avg win/loss, profit factor, Sharpe, Sortino, max drawdown, avg holding period), win rate trend chart, P&L distribution histogram, cumulative P&L area chart.

**Process Scores sub-tab:** overall score card with trend, radar chart per dimension, score trend line chart, process vs outcome quadrant chart (2x2):
- Skilled (high process, high outcome) — emerald tint
- Unlucky (high process, low outcome) — amber tint
- Lucky (low process, high outcome) — amber tint
- Needs Work (low process, low outcome) — red tint

**Attribution sub-tab:** By strategy table (trade count, win rate, profit factor, P&L), by day of week bar chart, by time of day bar chart.

### Screen 6: Behavioral Patterns (`/journal/behavioral`)

Period selector (1M, 3M, 6M — default 3M).

**Pattern cards:** pattern name + icon, severity badge (Low=emerald, Moderate=amber, High=red), occurrence count, description, P&L impact (semantic), actionable recommendation, "Acknowledge" button.

**Habit score gauges (4):** Consistency, Emotional Control, Risk Discipline, Patience — with current score, trend direction arrow, 90-day sparkline.

**Improvement focus areas:** 2-3 prioritized items linking to relevant journal entries.

Empty state: "No behavioral patterns detected."

### Screen 7: Weekly Review (`/journal/weekly`)

Week picker (prev/next arrows + calendar dropdown).

**Week summary card:** date range (Mon–Sun), total trades, P&L (semantic), win rate %, avg process score.

**Best trade card + Worst trade card:** instrument, P&L, process score — click → entry detail.

**Patterns this week:** list of flagged patterns.

**Goals progress table:** goal name, target, actual, status badge (Met=emerald, Close=amber, Missed=red).

**Focus for next week:** editable list (2-3 items), auto-suggested from behavioral analysis, save button.

## Files to Reference

- `product-plan/sections/trade-journal/README.md`
- `product-plan/sections/trade-journal/tests.md`
- Screenshots: `dashboard-light.png`, `entries-light.png`, `entrydetail-light.png`, `editor-light.png`, `analytics-light.png`, `behavioral-light.png`, `review-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Journal dashboard with stat cards, recent entries, habit gauges
- [ ] 3-tab entries screen (Needs Review, All Entries, Starred)
- [ ] "Journal This Trade" pre-fills editor from closed trade data
- [ ] Entry editor with collapsible sections and 5-dimension scoring dots
- [ ] Process score validation (all 5 required)
- [ ] Entry detail with radar chart for process scores
- [ ] Delete Level 3 confirmation modal
- [ ] Analytics: Performance, Process Scores (quadrant), Attribution
- [ ] Behavioral patterns with severity badges and habit gauges
- [ ] Weekly review with goals progress and editable focus areas
- [ ] Empty states throughout
- [ ] Responsive on mobile
