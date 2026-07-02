import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
  Plus,
  ShoppingCart,
  LogOut,
} from 'lucide-react'
import type { Position, CostLot } from '@/../product/sections/portfolio-and-positions/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatSignedCurrency(value: number, currency = 'USD'): string {
  const formatted = formatCurrency(Math.abs(value), currency)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatQuantity(qty: number): string {
  if (qty === Math.floor(qty)) return qty.toString()
  return qty.toFixed(4)
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

type SortColumn = 'symbol' | 'quantity' | 'avgCost' | 'currentPrice' | 'marketValue' | 'pnl' | 'pnlPercent' | 'weight' | 'dayChange' | 'dayChangePercent'
type SortDirection = 'asc' | 'desc'

function getSortValue(pos: Position, col: SortColumn): string | number {
  switch (col) {
    case 'symbol': return pos.symbol.toLowerCase()
    case 'quantity': return pos.quantity
    case 'avgCost': return pos.avgCostBasis
    case 'currentPrice': return pos.currentPrice
    case 'marketValue': return pos.marketValue
    case 'pnl': return pos.unrealizedPnL
    case 'pnlPercent': return pos.unrealizedPnLPercent
    case 'weight': return pos.weightPercent
    case 'dayChange': return pos.dayChange
    case 'dayChangePercent': return pos.dayChangePercent
    default: return 0
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortableHeader({
  label, column, currentColumn, currentDirection, onSort, align,
}: {
  label: string; column: SortColumn; currentColumn: SortColumn; currentDirection: SortDirection
  onSort: (col: SortColumn) => void; align?: 'left' | 'right'
}) {
  const isActive = currentColumn === column
  return (
    <button
      onClick={() => onSort(column)}
      className={`group inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}
    >
      <span>{label}</span>
      <span className={`inline-flex ${isActive ? 'text-pink-500 dark:text-pink-400' : 'text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {isActive && currentDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      </span>
    </button>
  )
}

function TaxStatusBadge({ status, daysHeld, exemptionDate }: { status: string; daysHeld: number; exemptionDate: string }) {
  const isExempt = status === 'exempt'
  return (
    <span
      title={`${daysHeld} days held · Exempt: ${formatDate(exemptionDate)}`}
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
        isExempt
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
      }`}
    >
      {isExempt ? 'Exempt' : 'Taxable'}
    </span>
  )
}

function BrokerBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
      {name}
    </span>
  )
}

function CostLotsPanel({ lots, currency }: { lots: CostLot[]; currency: string }) {
  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/40 px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-3">
        FIFO Cost Lots
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-200/60 dark:border-zinc-800/40">
              {['Acquired', 'Quantity', 'Remaining', 'Cost/Unit', 'Total Cost', 'Current Value', 'P&L', 'Days Held', 'Exemption Date'].map(h => (
                <th key={h} className="py-2 px-2 text-left text-xs font-bold uppercase tracking-[0.10em] text-zinc-400 dark:text-zinc-600 first:pl-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/30">
            {lots.map(lot => {
              const positive = lot.unrealizedPnL >= 0
              return (
                <tr key={lot.id} className="text-xs">
                  <td className="py-2 px-2 pl-0 text-zinc-600 dark:text-zinc-400">{formatDate(lot.acquiredAt)}</td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{formatQuantity(lot.originalQuantity)}</td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{formatQuantity(lot.remainingQuantity)}</td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(lot.costPerUnit, currency)}</td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(lot.totalCost, currency)}</td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(lot.currentValue, currency)}</td>
                  <td className={`py-2 px-2 font-mono tabular-nums font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {formatSignedCurrency(lot.unrealizedPnL, currency)}
                  </td>
                  <td className="py-2 px-2 font-mono tabular-nums text-zinc-500 dark:text-zinc-500">{lot.daysHeld}d</td>
                  <td className="py-2 px-2 text-zinc-500 dark:text-zinc-500">{formatDate(lot.taxExemptionDate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROWS_PER_PAGE = 50

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface PositionsTabProps {
  positions: Position[]
  onTradePosition?: (symbol: string) => void
  onClosePosition?: (symbol: string, quantity: number) => void
  onSetPositionAlert?: (positionId: string) => void
  onCreateOrder?: () => void
}

export function PositionsTab({
  positions,
  onTradePosition,
  onClosePosition,
  onSetPositionAlert,
  onCreateOrder,
}: PositionsTabProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('weight')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [brokerFilter, setBrokerFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  const brokers = useMemo(() =>
    [...new Set(positions.map(p => p.brokerShortName))].sort(),
    [positions],
  )

  const filtered = useMemo(() => {
    let result = [...positions]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.symbol.toLowerCase().includes(q) || p.instrumentName.toLowerCase().includes(q))
    }
    if (brokerFilter) {
      result = result.filter(p => p.brokerShortName === brokerFilter)
    }
    const dir = sortDirection === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const av = getSortValue(a, sortColumn)
      const bv = getSortValue(b, sortColumn)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    return result
  }, [positions, searchQuery, brokerFilter, sortColumn, sortDirection])

  const paginated = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const hasFilters = !!(searchQuery || brokerFilter)

  // Empty state
  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-pink-500/5 blur-xl dark:bg-pink-500/10" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
            <FileText size={24} className="text-zinc-300 dark:text-zinc-600" />
          </div>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No positions yet
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Create your first order to start building your portfolio.
        </p>
        {onCreateOrder && (
          <button
            onClick={onCreateOrder}
            className="mt-5 flex items-center gap-1.5 rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            <Plus size={14} />
            New Order
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0) }}
            placeholder="Search symbol or name..."
            className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 pl-8 pr-3 text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] transition-all w-48"
          />
        </div>
        <select
          value={brokerFilter}
          onChange={e => { setBrokerFilter(e.target.value); setPage(0) }}
          className="h-8 appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 px-3 pr-8 text-xs text-zinc-700 dark:text-zinc-300 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] transition-all"
        >
          <option value="">All Brokers</option>
          {brokers.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearchQuery(''); setBrokerFilter(''); setPage(0) }}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600">
          {filtered.length} position{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-600/50 via-pink-500/15 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                <th className="py-3 pl-5 pr-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 w-5" />
                <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Symbol" column="symbol" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Broker</th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Qty" column="quantity" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Avg Price" column="avgCost" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Price" column="currentPrice" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Value" column="marketValue" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="P&L $" column="pnl" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="P&L %" column="pnlPercent" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  <SortableHeader label="Weight" column="weight" currentColumn={sortColumn} currentDirection={sortDirection} onSort={handleSort} align="right" />
                </th>
                <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Tax</th>
                <th className="py-3 pl-2 pr-5 text-right text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {paginated.map(pos => {
                const pnlPositive = pos.unrealizedPnL >= 0
                const dayPositive = pos.dayChange >= 0
                const isExpanded = expandedId === pos.id
                return (
                  <tr key={pos.id} className="group">
                    <td colSpan={12} className="p-0">
                      <div
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-pink-50/40 dark:bg-pink-950/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center" onClick={() => setExpandedId(isExpanded ? null : pos.id)}>
                          {/* Chevron */}
                          <div className="py-3 pl-5 pr-2 w-8 shrink-0">
                            {isExpanded
                              ? <ChevronDown size={14} className="text-pink-500 dark:text-pink-400" />
                              : <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors" />
                            }
                          </div>

                          {/* Symbol */}
                          <div className="py-3 px-2 min-w-[140px]">
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{pos.symbol}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate max-w-[120px]">{pos.instrumentName}</p>
                          </div>

                          {/* Broker */}
                          <div className="py-3 px-2 min-w-[60px]">
                            <BrokerBadge name={pos.brokerShortName} />
                          </div>

                          {/* Qty */}
                          <div className="py-3 px-2 font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300 text-right min-w-[60px]">
                            {formatQuantity(pos.quantity)}
                          </div>

                          {/* Avg Price */}
                          <div className="py-3 px-2 font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300 text-right min-w-[80px]">
                            {formatCurrency(pos.avgCostBasis, pos.currency)}
                          </div>

                          {/* Current Price */}
                          <div className="py-3 px-2 font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300 text-right min-w-[80px]">
                            {formatCurrency(pos.currentPrice, pos.currency)}
                          </div>

                          {/* Market Value */}
                          <div className="py-3 px-2 font-mono text-xs font-semibold tabular-nums text-zinc-800 dark:text-zinc-200 text-right min-w-[90px]">
                            {formatCurrency(pos.marketValue, pos.currency)}
                          </div>

                          {/* P&L $ */}
                          <div className={`py-3 px-2 font-mono text-xs font-semibold tabular-nums text-right min-w-[90px] ${
                            pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {formatSignedCurrency(pos.unrealizedPnL, pos.currency)}
                          </div>

                          {/* P&L % */}
                          <div className={`py-3 px-2 font-mono text-xs tabular-nums text-right min-w-[70px] ${
                            pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {formatPercent(pos.unrealizedPnLPercent)}
                          </div>

                          {/* Weight % */}
                          <div className="py-3 px-2 font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400 text-right min-w-[60px]">
                            {pos.weightPercent.toFixed(1)}%
                          </div>

                          {/* Tax Status */}
                          <div className="py-3 px-2 min-w-[80px]">
                            <TaxStatusBadge status={pos.taxStatus} daysHeld={pos.daysHeld} exemptionDate={pos.taxExemptionDate} />
                          </div>

                          {/* Actions */}
                          <div className="py-3 pl-2 pr-5 min-w-[100px]" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onTradePosition?.(pos.symbol)}
                                className="rounded-md px-2 py-1 text-xs font-medium text-pink-600 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950/20 transition-colors"
                                title="Trade"
                              >
                                <ShoppingCart size={13} />
                              </button>
                              <button
                                onClick={() => onClosePosition?.(pos.symbol, pos.quantity)}
                                className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                                title="Close Position"
                              >
                                <LogOut size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded FIFO lots */}
                        {isExpanded && (
                          <CostLotsPanel lots={pos.costLots} currency={pos.currency} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 px-5 py-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing {page * ROWS_PER_PAGE + 1}&ndash;{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length} positions
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
