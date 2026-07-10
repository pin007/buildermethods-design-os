import type { OrderStatus } from '@/../product/sections/trading-core/types'

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400',
  },
  pending_approval: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  acknowledged: {
    label: "Ack'd",
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  partially_filled: {
    label: 'Partial',
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400',
  },
  filled: {
    label: 'Filled',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  },
  expired: {
    label: 'Expired',
    color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400',
  },
  amended: {
    label: 'Amended',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  },
  pending_reconciliation: {
    label: 'Reconciling',
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${config.color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {config.label}
    </span>
  )
}
