import { useMemo } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Database,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
  Bell,
  Calendar,
} from 'lucide-react'
import AppShell from './AppShell'
import { navigationGroups } from './MainNav'
import type { BrokerStatus } from './AppShell'
import type { CommandItem } from './CommandPalette'
import { getAllSectionIds, getSectionScreenDesigns } from '../lib/section-loader'
import { NewOrderForm } from '@/sections/trading-core/components/NewOrderForm'
import tradingCoreData from '../types'

interface ShellWrapperProps {
  children: React.ReactNode
}

const user = {
  name: 'Alex Morgan',
  email: 'alex@tradingsquad.io',
  avatarUrl: undefined,
}

const brokers: BrokerStatus[] = [
  { name: 'IB', status: 'connected' },
  { name: 'Binance', status: 'degraded' },
]

/**
 * Explicit mapping from nav hrefs to section screen designs.
 * Used when the screen design name doesn't exactly match the nav item label.
 * Format: navHref → { sectionId, screenName }
 */
const EXPLICIT_NAV_ROUTES: Record<string, { sectionId: string; screenName: string }> = {
  '/': { sectionId: 'trading-core', screenName: 'Dashboard' },
  '/alerts': { sectionId: 'alerts', screenName: 'Dashboard' },
  '/orders': { sectionId: 'trading-core', screenName: 'Orders' },
  '/calendar': { sectionId: 'trading-calendar', screenName: 'Dashboard' },
  '/portfolios': { sectionId: 'portfolio-and-positions', screenName: 'PortfolioOverview' },
  '/market-data': { sectionId: 'market-data', screenName: 'Overview' },
  '/market-data/quality': { sectionId: 'market-data', screenName: 'DataQuality' },
  '/market-data/corporate-actions': { sectionId: 'market-data', screenName: 'CorporateActions' },
  '/market-analysis': { sectionId: 'market-intelligence', screenName: 'MarketAnalysis' },
  '/strategies': { sectionId: 'strategy-engine', screenName: 'StrategyList' },
  '/strategies/comparison': { sectionId: 'strategy-engine', screenName: 'StrategyComparison' },
  '/trade-journal': { sectionId: 'trade-journal', screenName: 'Dashboard' },
  '/trade-journal/entries': { sectionId: 'trade-journal', screenName: 'Entries' },
  '/trade-journal/analytics': { sectionId: 'trade-journal', screenName: 'Analytics' },
  '/trade-journal/behavioral': { sectionId: 'trade-journal', screenName: 'Behavioral' },
  '/trade-journal/review': { sectionId: 'trade-journal', screenName: 'Review' },
  '/settings': { sectionId: 'settings-and-operations', screenName: 'SettingsOverview' },
}

/**
 * Build a map from nav hrefs → screen design fullscreen URLs.
 *
 * Uses explicit mappings first, then falls back to matching
 * screen design names against navigation item labels.
 */
function buildRouteMap(): Record<string, string> {
  const routes: Record<string, string> = {}

  // Apply explicit mappings first
  for (const [href, { sectionId, screenName }] of Object.entries(EXPLICIT_NAV_ROUTES)) {
    const screens = getSectionScreenDesigns(sectionId)
    if (screens.some((s) => s.name === screenName)) {
      routes[href] = `/sections/${sectionId}/screen-designs/${screenName}/fullscreen`
    }
  }

  // Fall back to name-matching for any remaining nav items
  for (const sectionId of getAllSectionIds()) {
    const screens = getSectionScreenDesigns(sectionId)

    for (const screen of screens) {
      for (const group of navigationGroups) {
        for (const item of group.items) {
          if (item.label === screen.name && !routes[item.href]) {
            routes[item.href] = `/sections/${sectionId}/screen-designs/${screen.name}/fullscreen`
          }
          if (item.children) {
            for (const child of item.children) {
              if (child.label === screen.name && !routes[child.href]) {
                routes[child.href] = `/sections/${sectionId}/screen-designs/${screen.name}/fullscreen`
              }
            }
          }
        }
      }
    }
  }

  return routes
}

export default function ShellWrapper({ children }: ShellWrapperProps) {
  const routeMap = useMemo(() => buildRouteMap(), [])

  // Determine which nav item is active based on current URL
  const activeHref = useMemo(() => {
    const path = window.location.pathname
    for (const [href, route] of Object.entries(routeMap)) {
      if (path === route) return href
    }
    return null
  }, [routeMap])

  // Enhance navigation groups with active state and availability
  const groups = useMemo(() => {
    return navigationGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        isActive: item.href === activeHref,
        children: item.children?.map((child) => ({
          ...child,
          isActive: child.href === activeHref,
        })),
      })),
    }))
  }, [activeHref])

  // Navigate to screen design route when a nav item is clicked
  const handleNavigate = (href: string) => {
    const route = routeMap[href]
    if (route) {
      window.location.href = route
    }
  }

  // Wire command palette navigation items to the same routes
  const commandItems: CommandItem[] = useMemo(() => [
    { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => handleNavigate('/') },
    { id: 'nav-alerts', label: 'Alerts', category: 'Navigation', icon: Bell, action: () => handleNavigate('/alerts') },
    { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => handleNavigate('/orders') },
    { id: 'nav-calendar', label: 'Calendar', category: 'Navigation', icon: Calendar, action: () => handleNavigate('/calendar') },
    { id: 'nav-portfolios', label: 'Portfolios', category: 'Navigation', icon: Wallet, action: () => handleNavigate('/portfolios') },
    { id: 'nav-market-data', label: 'Market Data', category: 'Navigation', icon: Database, action: () => handleNavigate('/market-data') },
    { id: 'nav-analysis', label: 'Market Analysis', category: 'Navigation', icon: Brain, action: () => handleNavigate('/market-analysis') },
    { id: 'nav-strategies', label: 'Strategies', category: 'Navigation', icon: FlaskConical, action: () => handleNavigate('/strategies') },
    { id: 'nav-journal', label: 'Trade Journal', category: 'Navigation', icon: BookOpen, action: () => handleNavigate('/trade-journal') },
    { id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: Settings, action: () => handleNavigate('/settings') },
    { id: 'act-new-order', label: 'New Order', description: 'Create a new order', category: 'Actions', icon: ShoppingCart, action: () => {} },
  ], [routeMap])

  // Derive page title from active nav item
  const pageTitle = useMemo(() => {
    if (!activeHref) return undefined
    for (const group of groups) {
      for (const item of group.items) {
        if (item.href === activeHref) return item.label
        if (item.children) {
          for (const child of item.children) {
            if (child.href === activeHref) return child.label
          }
        }
      }
    }
    return undefined
  }, [activeHref, groups])

  return (
    <AppShell
      navigationGroups={groups}
      user={user}
      brokers={brokers}
      commandItems={commandItems}
      orderPanelContent={
        <NewOrderForm
          instruments={tradingCoreData.instruments as any}
          portfolios={tradingCoreData.portfolios as any}
          brokers={tradingCoreData.brokers as any}
          onSubmit={(order) => console.log('Submit order:', order)}
          onClose={() => {
            document.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
            )
          }}
          onDirtyChange={(dirty) => console.log('Dirty state:', dirty)}
        />
      }
      pageTitle={pageTitle}
      onNavigate={handleNavigate}
      onLogout={() => console.log('Logout')}
      onEmergencyClose={(filter) => console.log('Emergency close:', filter)}
    >
      {children}
    </AppShell>
  )
}
