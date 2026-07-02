# Application Shell — Trading Squad

## Overview

The Trading Squad shell uses a sidebar-driven layout where all navigation chrome lives in the sidebar. The header is a lightweight functional bar inside the content area, visually disconnected from the sidebar. The design follows the Obsidian Forge dark-first aesthetic — zinc-950 backgrounds, pink-600 magenta accents, and the DM Sans + JetBrains Mono type system.

## Layout Structure

```
┌──────────────────────────────────────────────┐
│ [Sidebar 280px]  │  [Content Area — fills rest]  │
│                  │                               │
│  Logo            │  [breadcrumb (optional)]       │
│  Search          │  [system banners]             │
│  ─────────────   │                               │
│  Overview ▾      │  [page content rendered        │
│    Dashboard     │   by each section]            │
│    Alerts        │                               │
│  Trading ▾       │                               │
│    Orders        │                               │
│    Calendar      │                               │
│    Portfolios    │                               │
│    Market Data   │                               │
│  Intelligence ▾  │                               │
│    Market Anal.  │                               │
│    Strategies    │                               │
│  Review ▾        │                               │
│    Trade Journal │                               │
│  System ▾        │                               │
│    Settings      │                               │
│    Light/Dark    │                               │
│  ─────────────   │                               │
│  [Broker status] │                               │
│  [Close All Pos] │                               │
│  [User menu]     │                               │
└──────────────────────────────────────────────┘
                                    [Order Panel 480px slides in from right]
```

## Navigation Structure

| Nav Item | Route | Section |
|----------|-------|---------|
| Dashboard | `/` or `/dashboard` | Trading Core |
| Alerts | `/alerts` | Alerts |
| Orders | `/orders` | Trading Core |
| Calendar | `/calendar` | Trading Calendar |
| Portfolios | `/portfolios` | Portfolio & Positions |
| Market Data | `/market-data` | Market Data |
| — Data Quality | `/market-data/quality` | Market Data |
| — Corporate Actions | `/market-data/corporate-actions` | Market Data |
| Market Analysis | `/market-analysis` | Market Intelligence |
| Strategies | `/strategies` | Strategy Engine |
| — Comparison | `/strategies/compare` | Strategy Engine |
| Trade Journal | `/journal` | Trade Journal |
| — Entries | `/journal/entries` | Trade Journal |
| — Analytics | `/journal/analytics` | Trade Journal |
| — Behavioral | `/journal/behavioral` | Trade Journal |
| — Weekly Review | `/journal/weekly` | Trade Journal |
| Settings | `/settings` | Settings & Operations |

## Navigation Groups

- **Overview:** Dashboard, Alerts
- **Trading:** Orders, Calendar, Portfolios, Market Data (collapsible sub-items)
- **Intelligence:** Market Analysis, Strategies (collapsible sub-item: Comparison)
- **Review:** Trade Journal (collapsible sub-items: Entries, Analytics, Behavioral, Weekly Review)
- **System:** Settings, Light/Dark Mode toggle

## Sidebar Specifications

- **Default width:** 280px
- **Minimum width:** 220px (drag-resizable)
- **Maximum width:** 400px (drag-resizable)
- **Resize handle:** right edge of sidebar, highlights `pink-600/30` on hover
- **Background:** `zinc-950` (no right border — visually disconnected from content)

### Sidebar Elements (top to bottom)

1. **Logo:** "The Formation" icon (4 progressive bars with brand colors) + "Trading Squad" wordmark
2. **Search trigger:** "Search…" bar — click or Cmd+K/Ctrl+K opens command palette
3. **Navigation groups** (see above)
4. **Footer:**
   - Broker status dots (green/amber/red for IB and Binance)
   - "Close All Positions" button (red/destructive — requires Level 4 confirmation: type "CLOSE ALL")
   - User menu: avatar + name + email → dropdown with Profile, Settings, Logout

### Active Nav Item Styling

```
border-l-2 border-pink-600 bg-pink-600/10 text-pink-400
```

### Collapsed State (Tablet: 768px-1023px)

- Sidebar collapses to 64px (icons only)
- Expands to full width on hover with 200ms transition
- Icons show tooltips on hover

### Mobile (<768px)

- Sidebar hidden by default
- Hamburger icon in 48px top bar opens sidebar as overlay with backdrop

## Command Palette (Cmd+K)

Global search overlay:

- **Categories:** Navigation (pages), Instruments (ticker symbols), Actions (new order, etc.)
- **Keyboard navigation:** Arrow keys, Enter to select, Escape to close
- **Fuzzy filtering:** matches against label, description, category
- **ARIA:** `role="dialog"`, `aria-modal`, focus trap, focus returns to trigger on close

## Order Panel (Slide-Over)

Persistent 480px panel that slides in from the right:

- **Trigger:** "Create Order" buttons, command palette "New Order", `/orders/create` route
- **Persistence:** Stays open across page navigation
- **Minimize:** Collapses to 64px tab on right edge (shows "Order" label), preserves form data
- **Close:** X button (clears form), Esc key, click backdrop (prompts if unsaved changes)
- **Pre-fill:** Context-aware (from position, chart, or AI recommendation)
- **Animation:** Slide in from right (300ms ease-out)

## Toast Notifications

Global container (sections call shell's toast API, never render their own):

- **Desktop:** bottom-right, stacked
- **Mobile:** top-center, full-width
- **Variants:** success (green, 4s), error (red, 6s), warning (yellow, 5s), info (blue, 4s)
- **ARIA:** `role="status"` (success/info), `role="alert"` (error/warning)

## System Banners

Persistent banners at top of content area:

- **Pending approvals:** yellow — "You have N orders pending approval" + "Review" link
- **Broker disconnected:** red — "Broker connection lost. Attempting to reconnect..." + "Reconnect"
- **Session expiring:** yellow — countdown timer + "Extend Session"

## NiceGui Implementation Notes

```python
# Shell layout structure
with ui.row().classes('w-full h-screen overflow-hidden bg-zinc-950'):
    # Sidebar (fixed width, full height)
    with ui.column().classes('w-[280px] min-w-[220px] max-w-[400px] h-full bg-zinc-950 flex-shrink-0'):
        sidebar_content()

    # Content area (fills remaining width, scrollable)
    with ui.column().classes('flex-1 h-full overflow-y-auto p-6 gap-4'):
        breadcrumbs()       # optional, from section
        system_banners()    # from shell
        page_content()      # from section

    # Order panel (absolute positioned, slides from right)
    order_panel()

# Toast container (absolute positioned, bottom-right)
toast_container()
```

## Accessibility

- Skip navigation link (visually hidden, appears on focus): jumps to main content
- `aria-label="Main navigation"` on `<nav>`
- `aria-current="page"` on active nav item
- `aria-label="Sidebar"` on sidebar `<aside>`
- `aria-expanded` on collapsible groups and mobile hamburger
- Focus management: Command palette traps focus, returns to trigger on close
- Keyboard shortcuts: Cmd+K (command palette), Esc (closes overlays)
- Reduced motion: disable sidebar slide, chevron rotation, all decorative motion

## Session Management

- 8-hour JWT session
- 15 min before expiry: yellow warning banner with countdown + "Extend Session"
- On expiry: modal "Session expired" with "Log In" redirect
- Form state preserved during session extension
