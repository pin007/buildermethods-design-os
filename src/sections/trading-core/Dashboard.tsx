import data from '@/../product/sections/trading-core/data.json'
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
  return (
    <TradingDashboard
      portfolios={data.portfolios as any}
      recentActivity={data.recentActivity as any}
      onReviewApproval={() => navigate('Approval')}
      onCreateOrder={openOrderPanel}
      onViewOrders={() => navigate('Orders')}
      onConnectBroker={() => console.log('Connect broker')}
    />
  )
}
