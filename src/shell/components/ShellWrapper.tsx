import { useMemo } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  CandlestickChart,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
} from 'lucide-react'
import AppShell from './AppShell'
import { navigationGroups } from './MainNav'
import type { BrokerStatus } from './AppShell'
import type { CommandItem } from './CommandPalette'
import { getAllSectionIds, getSectionScreenDesigns } from '@/lib/section-loader'

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
 * Build a map from nav hrefs → screen design fullscreen URLs
 * by matching screen design names to navigation item labels.
 *
 * e.g. screen "Dashboard" in section "trading-core"
 *   → nav item "Dashboard" (href="/")
 *   → route "/sections/trading-core/screen-designs/Dashboard/fullscreen"
 */
function buildRouteMap(): Record<string, string> {
  const routes: Record<string, string> = {}

  for (const sectionId of getAllSectionIds()) {
    const screens = getSectionScreenDesigns(sectionId)

    for (const screen of screens) {
      // Match screen name to nav item label
      for (const group of navigationGroups) {
        for (const item of group.items) {
          if (item.label === screen.name && !routes[item.href]) {
            routes[item.href] = `/sections/${sectionId}/screen-designs/${screen.name}/fullscreen`
          }
        }
      }

      // Special case: "Dashboard" screen always maps to "/" even if
      // the nav item label doesn't exactly match
      if (screen.name === 'Dashboard' && !routes['/']) {
        routes['/'] = `/sections/${sectionId}/screen-designs/Dashboard/fullscreen`
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
    { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => handleNavigate('/orders') },
    { id: 'nav-positions', label: 'Positions', category: 'Navigation', icon: Wallet, action: () => handleNavigate('/positions') },
    { id: 'nav-charts', label: 'Charts', category: 'Navigation', icon: CandlestickChart, action: () => handleNavigate('/charts') },
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
      pageTitle={pageTitle}
      onNavigate={handleNavigate}
      onLogout={() => console.log('Logout')}
      onEmergencyClose={(filter) => console.log('Emergency close:', filter)}
    >
      {children}
    </AppShell>
  )
}
