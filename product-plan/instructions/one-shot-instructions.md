# Trading Squad — Complete Implementation Instructions

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
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations


---

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with the Obsidian Forge design system tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Key design rules:**
- Background: `bg-zinc-950` globally, `bg-zinc-900` for cards, `bg-zinc-800` for borders
- Primary accent: `pink-600` (#db2777) for buttons, active states, focus rings
- Secondary accent: `emerald` for positive/success indicators
- All numeric/trading data uses `font-mono` (JetBrains Mono)
- Minimum font size: `text-xs` (12px) — never smaller
- Focus rings: 2px `pink-600` outline with 4px offset on `focus-visible`

### 2. Data Model Types

Create types/interfaces for the core entities:

See `product-plan/data-model/types.ts` for the full type definitions.
See `product-plan/data-model/README.md` for entity relationships.

Key entities to define:
- `User` — authenticated user with role (Trader, Assistant, Viewer)
- `Portfolio` — named collection of positions and cash balances
- `Broker` — connected trading platform (IB, Binance) with credentials and status
- `Instrument` — tradable asset with ticker, exchange, and price data
- `Position` — ownership of instrument within portfolio with cost basis
- `CashBalance` — available cash per portfolio/broker/currency
- `Order` — buy/sell request with 12-state lifecycle
- `OrderEvent` — immutable state change record for audit trail
- `Trade` — executed transaction record
- `CostLot` / `LotMatch` — FIFO cost basis and tax tracking
- `Recommendation` — AI-generated trade suggestion
- `Strategy` — trading strategy configuration
- `JournalEntry` — post-trade reflection with process scores
- `Dividend` — taxable income event from positions
- `ExchangeRate` — daily CNB exchange rate for CZK conversion
- `Alert` — notification triggered by various conditions
- `ReconciliationLog` — daily broker-to-database reconciliation record

### 3. Routing Structure

Create routes for all sections:

| Route | Section |
|-------|---------|
| `/` | Dashboard (Trading Core) |
| `/orders` | Orders (Trading Core) |
| `/alerts` | Alerts |
| `/calendar` | Trading Calendar |
| `/portfolios` | Portfolio Overview |
| `/portfolios/:id` | Portfolio Detail |
| `/market-data` | Market Data Overview |
| `/market-data/sources/:id` | Source Detail |
| `/market-data/corporate-actions` | Corporate Actions |
| `/market-data/quality` | Data Quality |
| `/market-analysis` | Market Intelligence |
| `/strategies` | Strategy List |
| `/strategies/compare` | Strategy Comparison |
| `/strategies/:id` | Strategy Detail |
| `/journal` | Trade Journal Dashboard |
| `/journal/entries` | Journal Entries |
| `/journal/analytics` | Journal Analytics |
| `/journal/behavioral` | Behavioral Patterns |
| `/journal/weekly` | Weekly Review |
| `/settings` | Settings Overview |
| `/settings/:category` | Settings Category Detail |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with sidebar + content area
- `MainNav.tsx` — Navigation with grouped collapsible sections
- `UserMenu.tsx` — User menu with avatar and dropdown
- `CommandPalette.tsx` — Cmd+K search overlay
- `OrderPanel.tsx` — Slide-over order entry panel (480px, right-aligned)
- `ShellWrapper.tsx` — Top-level wrapper with providers
- `SystemBanner.tsx` — Persistent alert banners
- `ToastContainer.tsx` — Toast notification container
- `EmergencyCloseModal.tsx` — "Close All Positions" confirmation

See `product-plan/shell/README.md` for the full shell specification.

**Wire Up Navigation:**

Navigation groups:
- **Overview:** Dashboard, Alerts
- **Trading:** Orders, Calendar, Portfolios, Market Data (+ Data Quality, Corporate Actions)
- **Intelligence:** Market Analysis, Strategies (+ Comparison)
- **Review:** Trade Journal (+ Entries, Analytics, Behavioral, Weekly Review)
- **System:** Settings, Light/Dark toggle

Active nav item styling: `pink-600` left border + `pink-600/10` background + `pink-400` text

**User Menu:**
- User name and email
- Avatar with initials (optional image)
- Dropdown with Profile, Settings, Logout

**Responsive Behavior:**
- Desktop (1024px+): Sidebar visible (220–400px, resizable), content fills rest
- Tablet (768–1023px): Sidebar collapses to 64px icons only, expands on hover
- Mobile (<768px): Sidebar hidden, hamburger in top bar opens overlay

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions and entity relationships
- `product-plan/shell/README.md` — Shell design intent and specification
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (Google Fonts loaded, CSS custom properties applied)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with sidebar navigation
- [ ] Navigation links to correct routes
- [ ] Active nav item shows pink-600 styling
- [ ] Collapsible nav groups work
- [ ] Command palette opens with Cmd+K
- [ ] User menu shows user info
- [ ] Toast notification system works
- [ ] Responsive on mobile (hamburger menu)
- [ ] Dark mode by default (zinc-950 backgrounds)

---

# Milestone 2: Trading Core

## Goal

Implement the Trading Core — the command center for order execution and portfolio monitoring. This includes the dashboard, orders management, order entry form, and approval workflow.

## Overview

Trading Core provides a trading-focused dashboard showing real-time portfolio health and pending actions, a tab-based orders screen for managing the full order lifecycle (entry, approval, tracking, history), and the order entry form rendered inside the shell's global slide-over panel.

**Key Functionality:**
- Real-time portfolio dashboard (value, day P&L, cash, pending approvals)
- Three-tab orders management (Pending Approval, Open Orders, Order History)
- Order entry form with Market/Limit/Stop/Advanced order types and bracket orders
- Order approval workflow with risk analysis and 15-minute countdown timer
- Full 12-state order lifecycle with color-coded status badges
- Event sourcing timeline for complete order audit trail

## Recommended Approach: Test-Driven Development

Before implementing, write tests first based on the test specifications.

See `product-plan/sections/trading-core/tests.md` for detailed test-writing instructions.

## What to Implement

### Screen 1: Dashboard (`/`)

Stat cards in a 5-column responsive grid (5 desktop, 3 tablet, 1 mobile):
- Portfolio Value (monospace, icon: `trending-up`)
- Day P&L (green if positive, red if negative, monospace)
- Cash Available (monospace)
- Pending Approvals (with count badge, links to Orders tab)
- Open Orders (count)

Recent fills/activity list (last 5 events):
- Each row: symbol (monospace), side badge (BUY=emerald, SELL=red), amount, timestamp (relative)
- Click row navigates to order detail

Empty state (no broker connected): icon + "Welcome to Trading Squad! Connect your broker to get started." + "Connect Broker" CTA

Real-time updates: portfolio value and P&L flash green/red on change (300ms animation)

Loading states: skeleton screens (not spinners)

### Screen 2: Orders (`/orders`)

Three-tab interface: Pending Approval | Open Orders | Order History

**Pending Approval tab:**
- Sortable table: instrument (symbol + name), side badge, order type, quantity (monospace), limit price (monospace), risk % (color-coded: green<1%, yellow 1-5%, red>5%), time remaining (countdown, red+pulse <5min), actions
- Click row to open Approval Card
- Empty state: "No pending approvals. All clear!" + "View All Orders" link

**Open Orders tab:**
- Sortable live-updating table: order ID (monospace), instrument, side badge, type, quantity (monospace), price (monospace), status badge, broker badge (IB=blue, Binance=amber), TIF, created (monospace)
- Row actions: Cancel button, Amend button (opens order panel pre-filled)
- Bracket orders: collapsible group row — parent on top, child legs indented with connector line
- Empty state: "No open orders." + "Create Order" CTA

**Order History tab:**
- Filterable table: date range picker, instrument search, status filter dropdown
- Same columns as open orders + fill price column
- Expandable rows: event sourcing timeline (status badges + timestamps + messages)
- Pagination: 50 rows per page

**All tabs:**
- Default sort: Created descending
- All columns sortable (click header, sort indicator arrows)
- Column: broker badge (IB in blue `bg-blue-500/10 text-blue-400`, Binance in amber `bg-amber-500/10 text-amber-400`)

### Screen 3: Order Entry Form (inside shell's slide-over panel)

Render form content inside the 480px right panel. The panel chrome (header, minimize, close) is provided by the shell.

**BUY/SELL Toggle:** Large buttons — BUY in emerald, SELL in red. Default: BUY.

**Instrument search:** Autocomplete input with debounce (300ms). Shows company name + ticker in dropdown. After selection: show symbol preview card with current price and day change.

**Order type selector:** Tab-based (Market | Limit | Stop | Advanced)
- Market: quantity only
- Limit: quantity + limit price (pre-filled with current price)
- Stop: quantity + stop price
- Advanced: all fields + time-in-force selector (DAY/GTC/GTD/IOC/FOK) + bracket order toggle

**Bracket order (Advanced tab only):**
- "Attach Bracket" toggle
- Stop-loss price input (optional)
- Take-profit price input (optional)
- When both set: OCO behavior (when one fills, other cancels)

**Real-time order summary (always visible):**
- Estimated total (monospace)
- Commission (monospace)
- Portfolio impact % (green<1%, yellow 1-5%, red>5%)
- Risk level badge (Low/Medium/High)
- Available balance after order (monospace)
- Pre-trade warnings (wash sale, tax implications)

**Inline validation:** red border + error message on invalid fields, validate on blur.

**Submit:** Creates order; if risk >= 1% → status becomes `pending_approval` + warning toast; if risk < 1% → auto-approved → success toast.

### Screen 4: Approval Card (`/orders/pending/{id}`)

Centered card layout (max-width 800px), 4 sections:

1. **Order Details:** instrument (symbol + company name), BUY/SELL badge, quantity, limit price, estimated total
2. **Risk Analysis:** portfolio impact % (red if >5%), position size %, cash balance impact, warnings list
3. **Market Context:** current price, day change (green/red), 52-week range, recent volatility
4. **AI Recommendation** (if order from recommendation): confidence score (circular badge), reasoning text, target prices (entry/profit/stop)

**Actions:** Approve button (emerald, full-width on mobile) + Reject button (red, with optional reason textarea)

**Countdown timer:** 15-minute countdown from `approvalContext.expiresAt` — red + pulse animation when <5min; auto-reject on expiry with error toast.

### Order Status Badges (12 states)

| Status | Label | Tailwind Classes |
|--------|-------|-----------------|
| `draft` | DRAFT | `bg-zinc-800 text-zinc-400` |
| `pending_approval` | PENDING APPROVAL | `bg-amber-500/10 text-amber-400 border border-amber-500/30` |
| `approved` | APPROVED | `bg-blue-500/10 text-blue-400 border border-blue-500/30` |
| `submitted` | SUBMITTED | `bg-blue-500/10 text-blue-400` |
| `acknowledged` | ACKNOWLEDGED | `bg-blue-500/10 text-blue-400` |
| `partially_filled` | PARTIALLY FILLED | `bg-teal-500/10 text-teal-400 border border-teal-500/30` |
| `filled` | FILLED | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/30` |
| `cancelled` | CANCELLED | `bg-zinc-800 text-zinc-500` |
| `rejected` | REJECTED | `bg-red-500/10 text-red-400 border border-red-500/30` |
| `expired` | EXPIRED | `bg-zinc-800 text-zinc-500` |
| `amended` | AMENDED | `bg-blue-500/10 text-blue-400` |
| `failed` | FAILED | `bg-red-500/10 text-red-400 border border-red-500/30` |

## Files to Reference

- `product-plan/sections/trading-core/README.md` — Feature overview and design intent
- `product-plan/sections/trading-core/tests.md` — Test-writing instructions
- `product-plan/sections/trading-core/sample-data.json` — Sample data
- `product-plan/sections/trading-core/dashboard-light.png` — Dashboard visual reference
- `product-plan/sections/trading-core/orders-light.png` — Orders screen visual reference
- `product-plan/sections/trading-core/neworder-light.png` — Order entry visual reference
- `product-plan/sections/trading-core/approval-light.png` — Approval card visual reference

## Expected User Flows

### Flow 1: Create and Submit an Order

1. User clicks "Create Order" or Cmd+K → "New Order"
2. Shell opens the 480px slide-over order panel from the right
3. User selects BUY, searches for "AAPL", selects Apple Inc.
4. Symbol preview shows current price $185.50, +$2.30 (+1.26%)
5. User selects "Limit" tab, enters quantity 10, limit price 184.00
6. Order summary updates: Estimated total $1,840.00, Portfolio impact 3.89% (amber)
7. User clicks "Submit Order"
8. **Outcome:** If risk >= 1%: order status `pending_approval`, warning toast "Order pending approval — requires review"; if risk < 1%: `approved` → `submitted`, success toast "Order submitted to IB"

### Flow 2: Review and Approve a Pending Order

1. Dashboard shows "2 Pending Approvals" card with pink badge
2. User clicks the card to navigate to Orders screen, Pending Approval tab
3. User sees AAPL BUY 10 with Risk 3.89% (amber), countdown timer 14:23 remaining
4. User clicks the row to open the Approval Card
5. Card shows: Order Details, Risk Analysis (3.89% portfolio impact), Market Context (AAPL $185.50), AI Recommendation (82% confidence, reasoning)
6. User clicks green "Approve" button
7. **Outcome:** Toast "Order approved and submitted to broker", order moves to Open Orders tab with status `submitted`

### Flow 3: View Order History with Event Timeline

1. User navigates to Orders → Order History tab
2. User sees AAPL BUY 20 FILLED at $182.48 in the table
3. User clicks the row to expand it
4. Event timeline shows: DRAFT → APPROVED (auto, risk 0.77%) → SUBMITTED → ACKNOWLEDGED → FILLED at $182.48
5. **Outcome:** Full audit trail visible with timestamps for every state transition

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Dashboard renders with real portfolio data and stat cards
- [ ] Dashboard real-time value changes flash green/red (300ms)
- [ ] Orders screen has working 3-tab interface
- [ ] All 12 order status badges render with correct colors
- [ ] Pending Approval tab shows countdown timers
- [ ] Order entry form submits and creates orders
- [ ] Bracket order toggle shows/hides stop-loss and take-profit fields
- [ ] Risk < 1% auto-approves; risk >= 1% goes to pending_approval
- [ ] Approval card shows all 4 sections with real data
- [ ] Approve/reject actions work and show toasts
- [ ] Order history tab filterable and shows event timeline on expand
- [ ] Amend order pre-fills the order panel
- [ ] Empty states display properly
- [ ] Matches the visual design (check screenshots)
- [ ] Responsive on mobile

---

# Milestone 3: Portfolio & Positions

## Goal

Implement Portfolio & Positions — consolidated view of all investment portfolios and their holdings.

## Overview

Provides an aggregated overview screen showing total net worth, combined equity curve, and allocation across all portfolios, with a portfolio list to drill into. The detail screen shows summary stats, equity curve, and tab-based navigation into Positions, Watchlists, Dividends, and Performance.

**Key Functionality:**
- Aggregated portfolio overview with total net worth and combined allocation chart
- Per-portfolio positions table with real-time prices, P&L, tax status, and FIFO lot details
- Watchlist management with price alerts
- Dividend income tracking with CZK amounts and DRIP indicators
- Benchmark performance comparison with attribution analysis
- Margin and buying power monitoring

## Recommended Approach: Test-Driven Development

See `product-plan/sections/portfolio-and-positions/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Portfolio Overview (`/portfolios`)

**Stat cards (4-column grid):** Total Net Worth, Total Day P&L, Total Cash Balance, Total Unrealized P&L — each with monospace value, semantic P&L colors, and change indicator.

**Combined equity curve:** Line chart (ECharts/Plotly) showing total portfolio value over time with period selector (1M, 3M, 6M, YTD, 1Y, ALL). Primary pink-600 line.

**Combined allocation chart:** Donut chart with toggle: "By Asset" / "By Broker" / "By Portfolio".

**Portfolios list table:** Name, total value (monospace), day P&L (monospace, semantic), day P&L %, positions count, cash balance — click row navigates to `/portfolios/{id}`.

Real-time value changes: green/red flash (300ms) on update.

Empty state: "Welcome to Trading Squad! Connect your broker to get started." + "Connect Broker" CTA.

### Screen 2: Portfolio Detail (`/portfolios/{id}`)

**Header stat cards:** Total Value, Day P&L, Unrealized P&L, Cash Balance, Margin Available (if applicable).

**Equity curve:** ECharts line chart for this portfolio with period selector.

**Tab bar:** Positions | Watchlists | Dividends | Performance

### Positions Tab (Default)

Sortable, filterable table:
- Symbol (text + company name subtitle)
- Broker badge (IB=blue, Binance=amber)
- Quantity (monospace, right-aligned)
- Avg Price (monospace, right-aligned)
- Current Price (monospace, live-updating, flash on change)
- Market Value (monospace)
- P&L $ (monospace, emerald if positive, red if negative)
- P&L % (monospace, semantic color)
- Weight % (monospace)
- Tax Status badge: "Tax-Exempt" (emerald) if >= 3 years held, "Taxable" (red) otherwise. Tooltip shows days held and exemption target date.
- Actions: Trade button, Close button

**Expandable rows:** Click row to expand:
- FIFO lots table: acquisition date, quantity, cost basis per lot, current value, unrealized P&L
- Tax details: acquisition date, days held, 3-year exemption date, cost basis method (FIFO)
- Quick actions: Trade (opens shell order panel BUY pre-filled), Close (opens panel SELL pre-filled for full quantity)

**Filters:** Symbol search, broker dropdown, asset type dropdown. "Clear filters" when active.

**Pagination:** 50 rows per page.

Empty state: "No positions yet. Create your first order to start building your portfolio." + "New Order" CTA (opens shell order panel).

### Watchlists Tab

**Dropdown selector:** Pick watchlist (e.g., "Tech Stocks", "Earnings This Week"). Actions: New Watchlist, Rename, Delete (with confirmation).

**Instruments table:**
- Symbol + company name
- Current Price (monospace, live-updating)
- Day Change $ (monospace, semantic color)
- Day Change % (monospace, semantic color)
- Notes (truncated, tooltip on hover)
- Alert Status (bell icon if alert set, with trigger price tooltip)
- Actions: Edit, Remove, Trade

**Quick-add row** at bottom: search input + notes + "Add" button.

**Price alerts per item:** upper/lower trigger prices. Bell icon shows alert is set.

Empty state (no watchlists): "Create a watchlist to track instruments you're interested in." + "New Watchlist" CTA.

### Dividends Tab

**Period selector:** Monthly | Quarterly | Annual + date range picker.

**Summary cards:** Total income (USD + CZK), Yield on Cost %, Current Yield %, Estimated Annual Income.

**Dividends history table:** Instrument, Ex-Date, Pay-Date, Amount Per Share (monospace), Quantity (monospace), Total USD (monospace), Total CZK (monospace), Withholding Tax (monospace), DRIP badge.

**Upcoming ex-dates section:** Next 30 days, sorted by ex-date ascending.

### Performance Tab

**Benchmark Comparison:**
- Benchmark selector: SPY, QQQ, or custom symbol
- Period selector: MTD, QTD, YTD, 1Y, 3Y, Since Inception
- Time-weighted returns chart: portfolio (pink-600) vs benchmark (zinc-400 dashed)
- Summary: Portfolio return %, Benchmark return %, Alpha % (emerald if positive, red if negative)
- Attribution table: instrument, contribution to return %, sorted by absolute contribution descending

**Margin & Buying Power** (if margin account):
- Stat cards: Margin Used, Margin Available, Margin Usage % (progress bar: green<30%, yellow 30-50%, red>50%), Buying Power, Margin Call Distance %

## Files to Reference

- `product-plan/sections/portfolio-and-positions/README.md` — Overview
- `product-plan/sections/portfolio-and-positions/tests.md` — Test instructions
- `product-plan/sections/portfolio-and-positions/overview-light.png` — Portfolio overview visual
- `product-plan/sections/portfolio-and-positions/detail-light.png` — Portfolio detail visual

## Expected User Flows

### Flow 1: View Portfolio and Drill Into Positions

1. User navigates to `/portfolios`
2. Sees total net worth "$60,081.89", day P&L "+$914.56 (+1.54%)"
3. Combined equity curve shows portfolio growth over selected period
4. Portfolio list shows "US Equities" $47,231.89 and "Crypto" $12,850.00
5. User clicks "US Equities" row
6. Navigates to `/portfolios/port-1`, Positions tab shown by default
7. Table shows all positions with live prices, P&L, and tax status badges
8. **Outcome:** User can see full position breakdown for the portfolio

### Flow 2: Expand Position to See FIFO Lots

1. User clicks on AAPL position row
2. Row expands showing FIFO lots table
3. Lot 1: Acquired 2022-01-15, 20 shares @ $182.48, value $3,710, P&L +$60.04
4. Tax details: 1,101 days held, Tax-Exempt on 2025-01-15 (shown as badge)
5. **Outcome:** User sees cost basis breakdown and tax status per lot

### Flow 3: Manage Watchlist

1. User navigates to Portfolio detail → Watchlists tab
2. Selects "Tech Stocks" from dropdown
3. Table shows AAPL, MSFT, NVDA with live prices
4. User types "GOOGL" in the quick-add row, adds note "Watching for earnings"
5. Clicks "Add" button
6. **Outcome:** GOOGL appears in the watchlist, toast "Instrument added to watchlist" (green)

## Done When

- [ ] Tests written for key flows
- [ ] Portfolio overview renders with aggregated stats and equity curve
- [ ] Portfolio list table navigates to detail on row click
- [ ] Portfolio detail shows all 4 tabs
- [ ] Positions table loads with real data, sortable
- [ ] Tax Status badge shows correct state (Tax-Exempt / Taxable) based on holding period
- [ ] Position rows expand to show FIFO lots
- [ ] Trade/Close buttons open shell order panel pre-filled correctly
- [ ] Watchlist dropdown loads watchlists
- [ ] Dividends tab shows income summary and history
- [ ] Performance tab shows benchmark comparison chart
- [ ] Real-time price updates flash green/red
- [ ] Empty states display correctly
- [ ] Responsive on mobile

---

# Milestone 4: Market Data

## Goal

Implement Market Data — the operational control center for the platform's data pipeline.

## Overview

Market Data provides a health overview of all connected data sources (Yahoo Finance, Interactive Brokers, Finnhub, Binance), lets users manage instrument subscriptions grouped by source, trigger backfills and force-refreshes, monitor data quality metrics, and review a corporate actions audit log.

**Key Functionality:**
- Pipeline health overview with 4 data source vendor cards
- Source detail with instrument management, fetch history, and quality metrics
- Data quality monitoring dashboard with outlier review and bulk acknowledge
- Corporate actions audit log with re-adjustment capability
- Real-time status updates via WebSocket or polling

## Recommended Approach: Test-Driven Development

See `product-plan/sections/market-data/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Overview (`/market-data`)

**Stat cards (4-column):**
- Total Tracked Instruments (database icon)
- Active Data Sources (e.g., "3 / 4", server icon)
- Data Freshness (percentage of instruments with data < 1h old, schedule icon)
- Quality Alerts count (warning icon, links to `/market-data/quality`)

**Data Source Cards** (4 vendors, 4-column grid on desktop, 2-column tablet):
Each card shows:
- Source name + icon (Yahoo Finance, Interactive Brokers, Finnhub, Binance)
- Connection status dot: green=connected, amber=degraded, red=disconnected
- Status label: "Connected" / "Degraded" / "Disconnected" (matching color)
- Last successful fetch (relative time, absolute in tooltip)
- Error rate last 24h (% with color: green<1%, yellow 1-5%, red>5%)
- Tracked instruments count
- Next scheduled fetch timestamp
- Real-time capability badge: "Real-time" (emerald) for IB/Binance, "Scheduled" (zinc) for Yahoo/Finnhub
- Click card navigates to `/market-data/sources/{sourceId}`

**Recent Corporate Actions** (compact list, last 5):
- Instrument, type badge (Split=blue, Dividend=emerald, Ticker Change=amber), date, status
- "View All" link → `/market-data/corporate-actions`
- Empty: "No corporate actions detected recently."

**Recent Data Quality Alerts** (compact list, last 5):
- Instrument, alert type, severity badge, timestamp
- "View All" link → `/market-data/quality`
- Empty: "All data quality checks passing."

Real-time: source status and quality alerts update live.
Skeleton loading states.
Empty state (no sources): "No data sources configured." + "Configure Sources" CTA → Settings.

### Screen 2: Source Detail (`/market-data/sources/{sourceId}`)

**Header:** Source name, large connection status indicator, source description, "Force Refresh All" button (secondary).

**Configuration card:** Fetch schedule (human-readable cron, e.g., "Daily at 23:00 EST"), supported intervals, rate limits.

**Tab bar:** Instruments | Fetch History | Quality

#### Instruments Tab

Sortable table (50 rows per page):
- Symbol + company name
- Asset Type badge (Stock/Crypto)
- Tracked Intervals (small badges: 1d, 1h, 5m, 1m)
- Coverage Start (monospace date)
- Coverage End (monospace date)
- Data Points (monospace count)
- Gaps (monospace, red if > 0, emerald "0" otherwise)
- Last Fetched (relative, amber if > 1h stale, red if > 24h)
- Freshness dot (green=fresh, amber=stale, red=very stale)
- Actions: Backfill, Refresh, Remove buttons

**Add Instrument** button → modal with instrument search, interval checkboxes (1d/1h/5m/1m, default 1d), optional backfill date range, "Subscribe" button.

**Remove:** confirmation modal — "Stop tracking {symbol} from {source}? Historical data will be retained."

**Backfill:** popover/modal with date range picker, interval selector, priority (Normal/High), estimated duration, "Start Backfill" button.

**Refresh:** immediate fetch, loading spinner on row, toast on completion.

Filters: symbol search, asset type dropdown, freshness filter.

#### Fetch History Tab

Active backfill tasks at top (if any): progress bar, task ID, instrument, estimated time, "Cancel".

Timeline of last 100 fetch operations:
- Timestamp (monospace)
- Operation type badge: Scheduled (zinc), Manual (primary), Backfill (info/blue), Retry (warning/amber)
- Instruments affected (count)
- Data points fetched (monospace)
- Duration (monospace, e.g., "2.3s")
- Status badge: Success (emerald), Partial (amber), Failed (red)
- Error message (red inline for failed)
- "Retry" button on failed entries

Filters: status filter, date range.

#### Quality Tab

Per-instrument quality metrics:
- Symbol
- OHLCV Validity % (green>99%, yellow 95-99%, red<95%)
- Outliers Detected (count, "Review" link if > 0)
- Gaps Filled count
- Last Validated (timestamp)
- Quality Score (composite %, green>95%, yellow 80-95%, red<80%)
- Status badge: Healthy (emerald), Warning (amber), Critical (red)

Outlier review: expandable — flagged data points with date, expected range, actual value, Acknowledge/Dismiss actions.
Bulk acknowledge button.

### Screen 3: Corporate Actions (`/market-data/corporate-actions`)

Sortable audit log table (50 per page):
- Detection Date (monospace)
- Instrument (symbol + company name)
- Action Type badge: Split (blue), Dividend (emerald), Ticker Change (amber)
- Action Date (monospace)
- Details (split ratio, dividend amount, old→new ticker)
- Source badge (Yahoo, IB, etc.)
- Adjustment Status badge: Adjusted (emerald), Pending (amber), Failed (red), Not Required (zinc)
- Actions: "Re-adjust" on Failed, "View Details" expandable

Expandable row: full details, affected positions, adjustment history.
Re-adjust: confirmation modal → triggers recalculation, toast on completion.

Filters: instrument search, action type dropdown, status dropdown, date range.

### Screen 4: Data Quality (`/market-data/quality`)

**Stat cards:** Overall Quality Score, Instruments with Warnings, Outliers Pending Review, Gaps Filled (last 30 days).

**Quality alerts table:**
- Instrument, Source badge, Alert Type badge (Outlier=red, Gap Filled=amber, OHLCV Invalid=red, Stale Data=amber), Severity badge (Critical=red, Warning=amber, Info=blue), Detected At (monospace), Details text, Acknowledged (checkbox/badge)
- Actions: Acknowledge, View Data (links to source detail quality tab)

Multi-select checkboxes with "Acknowledge Selected" bulk action.
Default sort: Detected At descending, unacknowledged first.

## Files to Reference

- `product-plan/sections/market-data/README.md`
- `product-plan/sections/market-data/tests.md`
- `product-plan/sections/market-data/overview-light.png`
- `product-plan/sections/market-data/sourcedetail-light.png`
- `product-plan/sections/market-data/corporateactions-light.png`
- `product-plan/sections/market-data/dataquality-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Overview shows 4 source cards with connection status dots
- [ ] Source detail has 3-tab interface (Instruments, Fetch History, Quality)
- [ ] Add Instrument modal works with search and interval selection
- [ ] Backfill modal queues task and shows progress indicator
- [ ] Refresh action triggers immediate fetch with loading state
- [ ] Corporate actions table with expandable rows
- [ ] Re-adjust action triggers recalculation
- [ ] Data quality table with bulk acknowledge
- [ ] Real-time status updates (polling or WebSocket)
- [ ] Empty states display correctly
- [ ] Responsive on mobile

---

# Milestone 5: Market Intelligence

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

---

# Milestone 6: Strategy Engine

## Goal

Implement the Strategy Engine — hub for building, testing, and evaluating trading strategies.

## Overview

Provides a strategy library for managing configured strategies (trend following, mean reversion, composite master-slave), a backtesting workspace with realistic execution costs, walk-forward optimization to prevent overfitting, and side-by-side strategy comparison with benchmark overlays.

**Key Functionality:**
- Strategy list card grid with key metrics and active/inactive toggle
- Strategy detail with Configuration, Backtest History, and Walk-Forward History tabs
- 7-step strategy creation/editing flow (full page, not modal)
- Backtest configuration modal and full results view with charts
- Walk-forward optimization configuration and results
- Strategy comparison view (2-4 strategies side by side)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/strategy-engine/tests.md` for test-writing instructions.

## What to Implement

### Screen 1: Strategy List (`/strategies`)

**Card grid** (2-col desktop, 1-col mobile). Each card shows:
- Strategy name (bold)
- Type badge: Trend Following (blue), Mean Reversion (amber), Composite (purple)
- Active/inactive toggle (active: pink-600 left border; inactive: dimmed)
- Instrument chips (first 3, "+N more" if many)
- Last backtest date
- Key metrics row (monospace): Sharpe, CAGR, Max Drawdown
- Schedule summary (e.g., "Daily at 09:35 ET")

Sort options: Name, Last Backtest, Sharpe Ratio, CAGR.
Filter by: type, active/inactive, instrument.
"New Strategy" button (primary, top-right).

Empty state: "No strategies configured yet." + "Create Strategy" CTA.

### Screen 2: Strategy Detail (`/strategies/{id}`)

3-tab layout: Configuration | Backtest History | Walk-Forward History

**Configuration tab:**
- Read-only config display with "Edit" button
- Entry strategy section: type, parameters as key-value grid
- Exit strategies: collapsible cards (Stop Loss, Take Profit, Trailing Stop, Break Even)
- Instruments: chip list (add/remove in edit mode)
- Position sizing: risk-per-trade %, max position %, volatility toggle
- Schedule: enabled toggle, frequency, time, timezone
- Composite visualization (for Composite type): diagram showing master → slave connections

**Backtest History tab:**
- Table: ID, date range, capital, Sharpe (monospace), CAGR (monospace), max drawdown (monospace), total trades, status badge, duration
- Click row → backtest results view
- "Run Backtest" button at top
- Running backtests: animated progress bar + estimated time

**Walk-Forward History tab:**
- Table: ID, date range, windows count, avg validation Sharpe, avg return, status, duration
- Click row → walk-forward results
- "Run Walk-Forward" button

### Screen 3: New/Edit Strategy (Full Page)

7-step flow with back/next navigation and step indicator at top:
1. **Basic Info:** name input, type selection cards (with icons and descriptions)
2. **Parameters:** dynamic form fields based on type, tooltips per parameter
3. **Exit Strategies:** toggle on/off each exit type, configure enabled ones. Composite: drag handles for priority ordering
4. **Instruments:** autocomplete search, removable chips
5. **Position Sizing:** risk-per-trade slider (0.5%-5%, default 1%), max position slider (5%-30%, default 10%), volatility toggle
6. **Schedule:** enable/disable, frequency (Daily/Interval), time picker, timezone selector
7. **Review & Save:** summary of all settings, "Save Strategy" button

Inline validation on each step before proceeding.
Edit mode: pre-fill fields, allow direct step navigation.

### Screen 4: Backtest Configuration (Modal)

Launched from strategy detail "Run Backtest":
- Date range with preset buttons (1Y, 2Y, 3Y, 5Y, Max)
- Initial capital (default $100,000)
- Execution model: Simple/Volume-Based/Spread-Based (radio)
- Data granularity: Daily/Hourly/Minute (radio, shows estimated duration)
- Commission % (default 0.1%)
- Slippage % (disabled when Volume-Based or Spread-Based selected)
- Indicator snapshots toggle (default off, storage warning)
- Benchmark checkboxes: Buy-and-Hold (always on), SPY, QQQ, BTC
- "Run Backtest" with estimated duration

### Screen 5: Backtest Results View

**Top:** executive summary card — PASS/FAIL/REVIEW badge (emerald/red/amber), test period, recommendation text.

**Stat cards row (6):** CAGR, Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor — each with benchmark comparison arrow (vs SPY) and semantic color.

**Anti-pattern warnings banner** (if detected): specific issue and recommendation.

**Charts (tabbed or scrollable):**
- Equity Curve: portfolio (pink-600) vs benchmarks (zinc-400 dashed), log scale toggle
- Drawdown: area chart, red fill below zero
- Monthly Returns Heatmap: grid month×year, green=positive, red=negative
- Rolling Sharpe: 12-month rolling Sharpe line chart
- Trade Distribution: histogram with bell curve overlay

**Benchmark Comparison table:** strategy vs each benchmark with alpha, beta, excess Sharpe, information ratio.

**Trade Log (paginated 50/page):** trade #, entry/exit dates, instrument, direction badge (LONG=blue/SHORT=red), quantity (monospace), entry price, exit price, P&L (semantic color), return %, holding days. Expandable rows for indicator snapshots.

### Screen 6: Walk-Forward Results View

**Summary:** aggregated validation Sharpe, return, total windows, overfitting risk badge (Low/Medium/High).

**Windows table:** train start, train end, validation start, validation end, best params (collapsed JSON), validation Sharpe, validation return.

**Parameter stability chart:** line chart showing how each optimal parameter varies across windows.

**Expandable window detail:** full metrics for each validation window.

### Screen 7: Strategy Comparison (`/strategies/compare`)

**Selection:** checkboxes on strategy list / backtest history, "Compare Selected" button (2-4 strategies).

**Comparison table:** metrics as rows, strategies as columns, best value in each row highlighted emerald.

**Overlaid equity curves:** normalized to 100, colored lines using chart palette (pink, emerald, sky, amber), legend.

**Benchmark overlay toggle** for SPY.

**Ranking summary:** ordered by Sharpe with rank badges (#1, #2, etc.).

## Files to Reference

- `product-plan/sections/strategy-engine/README.md`
- `product-plan/sections/strategy-engine/tests.md`
- `product-plan/sections/strategy-engine/strategy-list-light.png`
- `product-plan/sections/strategy-engine/strategy-detail-light.png`
- `product-plan/sections/strategy-engine/backtest-results-light.png`
- `product-plan/sections/strategy-engine/strategy-comparison-light.png`

## Done When

- [ ] Tests written and passing
- [ ] Strategy list card grid renders with metrics and active toggle
- [ ] Strategy detail 3-tab interface works
- [ ] 7-step create/edit form with validation
- [ ] Backtest configuration modal launches backtest
- [ ] Backtest results show all charts (equity curve, drawdown, heatmap, distribution)
- [ ] Monthly returns heatmap renders correctly
- [ ] Walk-forward results table and parameter stability chart
- [ ] Strategy comparison view with overlaid equity curves
- [ ] Status badges (QUEUED, RUNNING animated, COMPLETED, FAILED)
- [ ] Backtest status indicator (RUNNING shows animated progress)
- [ ] Empty states for strategy list, backtest history, walk-forward history
- [ ] Responsive on mobile (charts stack, tables scroll horizontally)

---

# Milestone 7: Trade Journal

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

---

# Milestone 8: Settings & Operations

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

---

# Milestone 9: Alerts

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

---

# Milestone 10: Trading Calendar

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
