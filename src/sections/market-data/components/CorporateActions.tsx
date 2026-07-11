import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  X,
  RotateCcw,
  ChevronRight,
  Layers,
  DollarSign,
  ArrowRightLeft,
  FileText,
  Link2,
} from 'lucide-react'
import type {
  CorporateActionsProps,
  CorporateActionType,
  AdjustmentStatus,
  CorporateAction,
} from '@/../product/sections/market-data/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function formatTimestamp(timestamp: string): string {
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year} ${hh}:${mm}`
}

// ---------------------------------------------------------------------------
// Badge configs
// ---------------------------------------------------------------------------

const actionTypeBadge: Record<CorporateActionType, { bg: string; text: string; label: string; icon: typeof Layers }> = {
  split: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Split', icon: Layers },
  dividend: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Dividend', icon: DollarSign },
  ticker_change: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Ticker Change', icon: ArrowRightLeft },
}

const adjustmentBadge: Record<AdjustmentStatus, { bg: string; text: string; label: string }> = {
  adjusted: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Adjusted' },
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
  failed: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Failed' },
  not_required: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Not Required' },
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'detectedAt' | 'symbol' | 'actionType' | 'actionDate' | 'adjustmentStatus' | 'recordsAffected'

const PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CorporateActions({
  corporateActions,
  onReadjust,
  onViewDetails,
}: CorporateActionsProps) {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState('')
  const [actionTypeFilter, setActionTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'detectedAt',
    dir: 'desc',
  })
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const hasActiveFilters = searchQuery !== '' || actionTypeFilter !== 'all' || statusFilter !== 'all'

  // --- Computed: filtered & sorted ---
  const filtered = useMemo(() => {
    let result = [...corporateActions]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (ca) =>
          ca.symbol.toLowerCase().includes(q) ||
          ca.instrumentName.toLowerCase().includes(q),
      )
    }
    if (actionTypeFilter !== 'all') {
      result = result.filter((ca) => ca.actionType === actionTypeFilter)
    }
    if (statusFilter !== 'all') {
      result = result.filter((ca) => ca.adjustmentStatus === statusFilter)
    }

    result.sort((a, b) => {
      const { key, dir } = sort
      let cmp = 0
      switch (key) {
        case 'detectedAt':
          cmp = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()
          break
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol)
          break
        case 'actionType':
          cmp = a.actionType.localeCompare(b.actionType)
          break
        case 'actionDate':
          cmp = new Date(a.actionDate).getTime() - new Date(b.actionDate).getTime()
          break
        case 'adjustmentStatus':
          cmp = a.adjustmentStatus.localeCompare(b.adjustmentStatus)
          break
        case 'recordsAffected':
          cmp = a.recordsAffected - b.recordsAffected
          break
      }
      return dir === 'asc' ? cmp : -cmp
    })

    return result
  }, [corporateActions, searchQuery, actionTypeFilter, statusFilter, sort])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // --- Handlers ---
  function toggleSort(key: SortKey) {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  function clearFilters() {
    setSearchQuery('')
    setActionTypeFilter('all')
    setStatusFilter('all')
    setPage(0)
  }

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
    onViewDetails?.(id)
  }

  // --- Sort indicator ---
  function SortIcon({ sortKey }: { sortKey: SortKey }) {
    if (sort.key !== sortKey)
      return <ArrowUpDown size={12} aria-hidden="true" className="text-zinc-300 opacity-0 transition-opacity group-hover/th:opacity-100 dark:text-zinc-700" />
    return sort.dir === 'asc' ? (
      <ChevronUp size={12} aria-hidden="true" className="text-primary" />
    ) : (
      <ChevronDown size={12} aria-hidden="true" className="text-primary" />
    )
  }

  // --- Detail renderer for expanded rows ---
  function renderDetails(ca: CorporateAction) {
    const details = ca.details as Record<string, unknown>

    return (
      <div className="space-y-4 px-4 pb-5 pt-2">
        {/* Detail Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ca.actionType === 'split' && (
            <>
              <DetailCell label="Split Ratio" value={`${(details.ratio as number)}-for-1`} />
              <DetailCell label="Description" value={details.description as string} />
              <DetailCell label="Effective Date" value={formatDate(ca.actionDate)} />
            </>
          )}
          {ca.actionType === 'dividend' && (
            <>
              <DetailCell
                label="Amount per Share"
                value={`${(details.currency as string) === 'USD' ? '$' : ''}${(details.amountPerShare as number).toFixed(2)} ${details.currency as string}`}
              />
              <DetailCell label="Ex-Date" value={formatDate(details.exDate as string)} />
              <DetailCell label="Pay Date" value={formatDate(details.payDate as string)} />
              <DetailCell label="Description" value={details.description as string} />
            </>
          )}
          {ca.actionType === 'ticker_change' && (
            <>
              <DetailCell
                label="Symbol Change"
                value={`${details.oldSymbol as string} → ${details.newSymbol as string}`}
                mono
              />
              <DetailCell label="Description" value={details.description as string} />
              <DetailCell label="Effective Date" value={formatDate(ca.actionDate)} />
            </>
          )}
          <DetailCell label="Source" value={ca.dataSourceName} />
          <DetailCell label="Records Affected" value={ca.recordsAffected > 0 ? ca.recordsAffected.toLocaleString() : 'None'} mono />
          <DetailCell
            label="Adjustment Status"
            value={adjustmentBadge[ca.adjustmentStatus].label}
            badge={adjustmentBadge[ca.adjustmentStatus]}
          />
          {ca.adjustedAt && (
            <DetailCell label="Adjusted At" value={formatTimestamp(ca.adjustedAt)} mono />
          )}
        </div>

        {/* Error Message */}
        {ca.errorMessage && (
          <div className="rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Error</p>
            <p className="mt-1 text-xs leading-relaxed text-red-500 dark:text-red-400/80">
              {ca.errorMessage}
            </p>
          </div>
        )}

        {/* Affected Positions */}
        {ca.affectedPositions.length > 0 && (
          <div className="rounded-xl border border-border bg-zinc-50/50 px-4 py-3 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <Link2 size={12} className="text-faint" />
              <p className="text-xs font-medium text-muted-foreground">Affected Positions</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ca.affectedPositions.map((pos) => (
                <span
                  key={pos}
                  className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Re-adjust button for failed entries */}
        {ca.adjustmentStatus === 'failed' && (
          <div className="flex justify-end">
            <button
              onClick={() => onReadjust?.(ca.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Re-adjust Records
            </button>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Page Header                                                      */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Market Data
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Corporate Actions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit log of splits, dividends, and ticker changes across all data sources
          </p>
        </div>

        {/* Summary counts */}
        <div className="flex shrink-0 gap-3">
          {(['split', 'dividend', 'ticker_change'] as CorporateActionType[]).map((type) => {
            const badge = actionTypeBadge[type]
            const count = corporateActions.filter((ca) => ca.actionType === type).length
            return (
              <div
                key={type}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
              >
                <badge.icon size={13} className={badge.text} />
                <span className="font-mono text-sm font-semibold text-foreground">
                  {count}
                </span>
                <span className="hidden text-xs text-zinc-400 sm:inline dark:text-zinc-600">
                  {badge.label}{count !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Filters                                                          */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Search symbol or name..."
              aria-label="Search corporate actions by symbol or name"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Action Type */}
          <select
            value={actionTypeFilter}
            onChange={(e) => {
              setActionTypeFilter(e.target.value)
              setPage(0)
            }}
            aria-label="Filter by action type"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Types</option>
            <option value="split">Split</option>
            <option value="dividend">Dividend</option>
            <option value="ticker_change">Ticker Change</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
            aria-label="Filter by adjustment status"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Statuses</option>
            <option value="adjusted">Adjusted</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="not_required">Not Required</option>
          </select>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={12} aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Table                                                            */}
      {/* ================================================================= */}
      {corporateActions.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl dark:bg-primary/10" />
            <div className="relative rounded-2xl border border-dashed border-zinc-300 bg-card px-8 py-16 text-center backdrop-blur-sm dark:border-zinc-700/80">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800/80 dark:ring-zinc-700/50">
                <FileText size={24} className="text-hint" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">
                No corporate actions detected
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Actions like stock splits and dividends will appear here automatically.
              </p>
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-hint">
            No corporate actions match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 text-sm font-medium text-primary hover:text-primary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-border">
                  {/* Expand toggle column */}
                  <th className="w-10 px-3 py-3" />
                  {(
                    [
                      ['detectedAt', 'Detected'],
                      ['symbol', 'Instrument'],
                      ['actionType', 'Type'],
                      ['actionDate', 'Action Date'],
                    ] as const
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="group/th cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <SortIcon sortKey={key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-faint">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-faint">
                    Source
                  </th>
                  {(
                    [
                      ['adjustmentStatus', 'Status'],
                      ['recordsAffected', 'Records'],
                    ] as const
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="group/th cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <SortIcon sortKey={key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-faint">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((ca) => {
                  const typeBdg = actionTypeBadge[ca.actionType]
                  const adjBdg = adjustmentBadge[ca.adjustmentStatus]
                  const isExpanded = expandedId === ca.id
                  const TypeIcon = typeBdg.icon

                  return (
                    <tr key={ca.id} className="group">
                      {/* Main row cells wrapped in a fragment so expanded detail is a sibling */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleExpanded(ca.id)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${ca.symbol}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-all hover:bg-accent hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          <ChevronRight
                            size={14}
                            aria-hidden="true"
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </td>
                      {/* Detected */}
                      <td className="px-4 py-3">
                        <span
                          className="font-mono text-xs text-muted-foreground"
                          title={formatTimestamp(ca.detectedAt)}
                        >
                          {relativeTime(ca.detectedAt)}
                        </span>
                      </td>
                      {/* Instrument */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {ca.symbol}
                        </p>
                        <p className="text-xs text-faint">
                          {ca.instrumentName}
                        </p>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${typeBdg.bg} ${typeBdg.text}`}
                        >
                          <TypeIcon size={11} />
                          {typeBdg.label}
                        </span>
                      </td>
                      {/* Action Date */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDate(ca.actionDate)}
                        </span>
                      </td>
                      {/* Details Summary */}
                      <td className="max-w-[200px] px-4 py-3">
                        <span className="truncate text-xs text-muted-foreground">
                          {renderDetailsSummary(ca)}
                        </span>
                      </td>
                      {/* Source */}
                      <td className="px-4 py-3">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-muted-foreground dark:bg-zinc-800/60">
                          {ca.dataSourceName}
                        </span>
                      </td>
                      {/* Adjustment Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${adjBdg.bg} ${adjBdg.text}`}
                        >
                          {adjBdg.label}
                        </span>
                      </td>
                      {/* Records Affected */}
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-xs font-medium ${
                            ca.recordsAffected > 0
                              ? 'text-foreground'
                              : 'text-faint'
                          }`}
                        >
                          {ca.recordsAffected > 0 ? ca.recordsAffected.toLocaleString() : '—'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {ca.adjustmentStatus === 'failed' && (
                          <button
                            onClick={() => onReadjust?.(ca.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-pink-300 hover:text-primary dark:border-zinc-700 dark:hover:border-pink-800 dark:hover:text-pink-400"
                          >
                            <RotateCcw size={11} aria-hidden="true" />
                            Re-adjust
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Detail Panels (rendered outside table for layout flexibility) */}
          {paged.map((ca) => {
            if (expandedId !== ca.id) return null
            return (
              <div
                key={`detail-${ca.id}`}
                className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-800/20"
              >
                {renderDetails(ca)}
              </div>
            )
          })}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
              <span className="text-xs text-faint">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} actions
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                >
                  Previous
                </button>
                <button
                  disabled={(page + 1) * PAGE_SIZE >= filtered.length}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Row count for small datasets */}
          {filtered.length <= PAGE_SIZE && filtered.length > 0 && (
            <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
              <span className="text-xs text-faint">
                Showing {filtered.length} of {corporateActions.length} corporate actions
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detail Summary (inline in row)
// ---------------------------------------------------------------------------

function renderDetailsSummary(ca: CorporateAction): string {
  const details = ca.details as Record<string, unknown>
  switch (ca.actionType) {
    case 'split':
      return `${(details.ratio as number)}-for-1 stock split`
    case 'dividend':
      return `$${(details.amountPerShare as number).toFixed(2)}/share (${details.currency as string})`
    case 'ticker_change':
      return `${details.oldSymbol as string} → ${details.newSymbol as string}`
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Detail Cell helper
// ---------------------------------------------------------------------------

function DetailCell({
  label,
  value,
  mono,
  badge,
}: {
  label: string
  value: string
  mono?: boolean
  badge?: { bg: string; text: string }
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-faint">{label}</p>
      {badge ? (
        <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
          {value}
        </span>
      ) : (
        <p
          className={`mt-1 text-xs font-medium text-foreground ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </p>
      )}
    </div>
  )
}
