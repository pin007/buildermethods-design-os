import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Shield,
  ListTree,
  Star,
  Coins,
  LineChart,
} from 'lucide-react'
import type {
  PortfolioDetailProps,
  EquityCurvePeriod,
  EquityCurvePoint,
} from '@/../product/sections/portfolio-and-positions/types'
import { PositionsTab } from './PositionsTab'
import { WatchlistsTab } from './WatchlistsTab'
import { DividendsTab } from './DividendsTab'
import { PerformanceTab } from './PerformanceTab'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DetailTab = 'positions' | 'watchlists' | 'dividends' | 'performance'

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

function formatCompactCurrency(value: number, currency = 'USD'): string {
  const sym = currency === 'EUR' ? '\u20AC' : '$'
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${sym}${(value / 1_000).toFixed(1)}K`
  return `${sym}${value.toFixed(0)}`
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERIODS: EquityCurvePeriod[] = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL']

const TABS: { key: DetailTab; label: string; icon: typeof Layers }[] = [
  { key: 'positions', label: 'Positions', icon: ListTree },
  { key: 'watchlists', label: 'Watchlists', icon: Star },
  { key: 'dividends', label: 'Dividends', icon: Coins },
  { key: 'performance', label: 'Performance', icon: LineChart },
]

// ---------------------------------------------------------------------------
// Equity Curve sub-component (per-portfolio)
// ---------------------------------------------------------------------------

function EquityCurveChart({ data, period, onPeriodChange, currency }: {
  data: EquityCurvePoint[]
  period: EquityCurvePeriod
  onPeriodChange: (p: EquityCurvePeriod) => void
  currency: string
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

  const values = filteredData.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const height = 120
  const points = filteredData.map((p, i) => {
    const x = (i / Math.max(filteredData.length - 1, 1)) * 100
    const y = height - ((p.value - min) / range) * (height - 20) - 10
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} 100,${height}`

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
            <BarChart3 size={13} className="text-muted-foreground" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Equity Curve
          </h2>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-0.5 ring-1 ring-border/60">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-faint hover:text-muted-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative px-6 py-6">
        <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between">
          <span className="text-xs tabular-nums text-faint">
            {formatCompactCurrency(max, currency)}
          </span>
          <span className="text-xs tabular-nums text-faint">
            {formatCompactCurrency((max + min) / 2, currency)}
          </span>
          <span className="text-xs tabular-nums text-faint">
            {formatCompactCurrency(min, currency)}
          </span>
        </div>

        <div className="ml-12">
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-32 w-full sm:h-40">
            <defs>
              <linearGradient id="detailEquityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(219, 39, 119)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="rgb(219, 39, 119)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1="0" y1={height * 0.25} x2="100" y2={height * 0.25} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.5} x2="100" y2={height * 0.5} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
            <line x1="0" y1={height * 0.75} x2="100" y2={height * 0.75} stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />

            <polygon points={areaPoints} fill="url(#detailEquityGradient)" />

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

            {filteredData.length > 0 && (() => {
              const lastX = 100
              const lastY = height - ((filteredData[filteredData.length - 1].value - min) / range) * (height - 20) - 10
              return <circle cx={lastX} cy={lastY} r="1.5" fill="rgb(219, 39, 119)" className="animate-pulse" />
            })()}
          </svg>

          <div className="mt-2 flex justify-between">
            {filteredData.length > 0 && (
              <>
                <span className="text-xs text-faint">
                  {new Date(filteredData[0].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </span>
                {filteredData.length > 2 && (
                  <span className="text-xs text-faint">
                    {new Date(filteredData[Math.floor(filteredData.length / 2)].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </span>
                )}
                <span className="text-xs text-faint">
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PortfolioDetail({
  portfolio,
  positions,
  watchlists,
  dividends,
  dividendSummaries,
  upcomingDividends,
  yieldMetrics,
  benchmarkComparison,
  marginInfo,
  onTradePosition,
  onClosePosition,
  onSetPositionAlert,
  onCreateOrder,
  onTradeWatchlistItem,
  onCreateWatchlist,
  onRenameWatchlist,
  onDeleteWatchlist,
  onAddWatchlistItem,
  onRemoveWatchlistItem,
  onEditWatchlistItem,
  onChangeBenchmark,
  onChangeBenchmarkPeriod,
  onBack,
}: PortfolioDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('positions')
  const [equityPeriod, setEquityPeriod] = useState<EquityCurvePeriod>('ALL')

  const pnlPositive = portfolio.dayPnL >= 0
  const unrealizedPositive = portfolio.unrealizedPnL >= 0
  const cur = portfolio.currency

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header with back button                                          */}
      {/* ================================================================= */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onBack?.()}
          aria-label="Back to portfolios"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Portfolio
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {portfolio.name}
          </h1>
        </div>
        <span className="ml-auto rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
          {portfolio.currency}
        </span>
      </div>

      {/* ================================================================= */}
      {/* Stats grid — hero + secondary                                    */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">

        {/* HERO: Total Value */}
        <div className="relative lg:col-span-5 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.07]" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/[0.03] blur-2xl dark:bg-primary/[0.05]" />

          <div className="relative p-6">
            <div className="flex items-center gap-2 text-hint">
              <Wallet size={14} strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Total Value
              </span>
            </div>

            <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {formatCurrency(portfolio.totalValue, cur)}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                pnlPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {pnlPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="font-mono">{formatPercent(portfolio.dayPnLPercent)}</span>
              </div>
              <span className="text-xs text-faint">today</span>
              <span className="text-xs text-faint">&middot;</span>
              <span className="text-xs text-faint">
                {portfolio.positionCount} positions
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
          </div>
        </div>

        {/* Secondary stats */}
        <div className={`grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7 ${portfolio.hasMargin ? 'sm:grid-cols-2 lg:grid-cols-2' : ''}`}>

          {/* Day P&L */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
              pnlPositive ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]' : 'bg-red-500/[0.06] dark:bg-red-500/[0.08]'
            }`} />
            <div className="relative">
              <div className={pnlPositive ? 'text-emerald-500/50 dark:text-emerald-400/40' : 'text-red-500/50 dark:text-red-400/40'}>
                {pnlPositive ? <TrendingUp size={16} strokeWidth={1.5} /> : <TrendingDown size={16} strokeWidth={1.5} />}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                Day P&L
              </p>
              <p className={`mt-1 font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatSignedCurrency(portfolio.dayPnL, cur)}
              </p>
              <p className={`mt-1 text-xs font-medium font-mono ${
                pnlPositive ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-red-500/70 dark:text-red-400/60'
              }`}>
                {formatPercent(portfolio.dayPnLPercent)}
              </p>
            </div>
          </div>

          {/* Cash Balance */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="text-faint">
              <Banknote size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Cash Balance
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {formatCurrency(portfolio.cashBalance, cur)}
            </p>
            <p className="mt-1 text-xs text-faint">
              available for trading
            </p>
          </div>

          {/* Unrealized P&L */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
              unrealizedPositive ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]' : 'bg-red-500/[0.04] dark:bg-red-500/[0.06]'
            }`} />
            <div className="relative">
              <div className={unrealizedPositive ? 'text-emerald-500/50 dark:text-emerald-400/40' : 'text-red-500/50 dark:text-red-400/40'}>
                {unrealizedPositive ? <TrendingUp size={16} strokeWidth={1.5} /> : <TrendingDown size={16} strokeWidth={1.5} />}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                Unrealized P&L
              </p>
              <p className={`mt-1 font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                unrealizedPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatSignedCurrency(portfolio.unrealizedPnL, cur)}
              </p>
              <p className={`mt-1 text-xs font-medium font-mono ${
                unrealizedPositive ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-red-500/70 dark:text-red-400/60'
              }`}>
                {formatPercent(portfolio.unrealizedPnLPercent)}
              </p>
            </div>
          </div>

          {/* Margin Available (conditional) or Positions count */}
          {portfolio.hasMargin && marginInfo ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="text-amber-400/50 dark:text-amber-400/40">
                <Shield size={16} strokeWidth={1.5} />
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                Margin Available
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {formatCurrency(marginInfo.marginAvailable, cur)}
              </p>
              <p className="mt-1 text-xs text-faint">
                {marginInfo.marginUsagePercent.toFixed(1)}% used
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="text-faint">
                <Layers size={16} strokeWidth={1.5} />
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                Positions
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {portfolio.positionCount}
              </p>
              <p className="mt-1 text-xs text-faint">
                open holdings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Equity Curve                                                     */}
      {/* ================================================================= */}
      <EquityCurveChart
        data={portfolio.equityCurve}
        period={equityPeriod}
        onPeriodChange={setEquityPeriod}
        currency={cur}
      />

      {/* ================================================================= */}
      {/* Tab bar                                                          */}
      {/* ================================================================= */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 ring-1 ring-border/60">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-faint hover:text-muted-foreground'
              }`}
            >
              <Icon size={15} aria-hidden="true" className={isActive ? 'text-primary' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Tab content                                                      */}
      {/* ================================================================= */}
      <div>
        {activeTab === 'positions' && (
          <PositionsTab
            positions={positions}
            currency={cur}
            onTradePosition={onTradePosition}
            onClosePosition={onClosePosition}
            onSetPositionAlert={onSetPositionAlert}
            onCreateOrder={onCreateOrder}
          />
        )}
        {activeTab === 'watchlists' && (
          <WatchlistsTab
            watchlists={watchlists}
            onTradeWatchlistItem={onTradeWatchlistItem}
            onCreateWatchlist={onCreateWatchlist}
            onRenameWatchlist={onRenameWatchlist}
            onDeleteWatchlist={onDeleteWatchlist}
            onAddWatchlistItem={onAddWatchlistItem}
            onRemoveWatchlistItem={onRemoveWatchlistItem}
            onEditWatchlistItem={onEditWatchlistItem}
          />
        )}
        {activeTab === 'dividends' && (
          <DividendsTab
            dividends={dividends}
            dividendSummaries={dividendSummaries}
            upcomingDividends={upcomingDividends}
            yieldMetrics={yieldMetrics}
          />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab
            benchmarkComparison={benchmarkComparison}
            marginInfo={marginInfo}
            onChangeBenchmark={onChangeBenchmark}
            onChangeBenchmarkPeriod={onChangeBenchmarkPeriod}
          />
        )}
      </div>
    </div>
  )
}
