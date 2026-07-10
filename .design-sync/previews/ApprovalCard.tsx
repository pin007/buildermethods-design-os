import { ApprovalCard } from 'trading-squad-ds'
import data from '../../product/sections/trading-core/data.json'

const order = (data.orders as any[]).find((o) => o.status === 'pending_approval') ?? data.orders[0]
const instrument = (data.instruments as any[]).find((i) => i.id === order.instrumentId) ?? data.instruments[0]
const recommendation = (data.recommendations as any[]).find((r) => r.id === order.recommendationId)

export const PendingApproval = () => (
  <div style={{ padding: 24, maxWidth: 560 }}>
    <ApprovalCard
      order={order as any}
      instrument={instrument as any}
      recommendation={recommendation as any}
      onApprove={() => {}}
      onReject={() => {}}
      onClose={() => {}}
    />
  </div>
)
