import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Target,
  Layers,
  Trophy,
  Skull,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CalendarDays,
  Gauge,
  ShieldCheck,
  Brain,
  Crosshair,
  LogOut,
  Zap,
} from 'lucide-react'
import type {
  AnalyticsProps,
  AnalyticsPeriod,
  PerformanceMetrics,
  ProcessScoreAnalytics,
  AttributionData,
  TrendDirection,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Formatting helpers
// =============================================================================

function fmtCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000) return `$${(abs / 1000).toFixed(1)}k`
  if (abs >= 1000) return `$${(abs / 1000).toFixed(2)}k`
  return `$${abs.toFixed(2)}`
}

function fmtSignedCurrency(value: number): string {
  const f = fmtCurrency(value)
  return value >= 0 ? `+${f}` : `\u2212${f}`
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`
}

function fmtNum(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

// =============================================================================
// Trend arrow
// =============================================================================

function TrendArrow({ direction, size = 14 }: { direction: TrendDirection; size?: number }) {
  if (direction === 'up') return <ArrowUpRight size={size} className="text-emerald-500 dark:text-emerald-400" />
  if (direction === 'down') return <ArrowDownRight size={size} className="text-red-500 dark:text-red-400" />
  return <Minus size={size} className="text-zinc-400 dark:text-zinc-500" />
}

// =============================================================================
// Constants
// =============================================================================

const PERIODS: AnalyticsPeriod[] = ['1M', '3M', '6M', '1Y', 'YTD', 'ALL']

const TAB_KEYS = ['performance', 'process', 'attribution'] as const
type TabKey = (typeof TAB_KEYS)[number]

const TAB_META: Record<TabKey, { label: string; icon: React.ElementType }> = {
  performance: { label: 'Performance', icon: BarChart3 },
  process: { label: 'Process Scores', icon: Target },
  attribution: { label: 'Attribution', icon: Layers },
}

const DIMENSION_META: Record<string, { label: string; icon: React.ElementType; color: string; hex: string }> = {
  discipline: { label: 'Discipline', icon: ShieldCheck, color: 'text-pink-500 dark:text-pink-400', hex: '#db2777' },
  emotionalManagement: { label: 'Emotional', icon: Brain, color: 'text-violet-500 dark:text-violet-400', hex: '#8b5cf6' },
  riskManagement: { label: 'Risk Mgmt', icon: Gauge, color: 'text-amber-500 dark:text-amber-400', hex: '#f59e0b' },
  entryQuality: { label: 'Entry Quality', icon: Crosshair, color: 'text-emerald-500 dark:text-emerald-400', hex: '#10b981' },
  exitQuality: { label: 'Exit Quality', icon: LogOut, color: 'text-sky-500 dark:text-sky-400', hex: '#0ea5e9' },
}

const DIMENSION_KEYS = Object.keys(DIMENSION_META) as Array<keyof typeof DIMENSION_META>

const SESSION_LABELS: Record<string, string> = {
  market_open: 'Market Open (9–11)',
  mid_day: 'Mid-Day (11–14)',
  market_close: 'Market Close (14–16)',
}

const STRATEGY_LABELS: Record<string, string> = {
  trend_following: 'Trend Following',
  momentum: 'Momentum',
  mean_reversion: 'Mean Reversion',
  breakout: 'Breakout',
  manual: 'Manual / Discretionary',
}

// =============================================================================
// Main Component
// =============================================================================

export function Analytics({
  performanceMetrics,
  processScoreAnalytics,
  attributionData,
  portfolios,
  onPortfolioFilter,
  onPeriodChange,
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('performance')
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('YTD')

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Insights
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Analytics
          </h1>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelectedPeriod(p)
                onPeriodChange?.(p)
              }}
              className={`
                rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200
                ${selectedPeriod === p
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Portfolio filter                                                   */}
      {/* ================================================================= */}
      {portfolios.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          <button
            onClick={() => { setSelectedPortfolio(null); onPortfolioFilter?.(null) }}
            className={`
              flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:flex-none
              ${selectedPortfolio === null
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }
            `}
          >
            All Portfolios
          </button>
          {portfolios.map((pf) => (
            <button
              key={pf.id}
              onClick={() => { setSelectedPortfolio(pf.id); onPortfolioFilter?.(pf.id) }}
              className={`
                flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:flex-none
                ${selectedPortfolio === pf.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              {pf.name}
            </button>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* Tab bar                                                           */}
      {/* ================================================================= */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800/80">
        {TAB_KEYS.map((key) => {
          const meta = TAB_META[key]
          const active = activeTab === key
          const Icon = meta.icon
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${active
                  ? 'text-pink-600 dark:text-pink-400'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              <Icon size={14} className={active ? 'text-pink-500 dark:text-pink-400' : 'text-zinc-400 dark:text-zinc-600'} />
              {meta.label}
              {/* Active underline */}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-pink-600 dark:bg-pink-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Tab content                                                       */}
      {/* ================================================================= */}
      {activeTab === 'performance' && <PerformanceTab metrics={performanceMetrics} />}
      {activeTab === 'process' && <ProcessScoresTab analytics={processScoreAnalytics} />}
      {activeTab === 'attribution' && <AttributionTab data={attributionData} />}
    </div>
  )
}

// =============================================================================
// PERFORMANCE TAB
// =============================================================================

function PerformanceTab({ metrics }: { metrics: PerformanceMetrics }) {
  return (
    <div className="space-y-6">
      {/* Metric cards — 4 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Total Trades" value={String(metrics.totalTrades)} sub="all trades" />
        <MetricCard
          icon={Trophy}
          label="Winning Trades"
          value={String(metrics.winningTrades)}
          sub={`${fmtPct(metrics.winRate)} win rate`}
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          icon={Skull}
          label="Losing Trades"
          value={String(metrics.losingTrades)}
          sub={`${fmtPct(100 - metrics.winRate)} loss rate`}
          valueColor="text-red-600 dark:text-red-400"
        />
        <MetricCard
          icon={Percent}
          label="Win Rate"
          value={fmtPct(metrics.winRate)}
          sub="win / total"
          valueColor={metrics.winRate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
        />

        <MetricCard
          icon={TrendingUp}
          label="Average Win"
          value={fmtCurrency(metrics.averageWin)}
          sub="per winning trade"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          icon={TrendingDown}
          label="Average Loss"
          value={fmtCurrency(Math.abs(metrics.averageLoss))}
          sub="per losing trade"
          valueColor="text-red-600 dark:text-red-400"
        />
        <MetricCard icon={BarChart3} label="Win/Loss Ratio" value={fmtNum(metrics.winLossRatio)} sub="avg win / avg loss" />
        <MetricCard
          icon={Zap}
          label="Profit Factor"
          value={fmtNum(metrics.profitFactor)}
          sub="gross profit / gross loss"
          valueColor={metrics.profitFactor >= 1.5 ? 'text-emerald-600 dark:text-emerald-400' : undefined}
        />

        <MetricCard
          icon={DollarSign}
          label="Total P&L"
          value={fmtSignedCurrency(metrics.totalPnl)}
          sub={metrics.period}
          valueColor={metrics.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
        />
        <MetricCard icon={Activity} label="Sharpe Ratio" value={fmtNum(metrics.sharpeRatio)} sub="risk-adjusted return" />
        <MetricCard icon={Activity} label="Sortino Ratio" value={fmtNum(metrics.sortinoRatio)} sub="downside risk" />
        <MetricCard
          icon={TrendingDown}
          label="Max Drawdown"
          value={fmtPct(metrics.maxDrawdownPct)}
          sub={`${metrics.maxDrawdownDays} days`}
          valueColor="text-red-600 dark:text-red-400"
        />

        <MetricCard icon={Clock} label="Avg Holding Period" value={`${fmtNum(metrics.averageHoldingPeriodDays, 1)}d`} sub="days per trade" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Win Rate Trend */}
        <ChartCard title="Win Rate Trend" subtitle="Monthly">
          <WinRateTrendChart data={metrics.winRateTrend} />
        </ChartCard>

        {/* P&L Distribution */}
        <ChartCard title="P&L Distribution" subtitle="By return %">
          <PnlDistributionChart data={metrics.pnlDistribution} />
        </ChartCard>
      </div>

      {/* Cumulative P&L */}
      <ChartCard title="Cumulative P&L" subtitle="Running total over time">
        <CumulativePnlChart data={metrics.cumulativePnl} />
      </ChartCard>
    </div>
  )
}

// =============================================================================
// PROCESS SCORES TAB
// =============================================================================

function ProcessScoresTab({ analytics }: { analytics: ProcessScoreAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Overall score + Dimension breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Overall average card */}
        <div className="lg:col-span-4">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-6">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl bg-pink-500/[0.05] dark:bg-pink-500/[0.08]" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Overall Average
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="font-mono text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {analytics.overallAverage.toFixed(2)}
                </span>
                <span className="mb-1.5 text-lg text-zinc-300 dark:text-zinc-700">/ 5</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendArrow direction={analytics.trend} size={16} />
                <span className={`text-sm font-medium ${
                  analytics.trend === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : analytics.trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {analytics.trend === 'up' ? 'Improving' : analytics.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>

              {/* Dimension bars */}
              <div className="mt-6 space-y-3">
                {DIMENSION_KEYS.map((key) => {
                  const dim = DIMENSION_META[key]
                  const score = analytics.byDimension[key as keyof typeof analytics.byDimension]
                  const pct = (score / 5) * 100
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <dim.icon size={12} className={dim.color} />
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {dim.label}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {score.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: dim.hex,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="lg:col-span-8">
          <ChartCard title="Dimension Breakdown" subtitle="5 process dimensions">
            <RadarChart byDimension={analytics.byDimension} />
          </ChartCard>
        </div>
      </div>

      {/* Monthly trend */}
      <ChartCard title="Process Score Trends" subtitle="Monthly averages by dimension">
        <MonthlyTrendChart data={analytics.monthlyTrend} />
      </ChartCard>

      {/* Process vs Outcome Quadrant */}
      <ChartCard title="Process vs Outcome" subtitle="Trade classification by process quality and outcome">
        <ProcessOutcomeQuadrant data={analytics.processVsOutcome} />
      </ChartCard>
    </div>
  )
}

// =============================================================================
// ATTRIBUTION TAB
// =============================================================================

function AttributionTab({ data }: { data: AttributionData }) {
  return (
    <div className="space-y-6">
      {/* Strategy table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
            <Layers size={13} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            By Strategy
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                  Strategy
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                  Trades
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                  Win Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                  Profit Factor
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {data.byStrategy.map((row) => {
                const positive = row.pnl >= 0
                return (
                  <tr
                    key={row.strategy}
                    className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      positive
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/[0.06]'
                        : 'bg-red-50/30 dark:bg-red-950/[0.06]'
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {STRATEGY_LABELS[row.strategy] ?? row.strategy}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {row.trades}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-mono text-sm font-medium ${
                        row.winRate >= 50
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {fmtPct(row.winRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {row.profitFactor !== null ? fmtNum(row.profitFactor as number) : '\u2014'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`font-mono text-sm font-semibold ${
                        positive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {fmtSignedCurrency(row.pnl)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day of Week + Time of Day charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="By Day of Week" subtitle="Win rate & avg P&L">
          <DayOfWeekChart data={data.byDayOfWeek} />
        </ChartCard>

        <ChartCard title="By Time of Day" subtitle="Win rate & avg P&L by session">
          <TimeOfDayChart data={data.byTimeOfDay} />
        </ChartCard>
      </div>
    </div>
  )
}

// =============================================================================
// Shared: Metric Card
// =============================================================================

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  valueColor?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="text-pink-500/40 dark:text-pink-400/30">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl ${
        valueColor ?? 'text-zinc-900 dark:text-zinc-100'
      }`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">{sub}</p>
    </div>
  )
}

// =============================================================================
// Shared: Chart Card
// =============================================================================

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-600">{subtitle}</span>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// =============================================================================
// Chart: Win Rate Trend (line chart)
// =============================================================================

function WinRateTrendChart({ data }: { data: PerformanceMetrics['winRateTrend'] }) {
  if (data.length < 2) return <EmptyChart />

  const W = 500
  const H = 180
  const padX = 48
  const padY = 20
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const rates = data.map((d) => d.winRate)
  const minR = Math.max(0, Math.min(...rates) - 5)
  const maxR = Math.min(100, Math.max(...rates) + 5)
  const rangeR = maxR - minR || 1

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((d.winRate - minR) / rangeR) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`

  // Y-axis labels
  const yTicks = [minR, (minR + maxR) / 2, maxR]

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="wr-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#db2777" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#db2777" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 50% reference line */}
      {minR < 50 && maxR > 50 && (
        <>
          <line
            x1={padX}
            y1={padY + chartH - ((50 - minR) / rangeR) * chartH}
            x2={padX + chartW}
            y2={padY + chartH - ((50 - minR) / rangeR) * chartH}
            className="stroke-zinc-300 dark:stroke-zinc-700"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
          <text
            x={padX - 6}
            y={padY + chartH - ((50 - minR) / rangeR) * chartH + 3}
            textAnchor="end"
            className="fill-zinc-400 dark:fill-zinc-600"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
          >
            50%
          </text>
        </>
      )}

      {/* Grid lines */}
      {yTicks.map((v, i) => {
        const y = padY + chartH - ((v - minR) / rangeR) * chartH
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={padX + chartW} y2={y} className="stroke-zinc-100 dark:stroke-zinc-800/60" strokeWidth={1} strokeDasharray="4 4" />
            <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 dark:fill-zinc-600" fontSize={10} fontFamily="JetBrains Mono, monospace">
              {v.toFixed(0)}%
            </text>
          </g>
        )
      })}

      {/* Area + Line */}
      <path d={areaPath} fill="url(#wr-area)" />
      <path d={linePath} fill="none" stroke="#db2777" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#db2777" strokeWidth={2} className="dark:fill-zinc-900" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x}
          y={H + 16}
          textAnchor="middle"
          className="fill-zinc-400 dark:fill-zinc-600"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
        >
          {d.month.split(' ')[0].slice(0, 3)}
        </text>
      ))}
    </svg>
  )
}

// =============================================================================
// Chart: P&L Distribution (histogram)
// =============================================================================

function PnlDistributionChart({ data }: { data: PerformanceMetrics['pnlDistribution'] }) {
  if (data.length === 0) return <EmptyChart />

  const W = 500
  const H = 180
  const padX = 40
  const padY = 20
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const maxCount = Math.max(...data.map((d) => d.count))
  const barW = (chartW / data.length) * 0.65
  const gap = (chartW / data.length) * 0.35

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Bars */}
      {data.map((d, i) => {
        const barH = maxCount > 0 ? (d.count / maxCount) * chartH : 0
        const x = padX + (i / data.length) * chartW + gap / 2
        const y = padY + chartH - barH
        const isNeg = d.bucket.startsWith('-')
        const fillClass = isNeg ? '#ef4444' : '#10b981'

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill={fillClass}
              opacity={0.8}
            />
            {/* Count label on top */}
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-zinc-600 dark:fill-zinc-400"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
            >
              {d.count}
            </text>
            {/* Bucket label */}
            <text
              x={x + barW / 2}
              y={H + 18}
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-600"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {d.bucket}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// =============================================================================
// Chart: Cumulative P&L (area chart)
// =============================================================================

function CumulativePnlChart({ data }: { data: PerformanceMetrics['cumulativePnl'] }) {
  if (data.length < 2) return <EmptyChart />

  const W = 700
  const H = 200
  const padX = 52
  const padY = 20
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const pnls = data.map((d) => d.pnl)
  const minP = Math.min(0, ...pnls) - 50
  const maxP = Math.max(...pnls) + 50
  const rangeP = maxP - minP || 1

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((d.pnl - minP) / rangeP) * chartH,
  }))

  const zeroY = padY + chartH - ((0 - minP) / rangeP) * chartH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`

  // Y ticks
  const yTicks = [minP, 0, maxP / 2, maxP].filter((v, i, a) => a.indexOf(v) === i)

  // Date labels — show first, middle, last
  const dateIdxs = [0, Math.floor(data.length / 2), data.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cpnl-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Zero line */}
      <line x1={padX} y1={zeroY} x2={padX + chartW} y2={zeroY} className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth={1} />

      {/* Y ticks */}
      {yTicks.map((v, i) => {
        const y = padY + chartH - ((v - minP) / rangeP) * chartH
        return (
          <text key={i} x={padX - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 dark:fill-zinc-600" fontSize={10} fontFamily="JetBrains Mono, monospace">
            {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
          </text>
        )
      })}

      {/* Area + Line */}
      <path d={areaPath} fill="url(#cpnl-area)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={7}
        fill="#10b981"
        fillOpacity={0.15}
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3.5}
        fill="#10b981"
      />

      {/* Date labels */}
      {dateIdxs.map((idx) => {
        const d = data[idx]
        const dateStr = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        return (
          <text
            key={idx}
            x={points[idx].x}
            y={H + 16}
            textAnchor={idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'}
            className="fill-zinc-400 dark:fill-zinc-600"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
          >
            {dateStr}
          </text>
        )
      })}
    </svg>
  )
}

// =============================================================================
// Chart: Radar (pentagon, 5 dimensions)
// =============================================================================

function RadarChart({ byDimension }: { byDimension: ProcessScoreAnalytics['byDimension'] }) {
  const cx = 200
  const cy = 160
  const R = 120
  const levels = 5

  const dims = DIMENSION_KEYS.map((key, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const score = byDimension[key as keyof typeof byDimension]
    return {
      key,
      meta: DIMENSION_META[key],
      score,
      angle,
      x: cx + Math.cos(angle) * R,
      y: cy + Math.sin(angle) * R,
      sx: cx + Math.cos(angle) * (R * (score / 5)),
      sy: cy + Math.sin(angle) * (R * (score / 5)),
    }
  })

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center py-4">
      <svg viewBox="0 0 400 320" className="w-full max-w-md" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#db2777" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#db2777" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Grid rings */}
        {rings.map((level) => {
          const r = (level / 5) * R
          const ringPoints = dims.map((d) => {
            const rx = cx + Math.cos(d.angle) * r
            const ry = cy + Math.sin(d.angle) * r
            return `${rx},${ry}`
          })
          return (
            <polygon
              key={level}
              points={ringPoints.join(' ')}
              fill="none"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={0.75}
            />
          )
        })}

        {/* Axis lines */}
        {dims.map((d) => (
          <line
            key={d.key}
            x1={cx}
            y1={cy}
            x2={d.x}
            y2={d.y}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={0.75}
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dims.map((d) => `${d.sx},${d.sy}`).join(' ')}
          fill="url(#radar-fill)"
          stroke="#db2777"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dims.map((d) => (
          <circle key={d.key} cx={d.sx} cy={d.sy} r={4} fill="white" stroke={d.meta.hex} strokeWidth={2} className="dark:fill-zinc-900" />
        ))}

        {/* Labels */}
        {dims.map((d) => {
          const labelR = R + 28
          const lx = cx + Math.cos(d.angle) * labelR
          const ly = cy + Math.sin(d.angle) * labelR
          return (
            <g key={`label-${d.key}`}>
              <text
                x={lx}
                y={ly - 4}
                textAnchor="middle"
                className="fill-zinc-600 dark:fill-zinc-400"
                fontSize={11}
                fontWeight={500}
              >
                {d.meta.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                className="fill-zinc-400 dark:fill-zinc-500"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {d.score.toFixed(2)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// =============================================================================
// Chart: Monthly Trend (multi-line)
// =============================================================================

function MonthlyTrendChart({ data }: { data: ProcessScoreAnalytics['monthlyTrend'] }) {
  if (data.length < 2) return <EmptyChart />

  const W = 700
  const H = 200
  const padX = 48
  const padY = 20
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  // Gather all values to find range
  const allVals: number[] = []
  data.forEach((m) => {
    DIMENSION_KEYS.forEach((k) => allVals.push(m[k as keyof typeof m] as number))
  })
  const minV = Math.max(0, Math.min(...allVals) - 0.2)
  const maxV = Math.min(5, Math.max(...allVals) + 0.2)
  const rangeV = maxV - minV || 1

  const xScale = (i: number) => padX + (i / (data.length - 1)) * chartW
  const yScale = (v: number) => padY + chartH - ((v - minV) / rangeV) * chartH

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <g key={i}>
          <line x1={padX} y1={yScale(v)} x2={padX + chartW} y2={yScale(v)} className="stroke-zinc-100 dark:stroke-zinc-800/60" strokeWidth={1} strokeDasharray="4 4" />
          <text x={padX - 6} y={yScale(v) + 3} textAnchor="end" className="fill-zinc-400 dark:fill-zinc-600" fontSize={10} fontFamily="JetBrains Mono, monospace">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Dimension lines */}
      {DIMENSION_KEYS.map((key) => {
        const dim = DIMENSION_META[key]
        const points = data.map((m, i) => ({
          x: xScale(i),
          y: yScale(m[key as keyof typeof m] as number),
        }))
        const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

        return (
          <g key={key}>
            <path d={path} fill="none" stroke={dim.hex} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            {/* End dot */}
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={3}
              fill={dim.hex}
            />
          </g>
        )
      })}

      {/* X-axis labels */}
      {data.map((m, i) => (
        <text
          key={i}
          x={xScale(i)}
          y={H + 16}
          textAnchor="middle"
          className="fill-zinc-400 dark:fill-zinc-600"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
        >
          {m.month.split(' ')[0].slice(0, 3)}
        </text>
      ))}

      {/* Legend */}
      {DIMENSION_KEYS.map((key, i) => {
        const dim = DIMENSION_META[key]
        const legendX = padX + i * 120
        return (
          <g key={`leg-${key}`}>
            <line x1={legendX} y1={H + 24} x2={legendX + 14} y2={H + 24} stroke={dim.hex} strokeWidth={2} strokeLinecap="round" />
            <text x={legendX + 18} y={H + 27} className="fill-zinc-500 dark:fill-zinc-500" fontSize={9}>
              {dim.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// =============================================================================
// Chart: Process vs Outcome Quadrant
// =============================================================================

function ProcessOutcomeQuadrant({ data }: { data: ProcessScoreAnalytics['processVsOutcome'] }) {
  const total = data.skilledCount + data.unluckyCount + data.luckyCount + data.needsWorkCount || 1
  const quadrants = [
    {
      label: 'Unlucky',
      sublabel: 'High Process \u00b7 Low Outcome',
      count: data.unluckyCount,
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200/60 dark:border-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      sub: 'text-amber-600/70 dark:text-amber-500/70',
      countColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Skilled',
      sublabel: 'High Process \u00b7 High Outcome',
      count: data.skilledCount,
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200/60 dark:border-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      sub: 'text-emerald-600/70 dark:text-emerald-500/70',
      countColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Needs Work',
      sublabel: 'Low Process \u00b7 Low Outcome',
      count: data.needsWorkCount,
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200/60 dark:border-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      sub: 'text-red-600/70 dark:text-red-500/70',
      countColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Lucky',
      sublabel: 'Low Process \u00b7 High Outcome',
      count: data.luckyCount,
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200/60 dark:border-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      sub: 'text-amber-600/70 dark:text-amber-500/70',
      countColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="relative">
      {/* Axis labels */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Low Outcome</span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Outcome &rarr;</span>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">High Outcome</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quadrants.map((q) => (
          <div
            key={q.label}
            className={`relative overflow-hidden rounded-xl border ${q.border} ${q.bg} p-5 text-center transition-all hover:shadow-sm`}
          >
            <p className={`font-mono text-3xl font-bold ${q.countColor}`}>
              {q.count}
            </p>
            <p className={`mt-1 text-sm font-semibold ${q.text}`}>
              {q.label}
            </p>
            <p className={`mt-0.5 text-xs ${q.sub}`}>
              {q.sublabel}
            </p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
              {total > 0 ? fmtPct((q.count / total) * 100) : '0%'} of trades
            </p>
          </div>
        ))}
      </div>

      {/* Process axis label */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Low Process</span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">&uarr; Process</span>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">High Process</span>
      </div>
    </div>
  )
}

// =============================================================================
// Chart: Day of Week (grouped bars)
// =============================================================================

function DayOfWeekChart({ data }: { data: AttributionData['byDayOfWeek'] }) {
  if (data.length === 0) return <EmptyChart />

  const W = 500
  const H = 200
  const padX = 48
  const padY = 24
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const maxWr = 100
  const maxPnl = Math.max(...data.map((d) => Math.abs(d.averagePnl)), 1)

  const groupW = chartW / data.length
  const barW = groupW * 0.3

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Zero line for P&L */}
      <line x1={padX} y1={padY + chartH / 2} x2={padX + chartW} y2={padY + chartH / 2} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={0.5} />

      {data.map((d, i) => {
        const gx = padX + i * groupW + groupW / 2

        // Win rate bar (left, pink)
        const wrBarH = (d.winRate / maxWr) * chartH * 0.45
        const wrX = gx - barW - 2
        const wrY = padY + chartH / 2 - wrBarH

        // P&L bar (right, green/red)
        const pnlBarH = (Math.abs(d.averagePnl) / maxPnl) * chartH * 0.45
        const pnlPositive = d.averagePnl >= 0
        const pnlX = gx + 2
        const pnlY = pnlPositive
          ? padY + chartH / 2 - pnlBarH
          : padY + chartH / 2

        return (
          <g key={d.day}>
            {/* Win rate bar */}
            <rect x={wrX} y={wrY} width={barW} height={wrBarH} rx={2} fill="#db2777" opacity={0.8} />
            <text
              x={wrX + barW / 2}
              y={wrY - 5}
              textAnchor="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {d.winRate.toFixed(0)}%
            </text>

            {/* P&L bar */}
            <rect
              x={pnlX}
              y={pnlY}
              width={barW}
              height={pnlBarH}
              rx={2}
              fill={pnlPositive ? '#10b981' : '#ef4444'}
              opacity={0.8}
            />
            <text
              x={pnlX + barW / 2}
              y={pnlPositive ? pnlY - 5 : pnlY + pnlBarH + 12}
              textAnchor="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              ${Math.abs(d.averagePnl).toFixed(0)}
            </text>

            {/* Day label */}
            <text
              x={gx}
              y={H + 12}
              textAnchor="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
            >
              {d.day.slice(0, 3)}
            </text>

            {/* Trade count */}
            <text
              x={gx}
              y={H + 24}
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-600"
              fontSize={9}
            >
              {d.trades}t
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <circle cx={padX} cy={H + 28} r={3} fill="#db2777" />
      <text x={padX + 8} y={H + 31} className="fill-zinc-500 dark:fill-zinc-500" fontSize={9}>
        Win Rate
      </text>
      <circle cx={padX + 72} cy={H + 28} r={3} fill="#10b981" />
      <text x={padX + 80} y={H + 31} className="fill-zinc-500 dark:fill-zinc-500" fontSize={9}>
        Avg P&L
      </text>
    </svg>
  )
}

// =============================================================================
// Chart: Time of Day (grouped bars)
// =============================================================================

function TimeOfDayChart({ data }: { data: AttributionData['byTimeOfDay'] }) {
  if (data.length === 0) return <EmptyChart />

  const W = 500
  const H = 200
  const padX = 48
  const padY = 24
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const maxWr = 100
  const maxPnl = Math.max(...data.map((d) => Math.abs(d.averagePnl)), 1)

  const groupW = chartW / data.length
  const barW = groupW * 0.25

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Zero line */}
      <line x1={padX} y1={padY + chartH / 2} x2={padX + chartW} y2={padY + chartH / 2} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={0.5} />

      {data.map((d, i) => {
        const gx = padX + i * groupW + groupW / 2

        const wrBarH = (d.winRate / maxWr) * chartH * 0.45
        const wrX = gx - barW - 2
        const wrY = padY + chartH / 2 - wrBarH

        const pnlBarH = (Math.abs(d.averagePnl) / maxPnl) * chartH * 0.45
        const pnlPositive = d.averagePnl >= 0
        const pnlX = gx + 2
        const pnlY = pnlPositive ? padY + chartH / 2 - pnlBarH : padY + chartH / 2

        return (
          <g key={d.session}>
            <rect x={wrX} y={wrY} width={barW} height={wrBarH} rx={2} fill="#db2777" opacity={0.8} />
            <text x={wrX + barW / 2} y={wrY - 5} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize={9} fontFamily="JetBrains Mono, monospace">
              {d.winRate.toFixed(0)}%
            </text>

            <rect x={pnlX} y={pnlY} width={barW} height={pnlBarH} rx={2} fill={pnlPositive ? '#10b981' : '#ef4444'} opacity={0.8} />
            <text
              x={pnlX + barW / 2}
              y={pnlPositive ? pnlY - 5 : pnlY + pnlBarH + 12}
              textAnchor="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              ${Math.abs(d.averagePnl).toFixed(0)}
            </text>

            {/* Session label */}
            <text
              x={gx}
              y={H + 12}
              textAnchor="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              fontSize={10}
            >
              {SESSION_LABELS[d.session] ?? d.session}
            </text>

            {/* Trade count */}
            <text
              x={gx}
              y={H + 24}
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-600"
              fontSize={9}
            >
              {d.trades} trades
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <circle cx={padX} cy={H + 28} r={3} fill="#db2777" />
      <text x={padX + 8} y={H + 31} className="fill-zinc-500 dark:fill-zinc-500" fontSize={9}>Win Rate</text>
      <circle cx={padX + 72} cy={H + 28} r={3} fill="#10b981" />
      <text x={padX + 80} y={H + 31} className="fill-zinc-500 dark:fill-zinc-500" fontSize={9}>Avg P&L</text>
    </svg>
  )
}

// =============================================================================
// Empty chart placeholder
// =============================================================================

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center">
      <p className="text-sm text-zinc-400 dark:text-zinc-600">Not enough data to display chart</p>
    </div>
  )
}
