import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Eye,
  EyeOff,
} from 'lucide-react'
import type {
  StrategyComparisonProps,
  ComparisonData,
  ComparisonStrategy,
  NormalizedEquityCurvePoint,
} from '@/../product/sections/strategy-engine/types'

// =============================================================================
// Helpers
// =============================================================================

function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

// Chart color palette — magenta, emerald, sky, amber (from brand manual)
const CHART_COLORS = [
  { line: 'rgb(219 39 119)', bg: 'bg-primary', text: 'text-primary', name: 'pink' },
  { line: 'rgb(16 185 129)', bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', name: 'emerald' },
  { line: 'rgb(14 165 233)', bg: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', name: 'sky' },
  { line: 'rgb(245 158 11)', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', name: 'amber' },
]

const SPY_COLOR = { line: 'rgb(161 161 170)', dash: '2 1.5' }

// Rank icons
const RANK_ICONS = [Trophy, Medal, Award]
const RANK_COLORS = [
  'text-amber-500',   // Gold
  'text-zinc-400',    // Silver
  'text-amber-700 dark:text-amber-600', // Bronze
]

// =============================================================================
// Metrics to compare
// =============================================================================

interface MetricDef {
  key: keyof ComparisonStrategy
  label: string
  format: (val: number) => string
  higherIsBetter: boolean
}

const METRICS: MetricDef[] = [
  { key: 'cagr', label: 'CAGR', format: (v) => formatPercent(v), higherIsBetter: true },
  { key: 'sharpeRatio', label: 'Sharpe Ratio', format: (v) => formatNumber(v), higherIsBetter: true },
  { key: 'sortinoRatio', label: 'Sortino Ratio', format: (v) => formatNumber(v), higherIsBetter: true },
  { key: 'maxDrawdown', label: 'Max Drawdown', format: (v) => formatPercent(v), higherIsBetter: false },
  { key: 'winRate', label: 'Win Rate', format: (v) => formatPercent(v), higherIsBetter: true },
  { key: 'profitFactor', label: 'Profit Factor', format: (v) => formatNumber(v), higherIsBetter: true },
  { key: 'totalTrades', label: 'Total Trades', format: (v) => v.toString(), higherIsBetter: true },
  { key: 'avgHoldingDays', label: 'Avg Holding Days', format: (v) => formatNumber(v, 1), higherIsBetter: false },
]

// =============================================================================
// Ranking Summary
// =============================================================================

function RankingSummary({
  strategies,
  onViewBacktest,
}: {
  strategies: ComparisonStrategy[]
  onViewBacktest?: (id: string) => void
}) {
  const ranked = useMemo(
    () => [...strategies].sort((a, b) => a.rank - b.rank),
    [strategies],
  )

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ranked.map((strategy, idx) => {
        const Icon = RANK_ICONS[idx] ?? Award
        const rankColor = RANK_COLORS[idx] ?? 'text-zinc-500'
        const colorConfig = CHART_COLORS[idx % CHART_COLORS.length]
        const isFirst = idx === 0

        return (
          <button
            key={strategy.backtestId}
            onClick={() => onViewBacktest?.(strategy.backtestId)}
            className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all hover:shadow-md ${
              isFirst
                ? 'border-pink-200 bg-pink-50/50 dark:border-pink-900/50 dark:bg-pink-950/20'
                : 'border-border bg-card'
            }`}
          >
            {/* Rank badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${rankColor}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-hint">
                  #{strategy.rank}
                </span>
              </div>
              <div className={`h-2 w-2 rounded-full ${colorConfig.bg}`} />
            </div>

            <h3 className="mt-2 text-sm font-semibold text-foreground">
              {strategy.strategyName}
            </h3>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <p className="text-xs text-hint">Sharpe</p>
                <p className={`text-sm font-bold tabular-nums ${colorConfig.text}`}>
                  {formatNumber(strategy.sharpeRatio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-hint">CAGR</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatPercent(strategy.cagr)}
                </p>
              </div>
              <div>
                <p className="text-xs text-hint">Max DD</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatPercent(strategy.maxDrawdown)}
                </p>
              </div>
              <div>
                <p className="text-xs text-hint">Profit Factor</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatNumber(strategy.profitFactor)}
                </p>
              </div>
            </div>

            {/* Hover indicator */}
            <span className="mt-2 block text-xs text-hint opacity-0 transition-opacity group-hover:opacity-100">
              View backtest details &rarr;
            </span>
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Comparison Table
// =============================================================================

function ComparisonTable({ strategies }: { strategies: ComparisonStrategy[] }) {
  const ranked = useMemo(
    () => [...strategies].sort((a, b) => a.rank - b.rank),
    [strategies],
  )

  // For each metric, find the best value
  const bestValues = useMemo(() => {
    const map: Record<string, number> = {}
    for (const metric of METRICS) {
      const values = ranked.map((s) => s[metric.key] as number)
      if (metric.higherIsBetter) {
        // For drawdown (negative), "higher" means less negative
        if (metric.key === 'maxDrawdown') {
          map[metric.key] = Math.max(...values)
        } else {
          map[metric.key] = Math.max(...values)
        }
      } else {
        if (metric.key === 'maxDrawdown') {
          map[metric.key] = Math.max(...values) // least negative = best
        } else {
          map[metric.key] = Math.min(...values)
        }
      }
    }
    return map
  }, [ranked])

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Metrics Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-hint">
                Metric
              </th>
              {ranked.map((s, idx) => {
                const color = CHART_COLORS[idx % CHART_COLORS.length]
                return (
                  <th key={s.backtestId} className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${color.bg}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-hint">
                        {s.strategyName}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => (
              <tr key={metric.key} className="border-b border-zinc-50 dark:border-zinc-800/50">
                <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  {metric.label}
                </td>
                {ranked.map((s) => {
                  const val = s[metric.key] as number
                  const isBest = val === bestValues[metric.key]
                  return (
                    <td key={s.backtestId} className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                          isBest
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'text-foreground'
                        }`}
                      >
                        {metric.format(val)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// Overlaid Equity Curves Chart
// =============================================================================

function EquityCurvesChart({
  curves,
  strategies,
}: {
  curves: NormalizedEquityCurvePoint[]
  strategies: ComparisonStrategy[]
}) {
  const [showSpy, setShowSpy] = useState(true)

  // Get the strategy keys from the curve data (exclude 'date' and 'spy')
  const strategyKeys = useMemo(() => {
    if (curves.length === 0) return []
    return Object.keys(curves[0]).filter((k) => k !== 'date' && k !== 'spy')
  }, [curves])

  // Map strategy keys to display names (camelCase to strategy name)
  const keyToName = useMemo(() => {
    const map: Record<string, string> = {}
    // Create a reverse mapping from camelCase keys to strategy names
    for (const s of strategies) {
      const camelKey = s.strategyName
        .toLowerCase()
        .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/[^a-z0-9]/g, '')
      // Try to match against curve keys
      for (const key of strategyKeys) {
        if (key.toLowerCase().replace(/[^a-z]/g, '') === camelKey.toLowerCase().replace(/[^a-z]/g, '')) {
          map[key] = s.strategyName
        }
      }
    }
    // Fallback: direct assignment by order if matching fails
    if (Object.keys(map).length !== strategyKeys.length) {
      strategyKeys.forEach((key, idx) => {
        if (!map[key] && strategies[idx]) {
          map[key] = strategies[idx].strategyName
        }
      })
    }
    return map
  }, [strategies, strategyKeys])

  // Compute Y range
  const allValues = useMemo(() => {
    const vals: number[] = []
    for (const point of curves) {
      for (const key of strategyKeys) {
        const v = point[key]
        if (typeof v === 'number') vals.push(v)
      }
      if (showSpy && typeof point.spy === 'number') vals.push(point.spy as number)
    }
    return vals
  }, [curves, strategyKeys, showSpy])

  const minVal = Math.min(...allValues) * 0.95
  const maxVal = Math.max(...allValues) * 1.05
  const range = maxVal - minVal

  const toY = (val: number) => ((val - minVal) / range) * 100

  const makePath = (key: string) => {
    return curves
      .map((p, i) => {
        const val = p[key]
        if (typeof val !== 'number') return null
        const x = (i / (curves.length - 1)) * 100
        const y = 100 - toY(val)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .filter(Boolean)
      .join(' ')
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Equity Curves
          <span className="ml-2 text-xs font-normal text-hint">(Normalized to 100)</span>
        </h3>
        <button
          onClick={() => setShowSpy(!showSpy)}
          aria-pressed={showSpy}
          aria-label={showSpy ? 'Hide SPY benchmark' : 'Show SPY benchmark'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent dark:border-zinc-700"
        >
          {showSpy ? <Eye className="h-3 w-3" aria-hidden="true" /> : <EyeOff className="h-3 w-3" aria-hidden="true" />}
          SPY Benchmark
        </button>
      </div>
      <div className="p-4">
        {/* Legend */}
        <div className="mb-3 flex flex-wrap items-center gap-4">
          {strategyKeys.map((key, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length]
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-0.5 w-4 rounded ${color.bg}`} />
                <span className="text-xs text-muted-foreground">
                  {keyToName[key] || key}
                </span>
              </div>
            )
          })}
          {showSpy && (
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 rounded bg-zinc-400 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)' }} />
              <span className="text-xs text-muted-foreground">SPY</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="relative h-56 w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 flex h-full w-10 flex-col justify-between py-2 text-right">
            <span className="pr-1.5 text-xs tabular-nums text-hint">{maxVal.toFixed(0)}</span>
            <span className="pr-1.5 text-xs tabular-nums text-hint">{((maxVal + minVal) / 2).toFixed(0)}</span>
            <span className="pr-1.5 text-xs tabular-nums text-hint">{minVal.toFixed(0)}</span>
          </div>

          {/* Grid */}
          <div className="absolute inset-0 left-10">
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-border" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-border" />
          </div>

          {/* SVG */}
          <svg
            className="absolute inset-0 left-10 right-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: 'calc(100% - 2.5rem)', height: '100%' }}
          >
            {/* SPY line */}
            {showSpy && (
              <path
                d={makePath('spy')}
                fill="none"
                stroke={SPY_COLOR.line}
                strokeWidth="0.4"
                strokeDasharray={SPY_COLOR.dash}
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* Strategy lines */}
            {strategyKeys.map((key, idx) => {
              const color = CHART_COLORS[idx % CHART_COLORS.length]
              return (
                <path
                  key={key}
                  d={makePath(key)}
                  fill="none"
                  stroke={color.line}
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis */}
        <div className="mt-1 flex justify-between pl-10 text-xs text-hint">
          <span>{curves[0]?.date}</span>
          <span>{curves[Math.floor(curves.length / 2)]?.date}</span>
          <span>{curves[curves.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function StrategyComparison({ comparison, onBack, onViewBacktest }: StrategyComparisonProps) {
  const ranked = useMemo(
    () => [...comparison.strategies].sort((a, b) => a.rank - b.rank),
    [comparison.strategies],
  )

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Strategy Comparison
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparing {comparison.strategies.length} strategies by Sharpe ratio
          </p>
        </div>

        <div className="space-y-4">
          {/* Ranking Summary */}
          <RankingSummary strategies={ranked} onViewBacktest={onViewBacktest} />

          {/* Equity Curves */}
          <EquityCurvesChart
            curves={comparison.normalizedEquityCurves}
            strategies={ranked}
          />

          {/* Comparison Table */}
          <ComparisonTable strategies={ranked} />
        </div>
      </div>
  )
}
