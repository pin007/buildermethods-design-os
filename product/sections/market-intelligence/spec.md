# Market Intelligence Specification

## Overview
Market Intelligence is the AI-powered analysis hub that surfaces actionable trading opportunities from multiple signal sources. It provides a summary dashboard with key intelligence metrics, a unified recommendations feed combining Market Analyst opportunities and Trading Advisor strategy signals, a sentiment analysis dashboard with market-wide and per-instrument views, a guru/whale tracker showing notable institutional trades, and a research schedule monitor for managing automated analysis jobs. All recommendations feature transparent reasoning with confidence scores, technical indicators, and one-click order creation via the shell's slide-over panel.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../../inputs/design/ux-strategy.md)
- [ux-specification.md](../../inputs/design/ux-specification.md)
- [colors.md](../../inputs/design/system/colors.md)
- [typography.md](../../inputs/design/system/typography.md)

## Shell Integration

Market Intelligence MUST use all patterns provided by the application shell. No section-level chrome duplication.

### Breadcrumbs
All screens render breadcrumbs via the shell's `breadcrumb` prop. Breadcrumb paths use Home icon for root, clickable parents, current page in zinc-500 (non-clickable):
- Dashboard (default): `Home > Market Analysis`
- Recommendations tab: `Home > Market Analysis > Recommendations`
- Sentiment tab: `Home > Market Analysis > Sentiment`
- Guru Tracker tab: `Home > Market Analysis > Guru Tracker`
- Research Schedule tab: `Home > Market Analysis > Research Schedule`
- Recommendation Detail: `Home > Market Analysis > Recommendations > {Instrument}`
- Guru Tracker — Add Guru: `Home > Market Analysis > Guru Tracker > Add Guru`
- Guru Tracker — Edit Alert: `Home > Market Analysis > Guru Tracker > {Guru Name} > Edit Alert`
- Sentiment — Manage Sources: `Home > Market Analysis > Sentiment > Manage Sources`
- Sentiment — Edit Alert: `Home > Market Analysis > Sentiment > Alerts > {Instrument}`
- Research Schedule — Create Job: `Home > Market Analysis > Research Schedule > Create Job`
- Research Schedule — Edit Job: `Home > Market Analysis > Research Schedule > {Job Name} > Edit`

### Order Panel (Slide-Over)
Recommendation "Create Order" and guru tracker "Follow Trade" actions open the shell's Order Panel pre-filled with relevant data (instrument, action, target prices). The section MUST NOT render its own panel, backdrop, or slide-in animation — those are provided by the shell's `OrderPanel`.

### Toast Notifications
All user-facing notifications use the shell's toast API (`toastRef.current()`). No inline notification rendering within section components. Toast variants:
- Recommendation accepted: success (green, 4s)
- Recommendation dismissed: info (blue, 4s)
- On-demand analysis started: info (blue, 4s)
- On-demand analysis complete: success (green, 4s)
- Research job triggered: info (blue, 4s)
- Research job completed: success (green, 4s)
- Research job created: success (green, 4s)
- Research job updated: success (green, 4s)
- Research job deleted: info (blue, 4s)
- Research job failed: error (red, 6s)
- Guru added to tracking: success (green, 4s)
- Guru removed from tracking: info (blue, 4s)
- Guru alert configured: success (green, 4s)
- Sentiment alert triggered: warning (yellow, 5s)
- Sentiment alert saved: success (green, 4s)
- News source updated: success (green, 4s)
- Sector grouping saved: success (green, 4s)
- Analysis error: error (red, 6s)

### System Banners
New high-confidence recommendations (≥ 85%) use the shell's `SystemBanner` component (yellow variant with "Review" link navigating to the Recommendations tab). The section does NOT render its own persistent recommendation banners.

### Responsive Breakpoints
Follow the shell's 3-tier responsive system:
- Desktop (1024px+): Full layouts, multi-column grids, expandable cards with charts
- Tablet (768px-1023px): Condensed card layouts, collapsible detail sections, charts simplified
- Mobile (<768px): Single-column, stacked cards, chart hidden by default (tap to reveal)

### Focus Indicators
All interactive elements follow the shell's focus pattern: 2px pink-600 (#db2777) outline with 4px offset on `focus-visible`. Use `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` on form inputs. No `focus:outline-none` overrides.

### Typography
Minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes.

## User Flows

### Recommendations
- View intelligence dashboard: scan active recommendations count, market sentiment gauge, next scheduled research run, and top guru/whale move at a glance
- Browse unified recommendations: review AI-generated opportunities (Market Analyst) and strategy signals (Trading Advisor) in one feed — sorted by confidence, filterable by source, instrument, and action
- Drill into a recommendation: expand card to see full reasoning (technical signals, sentiment score, pattern detection), target prices (entry, profit, stop-loss), and an interactive chart with indicator overlays
- Accept a recommendation: click "Create Order" to open the shell's order panel pre-filled with symbol, action, type, and targets — modify if needed and submit
- Dismiss or snooze a recommendation: dismiss removes from list; snooze re-surfaces after 24 hours
- Analyze a specific ticker on-demand: use the search bar to request immediate AI analysis of any instrument — results appear as a recommendation card
- Handle recommendation expiry: active recommendations show countdown to expiry (24h for stocks, 12h for crypto), auto-expired with visual fade and EXPIRED badge

### Sentiment Management
- Monitor market sentiment: view aggregated sentiment (bullish/bearish/neutral) with breakdown by sector, asset class, and top movers — powered by FinBERT news analysis
- Pin instruments to sentiment watchlist: click "Watch" on any instrument in the top movers table to add it to a persistent watchlist panel — tracked instruments show live sentiment with alerts
- Create sentiment alerts: set threshold alerts per instrument (e.g., "Notify me if AAPL sentiment drops below 30") — configure direction (above/below), threshold value, and notification preference
- Manage sentiment alerts: view all active alerts in a collapsible alerts panel, edit thresholds, enable/disable individual alerts, delete alerts
- Manage news sources: open "Manage Sources" panel to enable/disable individual news feeds (e.g., Reuters, Bloomberg, CoinDesk, Reddit), view source health status (active/degraded/offline), and see article volume per source
- Adjust FinBERT sensitivity: configure sentiment scoring sensitivity — conservative (high confidence threshold), balanced (default), or aggressive (low threshold) — affects how articles are classified
- Configure sector groupings: customize which instruments map to which sectors for the sentiment-by-sector chart — add/remove instruments from sectors, create custom sector labels

### Guru/Whale Tracker Management
- Track guru/whale activity: browse a feed of notable trades by institutional investors, hedge funds, and crypto whales — with instrument, action, size, date, and a link to create a matching order
- Add a guru to tracking: click "Add Guru" to open a form — search by name (institutional investors, hedge funds) or paste a wallet address (crypto whales). Select type: Institutional, Hedge Fund, or Crypto Whale. Optionally set a display name and avatar
- Remove a guru from tracking: click the remove icon on a tracked guru in the guru summary row — confirmation dialog before removal. Removing a guru removes their trades from the feed and deletes associated alerts
- Enable/disable individual guru tracking: toggle switch per guru in the guru summary row — disabled gurus stay in the list but their trades are hidden from the feed
- Configure per-guru alerts: click "Alert" on a tracked guru to set notification rules — alert on any trade, alert only for specific instruments, alert only for trades above a dollar threshold. Multiple alerts per guru supported
- Manage guru alerts: view all active guru alerts in a collapsible alerts panel, edit alert rules, enable/disable, delete

### Research Schedule Management
- View all automated research jobs: see job cards with status, schedule, last/next run, and results summary
- Trigger ad-hoc research: select universe (full, watchlist) and confidence threshold, then trigger — results flow into recommendations feed
- Create a new research job: click "Create Job" to open a form — set job name, schedule type (daily at specific time, or interval in hours), timezone, instrument universe (full market, watchlist, or custom instrument list), confidence threshold, and maximum results to publish
- Edit an existing research job: click "Edit" on a job card to modify schedule parameters, universe, confidence threshold, or results limit. Changes take effect from the next scheduled run
- Delete a research job: click "Delete" on a job card — confirmation dialog with warning about losing job history. System-default jobs (Daily Stock Research, Crypto High Cap, Crypto Low Cap) can be disabled but not deleted
- View and manage job universe: within the edit form, add/remove individual instruments or switch between universe presets (Full, Watchlist, Custom). Custom universe shows a searchable instrument list with add/remove capability

## UI Requirements

### Intelligence Dashboard (Top Section)
- 4 stat cards in a responsive grid (4 columns desktop, 2 tablet, 1 mobile):
  1. **Active Recommendations:** count of actionable recommendations + "N new" badge since last visit. Icon: lightbulb. Links to Recommendations tab
  2. **Market Sentiment:** gauge showing bullish/bearish/neutral with numeric score (0-100). Icon: activity. Semantic coloring: green (bullish ≥ 65), yellow (neutral 35-64), red (bearish < 35). Links to Sentiment tab
  3. **Next Research Run:** countdown timer + job name (e.g., "Daily Stock Research in 2h 15m"). Icon: clock. Shows "Running..." with spinner when a job is active. Links to Research Schedule tab
  4. **Top Guru Move:** latest notable trade (e.g., "Berkshire +15% AAPL"). Icon: trending-up. Links to Guru Tracker tab
- Cards follow standard stat card anatomy: semantic icon, label (secondary text), large monospace value (h2), change indicator with semantic coloring
- Loading states use skeleton screens (not spinners) for all data-dependent components
- Real-time updates via WebSocket for recommendation count and sentiment score
- Empty state (no data yet): icon, "Intelligence engines are warming up. Your first analysis results will appear here shortly.", "Run Analysis" CTA

### Recommendations Tab
- **Unified feed:** cards from both Market Analyst (source badge: "AI Research" with brain icon) and Trading Advisor (source badge: "Strategy Signal" with flask icon)
- **On-demand analysis bar:** search input at the top of the tab — "Analyze any instrument..." with autocomplete (debounced 300ms). Analysis type toggle: Quick (technical only, <2s) or Full (technical + sentiment + correlation, <5s). Submit triggers immediate analysis; result appears at the top of the feed as a highlighted card with "On-Demand" badge
- **Card anatomy (collapsed):**
  - Instrument: symbol (monospace, bold) + company name
  - Action: BUY/SELL badge with semantic coloring (green/red)
  - Confidence score: circular badge with percentage — color-coded: green ≥ 75%, yellow 50-74%, gray < 50%
  - Source badge: "AI Research" or "Strategy Signal"
  - Key reasoning snippet: one-line summary (e.g., "Golden cross + positive sentiment (0.75)")
  - Expiry countdown: time remaining until recommendation expires
  - Created timestamp
- **Sort options:** confidence (default descending), date, instrument — toggle asc/desc via column header clicks
- **Filters:** source (AI Research / Strategy Signal / All), action (BUY / SELL / All), instrument search, confidence threshold slider (0-100, default 0)
- **Expandable card detail** (click card to expand, chevron rotates):
  - **Transparent reasoning:** bullet list with icon per signal type:
    - Chart icon (trending-up): technical signals — SMA crossover status, RSI value, MACD direction, momentum indicators
    - Newspaper icon (file-text): sentiment — FinBERT aggregate score with positive/negative/neutral breakdown, article count analyzed
    - Users icon (git-branch): portfolio correlation — correlation coefficient with current holdings, diversification assessment
  - **Scoring breakdown:** horizontal stacked bar showing technical (50%), sentiment (30%), diversification (20%) contribution to final score
  - **Target prices:** 3-column grid:
    - Entry price (recommended limit) with current price comparison
    - Take-profit target with +X% distance
    - Stop-loss level with -Y% distance
  - **Interactive chart:** candlestick chart with SMA 50/200 overlays, entry price line (dashed green), stop-loss line (dashed red), take-profit line (dashed blue). Chart palette follows brand manual. Height: 300px desktop, 200px tablet, hidden on mobile (tap "Show Chart" to reveal)
  - **Strategy context** (for Trading Advisor signals): strategy name, timeframe, position sizing recommendation
- **Actions per card:**
  - "Create Order" — primary CTA (pink-600 button), opens shell's order panel pre-filled with symbol, action, order type (limit), limit price (entry target), stop-loss, and take-profit
  - "Dismiss" — secondary action, removes from feed
  - "Snooze 24h" — secondary action, hides for 24 hours then re-surfaces
- **Recommendation states** (color-coded badges):
  - ACTIVE (blue) — actionable, within expiry window
  - ACCEPTED (green) — user created an order from this recommendation
  - DISMISSED (gray) — user dismissed
  - SNOOZED (yellow) — hidden, will re-appear
  - EXPIRED (gray, faded opacity) — past expiry window
- **Empty state:** lightbulb icon, "No recommendations available. Our AI is analyzing markets — check back soon.", "Run Analysis" CTA
- **Pagination:** 20 cards per page with "Load more" button (not traditional pagination — infinite scroll feel)

### Sentiment Tab
- **Market sentiment gauge:** large circular gauge (200px diameter desktop, 150px tablet/mobile) showing overall market sentiment. Scale: 0 (extreme bearish) to 100 (extreme bullish). Needle with current value. Color zones: red (0-34), yellow (35-64), green (65-100). Numeric score displayed in center (monospace, bold)
- **Sentiment by sector:** horizontal bar chart showing sentiment scores for sectors (Technology, Healthcare, Finance, Energy, Consumer, Industrial, Real Estate, Utilities). Bars color-coded: green (bullish), yellow (neutral), red (bearish). Sorted by score descending. Chart palette follows brand manual. "Edit Sectors" link opens sector grouping management panel
- **Sentiment by asset class:** side-by-side comparison cards for Stocks vs. Crypto — each showing aggregate sentiment score, trend arrow (up/down vs 24h ago), and article count
- **Top movers table:** instruments with largest sentiment changes in selected time range
  - Columns: instrument (symbol + name), sentiment score (0-10 scale, monospace), 24h change (green/red arrow + delta), article count, mini sparkline (7-day trend), "Watch" button (adds to sentiment watchlist)
  - Split into two sections: "Most Bullish" (top 5 positive changes) and "Most Bearish" (top 5 negative changes)
  - Sortable columns, click instrument to trigger on-demand analysis
- **Sentiment watchlist panel** (collapsible, above top movers table):
  - Horizontal list of pinned instruments showing: symbol, live sentiment score (color-coded), trend arrow, alert indicator (bell icon if alert configured)
  - Click instrument to scroll to its detail in top movers or trigger on-demand analysis
  - "Add" button to search and pin a new instrument
  - Remove button (x) per instrument to unpin
  - "Set Alert" button per instrument: opens inline form with direction (Above/Below), threshold value (0-100), and save/cancel buttons
- **Active alerts panel** (collapsible section, below watchlist):
  - Table of configured sentiment alerts: instrument, direction (above/below icon), threshold value, status (active/triggered/disabled toggle), last triggered timestamp
  - Edit alert: click to inline-edit threshold and direction
  - Delete alert: trash icon with confirmation
  - "Create Alert" button at top of panel
- **News feed:** scrollable list of recent headlines with:
  - Headline text (truncated to 2 lines)
  - Source name and timestamp
  - FinBERT sentiment badge: Positive (green), Negative (red), Neutral (gray) with confidence percentage
  - Instrument tags (if detected in article)
  - Click headline to expand summary
  - Source health indicator: colored dot next to source name (green=active, yellow=degraded, red=offline)
- **Manage Sources panel** (opened via "Manage Sources" button in the news feed header):
  - List of all configured news sources: name, type (news wire, social, blockchain), status badge (active/degraded/offline), article volume (last 24h count), enabled/disabled toggle
  - Source detail (expand): URL/feed endpoint, last fetch timestamp, error count (last 24h), average articles per day
  - Add source: form with name, type selector, feed URL. Validate feed connectivity on save
  - Remove source: trash icon with confirmation dialog
- **FinBERT sensitivity control** (gear icon in the sentiment gauge header):
  - Radio group: Conservative (high confidence threshold — fewer but more certain classifications), Balanced (default), Aggressive (low threshold — more classifications but lower confidence)
  - Current setting displayed as a subtle label below the gauge
  - Changing sensitivity shows a warning: "Changing sensitivity will affect future sentiment scores. Historical data is not recalculated."
- **Sector grouping management** (opened via "Edit Sectors" link on sector chart):
  - List of sectors with instrument count per sector
  - Click sector to expand and see member instruments
  - Add/remove instruments from a sector via search input within the expanded section
  - Create new custom sector: name input + instrument search to populate
  - Delete custom sector: trash icon (system-default sectors like Technology, Finance cannot be deleted, only customized)
  - Reorder sectors via drag handles (affects display order in the chart)
- **Time range filter:** 24h (default), 7d, 30d — pill-style toggle buttons at top of tab
- **Loading states:** skeleton screens for gauge, charts, table, and feed
- **Empty state:** activity icon, "Sentiment data is being collected. Results will appear after the first analysis run.", "Check Schedule" link

### Guru Tracker Tab
- **Notable trades feed:** card-based list of recent institutional/whale trades, reverse chronological
- **Card anatomy:**
  - Guru/fund name (bold) with type icon (building for institutional, landmark for hedge fund, bitcoin for crypto whale)
  - Instrument: symbol (monospace) + company name
  - Action badge: BUY (green), SELL (red), INCREASE (emerald), DECREASE (amber)
  - Trade size: share count + dollar value (monospace)
  - Date filed/detected
  - Change vs. previous holding: +/- percentage (e.g., "+15% position increase")
  - Source attribution: "SEC 13F Filing" or "On-Chain Analysis" badge (secondary text)
- **Filters:** investor type (Institutional / Hedge Fund / Crypto Whale / All), action (BUY / SELL / INCREASE / DECREASE / All), instrument search, tracked guru filter (select from guru summary row)
- **Sort:** by date (default descending), trade size, instrument
- **Action per card:** "Follow Trade" button (secondary variant) — opens shell's order panel pre-filled with instrument and matching action (BUY for BUY/INCREASE, SELL for SELL/DECREASE)
- **Guru summary row** (horizontally scrollable, above feed):
  - Tracked gurus displayed as compact chips: avatar/icon, name, recent trade count badge, enabled/disabled indicator (faded if disabled)
  - Click guru chip to filter feed by that guru (active filter shown with pink-600 border)
  - Each chip has a context menu (click ellipsis or right-click): Edit Alert, Enable/Disable, Remove
  - "Add Guru" button at the end of the row (+ icon)
- **Add Guru form** (modal dialog, opened via "Add Guru" button):
  - Search input: type name to search known institutional investors and hedge funds (autocomplete from database)
  - Wallet address input: for crypto whales, paste a blockchain address (ETH, BTC, SOL supported)
  - Type selector: Institutional / Hedge Fund / Crypto Whale (auto-detected from search, manual for wallet address)
  - Display name (optional): custom label for this guru (defaults to fund/investor name or truncated wallet address)
  - Initial alert toggle: "Alert me on any trade" checkbox (enabled by default)
  - "Add & Track" button (primary) / "Cancel" (secondary)
  - Validation: duplicate detection (warn if guru/address already tracked), wallet address format validation
- **Edit Guru** (inline from guru summary row context menu):
  - Edit display name
  - Change type (if misclassified)
  - Cannot edit underlying identifier (name or wallet address) — remove and re-add instead
- **Remove Guru** (from guru summary row context menu):
  - Confirmation dialog: "Remove {Guru Name} from tracking? This will remove all their trades from your feed and delete associated alerts."
  - "Remove" button (danger variant) / "Cancel" (secondary)
- **Per-guru alert configuration** (modal dialog, from chip context menu or "Set Alert" action):
  - Alert triggers (checkboxes, multiple allowed):
    - Any trade (default)
    - Specific instruments only: searchable instrument list to select which instruments trigger alerts
    - Trade size threshold: minimum dollar value to trigger (number input, e.g., "$1,000,000")
    - Action filter: BUY only, SELL only, or Any
  - Notification preference: in-app only (default), or in-app + email (future)
  - "Save Alert" (primary) / "Cancel" (secondary)
- **Alerts management panel** (collapsible section, below guru summary row):
  - Table of all guru alerts: guru name, trigger description, status (active/disabled toggle), last triggered timestamp, trigger count (total)
  - Inline edit: click row to expand and modify alert rules
  - Delete: trash icon with confirmation
- **Empty state (no gurus tracked):** users icon, "Start tracking institutional investors and crypto whales to see their notable trades.", "Add Your First Guru" CTA
- **Empty state (gurus tracked, no trades):** users icon, "No notable trades detected recently from your tracked gurus. Tracking data updates daily from SEC filings and on-chain analysis."
- **Pagination:** 20 cards per page with "Load more" button

### Research Schedule Tab
- **Job cards:** one card per scheduled research job, displayed in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- **Card anatomy:**
  - Job name (bold): e.g., "Daily Stock Research", "Crypto High Cap", "Crypto Low Cap"
  - Schedule description: e.g., "Daily at 06:00 ET", "Every 12 hours"
  - Status badge: Idle (gray), Running (blue with pulse animation), Error (red), Disabled (gray, faded)
  - Last run: timestamp + duration (e.g., "Today 06:00 ET, 12m 0s")
  - Next run: countdown timer (e.g., "in 5h 23m")
  - Results summary: "14 opportunities found, 10 published" (from last run)
  - Enabled/disabled toggle switch (top-right corner of card)
  - System badge: system-default jobs show a "System" badge indicating they cannot be deleted (only disabled or edited)
  - Action buttons row: "Run Now", "Edit", "Delete" (delete disabled for system jobs)
- **"Create Job" button** (top-right of tab, primary variant): opens the job creation form
- **Job creation/edit form** (modal dialog):
  - Job name: text input (required, max 50 characters)
  - Schedule type: radio group — "Daily at specific time" or "Interval (every N hours)"
  - Daily schedule fields (shown when "Daily" selected): time picker (HH:MM), timezone selector (dropdown with common trading timezones: America/New_York, UTC, Europe/Prague, Asia/Tokyo)
  - Interval schedule fields (shown when "Interval" selected): interval hours (number input, min 1, max 168, step 1)
  - Instrument universe: radio group — Full Market, Watchlist, or Custom
  - Custom universe panel (shown when "Custom" selected): searchable instrument list with add/remove capability. Shows selected instruments as removable chips. Search input with autocomplete (debounced 300ms). "Add" button to add from search, "x" on chip to remove
  - Confidence threshold: number input (range 1.0-10.0, step 0.5, default 7.0) with help text: "Only publish opportunities scoring above this threshold"
  - Maximum results: number input (min 1, max 50, default 10) with help text: "Maximum number of top opportunities to publish per run"
  - Enabled on creation: checkbox (default checked)
  - "Create Job" / "Save Changes" button (primary) / "Cancel" (secondary)
  - Validation: job name uniqueness, valid schedule parameters, at least 1 instrument in custom universe
- **Edit Job:** click "Edit" on a job card to open the creation form pre-filled with current values. All fields editable. For system-default jobs, the name field is read-only. Changes take effect from the next scheduled run. Shows a "Changes will apply from the next run" info message
- **Delete Job:** click "Delete" on a job card (only available for user-created jobs, disabled for system-default jobs):
  - Confirmation dialog: "Delete {Job Name}? This will permanently remove the job and its run history. Recommendations generated by past runs will remain in your feed."
  - "Delete" button (danger variant) / "Cancel" (secondary)
- **"Run Now" button** per card: opens a confirmation popover with:
  - Universe selector: radio buttons — Full (default), Watchlist, or Custom (uses job's configured custom universe if available)
  - Confidence threshold: number input (default: job's configured threshold, range 1-10, step 0.5)
  - "Start Research" button (primary) / "Cancel" (secondary)
- **Running state:** card background subtly pulses, status badge shows "Running" with animated spinner, elapsed time counter updates live. "Run Now" button disabled while job is running. "Cancel Run" link appears during execution
- **Job history** (collapsible section per card): table showing last 10 runs with columns: timestamp, duration, opportunities found, opportunities published, status badge (completed/failed/cancelled), trigger type badge (scheduled/manual). Click row to view opportunities from that run (navigates to Recommendations tab filtered by run)
- **Error state per job:** if last run failed, card shows a red border highlight with error summary. Expand history to see full error details. "Retry" button appears alongside "Run Now"
- **Empty state:** clock icon, "No research jobs configured yet. Create your first job to start automated market analysis.", "Create Research Job" CTA

## Configuration
- shell: true
