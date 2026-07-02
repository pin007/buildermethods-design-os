import data from '@/../product/sections/trading-core/data.json'
import { OrdersScreen } from './components/OrdersScreen'

const BASE = '/sections/trading-core/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

function openOrderPanel() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
  )
}

export default function OrdersPreview() {
  return (
    <OrdersScreen
      orders={data.orders as any}
      orderEvents={data.orderEvents as any}
      onViewOrder={(id) => console.log('View order:', id)}
      onAmendOrder={openOrderPanel}
      onCancelOrder={(id) => console.log('Cancel order:', id)}
      onCancelBracket={(groupId) => console.log('Cancel bracket:', groupId)}
      onReviewApproval={() => navigate('Approval')}
      onCreateOrder={openOrderPanel}
    />
  )
}
