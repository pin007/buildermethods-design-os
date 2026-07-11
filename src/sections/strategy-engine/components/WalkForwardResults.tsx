import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Layers,
  TrendingUp,
  Activity,
} from 'lucide-react'
import type {
  WalkForwardResultsProps,
  WalkForwardDetail,
  WalkForwardWindow,
  ParameterStabilityData,
  OverfittingRisk,
  ParameterStability,
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

// =============================================================================
// Overfitting Risk Badge
// =============================================================================

const overfittingConfig: Record<OverfittingRisk, {
  label: string
  bg: string
  text: string
  icon: typeof ShieldCheck
  description: string
}> = {
  LOW: {
    label: 'Low Risk',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: ShieldCheck,
    description: 'Out-of-sample performance closely matches in-sample. Strategy generalizes well.',
  },
  MEDIUM: {
    label: 'Medium Risk',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    icon: Shield,
    description: 'Some degradation between in-sample and out-of-sample. Review parameter choices.',
  },
  HIGH: {
    label: 'High Risk',
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    icon: ShieldAlert,
    description: 'Significant gap between in-sample and out-of-sample. Strategy may be overfit.',
  },
}

const stabilityConfig: Record<ParameterStability, {
  label: string
  bg: string
  text: string
}> = {
  HIGH: {
    label: 'Stable',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  MEDIUM: {
    label: 'Moderate',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
  LOW: {
    label: 'Volatile',
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
  },
}

// =============================================================================
// Summary Section
// =============================================================================

function SummarySection({ detail }: { detail: WalkForwardDetail }) {
  const risk = overfittingConfig[detail.overfittingRisk]
  const RiskIcon = risk.icon

  // OOS/IS ratio visualization
  const ratio = detail.overfittingRatio
  const ratioPercent = Math.min(ratio * 100, 100)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Overfitting Risk Card — spans 1 col */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${risk.bg}`}>
            <RiskIcon className={`h-5 w-5 ${risk.text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-hint">
              Overfitting Risk
            </p>
            <p className={`mt-0.5 text-lg font-bold ${risk.text}`}>{risk.label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {risk.description}
            </p>
          </div>
        </div>

        {/* OOS/IS Ratio Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-hint">
            <span>OOS/IS Sharpe Ratio</span>
            <span className="font-semibold tabular-nums">{formatNumber(ratio)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                ratio >= 0.8
                  ? 'bg-emerald-500'
                  : ratio >= 0.6
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${ratioPercent}%` }}
            />
          </div>
          <div className="mt-0.5 flex justify-between text-xs text-faint">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid — spans 2 cols */}
      <div className="grid grid-cols-2 gap-3 lg:col-span-2 sm:grid-cols-4">
        <MetricTile
          icon={TrendingUp}
          label="Avg Validation Sharpe"
          value={formatNumber(detail.avgValidationSharpe)}
          subtext={`In-sample: ${formatNumber(detail.inSampleAvgSharpe)}`}
          isGood={detail.avgValidationSharpe > 1.0}
        />
        <MetricTile
          icon={Activity}
          label="Avg Validation Return"
          value={formatPercent(detail.avgValidationReturn)}
          isGood={detail.avgValidationReturn > 0}
        />
        <MetricTile
          icon={Layers}
          label="Total Windows"
          value={detail.windows.length.toString()}
        />
        <MetricTile
          icon={BarChart3}
          label="In-Sample Sharpe"
          value={formatNumber(detail.inSampleAvgSharpe)}
          subtext={`Degradation: ${formatPercent(1 - ratio)}`}
        />
      </div>
    </div>
  )
}

function MetricTile({
  icon: Icon,
  label,
  value,
  subtext,
  isGood,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  subtext?: string
  isGood?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-hint" />
        <p className="text-xs font-medium uppercase tracking-wider text-hint">
          {label}
        </p>
      </div>
      <p className={`mt-1.5 text-xl font-bold tabular-nums ${
        isGood === true
          ? 'text-emerald-600 dark:text-emerald-400'
          : isGood === false
            ? 'text-red-600 dark:text-red-400'
            : 'text-foreground'
      }`}>
        {value}
      </p>
      {subtext && (
        <p className="mt-0.5 text-xs text-hint">{subtext}</p>
      )}
    </div>
  )
}

// =============================================================================
// Windows Table
// =============================================================================

type WindowSortKey = 'windowNumber' | 'trainSharpe' | 'valSharpe' | 'valReturn'

function WindowsTable({ windows }: { windows: WalkForwardWindow[] }) {
  const [sortCol, setSortCol] = useState<WindowSortKey>('windowNumber')
  const [sortAsc, setSortAsc] = useState(true)
  const [expandedWindow, setExpandedWindow] = useState<number | null>(null)

  const sorted = useMemo(() => {
    return [...windows].sort((a, b) => {
      const aVal = a[sortCol]
      const bVal = b[sortCol]
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [windows, sortCol, sortAsc])

  const handleSort = (col: WindowSortKey) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  const SortHeader = ({ col, label, className = '' }: { col: WindowSortKey; label: string; className?: string }) => (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-hint transition-colors hover:text-muted-foreground ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortCol === col && (
          <span className="text-primary">{sortAsc ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )

  // Calculate min/max for color grading
  const valSharpes = windows.map((w) => w.valSharpe)
  const minSharpe = Math.min(...valSharpes)
  const maxSharpe = Math.max(...valSharpes)

  const getSharpeColor = (val: number) => {
    if (maxSharpe === minSharpe) return 'text-foreground'
    const normalized = (val - minSharpe) / (maxSharpe - minSharpe)
    if (normalized >= 0.7) return 'text-emerald-600 dark:text-emerald-400'
    if (normalized >= 0.3) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Validation Windows
          <span className="ml-2 text-xs font-normal text-hint">({windows.length} windows)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="w-8 px-3 py-2.5" />
              <SortHeader col="windowNumber" label="#" />
              <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-hint">
                Training Period
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-hint">
                Validation Period
              </th>
              <SortHeader col="trainSharpe" label="Train Sharpe" className="text-right" />
              <SortHeader col="valSharpe" label="Val Sharpe" className="text-right" />
              <SortHeader col="valReturn" label="Val Return" className="text-right" />
              <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-hint">
                Best Params
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((window) => {
              const isExpanded = expandedWindow === window.windowNumber
              const degradation = window.trainSharpe > 0
                ? (window.valSharpe - window.trainSharpe) / window.trainSharpe
                : 0

              return (
                <tr
                  key={window.windowNumber}
                  className={`cursor-pointer border-b border-zinc-50 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 ${
                    isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''
                  }`}
                  onClick={() => setExpandedWindow(isExpanded ? null : window.windowNumber)}
                >
                  <td className="px-3 py-2.5">
                    {isExpanded
                      ? <ChevronUp className="h-3.5 w-3.5 text-hint" />
                      : <ChevronDown className="h-3.5 w-3.5 text-hint" />
                    }
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium tabular-nums text-hint">
                    {window.windowNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-foreground">
                    {window.trainStart} &rarr; {window.trainEnd}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-foreground">
                    {window.valStart} &rarr; {window.valEnd}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">
                    {formatNumber(window.trainSharpe)}
                  </td>
                  <td className={`px-3 py-2.5 text-right text-xs font-semibold tabular-nums ${getSharpeColor(window.valSharpe)}`}>
                    {formatNumber(window.valSharpe)}
                  </td>
                  <td className={`px-3 py-2.5 text-right text-xs tabular-nums ${
                    window.valReturn >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {window.valReturn >= 0 ? '+' : ''}{formatPercent(window.valReturn)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(window.bestParams).map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
                        >
                          <span className="text-hint">{key}=</span>
                          <span className="font-medium text-foreground">{val}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// Parameter Stability Chart
// =============================================================================

function ParameterStabilityChart({ parameterStability, windowCount }: {
  parameterStability: ParameterStabilityData[]
  windowCount: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Parameter Stability</h3>
        <p className="mt-0.5 text-xs text-hint">
          How optimal parameters change across walk-forward windows. Stable parameters indicate robust strategy design.
        </p>
      </div>
      <div className="divide-y divide-border">
        {parameterStability.map((param) => (
          <ParameterRow key={param.paramName} param={param} windowCount={windowCount} />
        ))}
      </div>
    </div>
  )
}

function ParameterRow({ param, windowCount }: { param: ParameterStabilityData; windowCount: number }) {
  const badge = stabilityConfig[param.stability]

  // Find unique values and their frequencies
  const valueCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const v of param.values) {
      counts.set(v, (counts.get(v) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
  }, [param.values])

  // For the sparkline-style visualization
  const uniqueValues = [...new Set(param.values)].sort((a, b) => a - b)
  const minVal = Math.min(...param.values)
  const maxVal = Math.max(...param.values)
  const range = maxVal - minVal

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-semibold text-foreground">
            {param.paramName}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
        <span className="text-xs text-hint">
          Most frequent: <span className="font-mono font-semibold text-foreground">{param.mostFrequent}</span>
        </span>
      </div>

      {/* Parameter value timeline */}
      <div className="mt-3 flex items-end gap-px">
        {param.values.map((val, idx) => {
          const isMostFrequent = val === param.mostFrequent
          const height = range > 0
            ? 12 + ((val - minVal) / range) * 28
            : 24

          return (
            <div
              key={idx}
              className="group relative flex-1"
              title={`Window ${idx + 1}: ${param.paramName}=${val}`}
            >
              <div
                className={`w-full rounded-t transition-colors ${
                  isMostFrequent
                    ? 'bg-primary dark:bg-pink-400'
                    : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
                style={{ height: `${height}px` }}
              />
              <div className="mt-0.5 text-center text-[8px] tabular-nums text-faint">
                {idx + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* Value frequency breakdown */}
      <div className="mt-2 flex flex-wrap gap-2">
        {valueCounts.map(([value, count]) => {
          const pct = (count / param.values.length) * 100
          return (
            <div key={value} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${
                value === param.mostFrequent ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
              }`} />
              <span className="text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground">{value}</span>
                {' '}({count}x, {pct.toFixed(0)}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// Sharpe Ratio Comparison Chart
// =============================================================================

function SharpeComparisonChart({ windows }: { windows: WalkForwardWindow[] }) {
  const allSharpes = windows.flatMap((w) => [w.trainSharpe, w.valSharpe])
  const maxSharpe = Math.max(...allSharpes) * 1.1
  const minSharpe = Math.min(Math.min(...allSharpes) * 0.9, 0)
  const range = maxSharpe - minSharpe

  const toHeight = (val: number) => ((val - minSharpe) / range) * 100

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            In-Sample vs Out-of-Sample Sharpe
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
              <span className="text-xs text-muted-foreground">Train</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Validation</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-end gap-1" style={{ height: '140px' }}>
          {windows.map((window) => (
            <div key={window.windowNumber} className="flex h-full flex-1 items-end gap-px">
              {/* Train bar */}
              <div
                className="flex-1 rounded-t bg-zinc-200 transition-colors dark:bg-zinc-700"
                style={{ height: `${toHeight(window.trainSharpe)}%` }}
                title={`W${window.windowNumber} Train: ${formatNumber(window.trainSharpe)}`}
              />
              {/* Validation bar */}
              <div
                className="flex-1 rounded-t bg-primary transition-colors dark:bg-pink-400"
                style={{ height: `${toHeight(window.valSharpe)}%` }}
                title={`W${window.windowNumber} Val: ${formatNumber(window.valSharpe)}`}
              />
            </div>
          ))}
        </div>
        {/* X-axis */}
        <div className="mt-1 flex gap-1">
          {windows.map((w) => (
            <div key={w.windowNumber} className="flex-1 text-center text-[8px] tabular-nums text-hint">
              W{w.windowNumber}
            </div>
          ))}
        </div>
        {/* Y-axis labels */}
        <div className="mt-2 flex items-center justify-between text-xs text-hint">
          <span>Min: {formatNumber(Math.min(...allSharpes))}</span>
          <span>Avg gap: {formatNumber(
            windows.reduce((sum, w) => sum + (w.trainSharpe - w.valSharpe), 0) / windows.length
          )}</span>
          <span>Max: {formatNumber(Math.max(...allSharpes))}</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function WalkForwardResults({ detail, onBack }: WalkForwardResultsProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Section Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-foreground active:scale-95"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Intelligence
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Walk-Forward Results
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {detail.strategyName} &middot; {detail.optimizationId}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary */}
          <SummarySection detail={detail} />

          {/* Sharpe Comparison Chart */}
          <SharpeComparisonChart windows={detail.windows} />

          {/* Windows Table */}
          <WindowsTable windows={detail.windows} />

          {/* Parameter Stability */}
          <ParameterStabilityChart
            parameterStability={detail.parameterStability}
            windowCount={detail.windows.length}
          />
        </div>
      </div>
    </div>
  )
}
