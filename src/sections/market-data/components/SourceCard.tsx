import {
  ChevronRight,
  Cloud,
  ArrowLeftRight,
  Bitcoin,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DataSource, DataSourceStatus } from '@/../product/sections/market-data/types'

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

function futureTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = then - now
  if (diffMs <= 0) return 'Overdue'
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  if (diffMin < 60) return `In ${diffMin}m`
  if (diffHr < 24) return `In ${diffHr}h`
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function formatAbsoluteTime(timestamp: string): string {
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm} UTC`
}

// ---------------------------------------------------------------------------
// Icon mapping (Material icon name → Lucide component)
// ---------------------------------------------------------------------------

const sourceIconMap: Record<string, LucideIcon> = {
  cloud_download: Cloud,
  swap_horiz: ArrowLeftRight,
  currency_bitcoin: Bitcoin,
  analytics: BarChart3,
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

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

const cardBorder: Record<DataSourceStatus, string> = {
  connected: 'border-border hover:border-zinc-300 dark:hover:border-zinc-700',
  degraded: 'border-amber-300/50 dark:border-amber-900/40 hover:border-amber-400/60 dark:hover:border-amber-800/50',
  disconnected: 'border-red-300/50 dark:border-red-900/40 hover:border-red-400/60 dark:hover:border-red-800/50',
}

const accentGradient: Record<DataSourceStatus, string> = {
  connected: 'from-emerald-500/40 via-emerald-400/10 to-transparent',
  degraded: 'from-amber-500/40 via-amber-400/10 to-transparent',
  disconnected: 'from-red-500/40 via-red-400/10 to-transparent',
}

// ---------------------------------------------------------------------------
// Error rate color
// ---------------------------------------------------------------------------

function errorRateColor(rate: number): string {
  if (rate < 1) return 'text-emerald-600 dark:text-emerald-400'
  if (rate <= 5) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SourceCardProps {
  source: DataSource
  onClick?: () => void
}

export function SourceCard({ source, onClick }: SourceCardProps) {
  const Icon = sourceIconMap[source.icon] ?? Cloud

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full overflow-hidden rounded-2xl border
        bg-card p-5 text-left transition-all duration-200
        hover:shadow-sm active:scale-[0.99]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600
        ${cardBorder[source.status]}
      `}
      aria-label={`${source.name} — ${statusLabel[source.status]}`}
    >
      {/* Status glow for degraded / disconnected */}
      {source.status === 'degraded' && (
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/[0.06] blur-2xl dark:bg-amber-500/[0.10]" />
      )}
      {source.status === 'disconnected' && (
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/[0.06] blur-2xl dark:bg-red-500/[0.10]" />
      )}

      <div className="relative">
        {/* Header: icon + name + status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-zinc-200/60 dark:ring-zinc-700/40">
              <Icon size={18} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {source.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${statusDot[source.status]}`} />
                <span className={`text-xs font-medium ${statusText[source.status]}`}>
                  {statusLabel[source.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Hover arrow */}
          <div className="opacity-40 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100">
            <ChevronRight size={14} aria-hidden="true" className="text-faint" />
          </div>
        </div>

        {/* Status message */}
        <p className="mt-3 truncate text-xs text-hint">
          {source.statusMessage}
        </p>

        {/* Metrics grid */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-xs text-faint">Last Fetch</p>
            <p
              className="mt-0.5 font-mono text-xs font-medium text-foreground"
              title={formatAbsoluteTime(source.lastSuccessfulFetch)}
            >
              {relativeTime(source.lastSuccessfulFetch)}
            </p>
          </div>
          <div>
            <p className="text-xs text-faint">Error Rate</p>
            <p className={`mt-0.5 font-mono text-xs font-medium ${errorRateColor(source.errorRateLast24h)}`}>
              {source.errorRateLast24h.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-faint">Instruments</p>
            <p className="mt-0.5 font-mono text-xs font-medium text-foreground">
              {source.trackedInstrumentsCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-faint">Next Fetch</p>
            <p
              className="mt-0.5 font-mono text-xs font-medium text-foreground"
              title={formatAbsoluteTime(source.nextScheduledFetch)}
            >
              {futureTime(source.nextScheduledFetch)}
            </p>
          </div>
        </div>

        {/* Real-time / Scheduled badge */}
        <div className="mt-4">
          {source.supportsRealtime ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800/40">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              Real-time
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-zinc-200/60 dark:bg-zinc-800/60 dark:ring-zinc-700/40">
              Scheduled
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentGradient[source.status]}`} />
    </button>
  )
}
