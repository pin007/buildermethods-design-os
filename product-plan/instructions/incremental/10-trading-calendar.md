# Milestone 10: Trading Calendar

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-9 complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Trading Calendar section — a unified calendar aggregating market-moving events (earnings, economic releases, dividends, options expirations, IPOs) to help traders plan positions around scheduled dates.

## Overview

Trading Calendar gives traders a unified view of all market-relevant scheduled events. Events are color-coded by type, filterable, and show portfolio relevance. Users click calendar days to view event lists, and expand event rows for full detail specific to the event type (earnings estimates, economic consensus, dividend amounts, options positions, IPO pricing).

**Key Functionality:**
- Unified month/week calendar grid with color-coded event type dots
- Filter chips to show/hide event types and portfolio-only toggle
- Stats bar showing this week's events, portfolio events, high-impact count, upcoming dividends
- Day click loads event list panel; event click expands inline detail
- Month/week view toggle with navigation controls
- 5 event types with distinct detail panels (earnings, economic, dividend, options, IPO)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/trading-calendar/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy the calendar component from `product-plan/sections/trading-calendar/components/`:

- `CalendarDashboard.tsx` — Full calendar view with stats, filters, grid, and event list

### Data Layer

Key types from `product-plan/sections/trading-calendar/types.ts`:
- `CalendarEvent` — event with type, title, date, instrument, impact, portfolio flag, and type-specific details
- `CalendarStats` — this week totals, portfolio events, high-impact count, upcoming dividends
- `CalendarEventType` — `'earnings' | 'economic' | 'dividend' | 'options' | 'ipo'`
- Event detail types: `EarningsDetails`, `EconomicDetails`, `DividendDetails`, `OptionsDetails`, `IpoDetails`

### Stats Bar

4 stat cards: This Week (count + breakdown by type), Portfolio Events (count affecting holdings), High Impact (high-impact economic events next 7 days), Upcoming Dividends (expected income next 30 days).

### Event Type Filter Chips

5 toggle chips, each with colored dot and count:

| Type | Color | Description |
|------|-------|-------------|
| Earnings | amber | Earnings announcement dates |
| Economic | blue | FOMC, NFP, CPI, GDP releases |
| Dividends | emerald | Ex-dividend and payment dates |
| Options | purple | Monthly/weekly expirations |
| IPOs | pink | Upcoming IPO listings |

Active chip: colored background + border. Inactive: dimmed zinc styling. Additional "Portfolio Only" toggle filters to events affecting held positions.

### Calendar Grid

**Month View:** 7-column grid (Mon–Sun). Each cell shows up to 3 event dots (color-coded) with "+N more" overflow. Today highlighted with pink-600 ring. Days with portfolio events show subtle background tint. Click day to expand event list.

**Week View:** Same column layout with more vertical space and event title snippets alongside dots.

**Navigation:** "< Prev" / "Next >" arrows with current month/week label. "Today" button resets to current date. Month/Week toggle.

### Event List Panel

Below calendar (desktop: side panel 1/3 width; mobile: full-width below). Shows events for selected day sorted by time then alphabetically. Each row: type indicator bar, time (if applicable), title, ticker, impact badge (economic), portfolio dot.

Click event row to expand inline detail.

### Event Detail Panels (5 types)

**Earnings:** company, fiscal quarter, timing (before/after market), EPS estimate vs prior, revenue estimate vs prior, confirmed badge, portfolio badge.

**Economic:** indicator name, country, release time + timezone, impact badge, consensus vs prior with unit, description.

**Dividend:** ex-date, record date, payment date, amount, yield %, frequency, portfolio badge with expected payment.

**Options:** expiration type, exchange, affected open positions with current value and ITM/OTM status.

**IPO:** company, ticker, exchange, listing date, price range, shares offered, valuation, underwriters, industry, status badge (upcoming/pricing/recent).

### Impact Level Colors

| Impact | Classes |
|--------|---------|
| `high` | `bg-red-500/10 text-red-400 border border-red-500/30` |
| `medium` | `bg-amber-500/10 text-amber-400 border border-amber-500/30` |
| `low` | `bg-zinc-800 text-zinc-400` |

### Callbacks

| Callback | Description |
|----------|-------------|
| `onCreateAlert` | Called when user creates an alert for an event |
| `onViewInstrument` | Called when user clicks an instrument ticker |
| `onViewPortfolio` | Called when user clicks "View Portfolio" from a portfolio event |

### Responsive Layout

- Desktop (1024px+): Calendar grid (2/3 width) + event list panel (1/3 width) side by side
- Tablet (768–1023px): Calendar grid full width, event list below
- Mobile (<768px): List view of events by date, full-width event detail cards

## Files to Reference

- `product-plan/sections/trading-calendar/README.md`
- `product-plan/sections/trading-calendar/tests.md`
- `product-plan/sections/trading-calendar/components/` — React components
- `product-plan/sections/trading-calendar/types.ts` — TypeScript interfaces
- `product-plan/sections/trading-calendar/sample-data.json` — Test data
- `product-plan/sections/trading-calendar/dashboard-light.png` — Visual reference (light)
- `product-plan/sections/trading-calendar/dashboard-dark.png` — Visual reference (dark)

## Done When

- [ ] Tests written and passing
- [ ] Stats bar shows correct event counts
- [ ] All 5 event type filter chips work correctly
- [ ] "Portfolio Only" toggle filters calendar to held positions events
- [ ] Month view calendar grid renders with color-coded dots
- [ ] "+N more" overflow indicator visible when >3 events per day
- [ ] Today highlighted with pink-600 ring
- [ ] Days with portfolio events show subtle background tint
- [ ] Week view shows event title snippets
- [ ] Prev/Next navigation and "Today" button work
- [ ] Month/Week view toggle works
- [ ] Clicking a day cell loads its events in the event list panel
- [ ] Events sorted by time then alphabetically in panel
- [ ] Clicking event row expands inline detail
- [ ] All 5 event detail types render correct fields
- [ ] Empty day state: "No events scheduled"
- [ ] Empty filter state: "No events match..." with reset link
- [ ] Loading skeleton screens for stats and calendar
- [ ] Error state with retry button
- [ ] Mobile responsive: list view, full-width cards
