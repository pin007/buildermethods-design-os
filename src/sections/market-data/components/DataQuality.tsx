import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Activity,
  Eye,
  BarChart3,
} from 'lucide-react'
import type {
  DataQualityProps,
  QualityAlertType,
  AlertSeverity,
  QualityAlert,
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

const alertTypeBadge: Record<QualityAlertType, { bg: string; text: string; label: string }> = {
  outlier: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Outlier' },
  gap_filled: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Gap Filled' },
  ohlcv_invalid: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'OHLCV Invalid' },
  stale_data: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Stale Data' },
}

const severityBadge: Record<AlertSeverity, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Critical' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Warning' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Info' },
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'symbol' | 'dataSourceName' | 'alertType' | 'severity' | 'detectedAt'

const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }

const PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DataQuality({
  pipelineStats,
  qualityAlerts,
  onAcknowledge,
  onBulkAcknowledge,
  onViewSourceData,
}: DataQualityProps) {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [alertTypeFilter, setAlertTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<'all' | 'unreviewed'>('unreviewed')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'detectedAt',
    dir: 'desc',
  })
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const hasActiveFilters =
    searchQuery !== '' ||
    sourceFilter !== 'all' ||
    alertTypeFilter !== 'all' ||
    severityFilter !== 'all' ||
    acknowledgedFilter !== 'all'

  // --- Computed: unique sources for filter dropdown ---
  const uniqueSources = useMemo(() => {
    const sources = new Map<string, string>()
    qualityAlerts.forEach((a) => sources.set(a.dataSourceId, a.dataSourceName))
    return Array.from(sources.entries())
  }, [qualityAlerts])

  // --- Computed: stat cards ---
  const stats = useMemo(() => {
    const unacknowledged = qualityAlerts.filter((a) => !a.acknowledged)
    const instrumentsWithWarnings = new Set(
      unacknowledged.map((a) => a.instrumentId),
    ).size
    const outliersPending = unacknowledged.filter((a) => a.alertType === 'outlier').length
    const gapsFilled = qualityAlerts.filter((a) => a.alertType === 'gap_filled').length

    return {
      overallScore: pipelineStats.dataFreshnessPercent,
      instrumentsWithWarnings,
      outliersPending,
      gapsFilled,
    }
  }, [qualityAlerts, pipelineStats])

  // --- Computed: filtered & sorted ---
  const filtered = useMemo(() => {
    let result = [...qualityAlerts]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.instrumentName.toLowerCase().includes(q),
      )
    }
    if (sourceFilter !== 'all') {
      result = result.filter((a) => a.dataSourceId === sourceFilter)
    }
    if (alertTypeFilter !== 'all') {
      result = result.filter((a) => a.alertType === alertTypeFilter)
    }
    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter)
    }
    if (acknowledgedFilter === 'unreviewed') {
      result = result.filter((a) => !a.acknowledged)
    }

    result.sort((a, b) => {
      const { key, dir } = sort
      let cmp = 0
      switch (key) {
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol)
          break
        case 'dataSourceName':
          cmp = a.dataSourceName.localeCompare(b.dataSourceName)
          break
        case 'alertType':
          cmp = a.alertType.localeCompare(b.alertType)
          break
        case 'severity':
          cmp = severityOrder[a.severity] - severityOrder[b.severity]
          break
        case 'detectedAt':
          cmp = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()
          break
      }
      return dir === 'asc' ? cmp : -cmp
    })

    return result
  }, [qualityAlerts, searchQuery, sourceFilter, alertTypeFilter, severityFilter, acknowledgedFilter, sort])

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
    setSourceFilter('all')
    setAlertTypeFilter('all')
    setSeverityFilter('all')
    setAcknowledgedFilter('all')
    setPage(0)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const unreviewedOnPage = paged.filter((a) => !a.acknowledged)
    const allSelected = unreviewedOnPage.every((a) => selectedIds.has(a.id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        unreviewedOnPage.forEach((a) => next.delete(a.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        unreviewedOnPage.forEach((a) => next.add(a.id))
        return next
      })
    }
  }

  function handleBulkAcknowledge() {
    if (selectedIds.size === 0) return
    onBulkAcknowledge?.(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  // --- Sort indicator ---
  function SortIcon({ sortKey }: { sortKey: SortKey }) {
    if (sort.key !== sortKey)
      return <ArrowUpDown size={12} className="text-zinc-300 opacity-0 transition-opacity group-hover/th:opacity-100 dark:text-zinc-700" />
    return sort.dir === 'asc' ? (
      <ChevronUp size={12} className="text-pink-600 dark:text-pink-400" />
    ) : (
      <ChevronDown size={12} className="text-pink-600 dark:text-pink-400" />
    )
  }

  // --- Score color helper ---
  function scoreColor(score: number): string {
    if (score >= 95) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 80) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const unreviewedOnPage = paged.filter((a) => !a.acknowledged)
  const allPageSelected = unreviewedOnPage.length > 0 && unreviewedOnPage.every((a) => selectedIds.has(a.id))

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Page Header                                                      */}
      {/* ================================================================= */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Market Data
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Data Quality
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor data integrity across all sources and instruments
        </p>
      </div>

      {/* ================================================================= */}
      {/* Stat Cards                                                       */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            icon: Shield,
            label: 'Overall Quality',
            value: `${stats.overallScore}%`,
            color: scoreColor(stats.overallScore),
            iconColor: stats.overallScore >= 95 ? 'text-emerald-500' : stats.overallScore >= 80 ? 'text-amber-500' : 'text-red-500',
          },
          {
            icon: AlertTriangle,
            label: 'Instruments w/ Warnings',
            value: stats.instrumentsWithWarnings.toString(),
            color: stats.instrumentsWithWarnings > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
            iconColor: stats.instrumentsWithWarnings > 0 ? 'text-amber-500' : 'text-emerald-500',
          },
          {
            icon: Eye,
            label: 'Outliers Pending Review',
            value: stats.outliersPending.toString(),
            color: stats.outliersPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
            iconColor: stats.outliersPending > 0 ? 'text-red-500' : 'text-emerald-500',
          },
          {
            icon: Activity,
            label: 'Gaps Filled',
            value: stats.gapsFilled.toString(),
            color: 'text-zinc-700 dark:text-zinc-300',
            iconColor: 'text-blue-500',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                  {card.label}
                </p>
                <p className={`mt-2 font-mono text-2xl font-semibold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80">
                <card.icon size={18} className={card.iconColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================================= */}
      {/* Filters & Bulk Actions                                           */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Search symbol or name..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus-visible:border-pink-600 focus-visible:ring-[3px] focus-visible:ring-pink-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Source */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value)
              setPage(0)
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-pink-600 focus-visible:ring-[3px] focus-visible:ring-pink-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {/* Alert Type */}
          <select
            value={alertTypeFilter}
            onChange={(e) => {
              setAlertTypeFilter(e.target.value)
              setPage(0)
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-pink-600 focus-visible:ring-[3px] focus-visible:ring-pink-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Types</option>
            <option value="outlier">Outlier</option>
            <option value="gap_filled">Gap Filled</option>
            <option value="ohlcv_invalid">OHLCV Invalid</option>
            <option value="stale_data">Stale Data</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value)
              setPage(0)
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-pink-600 focus-visible:ring-[3px] focus-visible:ring-pink-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          {/* Acknowledged toggle */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            {(['all', 'unreviewed'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setAcknowledgedFilter(opt)
                  setPage(0)
                }}
                className={`px-3 py-2 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  acknowledgedFilter === opt
                    ? 'bg-pink-600/10 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {opt === 'all' ? 'Show All' : 'Unreviewed'}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Bulk acknowledge */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkAcknowledge}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            <CheckCircle2 size={15} />
            Acknowledge Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* Alerts Table                                                     */}
      {/* ================================================================= */}
      {qualityAlerts.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
            <div className="relative rounded-2xl border border-dashed border-zinc-300 bg-white px-8 py-16 text-center backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/80">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:ring-emerald-800/50">
                <Shield size={24} className="text-emerald-500" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                All data quality checks passing
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                No issues to report. Quality checks run automatically after each fetch.
              </p>
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No alerts match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 text-sm font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                  {/* Select all checkbox */}
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-pink-600 focus:ring-pink-600/20 dark:border-zinc-600 dark:bg-zinc-800"
                    />
                  </th>
                  {(
                    [
                      ['symbol', 'Instrument'],
                      ['dataSourceName', 'Source'],
                      ['alertType', 'Alert Type'],
                      ['severity', 'Severity'],
                      ['detectedAt', 'Detected'],
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
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {paged.map((alert) => {
                  const typeBdg = alertTypeBadge[alert.alertType]
                  const sevBdg = severityBadge[alert.severity]
                  const isSelected = selectedIds.has(alert.id)

                  return (
                    <tr
                      key={alert.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-pink-50/50 dark:bg-pink-950/10'
                          : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        {!alert.acknowledged ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(alert.id)}
                            className="h-3.5 w-3.5 rounded border-zinc-300 text-pink-600 focus:ring-pink-600/20 dark:border-zinc-600 dark:bg-zinc-800"
                          />
                        ) : (
                          <div className="h-3.5 w-3.5" />
                        )}
                      </td>
                      {/* Instrument */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {alert.symbol}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                          {alert.instrumentName}
                        </p>
                      </td>
                      {/* Source */}
                      <td className="px-4 py-3">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                          {alert.dataSourceName}
                        </span>
                      </td>
                      {/* Alert Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${typeBdg.bg} ${typeBdg.text}`}
                        >
                          {typeBdg.label}
                        </span>
                      </td>
                      {/* Severity */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${sevBdg.bg} ${sevBdg.text}`}
                        >
                          {sevBdg.label}
                        </span>
                      </td>
                      {/* Detected */}
                      <td className="px-4 py-3">
                        <span
                          className="font-mono text-xs text-zinc-600 dark:text-zinc-400"
                          title={formatTimestamp(alert.detectedAt)}
                        >
                          {relativeTime(alert.detectedAt)}
                        </span>
                      </td>
                      {/* Details */}
                      <td className="max-w-[260px] px-4 py-3">
                        <p className="truncate text-xs leading-relaxed text-zinc-500 dark:text-zinc-400" title={alert.description}>
                          {alert.description}
                        </p>
                        {alert.dataPoint && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            {(['open', 'high', 'low', 'close'] as const).map((field) => (
                              <span
                                key={field}
                                className="font-mono text-xs text-zinc-400 dark:text-zinc-600"
                              >
                                <span className="uppercase">{field[0]}:</span>
                                {alert.dataPoint![field].toFixed(2)}
                              </span>
                            ))}
                            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
                              <span className="uppercase">V:</span>
                              {alert.dataPoint!.volume.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>
                      {/* Acknowledged Status */}
                      <td className="px-4 py-3">
                        {alert.acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} />
                            Reviewed
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            Unreviewed
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => onAcknowledge?.(alert.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-800 dark:hover:text-emerald-400"
                            >
                              <CheckCircle2 size={11} />
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => onViewSourceData?.(alert.dataSourceId)}
                            title="View in source"
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                          >
                            <BarChart3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} alerts
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <button
                  disabled={(page + 1) * PAGE_SIZE >= filtered.length}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Row count for small datasets */}
          {filtered.length <= PAGE_SIZE && filtered.length > 0 && (
            <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                Showing {filtered.length} of {qualityAlerts.length} alerts
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
