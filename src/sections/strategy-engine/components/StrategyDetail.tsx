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
} from '@/../product/sections/strategy-engine/types'
import { ToggleSwitch } from '@/sections/settings-and-operations/components/SettingsDetailLayout'

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
    bg: 'bg-muted',
    text: 'text-muted-foreground',
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
            aria-label="Back to strategies"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-foreground active:scale-95"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Intelligence
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                {strategy.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 ${typeConfig.bg} ${typeConfig.text}`}>
                <TypeIcon size={12} strokeWidth={2} />
                {typeConfig.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider shrink-0 ${
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
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {strategy.description}
            </p>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-medium ${strategy.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-hint'}`}>
            {strategy.active ? 'Active' : 'Inactive'}
          </span>
          <ToggleSwitch
            enabled={strategy.active}
            onChange={(active) => onToggleActive?.(strategy.id, active)}
            label={strategy.active ? 'Deactivate strategy' : 'Activate strategy'}
            size="md"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
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
                  ? 'border-primary text-primary dark:border-pink-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
            >
              <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
              {tab.label}
              {count !== undefined && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                  isActive
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                    : 'bg-muted text-muted-foreground'
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
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Pencil size={14} strokeWidth={1.5} aria-hidden="true" />
          Edit Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Strategy Parameters */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Entry Strategy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {typeBadgeConfig[strategy.type].label} parameters
            </p>
          </div>
          <div className="divide-y divide-border">
            {strategy.parameters.map((param) => (
              <div key={param.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{param.name}</p>
                  <p className="text-xs text-hint">{param.description}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Strategies */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Exit Strategies</h3>
            {strategy.exitPriority && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Priority: {strategy.exitPriority.map((t) => exitStrategyLabels[t]).join(' → ')}
              </p>
            )}
          </div>
          <div className="divide-y divide-border">
            {strategy.exitStrategies.map((exit) => {
              const ExitIcon = exitStrategyIcons[exit.type]
              const isExpanded = expandedExits.has(exit.type)
              return (
                <div key={exit.type}>
                  <button
                    onClick={() => onToggleExit(exit.type)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ExitIcon size={15} strokeWidth={1.5} className={exit.enabled ? 'text-muted-foreground' : 'text-faint'} />
                      <span className={`text-sm font-medium ${exit.enabled ? 'text-foreground' : 'text-hint'}`}>
                        {exitStrategyLabels[exit.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                        exit.enabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-muted text-hint'
                      }`}>
                        {exit.enabled ? 'On' : 'Off'}
                      </span>
                      {exit.parameters.length > 0 && (
                        isExpanded
                          ? <ChevronDown size={14} className="text-hint" aria-hidden="true" />
                          : <ChevronRight size={14} className="text-hint" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                  {isExpanded && exit.parameters.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 px-5 pb-3">
                      {exit.parameters.map((param) => (
                        <div key={param.name} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{param.name}</p>
                            <p className="text-xs text-hint">{param.description}</p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
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
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Instruments</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{strategy.instruments.length} assigned</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {strategy.instruments.map((inst) => (
                <span
                  key={inst}
                  className="inline-flex items-center rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
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
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Position Sizing</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Risk per Trade</span>
                <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                  {(strategy.positionSizing.riskPerTrade * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Max Position</span>
                <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                  {(strategy.positionSizing.maxPosition * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Volatility Adjustment</span>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  strategy.positionSizing.volatilityAdjustment
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-muted text-hint'
                }`}>
                  {strategy.positionSizing.volatilityAdjustment ? <Check size={11} /> : <X size={11} />}
                  {strategy.positionSizing.volatilityAdjustment ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Evaluation Schedule</h3>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  strategy.schedule.enabled
                    ? 'bg-pink-50 dark:bg-pink-950/30 text-primary'
                    : 'bg-muted text-hint'
                }`}>
                  <Clock size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatSchedule(strategy)}
                  </p>
                  {strategy.schedule.enabled && (
                    <p className="text-xs text-muted-foreground">
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
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Composite Strategy Flow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
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
              <ChevronRight size={20} className="text-faint shrink-0" />

              {/* Exit strategies in priority order */}
              {strategy.exitPriority.map((type, idx) => {
                const exit = strategy.exitStrategies.find((e) => e.type === type)
                const ExitIcon = exitStrategyIcons[type]
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
                      exit?.enabled
                        ? 'border-border bg-white dark:bg-zinc-800'
                        : 'border-dashed border-border bg-background opacity-50'
                    }`}>
                      <ExitIcon size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-hint">
                          #{idx + 1}
                        </p>
                        <p className="text-xs font-medium text-foreground">
                          {exitStrategyLabels[type]}
                        </p>
                      </div>
                    </div>
                    {idx < strategy.exitPriority!.length - 1 && (
                      <ChevronRight size={16} className="text-faint shrink-0" />
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
        <p className="text-sm text-muted-foreground">
          {backtests.length} backtest{backtests.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onRunBacktest}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Play size={14} strokeWidth={2} aria-hidden="true" />
          Run Backtest
        </button>
      </div>

      {backtests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border">
          <FlaskConical size={24} strokeWidth={1.5} className="text-faint mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No backtests yet</p>
          <p className="text-xs text-hint">Run your first backtest to evaluate this strategy</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">Date Range</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Capital</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Sharpe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">CAGR</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Max DD</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Trades</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {backtests.map((bt) => {
                  const sc = statusConfig[bt.status]
                  return (
                    <tr
                      key={bt.id}
                      onClick={() => bt.status === 'completed' ? onViewBacktest(bt.id) : undefined}
                      className={`transition-colors ${
                        bt.status === 'completed'
                          ? 'cursor-pointer hover:bg-accent/50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{bt.id}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {formatDateShort(bt.startDate)} — {formatDateShort(bt.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground tabular-nums">
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
                          <span className="text-faint">—</span>
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
                          <span className="text-faint">—</span>
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
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground tabular-nums">
                        {bt.metrics ? bt.metrics.totalTrades : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          {bt.status === 'running' && bt.progress !== undefined && (
                            <span className="text-xs font-mono text-blue-600 dark:text-blue-400 tabular-nums">
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
                          <p className="mt-1 text-xs text-red-500 dark:text-red-400 max-w-[200px] truncate" title={bt.errorMessage}>
                            {bt.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
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
        <p className="text-sm text-muted-foreground">
          {optimizations.length} optimization{optimizations.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onRunWalkForward}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Play size={14} strokeWidth={2} aria-hidden="true" />
          Run Walk-Forward
        </button>
      </div>

      {optimizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border">
          <BarChart3 size={24} strokeWidth={1.5} className="text-faint mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No walk-forward optimizations yet</p>
          <p className="text-xs text-hint">Run walk-forward analysis to validate parameter stability</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">Date Range</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Windows</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Avg Val Sharpe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Avg Val Return</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">Overfitting</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-hint">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-hint">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {optimizations.map((wfo) => {
                  const sc = statusConfig[wfo.status]
                  const oc = overfittingConfig[wfo.overfittingRisk]
                  return (
                    <tr
                      key={wfo.id}
                      onClick={() => wfo.status === 'completed' ? onViewWalkForward(wfo.id) : undefined}
                      className={`transition-colors ${
                        wfo.status === 'completed'
                          ? 'cursor-pointer hover:bg-accent/50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{wfo.id}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {formatDateShort(wfo.startDate)} — {formatDateShort(wfo.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground tabular-nums">
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
                        <span className="ml-1.5 text-xs font-mono text-hint tabular-nums">
                          ({wfo.overfittingRatio.toFixed(2)})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
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
