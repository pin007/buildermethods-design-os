import { useState } from 'react'
import {
  ArrowLeft,
  Settings2,
  FlaskConical,
  BarChart3,
  Pencil,
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Shuffle,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Zap,
  Info,
} from 'lucide-react'
import type {
  Strategy,
  Backtest,
  BacktestStatus,
  WalkForwardOptimization,
  ExitStrategyType,
  StrategyType,
  OverfittingRisk,
  StrategyDetailProps,
} from '../types'

// =============================================================================
// Helpers
// =============================================================================

type TabId = 'configuration' | 'backtests' | 'walk-forward'

const tabs: { id: TabId; label: string; icon: typeof Settings2 }[] = [
  { id: 'configuration', label: 'Configuration', icon: Settings2 },
  { id: 'backtests', label: 'Backtest History', icon: FlaskConical },
  { id: 'walk-forward', label: 'Walk-Forward', icon: BarChart3 },
]

const exitStrategyLabels: Record<ExitStrategyType, string> = {
  STOP_LOSS: 'Stop Loss',
  TAKE_PROFIT: 'Take Profit',
  TRAILING_STOP: 'Trailing Stop',
  BREAK_EVEN: 'Break Even',
}

const exitStrategyIcons: Record<ExitStrategyType, typeof Shield> = {
  STOP_LOSS: Shield,
  TAKE_PROFIT: Target,
  TRAILING_STOP: TrendingUp,
  BREAK_EVEN: Zap,
}

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

const statusConfig: Record<BacktestStatus, { label: string; bg: string; text: string; dot: string }> = {
  queued: {
    label: 'Queued',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    dot: 'bg-zinc-400',
  },
  running: {
    label: 'Running',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
}

const overfittingConfig: Record<OverfittingRisk, { bg: string; text: string }> = {
  LOW: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300' },
  MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300' },
  HIGH: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300' },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatDateShort(dateStr: string): string {
  if (dateStr.includes('T')) return formatDate(dateStr)
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const min = Math.floor(seconds / 60)
  const sec = Math.round(seconds % 60)
  return `${min}m ${sec}s`
}

function formatSchedule(strategy: Strategy): string {
  if (!strategy.schedule.enabled) return 'Manual (disabled)'
  if (strategy.schedule.frequency === 'interval' && strategy.schedule.intervalMinutes) {
    return `Every ${strategy.schedule.intervalMinutes} minutes`
  }
  const time = strategy.schedule.time ?? ''
  const tz = strategy.schedule.timezone
  const shortTz = tz === 'America/New_York' ? 'ET' : tz === 'UTC' ? 'UTC' : tz
  return `Daily at ${time} ${shortTz}`
}

// =============================================================================
// Component
// =============================================================================

export function StrategyDetail({
  strategy,
  backtests,
  walkForwardOptimizations,
  onEditStrategy,
  onToggleActive,
  onRunBacktest,
  onViewBacktest,
  onRunWalkForward,
  onViewWalkForward,
  onTabChange,
}: StrategyDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('configuration')
  const [expandedExits, setExpandedExits] = useState<Set<ExitStrategyType>>(
    new Set(strategy.exitStrategies.filter((e) => e.enabled).map((e) => e.type))
  )

  const typeConfig = typeBadgeConfig[strategy.type]
  const TypeIcon = typeConfig.icon

  // Filter backtests and WFO for this strategy
  const strategyBacktests = backtests
    .filter((bt) => bt.strategyId === strategy.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const strategyWFO = walkForwardOptimizations
    .filter((wfo) => wfo.strategyId === strategy.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const handleTab = (tab: TabId) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  const toggleExit = (type: ExitStrategyType) => {
    setExpandedExits((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  // ── Section header ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onBack?.()}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Intelligence
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                {strategy.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 ${typeConfig.bg} ${typeConfig.text}`}>
                <TypeIcon size={12} strokeWidth={2} />
                {typeConfig.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              {strategy.description}
            </p>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-medium ${strategy.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
            {strategy.active ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => onToggleActive?.(strategy.id, !strategy.active)}
            className={`
              relative flex h-6 w-11 items-center rounded-full transition-colors duration-200
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600
              ${strategy.active
                ? 'bg-pink-600 dark:bg-pink-500'
                : 'bg-stone-200 dark:bg-zinc-700'
              }
            `}
            role="switch"
            aria-checked={strategy.active}
            aria-label={strategy.active ? 'Deactivate strategy' : 'Activate strategy'}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${strategy.active ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const count = tab.id === 'backtests' ? strategyBacktests.length
            : tab.id === 'walk-forward' ? strategyWFO.length
            : undefined
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`
                inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'border-pink-600 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
            >
              <Icon size={15} strokeWidth={1.5} />
              {tab.label}
              {count !== undefined && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isActive
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'configuration' && (
        <ConfigurationTab
          strategy={strategy}
          expandedExits={expandedExits}
          onToggleExit={toggleExit}
          onEdit={() => onEditStrategy?.(strategy.id)}
        />
      )}
      {activeTab === 'backtests' && (
        <BacktestHistoryTab
          backtests={strategyBacktests}
          strategyId={strategy.id}
          onRunBacktest={() => onRunBacktest?.(strategy.id)}
          onViewBacktest={(id) => onViewBacktest?.(id)}
        />
      )}
      {activeTab === 'walk-forward' && (
        <WalkForwardTab
          optimizations={strategyWFO}
          strategyId={strategy.id}
          onRunWalkForward={() => onRunWalkForward?.(strategy.id)}
          onViewWalkForward={(id) => onViewWalkForward?.(id)}
        />
      )}
    </div>
  )
}

// =============================================================================
// Configuration Tab
// =============================================================================

function ConfigurationTab({
  strategy,
  expandedExits,
  onToggleExit,
  onEdit,
}: {
  strategy: Strategy
  expandedExits: Set<ExitStrategyType>
  onToggleExit: (type: ExitStrategyType) => void
  onEdit: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Edit button */}
      <div className="flex justify-end">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          <Pencil size={14} strokeWidth={1.5} />
          Edit Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Strategy Parameters */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Entry Strategy</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {typeBadgeConfig[strategy.type].label} parameters
            </p>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {strategy.parameters.map((param) => (
              <div key={param.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{param.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{param.description}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Strategies */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Exit Strategies</h3>
            {strategy.exitPriority && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Priority: {strategy.exitPriority.map((t) => exitStrategyLabels[t]).join(' → ')}
              </p>
            )}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {strategy.exitStrategies.map((exit) => {
              const ExitIcon = exitStrategyIcons[exit.type]
              const isExpanded = expandedExits.has(exit.type)
              return (
                <div key={exit.type}>
                  <button
                    onClick={() => onToggleExit(exit.type)}
                    className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ExitIcon size={15} strokeWidth={1.5} className={exit.enabled ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-600'} />
                      <span className={`text-sm font-medium ${exit.enabled ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {exitStrategyLabels[exit.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        exit.enabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}>
                        {exit.enabled ? 'On' : 'Off'}
                      </span>
                      {exit.parameters.length > 0 && (
                        isExpanded
                          ? <ChevronDown size={14} className="text-zinc-400" />
                          : <ChevronRight size={14} className="text-zinc-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && exit.parameters.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 px-5 pb-3">
                      {exit.parameters.map((param) => (
                        <div key={param.name} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{param.name}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{param.description}</p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                            {param.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Instruments */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Instruments</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{strategy.instruments.length} assigned</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {strategy.instruments.map((inst) => (
                <span
                  key={inst}
                  className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Position Sizing & Schedule */}
        <div className="space-y-6">
          {/* Position Sizing */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Position Sizing</h3>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Risk per Trade</span>
                <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {(strategy.positionSizing.riskPerTrade * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Max Position</span>
                <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {(strategy.positionSizing.maxPosition * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Volatility Adjustment</span>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  strategy.positionSizing.volatilityAdjustment
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                }`}>
                  {strategy.positionSizing.volatilityAdjustment ? <Check size={11} /> : <X size={11} />}
                  {strategy.positionSizing.volatilityAdjustment ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Evaluation Schedule</h3>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  strategy.schedule.enabled
                    ? 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                }`}>
                  <Clock size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatSchedule(strategy)}
                  </p>
                  {strategy.schedule.enabled && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Timezone: {strategy.schedule.timezone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composite strategy visualization */}
      {strategy.type === 'COMPOSITE' && strategy.exitPriority && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Composite Strategy Flow</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Master entry strategy with prioritized exit strategies
            </p>
          </div>
          <div className="px-5 py-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Master entry */}
              <div className="flex items-center gap-2 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 px-4 py-3">
                <Shuffle size={16} className="text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Master</p>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Entry Strategy</p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight size={20} className="text-zinc-300 dark:text-zinc-600 shrink-0" />

              {/* Exit strategies in priority order */}
              {strategy.exitPriority.map((type, idx) => {
                const exit = strategy.exitStrategies.find((e) => e.type === type)
                const ExitIcon = exitStrategyIcons[type]
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
                      exit?.enabled
                        ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        : 'border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 opacity-50'
                    }`}>
                      <ExitIcon size={14} className="text-zinc-500 dark:text-zinc-400" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          #{idx + 1}
                        </p>
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {exitStrategyLabels[type]}
                        </p>
                      </div>
                    </div>
                    {idx < strategy.exitPriority!.length - 1 && (
                      <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Backtest History Tab
// =============================================================================

function BacktestHistoryTab({
  backtests,
  strategyId,
  onRunBacktest,
  onViewBacktest,
}: {
  backtests: Backtest[]
  strategyId: string
  onRunBacktest: () => void
  onViewBacktest: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {backtests.length} backtest{backtests.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onRunBacktest}
          className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 dark:hover:bg-pink-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          <Play size={14} strokeWidth={2} />
          Run Backtest
        </button>
      </div>

      {backtests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <FlaskConical size={24} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">No backtests yet</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Run your first backtest to evaluate this strategy</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Date Range</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Capital</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Sharpe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">CAGR</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Max DD</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Trades</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {backtests.map((bt) => {
                  const sc = statusConfig[bt.status]
                  return (
                    <tr
                      key={bt.id}
                      onClick={() => bt.status === 'completed' ? onViewBacktest(bt.id) : undefined}
                      className={`transition-colors ${
                        bt.status === 'completed'
                          ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{bt.id}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {formatDateShort(bt.startDate)} — {formatDateShort(bt.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {formatCurrency(bt.initialCapital)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bt.metrics ? (
                          <span className={`font-mono font-semibold tabular-nums ${
                            bt.metrics.sharpeRatio >= 1.0 ? 'text-emerald-600 dark:text-emerald-400'
                              : bt.metrics.sharpeRatio >= 0.5 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}>
                            {bt.metrics.sharpeRatio.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bt.metrics ? (
                          <span className={`font-mono font-semibold tabular-nums ${
                            bt.metrics.cagr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {formatPercent(bt.metrics.cagr)}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bt.metrics ? (
                          <span className={`font-mono font-semibold tabular-nums ${
                            Math.abs(bt.metrics.maxDrawdown) <= 0.15 ? 'text-emerald-600 dark:text-emerald-400'
                              : Math.abs(bt.metrics.maxDrawdown) <= 0.25 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}>
                            {formatPercent(bt.metrics.maxDrawdown)}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {bt.metrics ? bt.metrics.totalTrades : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          {bt.status === 'running' && bt.progress !== undefined && (
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                              {bt.progress}%
                            </span>
                          )}
                        </div>
                        {/* Progress bar for running */}
                        {bt.status === 'running' && bt.progress !== undefined && (
                          <div className="mt-1.5 h-1 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${bt.progress}%` }}
                            />
                          </div>
                        )}
                        {bt.status === 'failed' && bt.errorMessage && (
                          <p className="mt-1 text-[10px] text-red-500 dark:text-red-400 max-w-[200px] truncate" title={bt.errorMessage}>
                            {bt.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {bt.duration ? formatDuration(bt.duration) : bt.estimatedRemaining ? `~${bt.estimatedRemaining.toFixed(0)}s left` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Walk-Forward Tab
// =============================================================================

function WalkForwardTab({
  optimizations,
  strategyId,
  onRunWalkForward,
  onViewWalkForward,
}: {
  optimizations: WalkForwardOptimization[]
  strategyId: string
  onRunWalkForward: () => void
  onViewWalkForward: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {optimizations.length} optimization{optimizations.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onRunWalkForward}
          className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 dark:hover:bg-pink-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          <Play size={14} strokeWidth={2} />
          Run Walk-Forward
        </button>
      </div>

      {optimizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <BarChart3 size={24} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">No walk-forward optimizations yet</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Run walk-forward analysis to validate parameter stability</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Date Range</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Windows</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Avg Val Sharpe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Avg Val Return</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Overfitting</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {optimizations.map((wfo) => {
                  const sc = statusConfig[wfo.status]
                  const oc = overfittingConfig[wfo.overfittingRisk]
                  return (
                    <tr
                      key={wfo.id}
                      onClick={() => wfo.status === 'completed' ? onViewWalkForward(wfo.id) : undefined}
                      className={`transition-colors ${
                        wfo.status === 'completed'
                          ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{wfo.id}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {formatDateShort(wfo.startDate)} — {formatDateShort(wfo.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {wfo.totalWindows}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-semibold tabular-nums ${
                          wfo.avgValidationSharpe >= 1.0 ? 'text-emerald-600 dark:text-emerald-400'
                            : wfo.avgValidationSharpe >= 0.5 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}>
                          {wfo.avgValidationSharpe.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-semibold tabular-nums ${
                          wfo.avgValidationReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                          {formatPercent(wfo.avgValidationReturn)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${oc.bg} ${oc.text}`}>
                          {wfo.overfittingRisk}
                        </span>
                        <span className="ml-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                          ({wfo.overfittingRatio.toFixed(2)})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {wfo.duration ? formatDuration(wfo.duration) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
