import { OrderStatusBadge } from 'trading-squad-ds'

const STATUSES = [
  'draft', 'pending_approval', 'approved', 'submitted', 'acknowledged',
  'partially_filled', 'filled', 'cancelled', 'rejected', 'expired',
  'amended', 'failed', 'pending_reconciliation',
] as const

export const AllStatuses = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 20, maxWidth: 520 }}>
    {STATUSES.map((s) => <OrderStatusBadge key={s} status={s} />)}
  </div>
)

export const LiveOrder = () => (
  <div style={{ padding: 20 }}>
    <OrderStatusBadge status="partially_filled" />
  </div>
)
