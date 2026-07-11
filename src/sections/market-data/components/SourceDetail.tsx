import { useState, useMemo } from 'react'
import {
  Cloud,
  ArrowLeft,
  ArrowLeftRight,
  Bitcoin,
  BarChart3,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  X,
  RotateCcw,
  Database,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  SourceDetailProps,
  DataSourceStatus,
  DataInterval,
  FreshnessStatus,
  AssetType,
  FetchOperationType,
  FetchOperationStatus,
  BackfillTaskStatus,
  QualityAlertType,
  AlertSeverity,
  InstrumentSubscription,
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

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatTimestamp(timestamp: string): string {
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Done'
  if (ms < 60000) return `${Math.ceil(ms / 1000)}s left`
  return `${Math.ceil(ms / 60000)}m left`
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString()}K`
  return n.toLocaleString()
}

function lastFetchedColor(timestamp: string): string {
  const diffHr = (Date.now() - new Date(timestamp).getTime()) / 3600000
  if (diffHr < 1) return 'text-foreground'
  if (diffHr < 24) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// ---------------------------------------------------------------------------
// Configs
// ---------------------------------------------------------------------------

const sourceIconMap: Record<string, LucideIcon> = {
  cloud_download: Cloud,
  swap_horiz: ArrowLeftRight,
  currency_bitcoin: Bitcoin,
  analytics: BarChart3,
}

const sourceShortNames: Record<string, string> = {
  ib: 'IB',
  finnhub: 'Finnhub',
  yahoo: 'Yahoo',
  binance: 'Binance',
}

const statusDot: Record<DataSourceStatus, string> = {
  connected: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  disconnected: 'bg-red-500',
}

const statusText: Record<DataSourceStatus, string> = {
  connected: 'text-emerald-600 dark:text-emerald-400',
  degraded: 'text-amber-600 dark:text-amber-400',
  disconnected: 'text-red-600 dark:text-red-400',
}

const statusLabel: Record<DataSourceStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
}

const accentGradient: Record<DataSourceStatus, string> = {
  connected: 'from-emerald-500/40 via-emerald-400/10 to-transparent',
  degraded: 'from-amber-500/40 via-amber-400/10 to-transparent',
  disconnected: 'from-red-500/40 via-red-400/10 to-transparent',
}

const freshnessDot: Record<FreshnessStatus, string> = {
  fresh: 'bg-emerald-500',
  stale: 'bg-amber-500',
  very_stale: 'bg-red-500',
}

const freshnessLabelText: Record<FreshnessStatus, string> = {
  fresh: 'Fresh',
  stale: 'Stale',
  very_stale: 'Very Stale',
}

const freshnessOrder: Record<FreshnessStatus, number> = {
  fresh: 0,
  stale: 1,
  very_stale: 2,
}

const fetchTypeBadge: Record<FetchOperationType, { bg: string; text: string; label: string }> = {
  scheduled: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Scheduled' },
  manual: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-primary', label: 'Manual' },
  backfill: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Backfill' },
  retry: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Retry' },
}

const fetchStatusBadge: Record<FetchOperationStatus, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Success' },
  partial: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Partial' },
  failed: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Failed' },
}

const backfillStatusBadge: Record<BackfillTaskStatus, { bg: string; text: string; label: string }> = {
  queued: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Queued' },
  running: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Running' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
  failed: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Failed' },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Cancelled' },
}

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

type Tab = 'instruments' | 'history' | 'quality'
type InstrumentSortKey = 'symbol' | 'assetType' | 'dataPoints' | 'gaps' | 'lastFetched' | 'freshness'
type QualitySortKey = 'symbol' | 'ohlcvValidity' | 'outliers' | 'gapsFilled' | 'qualityScore'

interface QualityMetric {
  subscriptionId: string
  symbol: string
  instrumentName: string
  ohlcvValidity: number
  outliers: number
  gapsFilled: number
  lastValidated: string
  qualityScore: number
  status: 'healthy' | 'warning' | 'critical'
}

const PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SourceDetail({
  dataSource,
  subscriptions,
  fetchOperations,
  backfillTasks,
  qualityAlerts,
  onForceRefreshAll,
  onRefreshInstrument,
  onAddInstrument,
  onRemoveInstrument,
  onStartBackfill,
  onCancelBackfill,
  onRetryFetch,
  onAcknowledgeAlert,
}: SourceDetailProps) {
  const Icon = sourceIconMap[dataSource.icon] ?? Cloud

  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<Tab>('instruments')

  // --- Instruments tab state ---
  const [instrumentSearch, setInstrumentSearch] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('all')
  const [freshnessFilter, setFreshnessFilter] = useState('all')
  const [instrumentSort, setInstrumentSort] = useState<{ key: InstrumentSortKey; dir: 'asc' | 'desc' }>({
    key: 'symbol',
    dir: 'asc',
  })
  const [instrumentPage, setInstrumentPage] = useState(0)

  // --- Fetch history tab state ---
  const [fetchStatusFilter, setFetchStatusFilter] = useState('all')
  const [fetchPage, setFetchPage] = useState(0)

  // --- Quality tab state ---
  const [qualitySort, setQualitySort] = useState<{ key: QualitySortKey; dir: 'asc' | 'desc' }>({
    key: 'qualityScore',
    dir: 'asc',
  })

  // --- Computed: filtered & sorted instruments ---
  const hasActiveFilters = instrumentSearch !== '' || assetTypeFilter !== 'all' || freshnessFilter !== 'all'

  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions]

    if (instrumentSearch) {
      const q = instrumentSearch.toLowerCase()
      result = result.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.instrumentName.toLowerCase().includes(q),
      )
    }
    if (assetTypeFilter !== 'all') {
      result = result.filter((s) => s.assetType === assetTypeFilter)
    }
    if (freshnessFilter !== 'all') {
      result = result.filter((s) => s.freshness === freshnessFilter)
    }

    result.sort((a, b) => {
      const { key, dir } = instrumentSort
      let cmp = 0
      switch (key) {
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol)
          break
        case 'assetType':
          cmp = a.assetType.localeCompare(b.assetType)
          break
        case 'dataPoints':
          cmp = a.dataPoints - b.dataPoints
          break
        case 'gaps':
          cmp = a.gaps - b.gaps
          break
        case 'lastFetched':
          cmp = new Date(a.lastFetched).getTime() - new Date(b.lastFetched).getTime()
          break
        case 'freshness':
          cmp = freshnessOrder[a.freshness] - freshnessOrder[b.freshness]
          break
      }
      return dir === 'asc' ? cmp : -cmp
    })

    return result
  }, [subscriptions, instrumentSearch, assetTypeFilter, freshnessFilter, instrumentSort])

  const pagedSubscriptions = filteredSubscriptions.slice(
    instrumentPage * PAGE_SIZE,
    (instrumentPage + 1) * PAGE_SIZE,
  )

  // --- Computed: filtered fetch operations ---
  const filteredFetchOps = useMemo(() => {
    let result = [...fetchOperations].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    if (fetchStatusFilter !== 'all') {
      result = result.filter((f) => f.status === fetchStatusFilter)
    }
    return result
  }, [fetchOperations, fetchStatusFilter])

  const pagedFetchOps = filteredFetchOps.slice(fetchPage * PAGE_SIZE, (fetchPage + 1) * PAGE_SIZE)

  const activeBackfills = backfillTasks.filter((t) => t.status === 'running' || t.status === 'queued')

  // --- Computed: quality metrics per instrument ---
  const qualityMetrics: QualityMetric[] = useMemo(() => {
    const metrics = subscriptions.map((sub) => {
      const alerts = qualityAlerts.filter((a) => a.instrumentId === sub.instrumentId)
      const outliers = alerts.filter((a) => a.alertType === 'outlier').length
      const gapsFilled = alerts.filter((a) => a.alertType === 'gap_filled').length
      const ohlcvInvalid = alerts.filter((a) => a.alertType === 'ohlcv_invalid').length
      const criticalCount = alerts.filter((a) => a.severity === 'critical').length
      const warningCount = alerts.filter((a) => a.severity === 'warning').length

      const ohlcvValidity = ohlcvInvalid > 0 ? 98.5 : 99.9
      let qualityScore = 100 - criticalCount * 5 - warningCount * 2 - gapsFilled * 0.5
      qualityScore = Math.max(0, Math.min(100, Number(qualityScore.toFixed(1))))

      const status: QualityMetric['status'] =
        qualityScore >= 95 ? 'healthy' : qualityScore >= 80 ? 'warning' : 'critical'

      const lastValidated =
        alerts.length > 0
          ? alerts.reduce((latest, a) =>
              new Date(a.detectedAt) > new Date(latest) ? a.detectedAt : latest,
            alerts[0].detectedAt)
          : sub.lastFetched

      return {
        subscriptionId: sub.id,
        symbol: sub.symbol,
        instrumentName: sub.instrumentName,
        ohlcvValidity,
        outliers,
        gapsFilled,
        lastValidated,
        qualityScore,
        status,
      }
    })

    metrics.sort((a, b) => {
      const { key, dir } = qualitySort
      let cmp = 0
      switch (key) {
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol)
          break
        case 'ohlcvValidity':
          cmp = a.ohlcvValidity - b.ohlcvValidity
          break
        case 'outliers':
          cmp = a.outliers - b.outliers
          break
        case 'gapsFilled':
          cmp = a.gapsFilled - b.gapsFilled
          break
        case 'qualityScore':
          cmp = a.qualityScore - b.qualityScore
          break
      }
      return dir === 'asc' ? cmp : -cmp
    })

    return metrics
  }, [subscriptions, qualityAlerts, qualitySort])

  // --- Sort toggle ---
  function toggleInstrumentSort(key: InstrumentSortKey) {
    setInstrumentSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  function toggleQualitySort(key: QualitySortKey) {
    setQualitySort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  function clearFilters() {
    setInstrumentSearch('')
    setAssetTypeFilter('all')
    setFreshnessFilter('all')
    setInstrumentPage(0)
  }

  // --- Sort indicator helper ---
  function SortIcon({ sortKey, current }: { sortKey: string; current: { key: string; dir: string } }) {
    if (current.key !== sortKey)
      return <ArrowUpDown size={12} aria-hidden="true" className="text-zinc-300 opacity-0 transition-opacity group-hover/th:opacity-100 dark:text-zinc-700" />
    return current.dir === 'asc' ? (
      <ChevronUp size={12} aria-hidden="true" className="text-primary" />
    ) : (
      <ChevronDown size={12} aria-hidden="true" className="text-primary" />
    )
  }

  // =========================================================================
  // Render
  // =========================================================================

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'instruments', label: 'Instruments', count: subscriptions.length },
    { id: 'history', label: 'Fetch History', count: fetchOperations.length },
    { id: 'quality', label: 'Quality', count: qualityAlerts.filter((a) => !a.acknowledged).length || undefined },
  ]

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Page Header                                                      */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack?.()}
            aria-label="Back to Market Data overview"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Market Data
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {dataSource.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className={`h-2 w-2 rounded-full ${statusDot[dataSource.status]}`} />
              <span className={`text-sm font-medium ${statusText[dataSource.status]}`}>
                {statusLabel[dataSource.status]}
              </span>
              <span className="text-sm text-faint">&mdash;</span>
              <span className="text-sm text-muted-foreground">
                {dataSource.statusMessage}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onForceRefreshAll?.(dataSource.id)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-accent active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Force Refresh All
        </button>
      </div>

      {/* ================================================================= */}
      {/* Config Summary                                                    */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Schedule', value: dataSource.fetchSchedule },
          { label: 'Intervals', value: dataSource.config.intervals.join(', ') },
          { label: 'Rate Limit', value: `${dataSource.rateLimitPerMinute}/min` },
          {
            label: 'Retention',
            value:
              dataSource.config.retentionDays >= 365
                ? `${Math.round(dataSource.config.retentionDays / 365)}y`
                : `${dataSource.config.retentionDays}d`,
          },
          {
            label: 'Fallbacks',
            value:
              dataSource.fallbackSources.length > 0
                ? dataSource.fallbackSources.map((s) => sourceShortNames[s] || s).join(', ')
                : 'None',
          },
          { label: 'Data Points', value: formatCompact(dataSource.totalDataPoints) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-3"
          >
            <p className="text-xs text-faint">{item.label}</p>
            <p
              className="mt-1 truncate font-mono text-xs font-medium text-foreground"
              title={item.value}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ================================================================= */}
      {/* Tab Bar                                                           */}
      {/* ================================================================= */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 ring-1 ring-zinc-200/60 dark:bg-zinc-900/80 dark:ring-zinc-800/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                sm:flex-none
                ${
                  isActive
                    ? 'bg-white text-foreground shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-800 dark:ring-zinc-700/50'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-pink-400'
                      : 'bg-zinc-200/60 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Instruments Tab                                                   */}
      {/* ================================================================= */}
      {activeTab === 'instruments' && (
        <div className="space-y-4">
          {/* Toolbar: search, filters, add button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  type="text"
                  value={instrumentSearch}
                  onChange={(e) => {
                    setInstrumentSearch(e.target.value)
                    setInstrumentPage(0)
                  }}
                  placeholder="Search symbol or name..."
                  aria-label="Search instruments by symbol or name"
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </div>

              {/* Asset type filter */}
              <select
                value={assetTypeFilter}
                onChange={(e) => {
                  setAssetTypeFilter(e.target.value)
                  setInstrumentPage(0)
                }}
                aria-label="Filter by asset type"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="all">All Types</option>
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
                <option value="option">Option</option>
              </select>

              {/* Freshness filter */}
              <select
                value={freshnessFilter}
                onChange={(e) => {
                  setFreshnessFilter(e.target.value)
                  setInstrumentPage(0)
                }}
                aria-label="Filter by data freshness"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="all">All Freshness</option>
                <option value="fresh">Fresh</option>
                <option value="stale">Stale</option>
                <option value="very_stale">Very Stale</option>
              </select>

              {/* Clear filters */}
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

            {/* Add Instrument */}
            <button
              onClick={() => onAddInstrument?.(dataSource.id, '', ['1d'])}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              <Plus size={15} aria-hidden="true" className="transition-transform group-hover:rotate-90" />
              Add Instrument
            </button>
          </div>

          {/* Table */}
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No instruments tracked from this source"
              description="Add instruments to start collecting data."
              actionLabel="Add Instrument"
              onAction={() => onAddInstrument?.(dataSource.id, '', ['1d'])}
            />
          ) : filteredSubscriptions.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-hint">
                No instruments match your filters.
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
                      {(
                        [
                          ['symbol', 'Symbol'],
                          ['assetType', 'Type'],
                        ] as const
                      ).map(([key, label]) => (
                        <th
                          key={key}
                          onClick={() => toggleInstrumentSort(key)}
                          className="group/th cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            <SortIcon sortKey={key} current={instrumentSort} />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-faint">
                        Intervals
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 lg:table-cell dark:text-zinc-600">
                        Coverage
                      </th>
                      {(
                        [
                          ['dataPoints', 'Points'],
                          ['gaps', 'Gaps'],
                          ['lastFetched', 'Last Fetched'],
                          ['freshness', 'Status'],
                        ] as const
                      ).map(([key, label]) => (
                        <th
                          key={key}
                          onClick={() => toggleInstrumentSort(key)}
                          className="group/th cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            <SortIcon sortKey={key} current={instrumentSort} />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-faint">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagedSubscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                      >
                        {/* Symbol */}
                        <td className="px-4 py-3">
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {sub.symbol}
                          </p>
                          <p className="text-xs text-faint">
                            {sub.instrumentName}
                          </p>
                        </td>
                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium capitalize text-muted-foreground dark:bg-zinc-800/60">
                            {sub.assetType}
                          </span>
                        </td>
                        {/* Intervals */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {sub.trackedIntervals.map((interval) => (
                              <span
                                key={interval}
                                className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-muted-foreground dark:bg-zinc-800/60"
                              >
                                {interval}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Coverage */}
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <p className="font-mono text-xs text-muted-foreground">
                            {sub.coverageStart}
                          </p>
                          <p className="font-mono text-xs text-faint">
                            → {sub.coverageEnd}
                          </p>
                        </td>
                        {/* Points */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">
                            {sub.dataPoints.toLocaleString()}
                          </span>
                        </td>
                        {/* Gaps */}
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono text-xs font-medium ${
                              sub.gaps > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {sub.gaps}
                          </span>
                        </td>
                        {/* Last Fetched */}
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono text-xs font-medium ${lastFetchedColor(sub.lastFetched)}`}
                            title={formatTimestamp(sub.lastFetched)}
                          >
                            {relativeTime(sub.lastFetched)}
                          </span>
                        </td>
                        {/* Freshness */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${freshnessDot[sub.freshness]}`} />
                            <span className="text-xs text-muted-foreground">
                              {freshnessLabelText[sub.freshness]}
                            </span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onStartBackfill?.(sub.id, '', '', '1d', 'normal')}
                              title="Backfill"
                              aria-label={`Backfill data for ${sub.symbol}`}
                              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-accent hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300"
                            >
                              <Download size={14} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => onRefreshInstrument?.(sub.id)}
                              title="Refresh"
                              aria-label={`Refresh ${sub.symbol}`}
                              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-accent hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300"
                            >
                              <RefreshCw size={14} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => onRemoveInstrument?.(sub.id)}
                              title="Remove"
                              aria-label={`Remove ${sub.symbol} from tracked instruments`}
                              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredSubscriptions.length > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
                  <span className="text-xs text-faint">
                    Showing {instrumentPage * PAGE_SIZE + 1}–
                    {Math.min((instrumentPage + 1) * PAGE_SIZE, filteredSubscriptions.length)} of{' '}
                    {filteredSubscriptions.length} instruments
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={instrumentPage === 0}
                      onClick={() => setInstrumentPage((p) => p - 1)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                    >
                      Previous
                    </button>
                    <button
                      disabled={(instrumentPage + 1) * PAGE_SIZE >= filteredSubscriptions.length}
                      onClick={() => setInstrumentPage((p) => p + 1)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Row count for small datasets */}
              {filteredSubscriptions.length <= PAGE_SIZE && filteredSubscriptions.length > 0 && (
                <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
                  <span className="text-xs text-faint">
                    Showing {filteredSubscriptions.length} of {subscriptions.length} instruments
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Fetch History Tab                                                 */}
      {/* ================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Active Backfill Tasks */}
          {activeBackfills.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center gap-2.5 border-b border-blue-200/40 px-6 py-3 dark:border-blue-900/30">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40">
                  <Download size={12} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Active Backfills
                </h3>
              </div>
              <div className="divide-y divide-blue-200/30 dark:divide-blue-900/20">
                {activeBackfills.map((task) => {
                  const badge = backfillStatusBadge[task.status]
                  return (
                    <div key={task.id} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {task.symbol}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {task.interval}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatTimeRemaining(task.estimatedTimeRemainingMs)}
                          </span>
                          <button
                            onClick={() => onCancelBackfill?.(task.id)}
                            className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-800 dark:hover:text-red-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs font-medium text-foreground">
                          {task.progressPercent}%
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-faint">
                        <span>
                          {task.startDate} → {task.endDate}
                        </span>
                        <span>&middot;</span>
                        <span>
                          {task.dataPointsFetched.toLocaleString()} / {task.estimatedTotalPoints.toLocaleString()} points
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={fetchStatusFilter}
              onChange={(e) => {
                setFetchStatusFilter(e.target.value)
                setFetchPage(0)
              }}
              aria-label="Filter by fetch status"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Fetch Operations Table */}
          {fetchOperations.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No fetch history yet"
              description="Data will appear here once the first scheduled fetch runs."
            />
          ) : filteredFetchOps.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-hint">
                No operations match this filter.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Timestamp', 'Type', 'Instruments', 'Points', 'Duration', 'Status', ''].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-faint"
                          >
                            {col}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagedFetchOps.map((op) => {
                      const typeBdg = fetchTypeBadge[op.operationType]
                      const statusBdg = fetchStatusBadge[op.status]
                      return (
                        <tr
                          key={op.id}
                          className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {formatTimestamp(op.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${typeBdg.bg} ${typeBdg.text}`}
                            >
                              {typeBdg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {op.instrumentsCount <= 3 ? (
                              <span className="font-mono text-xs text-muted-foreground">
                                {op.instrumentsAffected.join(', ')}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-muted-foreground">
                                {op.instrumentsCount} instruments
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-foreground">
                            {op.dataPointsFetched.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {formatDuration(op.durationMs)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusBdg.bg} ${statusBdg.text}`}
                            >
                              {statusBdg.label}
                            </span>
                            {op.errorMessage && (
                              <p className="mt-1 max-w-xs truncate text-xs text-red-500 dark:text-red-400" title={op.errorMessage}>
                                {op.errorMessage}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {(op.status === 'failed' || op.status === 'partial') && (
                              <button
                                onClick={() => onRetryFetch?.(op.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent dark:border-zinc-700"
                              >
                                <RotateCcw size={11} aria-hidden="true" />
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredFetchOps.length > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800/60">
                  <span className="text-xs text-faint">
                    Showing {fetchPage * PAGE_SIZE + 1}–
                    {Math.min((fetchPage + 1) * PAGE_SIZE, filteredFetchOps.length)} of{' '}
                    {filteredFetchOps.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={fetchPage === 0}
                      onClick={() => setFetchPage((p) => p - 1)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                    >
                      Previous
                    </button>
                    <button
                      disabled={(fetchPage + 1) * PAGE_SIZE >= filteredFetchOps.length}
                      onClick={() => setFetchPage((p) => p + 1)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 dark:border-zinc-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Quality Tab                                                       */}
      {/* ================================================================= */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No quality metrics available yet"
              description="Data quality checks run automatically after each fetch."
            />
          ) : (
            <>
              {/* Quality Metrics Table */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-border">
                        {(
                          [
                            ['symbol', 'Symbol'],
                            ['ohlcvValidity', 'OHLCV Validity'],
                            ['outliers', 'Outliers'],
                            ['gapsFilled', 'Gaps Filled'],
                            ['qualityScore', 'Quality Score'],
                          ] as const
                        ).map(([key, label]) => (
                          <th
                            key={key}
                            onClick={() => toggleQualitySort(key)}
                            className="group/th cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                          >
                            <div className="flex items-center gap-1">
                              {label}
                              <SortIcon sortKey={key} current={qualitySort} />
                            </div>
                          </th>
                        ))}
                        <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 md:table-cell dark:text-zinc-600">
                          Last Validated
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-faint">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {qualityMetrics.map((m) => {
                        const validityColor =
                          m.ohlcvValidity > 99
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : m.ohlcvValidity >= 95
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        const scoreColor =
                          m.qualityScore >= 95
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : m.qualityScore >= 80
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        const statusBadgeConfig = {
                          healthy: {
                            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                            text: 'text-emerald-600 dark:text-emerald-400',
                            label: 'Healthy',
                          },
                          warning: {
                            bg: 'bg-amber-50 dark:bg-amber-950/30',
                            text: 'text-amber-600 dark:text-amber-400',
                            label: 'Warning',
                          },
                          critical: {
                            bg: 'bg-red-50 dark:bg-red-950/30',
                            text: 'text-red-600 dark:text-red-400',
                            label: 'Critical',
                          },
                        }[m.status]

                        return (
                          <tr
                            key={m.subscriptionId}
                            className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                          >
                            <td className="px-4 py-3">
                              <p className="font-mono text-sm font-semibold text-foreground">
                                {m.symbol}
                              </p>
                              <p className="text-xs text-faint">
                                {m.instrumentName}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-mono text-xs font-medium ${validityColor}`}>
                                {m.ohlcvValidity.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {m.outliers > 0 ? (
                                <span className="font-mono text-xs font-medium text-red-600 dark:text-red-400">
                                  {m.outliers}
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-faint">
                                  0
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-muted-foreground">
                                {m.gapsFilled}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-mono text-sm font-semibold ${scoreColor}`}>
                                {m.qualityScore}%
                              </span>
                            </td>
                            <td className="hidden px-4 py-3 md:table-cell">
                              <span className="font-mono text-xs text-hint">
                                {relativeTime(m.lastValidated)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusBadgeConfig.bg} ${statusBadgeConfig.text}`}
                              >
                                {statusBadgeConfig.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quality Alerts Detail */}
              {qualityAlerts.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                        <AlertTriangle size={13} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Quality Alerts
                      </h3>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-muted-foreground dark:bg-zinc-800/60">
                        {qualityAlerts.filter((a) => !a.acknowledged).length} unreviewed
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {qualityAlerts.map((alert) => {
                      const alertBdg = alertTypeBadge[alert.alertType]
                      const sevBdg = severityBadge[alert.severity]
                      return (
                        <div key={alert.id} className="px-6 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-foreground">
                                  {alert.symbol}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${alertBdg.bg} ${alertBdg.text}`}
                                >
                                  {alertBdg.label}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${sevBdg.bg} ${sevBdg.text}`}
                                >
                                  {sevBdg.label}
                                </span>
                                {alert.acknowledged && (
                                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 size={11} />
                                    Reviewed
                                  </span>
                                )}
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                {alert.description}
                              </p>
                              {alert.dataPoint && (
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/40">
                                  {(['open', 'high', 'low', 'close', 'volume'] as const).map(
                                    (field) => (
                                      <span
                                        key={field}
                                        className="font-mono text-xs text-muted-foreground"
                                      >
                                        <span className="uppercase text-faint">
                                          {field[0]}:
                                        </span>{' '}
                                        {field === 'volume'
                                          ? alert.dataPoint![field].toLocaleString()
                                          : alert.dataPoint![field].toFixed(2)}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="font-mono text-xs text-faint">
                                {relativeTime(alert.detectedAt)}
                              </span>
                              {!alert.acknowledged && (
                                <button
                                  onClick={() => onAcknowledgeAlert?.(alert.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-zinc-700 dark:hover:border-emerald-800 dark:hover:text-emerald-400"
                                >
                                  <CheckCircle2 size={11} aria-hidden="true" />
                                  Acknowledge
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State helper
// ---------------------------------------------------------------------------

function EmptyState({
  icon: EmptyIcon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl dark:bg-primary/10" />
        <div className="relative rounded-2xl border border-dashed border-zinc-300 bg-card px-8 py-16 text-center backdrop-blur-sm dark:border-zinc-700/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800/80 dark:ring-zinc-700/50">
            <EmptyIcon size={24} className="text-hint" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              <Plus size={15} aria-hidden="true" />
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
