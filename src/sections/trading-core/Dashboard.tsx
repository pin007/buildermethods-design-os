import { useMemo } from 'react'
import data from '@/../product/sections/trading-core/data.json'
import { useTradingScope } from '@/lib/trading-scope'
import { TradingDashboard } from './components/TradingDashboard'

const BASE = '/sections/trading-core/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

function openOrderPanel() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
  )
}

export default function DashboardPreview() {
  // The dashboard is the active-trading home, so it only shows portfolios in
  // the current Paper/Live scope — matching what the order panel will accept.
  const scope = useTradingScope()
  const portfolios = useMemo(
    () => (data.portfolios as { environment: 'paper' | 'live' }[]).filter(
      (p) => p.environment === scope
    ),
    [scope]
  )

  return (
    <TradingDashboard
      portfolios={portfolios as any}
      recentActivity={data.recentActivity as any}
      onReviewApproval={() => navigate('Approval')}
      onCreateOrder={openOrderPanel}
      onViewOrders={() => navigate('Orders')}
      onConnectBroker={() => console.log('Connect broker')}
    />
  )
}
