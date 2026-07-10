import { CommandPalette } from 'trading-squad-ds'
import { LayoutDashboard, ShoppingCart, Bell, Wallet, Brain, Database } from 'lucide-react'

const items = [
  { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => {} },
  { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => {} },
  { id: 'nav-alerts', label: 'Alerts', category: 'Navigation', icon: Bell, action: () => {} },
  { id: 'nav-portfolios', label: 'Portfolios', category: 'Navigation', icon: Wallet, action: () => {} },
  { id: 'nav-analysis', label: 'Market Analysis', category: 'Navigation', icon: Brain, action: () => {} },
  { id: 'nav-market-data', label: 'Market Data', category: 'Navigation', icon: Database, action: () => {} },
  { id: 'inst-aapl', label: 'AAPL', description: 'Apple Inc.', category: 'Instruments', action: () => {} },
  { id: 'inst-nvda', label: 'NVDA', description: 'NVIDIA Corp.', category: 'Instruments', action: () => {} },
  { id: 'inst-btc', label: 'BTC-USD', description: 'Bitcoin', category: 'Instruments', action: () => {} },
  { id: 'act-new-order', label: 'New Order', description: 'Create a new order', category: 'Actions', icon: ShoppingCart, action: () => {} },
]

export const Open = () => (
  <div style={{ position: 'relative', height: 620, overflow: 'hidden' }}>
    <CommandPalette items={items as any} open onClose={() => {}} />
  </div>
)
