import { AppShell, navigationGroups } from 'trading-squad-ds'
import { LayoutDashboard, ShoppingCart, Bell, Brain } from 'lucide-react'

const user = { name: 'Alex Morgan', email: 'alex@tradingsquad.io' }

const brokers = [
  { name: 'IB', status: 'connected' as const },
  { name: 'Binance', status: 'degraded' as const },
]

const banners = [
  {
    id: 'pending-approvals',
    variant: 'approval' as const,
    message: 'You have 2 orders pending approval',
    actionLabel: 'Review',
    actionHref: '/orders',
  },
]

const commandItems = [
  { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => {} },
  { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => {} },
  { id: 'nav-alerts', label: 'Alerts', category: 'Navigation', icon: Bell, action: () => {} },
  { id: 'nav-analysis', label: 'Market Analysis', category: 'Navigation', icon: Brain, action: () => {} },
]

// Mark Dashboard active and add realistic badges, mirroring ShellPreview.
const groups = (navigationGroups as any[]).map((group) => ({
  ...group,
  items: group.items.map((item: any) => ({
    ...item,
    isActive: item.href === '/',
    badge: item.href === '/alerts' ? 3 : item.href === '/orders' ? 2 : item.href === '/market-analysis' ? 5 : undefined,
  })),
}))

function DashboardContent() {
  const cards = [
    { label: 'Net Liquidation', value: '$1,284,300', change: '+2.4% today' },
    { label: 'Day P&L', value: '+$30,120', change: '+2.4%' },
    { label: 'Open Positions', value: '14', change: '2 near stop' },
    { label: 'Margin Used', value: '42%', change: 'Watch' },
  ]
  return (
    <div className="p-6">
      <h1 className="mb-1 text-lg font-semibold text-foreground">Trading Dashboard</h1>
      <p className="mb-5 text-sm text-muted-foreground">Live overview across all connected portfolios</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-hint">{c.label}</p>
            <p className="mt-2 font-mono text-lg font-semibold text-foreground">{c.value}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{c.change}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Dashboard = () => (
  <div style={{ padding: 0, height: 720 }}>
    <AppShell
      navigationGroups={groups as any}
      user={user}
      brokers={brokers}
      commandItems={commandItems as any}
      orderPanelContent={<div className="p-4 text-sm text-muted-foreground">Order form</div>}
      banners={banners}
      pageTitle="Dashboard"
      onNavigate={() => {}}
      onLogout={() => {}}
      onEmergencyClose={() => {}}
      onDismissBanner={() => {}}
      onSessionExtend={() => {}}
    >
      <DashboardContent />
    </AppShell>
  </div>
)
