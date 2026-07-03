import { useState, useMemo } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  PieChart,
  Briefcase,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Cable,
  Layers,
} from 'lucide-react'
import type {
  PortfolioOverviewProps,
  AllocationView,
  EquityCurvePeriod,
  AllocationSliceUsd,
  EquityCurvePointUsd,
  Portfolio,
} from '@/../product/sections/portfolio-and-positions/types'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatSignedCurrency(value: number, currency = 'USD'): string {
  const formatted = formatCurrency(Math.abs(value), currency)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

// ---------------------------------------------------------------------------
// Allocation color palette — distinctive per-slice
// ---------------------------------------------------------------------------

const SLICE_COLORS = [
  { bar: 'bg-pink-500', text: 'text-pink-500', dot: 'bg-pink-500' },
  { bar: 'bg-emerald-500', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  { bar: 'bg-sky-500', text: 'text-sky-500', dot: 'bg-sky-500' },
  { bar: 'bg-amber-500', text: 'text-amber-500', dot: 'bg-amber-500' },
  { bar: 'bg-violet-500', text: 'text-violet-500', dot: 'bg-violet-500' },
  { bar: 'bg-rose-400', text: 'text-rose-400', dot: 'bg-rose-400' },
  { bar: 'bg-teal-400', text: 'text-teal-400', dot: 'bg-teal-400' },
  { bar: 'bg-orange-400', text: 'text-orange-400', dot: 'bg-orange-400' },
]

// ---------------------------------------------------------------------------
// Equity curve period options
// ---------------------------------------------------------------------------

const PERIODS: EquityCurvePeriod[] = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL']

const ALLOCATION_VIEWS: { key: AllocationView; label: string }[] = [
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'broker', label: 'Broker' },
  { key: 'assetType', label: 'Asset Type' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EquityCurveChart({ data, period, onPeriodChange }: {
  data: EquityCurvePointUsd[]
  period: EquityCurvePeriod
  onPeriodChange: (p: EquityCurvePeriod) => void
}) {
  const filteredData = useMemo(() => {
    if (period === 'ALL') return data
    const now = new Date()
    const monthsMap: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }
    if (period === 'YTD') {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return data.filter(p => new Date(p.date) >= yearStart)
    }
    const months = monthsMap[period] ?? 12
    const cutoff = new Date(now)
    cutoff.setMonth(cutoff.getMonth() - months)
    return data.filter(p => new Date(p.date) >= cutoff)
  }, [data, period])

  const values = filteredData.map(p => p.valueUsd)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  // Build SVG polyline
  const height = 120
  const points = filteredData.map((p, i) => {
    const x = (i / Math.max(filteredData.length - 1, 1)) * 100
    const y = height - ((p.valueUsd - min) / range) * (height - 20) - 10
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} 100,${height}`

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <BarChart3 size={13} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Equity Curve
          </h2>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 p-0.5 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative px-6 py-6">
        {/* Y-axis labels */}
        <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between">
          <span className="text-xs tabular-nums text-zinc-300 dark:text-zinc-700">
            {formatCompactCurrency(max)}
          </span>
          <span className="text-xs tabular-nums text-zinc-300 dark:text-zinc-700">
            {formatCompactCurrency((max + min) / 2)}
          </span>
          <span className="text-xs tabular-nums text-zinc-300 dark:text-zinc-700">
            {formatCompactCurrency(min)}
          </span>
        </div>

        {/* SVG chart */}
        <div className="ml-12">
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-32 w-full sm:h-40">
            <defs>
              <linearGradient id="equityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(219, 39, 119)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="rgb(219, 39, 119)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1={height * 0.25} x2="100" y2={height * 0.25} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.5} x2="100" y2={height * 0.5} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.75} x2="100" y2={height * 0.75} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />

            {/* Area fill */}
            <polygon
              points={areaPoints}
              fill="url(#equityGradient)"
            />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="rgb(219, 39, 119)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: '2px' }}
            />

            {/* End dot */}
            {filteredData.length > 0 && (() => {
              const lastX = 100
              const lastY = height - ((filteredData[filteredData.length - 1].valueUsd - min) / range) * (height - 20) - 10
              return (
                <circle cx={lastX} cy={lastY} r="1.5" fill="rgb(219, 39, 119)" className="animate-pulse" />
              )
            })()}
          </svg>

          {/* X-axis labels */}
          <div className="mt-2 flex justify-between">
            {filteredData.length > 0 && (
              <>
                <span className="text-xs text-zinc-300 dark:text-zinc-700">
                  {new Date(filteredData[0].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </span>
                {filteredData.length > 2 && (
                  <span className="text-xs text-zinc-300 dark:text-zinc-700">
                    {new Date(filteredData[Math.floor(filteredData.length / 2)].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </span>
                )}
                <span className="text-xs text-zinc-300 dark:text-zinc-700">
                  {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AllocationChart({ slices, view, onViewChange }: {
  slices: AllocationSliceUsd[]
  view: AllocationView
  onViewChange: (v: AllocationView) => void
}) {
  const sortedSlices = useMemo(() =>
    [...slices].sort((a, b) => b.percent - a.percent),
    [slices],
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <PieChart size={13} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Allocation
          </h2>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 p-0.5 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          {ALLOCATION_VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => onViewChange(v.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                view === v.key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allocation bars */}
      <div className="px-6 py-5 space-y-3">
        {/* Stacked bar */}
        <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/60">
          {sortedSlices.map((slice, i) => {
            const color = SLICE_COLORS[i % SLICE_COLORS.length]
            return (
              <div
                key={slice.name}
                className={`${color.bar} transition-all duration-500`}
                style={{ width: `${slice.percent}%` }}
                title={`${slice.name}: ${slice.percent}%`}
              />
            )
          })}
        </div>

        {/* Legend rows */}
        <div className="mt-4 space-y-2.5">
          {sortedSlices.map((slice, i) => {
            const color = SLICE_COLORS[i % SLICE_COLORS.length]
            return (
              <div key={slice.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm tabular-nums text-zinc-500 dark:text-zinc-500">
                    {formatCurrency(slice.valueUsd)}
                  </span>
                  <span className="w-14 text-right font-mono text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                    {slice.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PortfolioListTable({ portfolios, onViewPortfolio }: {
  portfolios: Portfolio[]
  onViewPortfolio?: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <Briefcase size={13} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Portfolios
          </h2>
        </div>
        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-500 dark:text-zinc-500">
          {portfolios.length}
        </span>
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800/40">
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Portfolio
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Total Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Day P&L
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Day %
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Positions
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">
                Cash
              </th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((portfolio) => {
              const pnlPositive = portfolio.dayPnL >= 0
              return (
                <tr
                  key={portfolio.id}
                  onClick={() => onViewPortfolio?.(portfolio.id)}
                  className="group cursor-pointer border-b border-zinc-50 dark:border-zinc-800/30 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/20">
                        <Briefcase size={14} className="text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {portfolio.name}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                          {portfolio.currency} · {portfolio.positionCount} positions
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(portfolio.totalValue, portfolio.currency)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono text-sm font-semibold tabular-nums ${
                    pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {formatSignedCurrency(portfolio.dayPnL, portfolio.currency)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono text-sm tabular-nums ${
                    pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {formatPercent(portfolio.dayPnLPercent)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {portfolio.positionCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(portfolio.cashBalance, portfolio.currency)}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-zinc-400 dark:text-zinc-600 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800/40">
        {portfolios.map((portfolio) => {
          const pnlPositive = portfolio.dayPnL >= 0
          return (
            <button
              key={portfolio.id}
              onClick={() => onViewPortfolio?.(portfolio.id)}
              className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/20">
                    <Briefcase size={14} className="text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {portfolio.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                      {portfolio.currency} · {portfolio.positionCount} positions
                    </p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {formatCurrency(portfolio.totalValue, portfolio.currency)}
                </p>
                <p className={`font-mono text-xs tabular-nums ${
                  pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                }`}>
                  {formatSignedCurrency(portfolio.dayPnL, portfolio.currency)} ({formatPercent(portfolio.dayPnLPercent)})
                </p>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 text-zinc-300 dark:text-zinc-700"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PortfolioOverview({
  aggregatedOverview,
  portfolios,
  onViewPortfolio,
  onConnectBroker,
}: PortfolioOverviewProps) {
  const [equityPeriod, setEquityPeriod] = useState<EquityCurvePeriod>('ALL')
  const [allocationView, setAllocationView] = useState<AllocationView>('assetType')

  const allocationData = useMemo(() => {
    switch (allocationView) {
      case 'portfolio': return aggregatedOverview.allocationByPortfolio
      case 'broker': return aggregatedOverview.allocationByBroker
      case 'assetType': return aggregatedOverview.allocationByAssetType
    }
  }, [allocationView, aggregatedOverview])

  // -------------------------------------------------------------------------
  // Empty state — no portfolios
  // -------------------------------------------------------------------------
  if (portfolios.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
              <Cable size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Welcome to Trading Squad!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Connect your broker to get started.
            </p>
            <button
              onClick={() => onConnectBroker?.()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              Connect Broker
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pnlPositive = aggregatedOverview.totalDayPnLUsd >= 0
  const unrealizedPositive = aggregatedOverview.totalUnrealizedPnLUsd >= 0

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header row                                                        */}
      {/* ================================================================= */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Portfolios
        </h1>
      </div>

      {/* ================================================================= */}
      {/* Stats grid — hero + secondary                                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">

        {/* -------------------------------------------------------------- */}
        {/* HERO: Total Net Worth (spans 5 columns)                        */}
        {/* -------------------------------------------------------------- */}
        <div className="relative lg:col-span-5 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-500/[0.04] blur-3xl dark:bg-pink-500/[0.07]" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-pink-500/[0.03] blur-2xl dark:bg-pink-500/[0.05]" />

          <div className="relative p-6">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Wallet size={14} strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Total Net Worth
              </span>
            </div>

            <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              {formatCurrency(aggregatedOverview.totalNetWorthUsd)}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                pnlPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {pnlPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="font-mono">{formatPercent(aggregatedOverview.totalDayPnLPercent)}</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">today</span>
              <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                {aggregatedOverview.portfolioCount} portfolios · {aggregatedOverview.positionCount} positions
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-600/60 via-pink-500/20 to-transparent" />
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Secondary stats 2×2 grid (remaining 7 columns)                 */}
        {/* -------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7">

          {/* Day P&L */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity ${
              pnlPositive ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]' : 'bg-red-500/[0.06] dark:bg-red-500/[0.08]'
            }`} />
            <div className="relative">
              <div className={pnlPositive ? 'text-emerald-500/50 dark:text-emerald-400/40' : 'text-red-500/50 dark:text-red-400/40'}>
                {pnlPositive ? <TrendingUp size={16} strokeWidth={1.5} /> : <TrendingDown size={16} strokeWidth={1.5} />}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Day P&L
              </p>
              <p className={`mt-1 font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatSignedCurrency(aggregatedOverview.totalDayPnLUsd)}
              </p>
              <p className={`mt-1 text-xs font-medium font-mono ${
                pnlPositive ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-red-500/70 dark:text-red-400/60'
              }`}>
                {formatPercent(aggregatedOverview.totalDayPnLPercent)}
              </p>
            </div>
          </div>

          {/* Cash Balance */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="text-zinc-300 dark:text-zinc-700">
              <Banknote size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Cash Balance
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {formatCurrency(aggregatedOverview.totalCashUsd)}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              across all portfolios
            </p>
          </div>

          {/* Unrealized P&L */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity ${
              unrealizedPositive ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]' : 'bg-red-500/[0.04] dark:bg-red-500/[0.06]'
            }`} />
            <div className="relative">
              <div className={unrealizedPositive ? 'text-emerald-500/50 dark:text-emerald-400/40' : 'text-red-500/50 dark:text-red-400/40'}>
                {unrealizedPositive ? <TrendingUp size={16} strokeWidth={1.5} /> : <TrendingDown size={16} strokeWidth={1.5} />}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Unrealized P&L
              </p>
              <p className={`mt-1 font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                unrealizedPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatSignedCurrency(aggregatedOverview.totalUnrealizedPnLUsd)}
              </p>
              <p className={`mt-1 text-xs font-medium font-mono ${
                unrealizedPositive ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-red-500/70 dark:text-red-400/60'
              }`}>
                {formatPercent(aggregatedOverview.totalUnrealizedPnLPercent)}
              </p>
            </div>
          </div>

          {/* Portfolios & Positions count */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="text-zinc-300 dark:text-zinc-700">
              <Layers size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Holdings
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {aggregatedOverview.positionCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              across {aggregatedOverview.portfolioCount} portfolios
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Charts row — Equity Curve + Allocation                            */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EquityCurveChart
            data={aggregatedOverview.combinedEquityCurve}
            period={equityPeriod}
            onPeriodChange={setEquityPeriod}
          />
        </div>
        <div className="lg:col-span-2">
          <AllocationChart
            slices={allocationData}
            view={allocationView}
            onViewChange={setAllocationView}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* Portfolio list table                                              */}
      {/* ================================================================= */}
      <PortfolioListTable
        portfolios={portfolios}
        onViewPortfolio={onViewPortfolio}
      />
    </div>
  )
}
