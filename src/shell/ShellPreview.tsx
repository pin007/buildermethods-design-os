import { useState, useRef, useEffect } from 'react'
import AppShell from './components/AppShell'
import { navigationGroups } from './components/MainNav'
import type { BrokerStatus } from './components/AppShell'
import type { CommandItem } from './components/CommandPalette'
import type { Toast } from './components/ToastContainer'
import type { Banner } from './components/SystemBanner'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  CandlestickChart,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
  Plus,
  Home,
  ChevronRight,
} from 'lucide-react'

// Mark Dashboard as active and add badge counts for preview
const groups = navigationGroups.map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    isActive: item.href === '/',
    badge:
      item.href === '/alerts'
        ? 3
        : item.href === '/orders'
          ? 2
          : item.href === '/market-analysis'
            ? 5
            : undefined,
  })),
}))

const user = {
  name: 'Alex Morgan',
  email: 'alex@tradingsquad.io',
  avatarUrl: undefined,
}

const brokers: BrokerStatus[] = [
  { name: 'IB', status: 'connected' },
  { name: 'Binance', status: 'degraded' },
]

const commandItems: CommandItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => console.log('→ Dashboard') },
  { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => console.log('→ Orders') },
  { id: 'nav-positions', label: 'Positions', category: 'Navigation', icon: Wallet, action: () => console.log('→ Positions') },
  { id: 'nav-charts', label: 'Charts', category: 'Navigation', icon: CandlestickChart, action: () => console.log('→ Charts') },
  { id: 'nav-analysis', label: 'Market Analysis', category: 'Navigation', icon: Brain, action: () => console.log('→ Analysis') },
  { id: 'nav-strategies', label: 'Strategies', category: 'Navigation', icon: FlaskConical, action: () => console.log('→ Strategies') },
  { id: 'nav-journal', label: 'Trade Journal', category: 'Navigation', icon: BookOpen, action: () => console.log('→ Journal') },
  { id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: Settings, action: () => console.log('→ Settings') },
  { id: 'inst-aapl', label: 'AAPL', description: 'Apple Inc.', category: 'Instruments', action: () => console.log('→ AAPL') },
  { id: 'inst-msft', label: 'MSFT', description: 'Microsoft Corp.', category: 'Instruments', action: () => console.log('→ MSFT') },
  { id: 'inst-btc', label: 'BTC-USD', description: 'Bitcoin', category: 'Instruments', action: () => console.log('→ BTC') },
  { id: 'inst-nvda', label: 'NVDA', description: 'NVIDIA Corp.', category: 'Instruments', action: () => console.log('→ NVDA') },
  { id: 'act-new-order', label: 'New Order', description: 'Create a new order', category: 'Actions', icon: ShoppingCart, action: () => console.log('→ New Order') },
]

// Demo banners
const demoBanners: Banner[] = [
  {
    id: 'pending-approvals',
    variant: 'approval',
    message: 'You have 2 orders pending approval',
    actionLabel: 'Review',
    actionHref: '/orders',
  },
]

type OrderType = 'Market' | 'Limit' | 'Stop' | 'Advanced'
type OrderSide = 'buy' | 'sell'

function MockOrderForm() {
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [side, setSide] = useState<OrderSide>('buy')

  const isBuy = side === 'buy'
  const showPrice = orderType === 'Limit' || orderType === 'Stop'
  const showTif = orderType !== 'Market'

  return (
    <div className="space-y-4">
      {/* Order type tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['Market', 'Limit', 'Stop', 'Advanced'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              orderType === type
                ? 'bg-card text-foreground shadow-sm'
                : 'text-hint hover:text-muted-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* BUY / SELL toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isBuy
              ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-600/40'
              : 'bg-muted text-hint hover:text-muted-foreground'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            !isBuy
              ? 'bg-red-600/20 text-red-600 dark:text-red-400 ring-1 ring-red-600/40'
              : 'bg-muted text-hint hover:text-muted-foreground'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-hint">
            Symbol
          </label>
          <input
            type="text"
            defaultValue="AAPL"
            className="w-full rounded-lg border border-input bg-card px-3 py-2
              font-mono text-sm text-foreground outline-none transition-colors
              focus:border-primary focus:ring-1 focus:ring-ring/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-hint">
            Quantity
          </label>
          <input
            type="number"
            defaultValue={100}
            className="w-full rounded-lg border border-input bg-card px-3 py-2
              font-mono text-sm text-foreground outline-none transition-colors
              focus:border-primary focus:ring-1 focus:ring-ring/30"
          />
        </div>

        {showPrice && (
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-hint">
              {orderType === 'Stop' ? 'Stop Price' : 'Limit Price'}
            </label>
            <input
              type="number"
              defaultValue={195.20}
              step={0.01}
              className="w-full rounded-lg border border-input bg-card px-3 py-2
                font-mono text-sm text-foreground outline-none transition-colors
                focus:border-primary focus:ring-1 focus:ring-ring/30"
            />
          </div>
        )}

        {showTif && (
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-hint">
              Time in Force
            </label>
            <select
              defaultValue="DAY"
              className="w-full rounded-lg border border-input bg-card px-3 py-2
                text-sm text-foreground outline-none transition-colors
                focus:border-primary focus:ring-1 focus:ring-ring/30"
            >
              <option value="DAY">Day</option>
              <option value="GTC">Good Till Cancelled</option>
              <option value="IOC">Immediate or Cancel</option>
              <option value="FOK">Fill or Kill</option>
            </select>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-hint">
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estimated Total</span>
            <span className="font-mono text-sm font-medium text-foreground">$19,520.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Commission</span>
            <span className="font-mono text-sm text-muted-foreground">$1.00</span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Total Cost</span>
              <span className="font-mono text-sm font-semibold text-foreground">$19,521.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicator */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-hint">
          Risk Indicator
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Portfolio Impact</span>
          <span className="font-mono text-sm font-medium text-amber-500 dark:text-amber-400">15.3%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
            style={{ width: '15.3%' }}
          />
        </div>
      </div>

      {/* Available Balance */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-hint">
          Available Balance
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current</span>
            <span className="font-mono text-sm text-foreground">$127,845.32</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">After Order</span>
            <span className="font-mono text-sm text-foreground">$108,324.32</span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        className={`w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors ${
          isBuy
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : 'bg-red-600 hover:bg-red-500'
        }`}
      >
        {isBuy ? 'Place Buy Order' : 'Place Sell Order'}
      </button>
    </div>
  )
}

// Breadcrumb demo
function DemoBreadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Home size={14} className="text-hint" />
      <ChevronRight size={12} className="text-faint" />
      <button className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</button>
      <ChevronRight size={12} className="text-faint" />
      <span className="text-hint">Overview</span>
    </div>
  )
}

export default function ShellPreview() {
  const [banners, setBanners] = useState(demoBanners)
  const toastRef = useRef<((toast: Omit<Toast, 'id'>) => void) | null>(null)

  // Demo: fire a toast on mount after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      toastRef.current?.({ variant: 'success', message: 'Portfolio sync complete — 12 positions updated' })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AppShell
      navigationGroups={groups}
      user={user}
      brokers={brokers}
      commandItems={commandItems}
      orderPanelContent={<MockOrderForm />}
      banners={banners}
      breadcrumb={<DemoBreadcrumb />}
      pageTitle="Dashboard"
      toastRef={toastRef}
      onNavigate={(href) => console.log('Navigate to:', href)}
      onLogout={() => console.log('Logout')}
      onEmergencyClose={(filter) => {
        console.log('Emergency close:', filter)
        toastRef.current?.({ variant: 'error', message: `All ${filter} positions closed` })
      }}
      onDismissBanner={(id) => setBanners((prev) => prev.filter((b) => b.id !== id))}
      onSessionExtend={() => {
        console.log('Extend session')
        toastRef.current?.({ variant: 'info', message: 'Session extended for 8 hours' })
      }}
    >
      {/* Sample dashboard content */}
      <div className="space-y-6">
        {/* Page heading with New Order button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-hint">
              Portfolio overview and recent activity
            </p>
          </div>
          <button
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'n',
                  ctrlKey: true,
                  bubbles: true,
                })
              )
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2
              text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Portfolio Value', value: '$127,845.32', change: '+2.4%', positive: true },
            { label: 'Day P&L', value: '+$1,247.89', change: '+0.98%', positive: true },
            { label: 'Open Positions', value: '12', change: '3 new today', positive: true },
            { label: 'Pending Orders', value: '2', change: '1 needs approval', positive: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-hint">
                {stat.label}
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
                }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Chart placeholder + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart area */}
          <div className="col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Portfolio Performance
              </h2>
              <div className="flex gap-1">
                {['1W', '1M', '3M', 'YTD', '1Y'].map((period) => (
                  <button
                    key={period}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      period === '1M'
                        ? 'bg-primary/15 text-primary dark:text-pink-400'
                        : 'text-hint hover:bg-accent hover:text-muted-foreground'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-faint">
              Equity curve chart renders here
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[
                { action: 'BUY', symbol: 'AAPL', qty: '50', time: '2m ago', color: 'text-emerald-600 dark:text-emerald-400' },
                { action: 'SELL', symbol: 'MSFT', qty: '25', time: '1h ago', color: 'text-red-500 dark:text-red-400' },
                { action: 'BUY', symbol: 'BTC', qty: '0.15', time: '3h ago', color: 'text-emerald-600 dark:text-emerald-400' },
                { action: 'APPROVED', symbol: 'NVDA', qty: '100', time: '5h ago', color: 'text-primary dark:text-pink-400' },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase ${activity.color}`}
                    >
                      {activity.action}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {activity.symbol}
                    </span>
                    <span className="font-mono text-xs text-hint">
                      x{activity.qty}
                    </span>
                  </div>
                  <span className="text-[10px] text-faint">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top positions table */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Top Positions
            </h2>
            <button className="text-xs font-medium text-primary dark:text-pink-400 hover:text-primary/80 dark:hover:text-pink-300">
              View All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-hint">
                <th className="pb-3 font-medium">Symbol</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Avg Cost</th>
                <th className="pb-3 font-medium text-right">Current</th>
                <th className="pb-3 font-medium text-right">P&L</th>
                <th className="pb-3 font-medium text-right">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { symbol: 'AAPL', qty: '150', cost: '$178.50', current: '$195.20', pnl: '+$2,505.00', pct: '+9.36%', positive: true },
                { symbol: 'MSFT', qty: '75', cost: '$375.00', current: '$412.80', pnl: '+$2,835.00', pct: '+10.08%', positive: true },
                { symbol: 'BTC-USD', qty: '2.50', cost: '$42,100', current: '$43,850', pnl: '+$4,375.00', pct: '+4.16%', positive: true },
                { symbol: 'NVDA', qty: '100', cost: '$485.00', current: '$472.30', pnl: '-$1,270.00', pct: '-2.62%', positive: false },
              ].map((pos) => (
                <tr key={pos.symbol} className="group hover:bg-hover">
                  <td className="py-3 font-mono font-medium text-foreground">
                    {pos.symbol}
                  </td>
                  <td className="py-3 font-mono text-right text-muted-foreground">
                    {pos.qty}
                  </td>
                  <td className="py-3 font-mono text-right text-muted-foreground">
                    {pos.cost}
                  </td>
                  <td className="py-3 font-mono text-right text-foreground">
                    {pos.current}
                  </td>
                  <td
                    className={`py-3 font-mono text-right font-medium ${
                      pos.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {pos.pnl}
                  </td>
                  <td
                    className={`py-3 font-mono text-right text-xs ${
                      pos.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {pos.pct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
