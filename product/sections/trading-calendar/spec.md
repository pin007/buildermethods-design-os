# Trading Calendar Specification

## Overview
Trading Calendar aggregates market-moving events into a unified calendar view. It displays earnings announcements, economic data releases (FOMC, NFP, CPI, GDP), dividend ex-dates, options expirations, and upcoming IPOs — helping traders plan positions around important dates and avoid surprises from scheduled events.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Architecture Source

Requirements sourced from [trading-calendar.md](../../inputs/architecture/components/trading-calendar.md).

## Shell Integration

Trading Calendar MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Breadcrumbs
All screens render breadcrumbs via the shell's `breadcrumb` prop:
- Calendar: `Home > Calendar`

### Toast Notifications
All user-facing notifications use the shell's toast API. Toast variants:
- Alert created: success (green, 4s)
- Alert removed: info (blue, 4s)

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full calendar grid, side detail panel, multi-column stat cards
- Tablet (768px–1023px): Calendar grid with condensed cells, detail panel below calendar
- Mobile (<768px): List view of events by date, full-width event detail cards

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`).

## User Flows
- View calendar with unified month/week toggle showing all event types color-coded by category
- Filter events by type (earnings, economic, dividend, options, IPO) using toggle chips
- Filter events by impact level (high, medium, low) for economic events
- Click an event to view full details in a side/bottom panel (analyst estimates, impact level, consensus values, etc.)
- View portfolio-relevant events highlighted with a distinct indicator (events for held positions)
- See upcoming portfolio events summary at the top — alerts for holdings reporting earnings, approaching ex-dividend dates, or nearing options expiration
- Navigate between months/weeks using prev/next controls and "Today" button

## UI Requirements

### Calendar Dashboard
Single-screen design combining stats, filters, calendar grid, and event list.

#### Stats Bar
Top row of summary stat cards:
- **This Week**: count of events this week, with breakdown by type
- **Portfolio Events**: count of events affecting held positions
- **High Impact**: count of high-impact economic events in the next 7 days
- **Upcoming Dividends**: total expected dividend income in the next 30 days

Stat cards follow standard anatomy: semantic icon, label (secondary text), large monospace value (h2), contextual sub-text.

#### Event Type Filters
Row of toggle chips below the stats bar — one per event type:
- **Earnings** (amber) — earnings announcement dates
- **Economic** (blue) — FOMC, NFP, CPI, GDP releases
- **Dividends** (emerald) — ex-dividend and payment dates
- **Options** (purple) — monthly/weekly expirations
- **IPOs** (pink) — upcoming IPO listings

Each chip shows a colored dot, label, and count of visible events. Clicking toggles the type on/off. All active by default. An additional "Portfolio Only" toggle filters to events affecting held positions.

#### Calendar View
- Month/Week toggle in the top-right corner of the calendar header
- Month view: 7-column grid (Mon–Sun), each day cell shows up to 3 event dots (color-coded) with overflow "+N more" indicator. Today highlighted with pink-600 ring. Days with portfolio events show a subtle background tint. Click a day to expand its event list in a below-calendar panel
- Week view: 7-column layout with more vertical space per day, showing event title snippets alongside dots. Time-based events (economic releases) show times
- Navigation: "< Prev" / "Next >" arrows with current month/week label centered. "Today" button resets to current date

#### Event List Panel
Below or beside the calendar (responsive):
- Shows events for the selected day (click a calendar cell) or the current day by default
- Events sorted by time (morning first), then alphabetically
- Each event row shows: color-coded type indicator, time (if applicable), title, instrument/ticker (if applicable), impact badge (high/medium/low for economic events), portfolio indicator (dot if in portfolio)
- Click an event row to expand inline detail

#### Event Detail (Expanded)
Inline expansion within the event list showing full event details based on type:

**Earnings Detail:**
- Company name, ticker, reporting date and timing (before/after market)
- Analyst estimates: EPS estimate vs prior, revenue estimate vs prior
- Confirmed/estimated status badge
- "In Portfolio" badge if held

**Economic Detail:**
- Indicator name, country flag, release date and time with timezone
- Impact level badge (high=red, medium=amber, low=gray)
- Consensus estimate, prior value, unit
- Description of the release

**Dividend Detail:**
- Company name, ticker
- Ex-dividend date, record date, payment date
- Dividend amount, yield %, frequency (quarterly/annual/etc.)
- "In Portfolio" badge with expected payment amount if held

**Options Detail:**
- Expiration date, type (monthly/weekly/quarterly)
- Exchange (CBOE, etc.)
- Affected open positions with current value and ITM/OTM status

**IPO Detail:**
- Company name, expected ticker, exchange
- Expected listing date, pricing range
- Shares offered, estimated valuation
- Lead underwriters, industry
- Status badge (upcoming/pricing/recent)

### States
- Loading: skeleton screens for stats, calendar cells, and event list
- Empty day: "No events scheduled" message in event list
- Empty filters: "No events match the selected filters. Try enabling more event types." with reset link
- Error: "Unable to load calendar events. Please try again." with retry button

## Configuration
- shell: true
