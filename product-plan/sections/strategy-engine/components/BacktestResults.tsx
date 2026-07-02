import { useState, useMemo, Fragment } from 'react'
import {
  ArrowLeft,
  RotateCcw,
  GitCompare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import type {
  BacktestResultsProps,
  BacktestDetail,
  BacktestDetailMetrics,
  BacktestTrade,
  BenchmarkComparison,
  MonthlyReturn,
  EquityCurvePoint,
  AntiPatternWarning,
  TradeDirection,
  BacktestRecommendation,
} from '../types'

// =============================================================================
// Helpers
// =============================================================================

function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type ChartTab = 'equity' | 'drawdown' | 'monthly' | 'distribution'

// =============================================================================
// Anti-Pattern Warnings Banner
// =============================================================================

function WarningsBanner({ warnings }: { warnings: AntiPatternWarning[] }) {
  if (warnings.length === 0) return null

  const severityConfig = {
    info: {
      icon: Info,
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      border: 'border-sky-200 dark:border-sky-800',
      iconColor: 'text-sky-500',
      textColor: 'text-sky-800 dark:text-sky-200',
      recColor: 'text-sky-600 dark:text-sky-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-800 dark:text-amber-200',
      recColor: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500',
      textColor: 'text-red-800 dark:text-red-200',
      recColor: 'text-red-600 dark:text-red-400',
    },
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, idx) => {
        const config = severityConfig[warning.severity]
        const Icon = config.icon
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-lg border ${config.border} ${config.bg} p-3`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${config.textColor}`}>{warning.message}</p>
              <p className={`mt-0.5 text-xs ${config.recColor}`}>{warning.recommendation}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// Executive Summary Card
// =============================================================================

function ExecutiveSummary({
  detail,
  onRerun,
  onCompare,
}: {
  detail: BacktestDetail
  onRerun?: (id: string) => void
  onCompare?: (id: string) => void
}) {
  const badgeConfig: Record<BacktestRecommendation, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
    PASS: {
      label: 'Pass',
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
    },
    FAIL: {
      label: 'Fail',
      bg: 'bg-red-100 dark:bg-red-900/40',
      text: 'text-red-700 dark:text-red-300',
      icon: XCircle,
    },
    REVIEW: {
      label: 'Review',
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      text: 'text-amber-700 dark:text-amber-300',
      icon: Eye,
    },
  }

  const badge = badgeConfig[detail.recommendation]
  const BadgeIcon = badge.icon

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
              <BadgeIcon className="h-3.5 w-3.5" />
              {badge.label}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{detail.backtestId}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {detail.strategyName}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {detail.testPeriod} &middot; {formatCurrency(detail.initialCapital)} &rarr; {formatCurrency(detail.finalValue)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {detail.recommendationText}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onRerun?.(detail.backtestId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-run
          </button>
          <button
            onClick={() => onCompare?.(detail.backtestId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Stat Cards Row
// =============================================================================

interface StatCardData {
  label: string
  value: string
  benchmark?: string
  benchmarkLabel?: string
  isGood?: boolean
  isBad?: boolean
}

function StatCard({ stat }: { stat: StatCardData }) {
  const valueColor = stat.isBad
    ? 'text-red-600 dark:text-red-400'
    : stat.isGood
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-zinc-900 dark:text-zinc-50'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {stat.label}
      </p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${valueColor}`}>
        {stat.value}
      </p>
      {stat.benchmark && (
        <div className="mt-1.5 flex items-center gap-1">
          {stat.isGood ? (
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          ) : stat.isBad ? (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          ) : (
            <Minus className="h-3 w-3 text-zinc-400" />
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {stat.benchmark} {stat.benchmarkLabel ?? 'SPY'}
          </span>
        </div>
      )}
    </div>
  )
}

function StatsRow({ metrics, spyBenchmark }: { metrics: BacktestDetailMetrics; spyBenchmark: BacktestDetail['spyBenchmark'] }) {
  const stats: StatCardData[] = [
    {
      label: 'CAGR',
      value: formatPercent(metrics.cagr),
      benchmark: formatPercent(spyBenchmark.cagr),
      isGood: metrics.cagr > spyBenchmark.cagr,
      isBad: metrics.cagr < spyBenchmark.cagr * 0.5,
    },
    {
      label: 'Sharpe Ratio',
      value: formatNumber(metrics.sharpeRatio),
      benchmark: formatNumber(spyBenchmark.sharpeRatio),
      isGood: metrics.sharpeRatio > spyBenchmark.sharpeRatio,
      isBad: metrics.sharpeRatio < 1.0,
    },
    {
      label: 'Sortino Ratio',
      value: formatNumber(metrics.sortinoRatio),
      isGood: metrics.sortinoRatio > 1.5,
      isBad: metrics.sortinoRatio < 1.0,
    },
    {
      label: 'Max Drawdown',
      value: formatPercent(metrics.maxDrawdown),
      benchmark: formatPercent(spyBenchmark.maxDrawdown),
      isGood: Math.abs(metrics.maxDrawdown) < Math.abs(spyBenchmark.maxDrawdown),
      isBad: metrics.maxDrawdown < -0.25,
    },
    {
      label: 'Win Rate',
      value: formatPercent(metrics.winRate),
      isGood: metrics.winRate > 0.55,
      isBad: metrics.winRate < 0.45,
    },
    {
      label: 'Profit Factor',
      value: formatNumber(metrics.profitFactor),
      isGood: metrics.profitFactor > 1.5,
      isBad: metrics.profitFactor < 1.0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}

// =============================================================================
// Equity Curve (CSS-based visualization)
// =============================================================================

function EquityCurveChart({ equityCurve }: { equityCurve: EquityCurvePoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Compute min/max for scaling
  const allValues = equityCurve.flatMap((p) => [p.strategy, p.spy, p.buyAndHold])
  const minVal = Math.min(...allValues) * 0.95
  const maxVal = Math.max(...allValues) * 1.05
  const range = maxVal - minVal

  const toY = (val: number) => ((val - minVal) / range) * 100

  // Generate SVG path
  const makePath = (key: 'strategy' | 'spy' | 'buyAndHold') => {
    return equityCurve
      .map((p, i) => {
        const x = (i / (equityCurve.length - 1)) * 100
        const y = 100 - toY(p[key])
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const hovered = hoveredIdx !== null ? equityCurve[hoveredIdx] : null

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-pink-600" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Strategy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-zinc-400 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)' }} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">SPY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-emerald-500 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, currentColor 3px, currentColor 5px)' }} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Buy & Hold</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="mb-2 flex items-center gap-4 text-xs">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            {new Date(hovered.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <span className="font-semibold text-pink-600">{formatCurrency(hovered.strategy)}</span>
          <span className="text-zinc-400">{formatCurrency(hovered.spy)}</span>
          <span className="text-emerald-500">{formatCurrency(hovered.buyAndHold)}</span>
        </div>
      )}

      <div
        className="relative h-48 w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full w-14 flex-col justify-between py-2 text-right">
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">{formatCurrency(maxVal)}</span>
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">{formatCurrency((maxVal + minVal) / 2)}</span>
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">{formatCurrency(minVal)}</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 left-14">
          <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-zinc-200 dark:border-zinc-800" />
        </div>

        {/* SVG Chart */}
        <svg
          className="absolute inset-0 left-14 right-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: 'calc(100% - 3.5rem)', height: '100%' }}
        >
          {/* Buy & Hold line */}
          <path
            d={makePath('buyAndHold')}
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth="0.4"
            strokeDasharray="1 0.8"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* SPY line */}
          <path
            d={makePath('spy')}
            fill="none"
            stroke="rgb(161 161 170)"
            strokeWidth="0.4"
            strokeDasharray="0.8 0.6"
            opacity="0.6"
            vectorEffect="non-scaling-stroke"
          />
          {/* Strategy line */}
          <path
            d={makePath('strategy')}
            fill="none"
            stroke="rgb(219 39 119)"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Hover zones */}
        <div className="absolute inset-0 left-14 flex">
          {equityCurve.map((_, i) => (
            <div
              key={i}
              className="h-full flex-1 cursor-crosshair"
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}
        </div>

        {/* Hover line */}
        {hoveredIdx !== null && (
          <div
            className="pointer-events-none absolute top-0 h-full w-px bg-pink-600/40"
            style={{
              left: `calc(3.5rem + ${(hoveredIdx / (equityCurve.length - 1)) * 100}% * (1 - 3.5rem / 100%))`,
            }}
          />
        )}
      </div>

      {/* X-axis */}
      <div className="mt-1 flex justify-between pl-14 text-[10px] text-zinc-400">
        <span>{equityCurve[0]?.date.slice(0, 7)}</span>
        <span>{equityCurve[Math.floor(equityCurve.length / 2)]?.date.slice(0, 7)}</span>
        <span>{equityCurve[equityCurve.length - 1]?.date.slice(0, 7)}</span>
      </div>
    </div>
  )
}

// =============================================================================
// Drawdown Chart
// =============================================================================

function DrawdownChart({ equityCurve }: { equityCurve: EquityCurvePoint[] }) {
  // Calculate drawdown from equity curve
  const drawdowns = useMemo(() => {
    let peak = equityCurve[0]?.strategy ?? 0
    return equityCurve.map((p) => {
      if (p.strategy > peak) peak = p.strategy
      const dd = (p.strategy - peak) / peak
      return { date: p.date, drawdown: dd }
    })
  }, [equityCurve])

  const minDD = Math.min(...drawdowns.map((d) => d.drawdown), -0.01)
  const toY = (dd: number) => (dd / minDD) * 100

  const areaPath = drawdowns
    .map((d, i) => {
      const x = (i / (drawdowns.length - 1)) * 100
      const y = toY(d.drawdown)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const closedPath = `${areaPath} L 100 0 L 0 0 Z`

  return (
    <div>
      <div className="relative h-36 w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Zero line */}
        <div className="absolute left-14 right-0 top-0 border-b border-zinc-300 dark:border-zinc-600" />

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full w-14 flex-col justify-between py-1 text-right">
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">0%</span>
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">{formatPercent(minDD / 2)}</span>
          <span className="pr-2 text-[10px] tabular-nums text-zinc-400">{formatPercent(minDD)}</span>
        </div>

        <svg
          className="absolute inset-0 left-14"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: 'calc(100% - 3.5rem)', height: '100%' }}
        >
          <path
            d={closedPath}
            fill="rgb(239 68 68)"
            opacity="0.15"
          />
          <path
            d={areaPath}
            fill="none"
            stroke="rgb(239 68 68)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="mt-1 flex justify-between pl-14 text-[10px] text-zinc-400">
        <span>{equityCurve[0]?.date.slice(0, 7)}</span>
        <span>{equityCurve[Math.floor(equityCurve.length / 2)]?.date.slice(0, 7)}</span>
        <span>{equityCurve[equityCurve.length - 1]?.date.slice(0, 7)}</span>
      </div>
    </div>
  )
}

// =============================================================================
// Monthly Returns Heatmap
// =============================================================================

function MonthlyReturnsHeatmap({ monthlyReturns }: { monthlyReturns: MonthlyReturn[] }) {
  // Group by year
  const years = useMemo(() => {
    const map = new Map<number, Map<number, number>>()
    for (const mr of monthlyReturns) {
      if (!map.has(mr.year)) map.set(mr.year, new Map())
      map.get(mr.year)!.set(mr.month, mr.return)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, months]) => ({ year, months }))
  }, [monthlyReturns])

  // Color scale
  const getColor = (val: number | undefined) => {
    if (val === undefined) return 'bg-zinc-100 dark:bg-zinc-800'
    if (val >= 0.03) return 'bg-emerald-500 text-white'
    if (val >= 0.02) return 'bg-emerald-400 text-white'
    if (val >= 0.01) return 'bg-emerald-300 dark:bg-emerald-600 text-emerald-900 dark:text-emerald-100'
    if (val >= 0) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
    if (val >= -0.01) return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
    if (val >= -0.02) return 'bg-red-300 dark:bg-red-700 text-red-900 dark:text-red-100'
    return 'bg-red-500 text-white'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Year
            </th>
            {MONTH_LABELS.map((m) => (
              <th key={m} className="px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {m}
              </th>
            ))}
            <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {years.map(({ year, months }) => {
            const yearTotal = Array.from(months.values()).reduce((sum, v) => sum + v, 0)
            return (
              <tr key={year}>
                <td className="px-2 py-0.5 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {year}
                </td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const val = months.get(month)
                  return (
                    <td key={month} className="px-0.5 py-0.5">
                      <div
                        className={`rounded px-1 py-1 text-[10px] font-medium tabular-nums ${getColor(val)}`}
                        title={val !== undefined ? `${MONTH_LABELS[month - 1]} ${year}: ${formatPercent(val)}` : undefined}
                      >
                        {val !== undefined ? formatPercent(val, 1) : ''}
                      </div>
                    </td>
                  )
                })}
                <td className="px-2 py-0.5">
                  <div className={`rounded px-1 py-1 text-[10px] font-bold tabular-nums ${getColor(yearTotal)}`}>
                    {formatPercent(yearTotal, 1)}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// Trade Distribution Histogram
// =============================================================================

function TradeDistribution({ trades }: { trades: BacktestTrade[] }) {
  const buckets = useMemo(() => {
    const pnls = trades.map((t) => t.returnPct)
    const min = Math.min(...pnls)
    const max = Math.max(...pnls)
    const bucketCount = 15
    const step = (max - min) / bucketCount
    const result: { from: number; to: number; count: number; isPositive: boolean }[] = []

    for (let i = 0; i < bucketCount; i++) {
      const from = min + i * step
      const to = from + step
      const count = pnls.filter((p) => p >= from && (i === bucketCount - 1 ? p <= to : p < to)).length
      result.push({ from, to, count, isPositive: (from + to) / 2 >= 0 })
    }
    return result
  }, [trades])

  const maxCount = Math.max(...buckets.map((b) => b.count))

  return (
    <div>
      <div className="flex h-32 items-end gap-0.5">
        {buckets.map((bucket, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div
              className={`w-full rounded-t transition-all ${
                bucket.isPositive
                  ? 'bg-emerald-400 dark:bg-emerald-500'
                  : 'bg-red-400 dark:bg-red-500'
              }`}
              style={{ height: `${maxCount > 0 ? (bucket.count / maxCount) * 100 : 0}%`, minHeight: bucket.count > 0 ? '2px' : '0px' }}
              title={`${formatPercent(bucket.from)} to ${formatPercent(bucket.to)}: ${bucket.count} trades`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>{formatPercent(buckets[0]?.from ?? 0)}</span>
        <span>0%</span>
        <span>{formatPercent(buckets[buckets.length - 1]?.to ?? 0)}</span>
      </div>
      <p className="mt-1 text-center text-[10px] text-zinc-400">Trade Return Distribution</p>
    </div>
  )
}

// =============================================================================
// Charts Section (Tabbed)
// =============================================================================

function ChartsSection({ equityCurve, monthlyReturns, trades }: {
  equityCurve: EquityCurvePoint[]
  monthlyReturns: MonthlyReturn[]
  trades: BacktestTrade[]
}) {
  const [activeTab, setActiveTab] = useState<ChartTab>('equity')

  const tabs: { key: ChartTab; label: string }[] = [
    { key: 'equity', label: 'Equity Curve' },
    { key: 'drawdown', label: 'Drawdown' },
    { key: 'monthly', label: 'Monthly Returns' },
    { key: 'distribution', label: 'Distribution' },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-pink-600 text-pink-600 dark:text-pink-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 'equity' && <EquityCurveChart equityCurve={equityCurve} />}
        {activeTab === 'drawdown' && <DrawdownChart equityCurve={equityCurve} />}
        {activeTab === 'monthly' && <MonthlyReturnsHeatmap monthlyReturns={monthlyReturns} />}
        {activeTab === 'distribution' && <TradeDistribution trades={trades} />}
      </div>
    </div>
  )
}

// =============================================================================
// Benchmark Comparison Table
// =============================================================================

function BenchmarkComparisonTable({ comparisons }: { comparisons: BenchmarkComparison[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Benchmark Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Metric
              </th>
              {comparisons.map((c) => (
                <th key={c.benchmark} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  vs {c.benchmark}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            <tr className="border-b border-zinc-50 dark:border-zinc-800/50">
              <td className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-300">Alpha</td>
              {comparisons.map((c) => (
                <td key={c.benchmark} className="px-4 py-2 tabular-nums">
                  <span className={c.alpha >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {c.alpha >= 0 ? '+' : ''}{formatPercent(c.alpha)}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-50 dark:border-zinc-800/50">
              <td className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-300">Beta</td>
              {comparisons.map((c) => (
                <td key={c.benchmark} className="px-4 py-2 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatNumber(c.beta)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-50 dark:border-zinc-800/50">
              <td className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-300">Excess Sharpe</td>
              {comparisons.map((c) => (
                <td key={c.benchmark} className="px-4 py-2 tabular-nums">
                  <span className={c.excessSharpe >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {c.excessSharpe >= 0 ? '+' : ''}{formatNumber(c.excessSharpe)}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-50 dark:border-zinc-800/50">
              <td className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-300">Information Ratio</td>
              {comparisons.map((c) => (
                <td key={c.benchmark} className="px-4 py-2 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatNumber(c.informationRatio)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-300">Max Drawdown</td>
              {comparisons.map((c) => (
                <td key={c.benchmark} className="px-4 py-2 tabular-nums">
                  <span className="text-zinc-700 dark:text-zinc-300">{formatPercent(c.strategyMaxDrawdown)}</span>
                  <span className="mx-1 text-zinc-300 dark:text-zinc-600">vs</span>
                  <span className="text-zinc-500">{formatPercent(c.benchmarkMaxDrawdown)}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// Additional Metrics Grid
// =============================================================================

function AdditionalMetrics({ metrics }: { metrics: BacktestDetailMetrics }) {
  const items = [
    { label: 'Total Return', value: formatPercent(metrics.totalReturn) },
    { label: 'Calmar Ratio', value: formatNumber(metrics.calmarRatio) },
    { label: 'Volatility', value: formatPercent(metrics.volatility) },
    { label: 'Max DD Duration', value: `${metrics.maxDrawdownDuration} days` },
    { label: 'Total Trades', value: metrics.totalTrades.toString() },
    { label: 'Trades/Year', value: formatNumber(metrics.tradesPerYear, 1) },
    { label: 'Avg Holding', value: `${formatNumber(metrics.avgHoldingDays, 1)} days` },
    { label: 'Avg Win', value: formatCurrency(metrics.avgWin) },
    { label: 'Avg Loss', value: formatCurrency(metrics.avgLoss) },
    { label: 'Largest Win', value: formatCurrency(metrics.largestWin) },
    { label: 'Largest Loss', value: formatCurrency(metrics.largestLoss) },
    { label: 'VaR 95%', value: formatPercent(metrics.var95) },
    { label: 'CVaR 95%', value: formatPercent(metrics.cvar95) },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Detailed Metrics</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-zinc-100 sm:grid-cols-3 lg:grid-cols-4 dark:bg-zinc-800">
        {items.map((item) => (
          <div key={item.label} className="bg-white px-4 py-2.5 dark:bg-zinc-900">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Trade Log
// =============================================================================

const TRADES_PER_PAGE = 10

function TradeLog({ trades }: { trades: BacktestTrade[] }) {
  const [page, setPage] = useState(0)
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null)
  const [sortCol, setSortCol] = useState<keyof BacktestTrade>('tradeNumber')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      const aVal = a[sortCol]
      const bVal = b[sortCol]
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [trades, sortCol, sortAsc])

  const totalPages = Math.ceil(sorted.length / TRADES_PER_PAGE)
  const pageTrades = sorted.slice(page * TRADES_PER_PAGE, (page + 1) * TRADES_PER_PAGE)

  const handleSort = (col: keyof BacktestTrade) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  const SortHeader = ({ col, label, className = '' }: { col: keyof BacktestTrade; label: string; className?: string }) => (
    <th
      className={`cursor-pointer select-none px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300 ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortCol === col && (
          <span className="text-pink-500">{sortAsc ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Trade Log
          <span className="ml-2 text-xs font-normal text-zinc-400">({trades.length} trades)</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded p-1 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded p-1 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="w-8 px-3 py-2.5" />
              <SortHeader col="tradeNumber" label="#" className="text-right" />
              <SortHeader col="entryDate" label="Entry" />
              <SortHeader col="exitDate" label="Exit" />
              <SortHeader col="instrument" label="Instrument" />
              <SortHeader col="direction" label="Dir" />
              <SortHeader col="quantity" label="Qty" className="text-right" />
              <SortHeader col="entryPrice" label="Entry $" className="text-right" />
              <SortHeader col="exitPrice" label="Exit $" className="text-right" />
              <SortHeader col="pnl" label="P&L" className="text-right" />
              <SortHeader col="returnPct" label="Return" className="text-right" />
              <SortHeader col="holdingDays" label="Days" className="text-right" />
            </tr>
          </thead>
          <tbody>
            {pageTrades.map((trade) => {
              const isExpanded = expandedTrade === trade.tradeNumber
              const hasSnapshots = trade.indicatorSnapshots !== null
              return (
                <Fragment key={trade.tradeNumber}>
                  <tr
                    className={`border-b border-zinc-50 transition-colors dark:border-zinc-800/50 ${
                      hasSnapshots ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''
                    } ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''}`}
                    onClick={() => hasSnapshots && setExpandedTrade(isExpanded ? null : trade.tradeNumber)}
                  >
                    <td className="px-3 py-2">
                      {hasSnapshots && (
                        isExpanded
                          ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                          : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums text-zinc-500">
                      {trade.tradeNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                      {trade.entryDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                      {trade.exitDate}
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                      {trade.instrument}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          trade.direction === 'LONG'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                      {trade.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatPrice(trade.entryPrice)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatPrice(trade.exitPrice)}
                    </td>
                    <td className={`px-3 py-2 text-right text-xs font-semibold tabular-nums ${
                      trade.pnl >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </td>
                    <td className={`px-3 py-2 text-right text-xs tabular-nums ${
                      trade.returnPct >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.returnPct >= 0 ? '+' : ''}{formatPercent(trade.returnPct)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs tabular-nums text-zinc-500">
                      {trade.holdingDays}
                    </td>
                  </tr>
                  {/* Expanded indicator snapshots */}
                  {isExpanded && trade.indicatorSnapshots && (
                    <tr key={`${trade.tradeNumber}-snapshots`} className="border-b border-zinc-50 dark:border-zinc-800/50">
                      <td colSpan={12} className="px-6 py-3">
                        <div className="flex gap-6">
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                              Entry Indicators
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                              {Object.entries(trade.indicatorSnapshots.entry).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-4">
                                  <span className="text-xs text-zinc-500">{key}</span>
                                  <span className="text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                                    {typeof val === 'number' ? formatNumber(val) : val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                              Exit Indicators
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                              {Object.entries(trade.indicatorSnapshots.exit).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-4">
                                  <span className="text-xs text-zinc-500">{key}</span>
                                  <span className="text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                                    {typeof val === 'number' ? formatNumber(val) : val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function BacktestResults({ detail, onBack, onRerun, onCompare }: BacktestResultsProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Section Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Intelligence
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Backtest Results
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          {/* Anti-Pattern Warnings */}
          <WarningsBanner warnings={detail.antiPatternWarnings} />

          {/* Executive Summary */}
          <ExecutiveSummary detail={detail} onRerun={onRerun} onCompare={onCompare} />

          {/* Stat Cards */}
          <StatsRow metrics={detail.metrics} spyBenchmark={detail.spyBenchmark} />

          {/* Charts */}
          <ChartsSection
            equityCurve={detail.equityCurve}
            monthlyReturns={detail.monthlyReturns}
            trades={detail.trades}
          />

          {/* Benchmark Comparison + Additional Metrics side by side on large screens */}
          <div className="grid gap-4 lg:grid-cols-2">
            <BenchmarkComparisonTable comparisons={detail.benchmarkComparisons} />
            <AdditionalMetrics metrics={detail.metrics} />
          </div>

          {/* Trade Log */}
          <TradeLog trades={detail.trades} />
        </div>
      </div>
    </div>
  )
}
