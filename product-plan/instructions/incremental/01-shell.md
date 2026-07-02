# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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
