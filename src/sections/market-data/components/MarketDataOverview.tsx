import {
  Database,
  Server,
  Clock,
  AlertTriangle,
  ChevronRight,
  GitMerge,
  ShieldAlert,
  Settings,
} from 'lucide-react'
import type {
  MarketDataOverviewProps,
  CorporateActionType,
  AdjustmentStatus,
  QualityAlertType,
  AlertSeverity,
} from '@/../product/sections/market-data/types'
import { SourceCard } from './SourceCard'

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

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// ---------------------------------------------------------------------------
// Badge configs
// ---------------------------------------------------------------------------

const actionTypeBadge: Record<CorporateActionType, { bg: string; text: string; label: string }> = {
  split: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Split',
  },
  dividend: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Dividend',
  },
  ticker_change: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Ticker Change',
  },
}

const adjustmentBadge: Record<AdjustmentStatus, { bg: string; text: string; label: string }> = {
  adjusted: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Adjusted',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Pending',
  },
  failed: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Failed',
  },
  not_required: {
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
    text: 'text-zinc-500 dark:text-zinc-400',
    label: 'Not Required',
  },
}

const alertTypeBadge: Record<QualityAlertType, { bg: string; text: string; label: string }> = {
  outlier: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Outlier',
  },
  gap_filled: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Gap Filled',
  },
  ohlcv_invalid: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'OHLCV Invalid',
  },
  stale_data: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Stale Data',
  },
}

const severityBadge: Record<AlertSeverity, { bg: string; text: string; label: string }> = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Info',
  },
}

// ---------------------------------------------------------------------------
// Change-type styling
// ---------------------------------------------------------------------------

type ChangeType = 'positive' | 'negative' | 'neutral' | 'warning'

const changeColors: Record<ChangeType, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-500 dark:text-red-400',
  neutral: 'text-zinc-500 dark:text-zinc-500',
  warning: 'text-amber-500 dark:text-amber-400',
}

const iconTint: Record<ChangeType, string> = {
  positive: 'text-emerald-600/50 dark:text-emerald-400/40',
  negative: 'text-red-500/50 dark:text-red-400/40',
  neutral: 'text-zinc-300 dark:text-zinc-700',
  warning: 'text-amber-500/50 dark:text-amber-400/40',
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MarketDataOverview({
  pipelineStats,
  dataSources,
  recentCorporateActions,
  recentQualityAlerts,
  onViewSource,
  onViewAllCorporateActions,
  onViewAllQualityAlerts,
  onConfigureSources,
}: MarketDataOverviewProps) {
  // Derive stat card context from data
  const degradedCount = dataSources.filter((s) => s.status === 'degraded').length
  const disconnectedCount = dataSources.filter((s) => s.status === 'disconnected').length

  const sourcesChangeType: ChangeType =
    disconnectedCount > 0 ? 'negative' : degradedCount > 0 ? 'warning' : 'positive'
  const sourcesChange =
    disconnectedCount > 0
      ? `${disconnectedCount} disconnected`
      : degradedCount > 0
        ? `${degradedCount} degraded`
        : 'All connected'

  const freshnessChangeType: ChangeType =
    pipelineStats.dataFreshnessPercent >= 95
      ? 'positive'
      : pipelineStats.dataFreshnessPercent >= 80
        ? 'warning'
        : 'negative'

  const alertsChangeType: ChangeType =
    pipelineStats.qualityAlertsCount === 0 ? 'positive' : 'warning'

  // =========================================================================
  // Empty state — no data sources configured
  // =========================================================================

  if (dataSources.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 bg-white px-8 py-16 text-center backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/80">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800/80 dark:ring-zinc-700/50">
              <Server size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              No data sources configured
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Set up your market data connections to get started.
            </p>
            <button
              onClick={() => onConfigureSources?.()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              <Settings size={15} />
              Configure Sources
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // Main overview
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Pipeline Health
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Market Data
        </h1>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Stat Cards                                                      */}
      {/* --------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Tracked Instruments */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="text-zinc-300 dark:text-zinc-700">
            <Database size={16} strokeWidth={1.5} />
          </div>
          <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Tracked Instruments
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {pipelineStats.totalTrackedInstruments}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            {formatCompact(pipelineStats.totalDataPoints)} data points
          </p>
        </div>

        {/* Active Sources */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          {sourcesChangeType !== 'positive' && (
            <div
              className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${
                sourcesChangeType === 'warning'
                  ? 'bg-amber-500/[0.08] dark:bg-amber-500/[0.12]'
                  : 'bg-red-500/[0.08] dark:bg-red-500/[0.12]'
              }`}
            />
          )}
          <div className="relative">
            <div className={iconTint[sourcesChangeType]}>
              <Server size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Active Sources
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pipelineStats.activeDataSources} / {pipelineStats.totalDataSources}
            </p>
            <p className={`mt-1 text-xs font-medium ${changeColors[sourcesChangeType]}`}>
              {sourcesChange}
            </p>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          {freshnessChangeType !== 'positive' && (
            <div
              className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${
                freshnessChangeType === 'warning'
                  ? 'bg-amber-500/[0.08] dark:bg-amber-500/[0.12]'
                  : 'bg-red-500/[0.08] dark:bg-red-500/[0.12]'
              }`}
            />
          )}
          <div className="relative">
            <div className={iconTint[freshnessChangeType]}>
              <Clock size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Data Freshness
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pipelineStats.dataFreshnessPercent}%
            </p>
            <p className={`mt-1 text-xs font-medium ${changeColors[freshnessChangeType]}`}>
              {pipelineStats.dataFreshnessPercent >= 95
                ? 'All instruments current'
                : pipelineStats.dataFreshnessPercent >= 80
                  ? 'Some instruments stale'
                  : 'Many instruments stale'}
            </p>
          </div>
        </div>

        {/* Quality Alerts (clickable) */}
        <button
          onClick={() => onViewAllQualityAlerts?.()}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:border-pink-300 hover:shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:hover:border-pink-900/60"
        >
          {pipelineStats.qualityAlertsCount > 0 && (
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/[0.08] blur-2xl dark:bg-amber-500/[0.12]" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className={iconTint[alertsChangeType]}>
                <AlertTriangle size={16} strokeWidth={1.5} />
              </div>
              {pipelineStats.qualityAlertsCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white shadow-sm shadow-pink-600/30">
                  {pipelineStats.qualityAlertsCount}
                </span>
              )}
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Quality Alerts
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pipelineStats.qualityAlertsCount}
            </p>
            <p className={`mt-1 text-xs font-medium ${changeColors[alertsChangeType]}`}>
              {pipelineStats.qualityAlertsCount === 0
                ? 'All clear'
                : `${pipelineStats.qualityAlertsCount} unreviewed`}
            </p>

            {/* Hover arrow */}
            <div className="absolute right-0 top-1/2 -translate-x-1 -translate-y-1/2 opacity-40 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </button>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Data Sources                                                    */}
      {/* --------------------------------------------------------------- */}
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <Server size={13} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Data Sources
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onClick={() => onViewSource?.(source.id)}
            />
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Bottom: Corporate Actions + Quality Alerts                      */}
      {/* --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Corporate Actions */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
                <GitMerge size={13} className="text-zinc-500 dark:text-zinc-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Recent Corporate Actions
              </h2>
            </div>
            <button
              onClick={() => onViewAllCorporateActions?.()}
              className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
            >
              View All
              <ChevronRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* List */}
          {recentCorporateActions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60">
                <GitMerge size={16} className="text-zinc-300 dark:text-zinc-700" />
              </div>
              <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
                No corporate actions detected recently.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {recentCorporateActions.slice(0, 5).map((action) => {
                const typeBadge = actionTypeBadge[action.actionType]
                const statusBdg = adjustmentBadge[action.adjustmentStatus]
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between gap-3 px-6 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {action.symbol}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${typeBadge.bg} ${typeBadge.text}`}
                      >
                        {typeBadge.label}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden font-mono text-xs text-zinc-400 sm:inline dark:text-zinc-600">
                        {formatDate(action.actionDate)}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusBdg.bg} ${statusBdg.text}`}
                      >
                        {statusBdg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quality Alerts */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
                <ShieldAlert size={13} className="text-zinc-500 dark:text-zinc-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Data Quality Alerts
              </h2>
            </div>
            <button
              onClick={() => onViewAllQualityAlerts?.()}
              className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
            >
              View All
              <ChevronRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* List */}
          {recentQualityAlerts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60">
                <ShieldAlert size={16} className="text-zinc-300 dark:text-zinc-700" />
              </div>
              <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
                All data quality checks passing.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {recentQualityAlerts.slice(0, 5).map((alert) => {
                const alertBdg = alertTypeBadge[alert.alertType]
                const sevBdg = severityBadge[alert.severity]
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between gap-3 px-6 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {alert.symbol}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${alertBdg.bg} ${alertBdg.text}`}
                      >
                        {alertBdg.label}
                      </span>
                      <span
                        className={`hidden shrink-0 rounded px-1.5 py-0.5 text-xs font-medium sm:inline ${sevBdg.bg} ${sevBdg.text}`}
                      >
                        {sevBdg.label}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-600">
                      {relativeTime(alert.detectedAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
