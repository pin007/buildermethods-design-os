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
          ? 'border-l-[3px] border-l-pink-600 border-t-zinc-200 border-r-zinc-200 border-b-zinc-200 dark:border-l-pink-500 dark:border-t-zinc-800 dark:border-r-zinc-800 dark:border-b-zinc-800 bg-white dark:bg-zinc-900'
          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 opacity-75'
        }
        hover:shadow-md dark:hover:shadow-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700
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
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-8">
            {strategy.name}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
            {strategy.description}
          </p>
        </div>

        {/* Active toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleActive?.(!isActive)
          }}
          className={`
            relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600
            ${isActive
              ? 'bg-pink-600 dark:bg-pink-500'
              : 'bg-zinc-200 dark:bg-zinc-700'
            }
          `}
          aria-label={isActive ? 'Deactivate strategy' : 'Activate strategy'}
          role="switch"
          aria-checked={isActive}
        >
          <span
            className={`
              inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
              ${isActive ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Instruments */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {strategy.instruments.slice(0, 5).map((inst) => (
            <span
              key={inst}
              className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              {inst}
            </span>
          ))}
          {strategy.instruments.length > 5 && (
            <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
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
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic text-center">
            No backtests yet
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 mt-1">
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
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
            className="rounded-lg p-1.5 text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30"
            aria-label="Delete strategy"
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
          <div className="text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}
