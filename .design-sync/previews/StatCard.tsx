import { StatCard } from 'trading-squad-ds'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

export const Positive = () => (
  <div style={{ padding: 20, maxWidth: 300 }}>
    <StatCard icon={Wallet} label="Portfolio Value" value="$1,284,300" change="+2.4% today" changeType="positive" />
  </div>
)

export const Negative = () => (
  <div style={{ padding: 20, maxWidth: 300 }}>
    <StatCard icon={TrendingDown} label="Unrealized P&L" value="-$18,420" change="-1.1% today" changeType="negative" />
  </div>
)

export const WithBadge = () => (
  <div style={{ padding: 20, maxWidth: 300 }}>
    <StatCard icon={AlertTriangle} label="Pending Approvals" value="3" changeType="warning" badge={3} onClick={() => {}} />
  </div>
)

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20, maxWidth: 640 }}>
    <StatCard icon={Wallet} label="Net Liquidation" value="$1,284,300" change="+2.4%" changeType="positive" />
    <StatCard icon={TrendingUp} label="Day P&L" value="+$30,120" change="+2.4%" changeType="positive" />
    <StatCard icon={TrendingDown} label="Open Positions" value="14" change="2 near stop" changeType="neutral" />
    <StatCard icon={AlertTriangle} label="Margin Used" value="42%" change="Watch" changeType="warning" />
  </div>
)
