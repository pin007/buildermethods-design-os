import {
  TrendingUp,
  GitBranch,
  Shuffle,
  Clock,
  Calendar,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import type { Strategy, StrategyType } from '@/../product/sections/strategy-engine/types'
import { ToggleSwitch } from '@/sections/settings-and-operations/components/SettingsDetailLayout'

// =============================================================================
// Props
// =============================================================================

interface StrategyCardProps {
  strategy: Strategy
  onView?: () => void
  onToggleActive?: (active: boolean) => void
  onDelete?: () => void
}

// =============================================================================
// Helpers
// =============================================================================

const typeBadgeConfig: Record<StrategyType, { label: string; bg: string; text: string; icon: typeof TrendingUp }> = {
  TREND_FOLLOWING: {
    label: 'Trend Following',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    icon: TrendingUp,
  },
  MEAN_REVERSION: {
    label: 'Mean Reversion',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    icon: GitBranch,
  },
  COMPOSITE: {
    label: 'Composite',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    icon: Shuffle,
  },
}

function formatSchedule(strategy: Strategy): string {
  if (!strategy.schedule.enabled) return 'Manual'
  if (strategy.schedule.frequency === 'interval' && strategy.schedule.intervalMinutes) {
    return `Every ${strategy.schedule.intervalMinutes}m`
  }
  const time = strategy.schedule.time ?? ''
  const tz = strategy.schedule.timezone
  const shortTz = tz === 'America/New_York' ? 'ET' : tz === 'UTC' ? 'UTC' : tz
  return `Daily at ${time} ${shortTz}`
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatSharpe(value: number): string {
  return value.toFixed(2)
}

// =============================================================================
// Component
// =============================================================================

export function StrategyCard({ strategy, onView, onToggleActive, onDelete }: StrategyCardProps) {
  const typeConfig = typeBadgeConfig[strategy.type]
  const TypeIcon = typeConfig.icon
  const bt = strategy.lastBacktest
  const isActive = strategy.active

  return (
    <div
      className={`
        group relative rounded-2xl border transition-all duration-200 cursor-pointer
        ${isActive
          ? 'border-l-[3px] border-l-primary border-t-border border-r-border border-b-border bg-card'
          : 'border-border bg-zinc-50/50 dark:bg-zinc-900/50 opacity-75'
        }
        hover:shadow-md dark:hover:shadow-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
      `}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onView?.() }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
              <TypeIcon size={12} strokeWidth={2} />
              {typeConfig.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                strategy.promotedToLive
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-blue-400/10 text-blue-600 dark:text-blue-400'
              }`}
              title={
                strategy.promotedToLive
                  ? 'Promoted to live — low-risk signals may auto-execute against live portfolios'
                  : 'Paper only — live signals still require manual approval'
              }
            >
              {strategy.promotedToLive ? 'Live' : 'Paper'}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground truncate pr-8">
            {strategy.name}
          </h3>
          <p className="mt-0.5 text-xs text-hint line-clamp-1">
            {strategy.description}
          </p>
        </div>

        {/* Active toggle */}
        <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            enabled={isActive}
            onChange={(active) => onToggleActive?.(active)}
            label={isActive ? 'Deactivate strategy' : 'Activate strategy'}
            size="md"
          />
        </span>
      </div>

      {/* Instruments */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {strategy.instruments.slice(0, 5).map((inst) => (
            <span
              key={inst}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {inst}
            </span>
          ))}
          {strategy.instruments.length > 5 && (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-hint">
              +{strategy.instruments.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      {bt ? (
        <div className="mx-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-hint mb-0.5">
                Sharpe
              </p>
              <p className={`font-mono text-sm font-bold tabular-nums ${
                bt.sharpe >= 1.0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : bt.sharpe >= 0.5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-500 dark:text-red-400'
              }`}>
                {formatSharpe(bt.sharpe)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-hint mb-0.5">
                CAGR
              </p>
              <p className={`font-mono text-sm font-bold tabular-nums ${
                bt.cagr >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {formatPercent(bt.cagr)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-hint mb-0.5">
                Max DD
              </p>
              <p className={`font-mono text-sm font-bold tabular-nums ${
                Math.abs(bt.maxDrawdown) <= 0.15
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : Math.abs(bt.maxDrawdown) <= 0.25
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-500 dark:text-red-400'
              }`}>
                {formatPercent(bt.maxDrawdown)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3.5">
          <p className="text-xs text-hint italic text-center">
            No backtests yet
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 mt-1">
        <div className="flex items-center gap-3 text-xs text-hint">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} strokeWidth={1.5} />
            {formatSchedule(strategy)}
          </span>
          {bt && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} strokeWidth={1.5} />
              {formatDate(bt.date)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="rounded-lg p-1.5 text-faint hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30"
            aria-label="Delete strategy"
          >
            <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <div className="text-faint opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}
