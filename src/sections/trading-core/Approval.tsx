import data from '@/../product/sections/trading-core/data.json'
import { ApprovalCard } from './components/ApprovalCard'

export default function ApprovalPreview() {
  const order = data.orders.find((o) => o.id === 'ord-002')!
  const instrument = data.instruments.find((i) => i.id === order.instrumentId)!
  const recommendation = data.recommendations.find((r) => r.id === order.recommendationId)

  return (
    <ApprovalCard
      order={order as any}
      instrument={instrument as any}
      recommendation={recommendation as any}
      onApprove={(id) => console.log('Approve order:', id)}
      onReject={(id, reason) => console.log('Reject order:', id, reason)}
      onClose={() => console.log('Close approval card')}
    />
  )
}
