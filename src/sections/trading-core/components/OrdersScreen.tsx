import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Clock,
  ListOrdered,
  History,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Pencil,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Link2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { Order, OrderEvent, OrderStatus, OrdersScreenProps } from '@/../product/sections/trading-core/types'
import { OrderStatusBadge } from './OrderStatusBadge'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type TabId = 'pending' | 'open' | 'history'

const tabs: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: 'pending', label: 'Pending Approval', icon: Clock },
  { id: 'open', label: 'Open Orders', icon: ListOrdered },
  { id: 'history', label: 'Order History', icon: History },
]

const pendingStatuses: OrderStatus[] = ['pending_approval']
const openStatuses: OrderStatus[] = ['draft', 'approved', 'submitted', 'acknowledged', 'partially_filled', 'amended', 'pending_reconciliation']
const historyStatuses: OrderStatus[] = ['filled', 'cancelled', 'rejected', 'expired', 'failed']

const ROWS_PER_PAGE = 50

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

type SortColumn = 'instrument' | 'side' | 'type' | 'qty' | 'price' | 'status' | 'created' | 'riskPercent' | 'timeRemaining'
type SortDirection = 'asc' | 'desc'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number | null, fallback = '\u2014'): string {
  if (value === null || value === undefined) return fallback
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return value.toFixed(2)
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function formatFullTimestamp(ts: string): string {
  const d = new Date(ts)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  const ss = d.getUTCSeconds().toString().padStart(2, '0')
  return `${day} ${month} ${year} ${hh}:${mm}:${ss}`
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function orderTypeLabel(t: string): string {
  return t === 'stop_loss' ? 'Stop' : t.charAt(0).toUpperCase() + t.slice(1)
}

function priceDisplay(order: Order): string {
  if (order.orderType === 'limit' && order.limitPrice !== null) return formatCurrency(order.limitPrice)
  if (order.orderType === 'stop_loss' && order.stopPrice !== null) return formatCurrency(order.stopPrice)
  return 'Market'
}

function getRiskPercent(order: Order): number | null {
  return order.approvalContext?.riskAnalysis?.portfolioImpactPercent ?? null
}

function getTimeRemainingMs(order: Order, now: number): number | null {
  if (!order.approvalContext?.expiresAt) return null
  return new Date(order.approvalContext.expiresAt).getTime() - now
}

function getSortValue(order: Order, column: SortColumn, now: number): string | number {
  switch (column) {
    case 'instrument': return order.symbol.toLowerCase()
    case 'side': return order.side
    case 'type': return order.orderType
    case 'qty': return order.quantity
    case 'price': return order.limitPrice ?? order.stopPrice ?? 0
    case 'status': return order.status
    case 'created': return new Date(order.createdAt).getTime()
    case 'riskPercent': return getRiskPercent(order) ?? 0
    case 'timeRemaining': return getTimeRemainingMs(order, now) ?? Infinity
    default: return 0
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SideBadge({ side }: { side: 'BUY' | 'SELL' }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold tracking-wider ${
        side === 'BUY'
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
      }`}
    >
      {side}
    </span>
  )
}

function BrokerBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
      {name}
    </span>
  )
}

function BracketRoleBadge({ role }: { role: 'stop_loss' | 'take_profit' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold ${
        role === 'stop_loss'
          ? 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400'
          : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400'
      }`}
    >
      <ShieldCheck size={10} />
      {role === 'stop_loss' ? 'SL' : 'TP'}
    </span>
  )
}

function SortableHeader({
  label,
  column,
  currentColumn,
  currentDirection,
  onSort,
  align,
}: {
  label: string
  column: SortColumn
  currentColumn: SortColumn
  currentDirection: SortDirection
  onSort: (col: SortColumn) => void
  align?: 'left' | 'right'
}) {
  const isActive = currentColumn === column
  return (
    <button
      onClick={() => onSort(column)}
      className={`group inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}
    >
      <span>{label}</span>
      <span className={`inline-flex ${isActive ? 'text-primary' : 'text-faint opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {isActive && currentDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Risk % and Time Remaining cells
// ---------------------------------------------------------------------------

function RiskPercentCell({ percent }: { percent: number | null }) {
  if (percent === null) return <span className="text-faint">&mdash;</span>
  const color = percent > 5
    ? 'text-red-600 dark:text-red-400'
    : percent > 1
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400'
  return <span className={`font-mono text-xs font-semibold ${color}`}>{percent.toFixed(1)}%</span>
}

function TimeRemainingCell({ ms }: { ms: number | null }) {
  if (ms === null) return <span className="text-faint">&mdash;</span>
  const isExpired = ms <= 0
  const isUrgent = ms > 0 && ms < 5 * 60 * 1000
  const color = isExpired
    ? 'text-red-600 dark:text-red-400'
    : isUrgent
    ? 'text-red-600 dark:text-red-400 animate-pulse'
    : 'text-muted-foreground'
  return (
    <span className={`font-mono text-xs font-semibold tabular-nums ${color}`}>
      {isExpired ? 'Expired' : formatCountdown(ms)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Order Row
// ---------------------------------------------------------------------------

interface OrderRowProps {
  order: Order
  isChild?: boolean
  isSelected: boolean
  showPendingColumns?: boolean
  now: number
  onSelect: () => void
  onAmend?: () => void
  onCancel?: () => void
  onReview?: () => void
}

function OrderRow({ order, isChild, isSelected, showPendingColumns, now, onSelect, onAmend, onCancel, onReview }: OrderRowProps) {
  const isOpen = openStatuses.includes(order.status) || pendingStatuses.includes(order.status)

  return (
    <tr
      onClick={onSelect}
      className={`group cursor-pointer transition-colors ${
        isSelected
          ? 'bg-pink-50/60 dark:bg-pink-950/10'
          : 'hover:bg-accent/40'
      } ${isChild ? 'bg-zinc-50/40 dark:bg-zinc-900/40' : ''}`}
    >
      {/* ID + bracket indicator */}
      <td className="whitespace-nowrap py-3 pl-5 pr-2">
        <div className="flex items-center gap-2">
          {isChild && (
            <span className="flex h-4 w-4 items-center justify-center text-faint">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 0v8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          <span className="font-mono text-xs text-hint">
            {order.id}
          </span>
        </div>
      </td>

      {/* Instrument */}
      <td className="whitespace-nowrap py-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {order.symbol}
          </span>
          {order.bracketRole && order.bracketRole !== 'parent' && (
            <BracketRoleBadge role={order.bracketRole} />
          )}
          {order.bracketRole === 'parent' && (
            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-hint">
              <Link2 size={10} />
              Bracket
            </span>
          )}
        </div>
      </td>

      {/* Side */}
      <td className="whitespace-nowrap py-3 px-2">
        <SideBadge side={order.side} />
      </td>

      {/* Type */}
      <td className="whitespace-nowrap py-3 px-2 text-xs text-muted-foreground">
        {orderTypeLabel(order.orderType)}
      </td>

      {/* Qty */}
      <td className="whitespace-nowrap py-3 px-2 font-mono text-xs text-foreground text-right tabular-nums">
        {order.filledQuantity > 0 && order.filledQuantity < order.quantity
          ? `${order.filledQuantity}/${order.quantity}`
          : order.quantity}
      </td>

      {/* Price */}
      <td className="whitespace-nowrap py-3 px-2 font-mono text-xs text-foreground text-right tabular-nums">
        {priceDisplay(order)}
      </td>

      {/* Status */}
      <td className="whitespace-nowrap py-3 px-2">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Broker */}
      <td className="whitespace-nowrap py-3 px-2">
        <BrokerBadge name={order.brokerShortName} />
      </td>

      {/* TIF */}
      <td className="whitespace-nowrap py-3 px-2 font-mono text-xs text-hint">
        {order.timeInForce}
      </td>

      {/* Timestamp */}
      <td className="whitespace-nowrap py-3 px-2 text-xs tabular-nums text-faint">
        {formatTimestamp(order.createdAt)}
      </td>

      {/* Pending-only columns */}
      {showPendingColumns && (
        <>
          <td className="whitespace-nowrap py-3 px-2 text-right">
            <RiskPercentCell percent={getRiskPercent(order)} />
          </td>
          <td className="whitespace-nowrap py-3 px-2 text-right">
            <TimeRemainingCell ms={getTimeRemainingMs(order, now)} />
          </td>
        </>
      )}

      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-2 pr-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {order.status === 'pending_approval' && onReview && (
            <button
              onClick={(e) => { e.stopPropagation(); onReview() }}
              className="rounded-md px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 transition-colors"
            >
              Review
            </button>
          )}
          {isOpen && order.status !== 'pending_approval' && order.status !== 'pending_reconciliation' && onAmend && (
            <button
              onClick={(e) => { e.stopPropagation(); onAmend() }}
              title="Amend"
              aria-label={`Amend order ${order.id}`}
              className="rounded-md p-1.5 text-hint hover:bg-accent hover:text-muted-foreground transition-colors"
            >
              <Pencil size={13} aria-hidden="true" />
            </button>
          )}
          {isOpen && order.status !== 'pending_reconciliation' && onCancel && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel() }}
              title="Cancel"
              aria-label={`Cancel order ${order.id}`}
              className="rounded-md p-1.5 text-hint hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
            >
              <Ban size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Order Detail Panel
// ---------------------------------------------------------------------------

interface OrderDetailPanelProps {
  order: Order
  events: OrderEvent[]
  onClose: () => void
  onAmend?: () => void
  onCancel?: () => void
  onCancelBracket?: () => void
  onReview?: () => void
}

function OrderDetailPanel({ order, events, onClose, onAmend, onCancel, onCancelBracket, onReview }: OrderDetailPanelProps) {
  const [timelineOpen, setTimelineOpen] = useState(true)
  const isOpen = openStatuses.includes(order.status) || pendingStatuses.includes(order.status)

  return (
    <div className="relative border-t border-border/60 bg-zinc-50/50 dark:bg-zinc-900/50">
      {/* Pink gradient accent at the top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-pink-600/40 via-pink-500/15 to-transparent" />

      <div className="px-5 py-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground">
                {order.symbol}
              </h3>
              <SideBadge side={order.side} />
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.instrumentName} &middot; <span className="font-mono">{order.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg p-1.5 text-hint hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <DetailField label="Order Type" value={orderTypeLabel(order.orderType)} />
          <DetailField label="Quantity" value={String(order.quantity)} mono />
          <DetailField label="Price" value={priceDisplay(order)} mono />
          <DetailField label="Time in Force" value={order.timeInForce} mono />
          <DetailField label="Broker" value={order.brokerShortName} />
          <DetailField label="Created" value={formatFullTimestamp(order.createdAt)} />
          {order.fillPrice !== null && (
            <DetailField label="Fill Price" value={formatCurrency(order.fillPrice)} mono />
          )}
          {order.filledQuantity > 0 && (
            <DetailField label="Filled" value={`${order.filledQuantity} / ${order.quantity}`} mono />
          )}
          {order.commission !== null && (
            <DetailField label="Commission" value={`$${formatCurrency(order.commission)}`} mono />
          )}
          {order.bracketGroupId && (
            <DetailField label="Bracket" value={order.bracketGroupId} />
          )}
        </div>

        {/* Rejection reason */}
        {order.rejectionReason && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-red-500" />
            <p className="text-xs font-medium text-red-700 dark:text-red-400">{order.rejectionReason}</p>
          </div>
        )}

        {/* Error message */}
        {order.errorMessage && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-red-500" />
            <p className="text-xs font-medium text-red-700 dark:text-red-400">{order.errorMessage}</p>
          </div>
        )}

        {/* Amended fields */}
        {order.amendedFields && Object.keys(order.amendedFields).length > 0 && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 px-4 py-3">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500" />
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 mb-1">Amended</p>
            {Object.entries(order.amendedFields).map(([field, change]) => (
              <p key={field} className="text-xs text-blue-700 dark:text-blue-300">
                {field}: <span className="line-through opacity-60 font-mono">{change.from}</span> <span className="text-blue-400 dark:text-blue-600">&rarr;</span> <span className="font-semibold font-mono">{change.to}</span>
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          {order.status === 'pending_approval' && onReview && (
            <button
              onClick={onReview}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-600/20 transition-all hover:bg-amber-500 hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              <CheckCircle2 size={13} aria-hidden="true" />
              Review Approval
            </button>
          )}
          {isOpen && order.status !== 'pending_approval' && order.status !== 'pending_reconciliation' && onAmend && (
            <button
              onClick={onAmend}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <Pencil size={13} aria-hidden="true" />
              Amend
            </button>
          )}
          {isOpen && order.status !== 'pending_reconciliation' && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Ban size={13} aria-hidden="true" />
              Cancel
            </button>
          )}
          {order.bracketRole === 'parent' && isOpen && onCancelBracket && (
            <button
              onClick={onCancelBracket}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Ban size={13} aria-hidden="true" />
              Cancel Bracket
            </button>
          )}
        </div>

        {/* Event timeline */}
        {events.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setTimelineOpen(!timelineOpen)}
              aria-expanded={timelineOpen}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {timelineOpen ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
              Event Timeline ({events.length})
            </button>
            {timelineOpen && (
              <div className="mt-3 ml-1 border-l-2 border-border pl-4 space-y-3">
                {events.map((event, idx) => (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        idx === 0 ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                    />
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={event.status} />
                          <span className="text-xs text-muted-foreground truncate">
                            {event.message}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-faint">
                        {formatFullTimestamp(event.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-hint">
        {label}
      </p>
      <p className={`mt-0.5 text-sm text-foreground ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty States
// ---------------------------------------------------------------------------

function EmptyPending({ onViewOrders }: { onViewOrders?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="absolute -inset-3 rounded-2xl bg-emerald-500/5 blur-xl dark:bg-emerald-500/10" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-foreground">No pending approvals</p>
      <p className="mt-1 text-xs text-hint">All clear!</p>
      {onViewOrders && (
        <button
          onClick={onViewOrders}
          className="mt-4 text-xs font-semibold text-primary hover:text-primary dark:hover:text-pink-300 transition-colors"
        >
          View All Orders
        </button>
      )}
    </div>
  )
}

function EmptyOrders({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="absolute -inset-3 rounded-2xl bg-primary/5 blur-xl dark:bg-primary/10" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <FileText size={24} className="text-faint" />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-foreground">No orders found</p>
      <p className="mt-1 text-xs text-hint">Your order history will appear here.</p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98]"
        >
          <Plus size={14} aria-hidden="true" />
          Create Order
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter bar (Order History)
// ---------------------------------------------------------------------------

interface FilterBarProps {
  statusFilter: string
  instrumentFilter: string
  dateFrom: string
  dateTo: string
  onStatusChange: (val: string) => void
  onInstrumentChange: (val: string) => void
  onDateFromChange: (val: string) => void
  onDateToChange: (val: string) => void
  instruments: string[]
  statuses: OrderStatus[]
}

function FilterBar({
  statusFilter,
  instrumentFilter,
  dateFrom,
  dateTo,
  onStatusChange,
  onInstrumentChange,
  onDateFromChange,
  onDateToChange,
  instruments,
  statuses,
}: FilterBarProps) {
  const hasFilters = !!(statusFilter || instrumentFilter || dateFrom || dateTo)

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-hint" />
        <select
          value={instrumentFilter}
          onChange={(e) => onInstrumentChange(e.target.value)}
          aria-label="Filter by instrument"
          className="h-8 appearance-none rounded-lg border border-border bg-card pl-8 pr-8 text-xs text-foreground focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] transition-all"
        >
          <option value="">All Instruments</option>
          {instruments.map((sym) => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
        className="h-8 appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-xs text-foreground focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] transition-all"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
        ))}
      </select>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] transition-all"
        aria-label="Date from"
      />
      <span className="text-xs text-faint">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] transition-all"
        aria-label="Date to"
      />
      {hasFilters && (
        <button
          onClick={() => { onStatusChange(''); onInstrumentChange(''); onDateFromChange(''); onDateToChange('') }}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <X size={12} aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function OrdersScreen({
  orders,
  orderEvents,
  onViewOrder,
  onAmendOrder,
  onCancelOrder,
  onCancelBracket,
  onReviewApproval,
  onCreateOrder,
}: OrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('pending')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [expandedBrackets, setExpandedBrackets] = useState<Set<string>>(new Set(['bracket-001']))
  const [statusFilter, setStatusFilter] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [historyPage, setHistoryPage] = useState(0)
  const [sortColumn, setSortColumn] = useState<SortColumn>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [now, setNow] = useState(Date.now())

  // Tick countdown for pending tab
  useEffect(() => {
    if (activeTab !== 'pending') return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [activeTab])

  const isPending = activeTab === 'pending'

  // Handle sort click
  const handleSort = useCallback((col: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === col) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        return col
      }
      setSortDirection('asc')
      return col
    })
  }, [])

  // Pending approval count for tab badge
  const pendingCount = useMemo(
    () => orders.filter((o) => pendingStatuses.includes(o.status)).length,
    [orders],
  )

  // Build flat list for each tab, handling bracket grouping
  const tabOrders = useMemo(() => {
    let filtered: Order[]
    if (activeTab === 'pending') {
      filtered = orders.filter((o) => pendingStatuses.includes(o.status))
    } else if (activeTab === 'open') {
      filtered = orders.filter((o) => openStatuses.includes(o.status))
    } else {
      filtered = orders.filter((o) => historyStatuses.includes(o.status))
      if (statusFilter) filtered = filtered.filter((o) => o.status === statusFilter)
      if (instrumentFilter) filtered = filtered.filter((o) => o.symbol === instrumentFilter)
      if (dateFrom) {
        const from = new Date(dateFrom).getTime()
        filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= from)
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000
        filtered = filtered.filter((o) => new Date(o.createdAt).getTime() < to)
      }
    }

    // Sort by selected column
    const dir = sortDirection === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      const av = getSortValue(a, sortColumn, now)
      const bv = getSortValue(b, sortColumn, now)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })

    return filtered
  }, [orders, activeTab, statusFilter, instrumentFilter, dateFrom, dateTo, sortColumn, sortDirection, now])

  // Build display rows with bracket grouping
  const displayRows = useMemo(() => {
    const rows: { order: Order; isChild: boolean }[] = []
    const bracketChildIds = new Set<string>()

    tabOrders.forEach((o) => {
      if (o.bracketGroupId && o.bracketRole !== 'parent') {
        bracketChildIds.add(o.id)
      }
    })

    const allChildrenByGroup = new Map<string, Order[]>()
    orders.forEach((o) => {
      if (o.bracketGroupId && o.bracketRole !== 'parent') {
        const children = allChildrenByGroup.get(o.bracketGroupId) || []
        children.push(o)
        allChildrenByGroup.set(o.bracketGroupId, children)
      }
    })

    tabOrders.forEach((o) => {
      if (bracketChildIds.has(o.id)) return

      rows.push({ order: o, isChild: false })

      if (o.bracketRole === 'parent' && o.bracketGroupId && expandedBrackets.has(o.bracketGroupId)) {
        const children = allChildrenByGroup.get(o.bracketGroupId) || []
        children
          .sort((a, b) => (a.bracketRole === 'stop_loss' ? -1 : 1))
          .forEach((child) => rows.push({ order: child, isChild: true }))
      }
    })

    return rows
  }, [tabOrders, orders, expandedBrackets])

  // Paginate history
  const paginatedRows = activeTab === 'history'
    ? displayRows.slice(historyPage * ROWS_PER_PAGE, (historyPage + 1) * ROWS_PER_PAGE)
    : displayRows

  const totalPages = Math.ceil(displayRows.length / ROWS_PER_PAGE)

  // Get events for selected order
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null
  const selectedEvents = useMemo(
    () => selectedOrderId
      ? orderEvents
          .filter((e) => e.orderId === selectedOrderId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : [],
    [orderEvents, selectedOrderId],
  )

  // Unique instruments and statuses for filters
  const uniqueInstruments = useMemo(
    () => [...new Set(orders.filter((o) => historyStatuses.includes(o.status)).map((o) => o.symbol))].sort(),
    [orders],
  )

  function toggleBracket(groupId: string) {
    setExpandedBrackets((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  // Column definitions
  const baseColumns: { key: SortColumn | 'id' | 'broker' | 'tif' | 'actions'; label: string; sortable: boolean; align?: 'right' }[] = [
    { key: 'id', label: 'ID', sortable: false },
    { key: 'instrument', label: 'Instrument', sortable: true },
    { key: 'side', label: 'Side', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'qty', label: 'Qty', sortable: true, align: 'right' },
    { key: 'price', label: 'Price', sortable: true, align: 'right' },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'broker', label: 'Broker', sortable: false },
    { key: 'tif', label: 'TIF', sortable: false },
    { key: 'created', label: 'Created', sortable: true },
  ]

  const pendingExtraColumns: typeof baseColumns = [
    { key: 'riskPercent', label: 'Risk %', sortable: true, align: 'right' },
    { key: 'timeRemaining', label: 'Time Left', sortable: true, align: 'right' },
  ]

  const columns = isPending
    ? [...baseColumns, ...pendingExtraColumns, { key: 'actions' as const, label: '', sortable: false }]
    : [...baseColumns, { key: 'actions' as const, label: '', sortable: false }]

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Manage
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Orders
          </h1>
        </div>
        <button
          onClick={() => onCreateOrder?.()}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} aria-hidden="true" className="transition-transform group-hover:rotate-90" />
          New Order
        </button>
      </div>

      {/* ================================================================= */}
      {/* Tab bar                                                           */}
      {/* ================================================================= */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 ring-1 ring-border/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedOrderId(null); setHistoryPage(0) }}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                sm:flex-none
                ${isActive
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-hint hover:text-foreground'
                }
              `}
            >
              <Icon size={15} aria-hidden="true" />
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold tabular-nums text-primary-foreground shadow-sm shadow-pink-600/30">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Pending approval warning                                          */}
      {/* ================================================================= */}
      {activeTab === 'pending' && pendingCount > 0 && (
        <div className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 px-5 py-3">
          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-500" />
          <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Pending orders have a <span className="font-semibold">15-minute</span> approval window. Review promptly to avoid auto-rejection.
          </p>
        </div>
      )}

      {/* ================================================================= */}
      {/* Orders table card                                                 */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Pink gradient accent at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-600/50 via-pink-500/15 to-transparent" />

        {/* Filters (history only) */}
        {activeTab === 'history' && tabOrders.length > 0 && (
          <div className="pt-4">
            <FilterBar
              statusFilter={statusFilter}
              instrumentFilter={instrumentFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onStatusChange={setStatusFilter}
              onInstrumentChange={setInstrumentFilter}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              instruments={uniqueInstruments}
              statuses={historyStatuses}
            />
          </div>
        )}

        {paginatedRows.length === 0 ? (
          activeTab === 'pending' ? (
            <EmptyPending onViewOrders={() => setActiveTab('history')} />
          ) : (
            <EmptyOrders onCreate={onCreateOrder} />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50">
                  {columns.map((col, i) => (
                    <th
                      key={col.key}
                      className={`py-3 text-xs font-bold uppercase tracking-[0.12em] text-hint ${
                        i === 0 ? 'pl-5 pr-2 text-left' : col.key === 'actions' ? 'pl-2 pr-5 text-right' : 'px-2 text-left'
                      } ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.sortable ? (
                        <SortableHeader
                          label={col.label}
                          column={col.key as SortColumn}
                          currentColumn={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          align={col.align}
                        />
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedRows.map(({ order, isChild }) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isChild={isChild}
                    isSelected={selectedOrderId === order.id}
                    showPendingColumns={isPending}
                    now={now}
                    onSelect={() => {
                      if (order.bracketRole === 'parent' && order.bracketGroupId) {
                        toggleBracket(order.bracketGroupId)
                      }
                      setSelectedOrderId(selectedOrderId === order.id ? null : order.id)
                      onViewOrder?.(order.id)
                    }}
                    onAmend={() => onAmendOrder?.(order.id)}
                    onCancel={() => onCancelOrder?.(order.id)}
                    onReview={() => onReviewApproval?.(order.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected order detail */}
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            events={selectedEvents}
            onClose={() => setSelectedOrderId(null)}
            onAmend={() => onAmendOrder?.(selectedOrder.id)}
            onCancel={() => onCancelOrder?.(selectedOrder.id)}
            onCancelBracket={selectedOrder.bracketGroupId ? () => onCancelBracket?.(selectedOrder.bracketGroupId!) : undefined}
            onReview={() => onReviewApproval?.(selectedOrder.id)}
          />
        )}

        {/* Pagination (history only) */}
        {activeTab === 'history' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {historyPage * ROWS_PER_PAGE + 1}&ndash;{Math.min((historyPage + 1) * ROWS_PER_PAGE, displayRows.length)} of {displayRows.length}
            </p>
            <div className="flex gap-1">
              <button
                disabled={historyPage === 0}
                onClick={() => setHistoryPage(historyPage - 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={historyPage >= totalPages - 1}
                onClick={() => setHistoryPage(historyPage + 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
