import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import type {
  BenchmarkComparison,
  BenchmarkPeriod,
  MarginInfo,
} from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BENCHMARK_PERIODS: { key: BenchmarkPeriod; label: string }[] = [
  { key: 'MTD', label: 'MTD' },
  { key: 'QTD', label: 'QTD' },
  { key: 'YTD', label: 'YTD' },
  { key: '1Y', label: '1Y' },
  { key: '3Y', label: '3Y' },
  { key: 'inception', label: 'Inception' },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface PerformanceTabProps {
  benchmarkComparison: BenchmarkComparison | null
  marginInfo: MarginInfo | null
  onChangeBenchmark?: (benchmark: string) => void
  onChangeBenchmarkPeriod?: (period: BenchmarkPeriod) => void
}

export function PerformanceTab({
  benchmarkComparison,
  marginInfo,
  onChangeBenchmark,
  onChangeBenchmarkPeriod,
}: PerformanceTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<BenchmarkPeriod>(benchmarkComparison?.period ?? 'YTD')

  // Empty state
  if (!benchmarkComparison) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
          <BarChart3 size={24} className="text-zinc-300 dark:text-zinc-600" />
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Not enough data</p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Check back after your portfolio has some history.</p>
      </div>
    )
  }

  const bc = benchmarkComparison
  const alphaPositive = bc.alphaPercent >= 0

  // Build SVG for benchmark comparison chart
  const series = bc.series
  const allValues = series.flatMap(p => [p.portfolioReturn, p.benchmarkReturn])
  const maxVal = Math.max(...allValues, 0)
  const minVal = Math.min(...allValues, 0)
  const range = (maxVal - minVal) || 1
  const height = 140

  const portfolioPoints = series.map((p, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * 100
    const y = height - ((p.portfolioReturn - minVal) / range) * (height - 20) - 10
    return `${x},${y}`
  }).join(' ')

  const benchmarkPoints = series.map((p, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * 100
    const y = height - ((p.benchmarkReturn - minVal) / range) * (height - 20) - 10
    return `${x},${y}`
  }).join(' ')

  // Zero line
  const zeroY = height - ((0 - minVal) / range) * (height - 20) - 10

  return (
    <div className="space-y-5">
      {/* ================================================================= */}
      {/* Benchmark Comparison                                              */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <BarChart3 size={13} className="text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Benchmark Comparison
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                vs {bc.benchmarkName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Benchmark selector */}
            <select
              value={bc.benchmark}
              onChange={e => onChangeBenchmark?.(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 px-3 pr-8 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] transition-all"
            >
              <option value="SPY">S&P 500 (SPY)</option>
              <option value="QQQ">NASDAQ (QQQ)</option>
            </select>

            {/* Period selector */}
            <div className="flex gap-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 p-0.5 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
              {BENCHMARK_PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setSelectedPeriod(p.key); onChangeBenchmarkPeriod?.(p.key) }}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition-all ${
                    selectedPeriod === p.key
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                      : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Portfolio Return</p>
            <p className={`mt-1 font-mono text-xl font-semibold tracking-tight ${
              bc.portfolioReturnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {formatPercent(bc.portfolioReturnPercent)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Benchmark Return</p>
            <p className={`mt-1 font-mono text-xl font-semibold tracking-tight ${
              bc.benchmarkReturnPercent >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {formatPercent(bc.benchmarkReturnPercent)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Alpha</p>
            <div className="mt-1 flex items-center gap-2">
              <p className={`font-mono text-xl font-semibold tracking-tight ${
                alphaPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              }`}>
                {formatPercent(bc.alphaPercent)}
              </p>
              <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-xs font-semibold ${
                alphaPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {alphaPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {alphaPositive ? 'Outperforming' : 'Underperforming'}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 py-5">
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-36 w-full sm:h-44">
            {/* Grid lines */}
            <line x1="0" y1={height * 0.25} x2="100" y2={height * 0.25} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.5} x2="100" y2={height * 0.5} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.75} x2="100" y2={height * 0.75} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />

            {/* Zero line */}
            <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="currentColor" strokeWidth="0.2" strokeDasharray="0.5,0.5" className="text-zinc-300 dark:text-zinc-700" />

            {/* Benchmark line (sky blue) */}
            <polyline
              points={benchmarkPoints}
              fill="none"
              stroke="rgb(56, 189, 248)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: '1.5px' }}
              opacity="0.7"
            />

            {/* Portfolio line (pink/magenta) */}
            <polyline
              points={portfolioPoints}
              fill="none"
              stroke="rgb(219, 39, 119)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: '2px' }}
            />
          </svg>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-5 rounded-full bg-pink-600" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-5 rounded-full bg-sky-400 opacity-70" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{bc.benchmarkName}</span>
            </div>
          </div>

          {/* X-axis labels */}
          {series.length > 0 && (
            <div className="mt-2 flex justify-between">
              <span className="text-xs text-zinc-300 dark:text-zinc-700">
                {new Date(series[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-zinc-300 dark:text-zinc-700">
                {new Date(series[series.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution analysis */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800/60 px-5 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800/80">
            <BarChart3 size={12} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Attribution Analysis</h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {bc.attribution.map(entry => {
            const positive = entry.contributionPercent >= 0
            return (
              <div key={entry.symbol} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {positive
                    ? <TrendingUp size={14} className="text-emerald-500/60 dark:text-emerald-400/50" />
                    : <TrendingDown size={14} className="text-red-500/60 dark:text-red-400/50" />
                  }
                  <div>
                    <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">{entry.symbol}</span>
                    <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">{entry.instrumentName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mini bar */}
                  <div className="hidden sm:flex h-1.5 w-20 items-center rounded-full bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(entry.contributionPercent) * 20, 100)}%` }}
                    />
                  </div>
                  <span className={`font-mono text-sm font-semibold tabular-nums ${
                    positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {formatPercent(entry.contributionPercent)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Margin & Buying Power                                             */}
      {/* ================================================================= */}
      {marginInfo && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Shield size={15} className="text-zinc-400 dark:text-zinc-500" />
            Margin & Buying Power
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* Margin Used */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Margin Used</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                {formatCurrency(marginInfo.marginUsed)}
              </p>
            </div>

            {/* Margin Available */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Available</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                {formatCurrency(marginInfo.marginAvailable)}
              </p>
            </div>

            {/* Margin Usage % */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Usage</p>
              <p className={`mt-1 font-mono text-lg font-semibold tracking-tight ${
                marginInfo.marginUsagePercent > 50
                  ? 'text-red-600 dark:text-red-400'
                  : marginInfo.marginUsagePercent > 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {marginInfo.marginUsagePercent.toFixed(1)}%
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800/60">
                <div
                  className={`h-full rounded-full transition-all ${
                    marginInfo.marginUsagePercent > 50
                      ? 'bg-red-500'
                      : marginInfo.marginUsagePercent > 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(marginInfo.marginUsagePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Buying Power */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Buying Power</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                {formatCurrency(marginInfo.buyingPower)}
              </p>
            </div>

            {/* Margin Call Distance */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">Call Distance</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                {marginInfo.marginCallDistancePercent.toFixed(1)}%
              </p>
              {marginInfo.alertTriggered && (
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={11} />
                  Alert triggered
                </div>
              )}
            </div>
          </div>

          {/* Margin call risk */}
          {marginInfo.marginCallRisk.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
              <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800/60 px-4 py-2.5">
                <AlertTriangle size={13} className="text-amber-500 dark:text-amber-400" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Margin call risk — price drop to trigger call
                </p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {marginInfo.marginCallRisk.map(risk => (
                  <div key={risk.symbol} className="flex items-center justify-between px-4 py-2.5">
                    <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">{risk.symbol}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-red-500 dark:text-red-400">
                      {risk.priceDropPercentToCall.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
