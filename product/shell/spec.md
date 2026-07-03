# Application Shell Specification

## Overview
The Trading Squad shell uses a sidebar-driven layout where all navigation chrome lives in the sidebar. The header is a lightweight functional bar inside the content area, visually disconnected from the sidebar. The design follows the Obsidian Forge dark-first aesthetic — zinc-950 backgrounds, pink-600 magenta accents, and the DM Sans + JetBrains Mono type system.

## Mandatory Specifications

Following specifications must be followed:
- [trading-squad-brand-manual.md](../inputs/design/trading-squad-brand-manual.md)
- [ux-strategy.md](../inputs/design/ux-strategy.md)
- [ux-specification.md](../inputs/design/ux-specification.md)
- [colors.md](../inputs/design/system/colors.md)
- [typography.md](../inputs/design/system/typography.md)

## Navigation Structure
- Dashboard → Trading Core (home/default view, portfolio summary, pending approvals)
- Alerts → Alerts (alert management, silences, routing, inhibition rules)
- Orders → Trading Core (order entry, order history, pending approvals)
- Calendar → Trading Calendar (earnings, economic releases, dividends, options expirations, IPOs)
- Portfolios → Portfolio & Positions (multi-portfolio overview, positions, watchlists, dividends, performance)
- Market Data → Market Data (pipeline health dashboard, data source overview)
  - Data Quality → Data quality monitoring and metrics
  - Corporate Actions → Corporate actions log and tracking
- Market Analysis → Market Intelligence (AI recommendations, sentiment, guru/whale tracking)
- Strategies → Strategy Engine (strategy list, backtesting, configuration)
  - Comparison → Side-by-side strategy comparison view
- Trade Journal → Trade Journal (dashboard with summary stats and recent entries)
  - Entries → Trade Journal entries list (Needs Review, All Entries, Starred tabs)
  - Analytics → Trade Journal analytics (Performance, Process Scores, Attribution sub-tabs)
  - Behavioral → Behavioral pattern detection and habit scores
  - Weekly Review → Weekly review with goals progress and focus areas
- Settings → Settings & Operations (broker gateways, data pipelines, preferences, tax)

## Navigation Groups
- **Overview:** Dashboard, Alerts
- **Trading:** Orders, Calendar, Portfolios, Market Data (collapsible, with sub-items: Data Quality, Corporate Actions)
- **Intelligence:** Market Analysis, Strategies (collapsible, with sub-item: Comparison)
- **Review:** Trade Journal (collapsible, with sub-items: Entries, Analytics, Behavioral, Weekly Review)
- **System:** Settings, Light/Dark Mode toggle (collapsible)

## Sidebar
All navigation chrome consolidated in the sidebar:
- **Logo:** The Formation icon + "Trading Squad" wordmark at top
- **Trading mode indicator:** Persistent Paper/Live pill directly beneath the logo (see Trading Mode Indicator)
- **Search trigger:** Click or Cmd+K opens command palette
- **Navigation:** Grouped nav items with collapsible groups (Trading, Intelligence, Review, System). Items with sub-pages (Market Data, Strategies, Trade Journal) show their children inline beneath the parent item.
- **Badge counts:** Pink badges on nav items (e.g., pending approvals on Orders, unread on Market Analysis)
- **Broker status:** Connection dots (green/amber/red) for IB and Binance in footer
- **Data freshness:** Market-data feed indicator in the footer (see Data Freshness)
- **Alerts:** Nav item in Overview group with badge count (same style as Orders/Market Analysis badges)
- **Theme toggle:** Sun/Moon nav item in System group — toggles dark/light mode on click
- **Density toggle:** Rows nav item in System group directly beneath Theme toggle — toggles Comfortable/Compact on click (see Content Density)
- **Emergency close:** "Close All Positions" button in sidebar footer, always visible. Opens Level 4 confirmation: modal with position type filter (intraday/swing/all), requires explicit confirmation (e.g., type "CLOSE ALL" to confirm). Red/destructive styling. Shows position count and estimated market impact before confirmation.
- **User menu:** Avatar with initials, name, email — dropdown opens upward with Profile, Settings, Logout. Dropdown follows menu accessibility: ARIA role="menu", aria-haspopup, aria-expanded, keyboard navigation with Arrow Up/Down, Esc to close, focus management (first item on open, trigger on close)

## Sidebar Resizing
Sidebar is resizable by dragging the right edge. Drag handle highlights pink-600/30 on hover.
- **Default width:** 280px
- **Minimum width:** 220px
- **Maximum width:** 400px

## Trading Mode Indicator (Paper / Live)
A persistent, unmistakable indicator of the active trading environment, rendered as a full-width pill directly beneath the logo. This is a safety-critical affordance — a user must never be unsure whether an order commits real money.
- **Paper:** blue pill (`blue-400/10` bg, `blue-400/40` border, blue text) with a flask icon and the label "Paper Trading"
- **Live:** rose pill (`rose-500/10` bg, `rose-500/50` border, rose text) with a broadcast icon and a pulsing dot; label "Live Trading"
- **Default:** `paper` when nothing is persisted — a session never silently starts in Live
- **Persistence:** stored in `localStorage` (`trading-mode`); survives navigation and reload
- **Collapsed sidebar (tablet):** shows the mode icon only (blue flask / rose broadcast), tinted to match
- **Order Panel inheritance:** the Order Panel header shows a matching PAPER/LIVE tag so the mode is visible at the point of order entry
- **Reduced motion:** the Live pulsing dot is suppressed under `prefers-reduced-motion`

## Content Density
A per-user Comfortable/Compact density setting for the content region, letting power traders tighten tables and cards for scanning without a rebuild. Rendered as a toggle nav item in the **System** group directly beneath the Light/Dark theme toggle, mirroring that item's behavior: a single row whose label/icon name the mode it will switch to (Comfortable active → "Compact" + `Rows2` icon; Compact active → "Comfortable" + `Rows3` icon). Collapses to an icon-only row on the tablet/collapsed sidebar.
- **Mechanism:** sets `data-density="comfortable" | "compact"` on the document root; Compact reduces Tailwind's `--spacing` unit within the content region only (`#main-content`), so padding/gaps/margins shrink while the nav chrome and type scale stay fixed
- **Default:** `comfortable`
- **Persistence:** stored in `localStorage` (`density`)

## Data Freshness
Streaming trading data must communicate how live and how recent it is — traders distrust numbers they cannot date. A reusable freshness indicator (status dot + label, wrapped in `aria-live="polite"`) is used in two places:
- **Global:** market-data feed status in the sidebar footer (e.g., "Live · real-time"); collapses to a dot-only indicator on the tablet sidebar
- **Per-surface:** placed on prominent live surfaces (e.g., beneath the Dashboard title) so each data region carries its own recency
- **States:** `live` (green pulsing dot), `delayed` (amber), `stale` (amber, dimmed), `disconnected` (red)
- **Relative time:** when given a timestamp, renders an auto-ticking "updated Ns ago"; the pulse is suppressed under `prefers-reduced-motion`

## Command Palette (Cmd+K)
Global search overlay triggered by Cmd+K / Ctrl+K, or by clicking the search bar in the sidebar.
- **Categories:** Navigation (pages), Instruments (symbols), Actions (new order, etc.)
- **Keyboard navigation:** Arrow keys to navigate, Enter to select, Escape to close
- **Fuzzy filtering:** Matches against label, description, and category
- **Accessibility:** ARIA role="dialog", aria-modal, focus trap (Tab cycles within palette), focus returns to trigger element on close

## Mobile Header
On mobile only (<768px): a 48px bar with a hamburger icon to open/close the sidebar overlay. Hidden on desktop — the sidebar is always visible.

## Layout Pattern
Sidebar contains all chrome. Content area is a scrollable region with 24px padding — no header bar on desktop. Page titles are rendered by each section's content, not by the shell. The sidebar and content area are visually independent — no shared borders or backgrounds between them. Skip navigation link: visually hidden anchor that appears on keyboard focus, jumps focus to the main content area. First element in the tab order. Shell integrates with browser history. Each navigation action pushes state to the browser history stack. Back/forward buttons navigate between previously visited sections. Shell provides an optional breadcrumb area at the top of the content region. Sections render breadcrumbs when navigating into sub-pages (e.g., Settings > Broker Connections > Edit IB). Breadcrumbs use Home icon + clickable parents, current page in zinc-500 (non-clickable).

## Responsive Behavior
- **Desktop (1024px+):** Sidebar visible and resizable (220px-400px). Content area fills remaining width.
- **Tablet (768px-1023px):** Sidebar collapses to 64px (icons only). Expands to full width on hover with 200ms width transition. Logo shows icon-only, search shows icon-only, nav shows icons with tooltips, footer shows minimal indicators. Content area adjusts.
- **Mobile (<768px):** Sidebar hidden. Hamburger icon in header opens sidebar as overlay with backdrop. Content is full-width.
- **Container queries:** cards, stat grids, and the slide-over Order Panel size to their own container width (Tailwind v4 `@container`), not just the viewport — a stat card rendered in the 480px Order Panel or beside the collapsed 64px sidebar reflows to a stacked layout regardless of screen width. Use `@container` breakpoints for component-level layout; reserve viewport breakpoints for the shell frame (sidebar/content split).

## Design Notes
- Typography: minimum font size is 12px (`text-xs` / `--font-size-xs`). No `text-[10px]`, `text-[11px]`, or `text-[9px]` classes
- Numeric data: all numbers in tables, prices, quantities, percentages, and live-updating values use tabular figures (`font-variant-numeric: tabular-nums`, via the `.tabular` utility) so digit width stays constant and values do not jitter on real-time updates. Monospace (JetBrains Mono) values are inherently tabular; DM Sans numerics must opt in.
- Active nav item: pink-600 left border + pink-600/10 background tint + pink-400 text
- Nav icons: lucide-react, 18px size, zinc-500 default / pink-400 active
- Nav item spacing: py-1.5 for tighter density. All interactive elements meet 44px minimum touch target on mobile (min-h-[44px] lg:min-h-0)
- Sidebar background: zinc-950 (matches --bg-primary), no right border (visually disconnected)
- Sidebar scroll: the nav uses a slim brand-magenta scrollbar (`.scrollbar-slim`) — thin, track-less thumb tinted with the primary accent at ~45% that brightens to full primary on hover (WebKit + Firefox)
- Header background: zinc-950 (same as content — seamless)
- Group labels: uppercase, zinc-500, 11px, letter-spacing wide, clickable chevron for collapsible groups
- Logo: "The Formation" icon from brand manual — 4 progressive bars with brand-defined colors (#2A2A2E, #3A3A3F, #6B6B70, gradient #ec4899→#db2777→#be185d). Per brand manual: minimum icon size 24px, use icon-only below 140px width.
- Favicon: Brand manual 32px favicon — 3-bar simplified Formation on #0D0D0F background with gradient accent bar. File: /public/favicon.svg
- ARIA: `aria-label="Main navigation"` on `<nav>`, `aria-current="page"` on active nav item, `aria-label="Sidebar"` on `<aside>`, `aria-expanded` on collapsible group toggles and mobile hamburger, `role="status"` on broker status indicators, `role="separator"` on resize handle
- Focus indicators: all interactive elements show a 2px pink-600 (#db2777) outline with 4px offset on keyboard focus (`focus-visible`). Mouse focus shows no outline
- Reduced motion: respect `prefers-reduced-motion` — disable sidebar slide transition, chevron rotation, and all decorative motion when user prefers reduced motion
- Command palette: backdrop fades in (150ms), palette scales from 95% to 100% (200ms ease-out). Reverse on close
- User menu dropdown: fade in (150ms ease-out). Reverse on close
- Sidebar mobile overlay: slide-in from left (300ms ease-in-out) — already implemented
- All animations disabled when prefers-reduced-motion is set
- Keyboard shortcuts planned for Phase 2 (Cmd+1 through Cmd+7)

## Toast Notifications
Shell provides a global toast notification container:
- Desktop: bottom-right, stacked
- Mobile: top-center, full-width
- Variants: success (green, 4s), error (red, 6s), warning (yellow, 5s), info (blue, 4s)
- Auto-dismiss with manual close button
- ARIA role="status" (success/info) or role="alert" (error/warning)
- Sections call shell's toast API to display notifications

## System Banners
Shell renders persistent banners at the top of the content area (above page content, below mobile header):
- Pending approvals: yellow banner with "You have N orders pending approval" + "Review" link
- Broker disconnected: red banner with "Broker connection lost. Attempting to reconnect..." + "Reconnect" button
- Session expiring: yellow banner with countdown timer + "Extend Session" button
- Dismissible (X button), reappears on next relevant event
- ARIA role="alert" for critical banners, role="status" for informational

## Order Panel

Shell provides a persistent slide-over order entry panel accessible from any page:
- **Trigger:** Contextual "Create Order" buttons (charts, positions, market analysis), Cmd+N keyboard shortcut (Phase 2), command palette "New Order" action, or navigation to /orders/create route
- **Width / placement:** Desktop (≥640px) — 480px right-aligned slide-over, full viewport height. Mobile (<640px) — a native bottom sheet: full-width, anchored to the bottom, rounded top with a grab handle, `max-h-[92dvh]`, so the primary action stays reachable in the thumb zone
- **Mode tag:** Header shows a PAPER/LIVE tag inherited from the Trading Mode Indicator
- **Backdrop:** Subtle dim overlay on main content when panel is open
- **Persistence:** Panel stays open across page navigation. User can minimize panel to collapse it to a 64px tab on the right edge (shows "Order" label + minimize/restore toggle). Minimized state preserves form data.
- **Layout:** Main order form area with sidebar containing Order Summary (real-time calculations), Risk Indicator (portfolio impact %), and Available Balance
- **Order types:** Tab-based interface for Market, Limit, Stop, and Advanced orders. Tab selection dynamically shows/hides relevant form fields
- **Pre-fill:** When triggered from context (chart symbol, AI recommendation, position row), relevant fields auto-populate. When triggered via Cmd+N or command palette, symbol field is blank and focused
- **Close:** X button (clears form data), Esc key, or click backdrop. Closing prompts confirmation if form has unsaved changes
- **Animation:** Desktop — slide in from right (300ms ease-out); mobile — slide up from bottom. Backdrop fade in (150ms). Minimize/restore uses 200ms width transition
- **Accessibility:** ARIA role="dialog", aria-modal="true", aria-label="Order entry panel", focus trap when open, focus returns to trigger element on close, keyboard navigation within form fields and tabs
- **Route behavior:** Navigating to /orders/create opens the panel on the Orders page with no pre-fill

## Tab Order
1. Skip to main content link (visually hidden, appears on focus)
2. Trading mode indicator (Paper/Live pill)
3. Search trigger (sidebar)
4. Sidebar navigation items, top to bottom (System group includes the Theme and Density toggles)
5. Emergency close button
6. User menu
7. Main content area (sections manage their own tab order)

## Page Titles
Document title updates on navigation: "{Page Name} - Trading Squad". Shell provides a callback or context for sections to set the page title.

## Session Management
- Shell monitors JWT session expiry (8-hour session per architecture spec)
- 15 minutes before expiry: show yellow warning banner with countdown + "Extend Session" button
- On expiry: show modal "Session expired. Please log in again." with "Log In" redirect button
- Form state is preserved during session extension (no data loss)
