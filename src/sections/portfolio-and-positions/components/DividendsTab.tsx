import { useState, useMemo } from 'react'
import {
  Coins,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type {
  Dividend,
  DividendSummary,
  UpcomingDividend,
  YieldMetric,
  DividendPeriod,
} from '@/../product/sections/portfolio-and-positions/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERIOD_OPTIONS: { key: DividendPeriod; label: string }[] = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'annual', label: 'Annual' },
]

const ROWS_PER_PAGE = 50

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface DividendsTabProps {
  dividends: Dividend[]
  dividendSummaries: DividendSummary[]
  upcomingDividends: UpcomingDividend[]
  yieldMetrics: YieldMetric[]
}

export function DividendsTab({
  dividends,
  dividendSummaries,
  upcomingDividends,
  yieldMetrics,
}: DividendsTabProps) {
  const [period, setPeriod] = useState<DividendPeriod>('quarterly')
  const [yieldOpen, setYieldOpen] = useState(false)
  const [page, setPage] = useState(0)

  const activeSummary = useMemo(
    () => dividendSummaries.find(s => s.period === period),
    [dividendSummaries, period],
  )

  const totalIncome = useMemo(
    () => activeSummary?.summaries.reduce((acc, s) => acc + s.totalUsd, 0) ?? 0,
    [activeSummary],
  )

  const totalIncomeCzk = useMemo(
    () => activeSummary?.summaries.reduce((acc, s) => acc + s.totalCzk, 0) ?? 0,
    [activeSummary],
  )

  const annualIncome = useMemo(
    () => yieldMetrics.reduce((acc, m) => acc + m.annualIncomeUsd, 0),
    [yieldMetrics],
  )

  const sortedDividends = useMemo(
    () => [...dividends].sort((a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()),
    [dividends],
  )

  const paginated = sortedDividends.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
  const totalPages = Math.ceil(sortedDividends.length / ROWS_PER_PAGE)

  // Empty state
  if (dividends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <Coins size={24} className="text-faint" />
        </div>
        <p className="mt-5 text-sm font-medium text-foreground">No dividend history yet</p>
        <p className="mt-1 text-xs text-hint">Dividends will appear here as they are recorded.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-1 w-fit rounded-lg bg-muted p-0.5 ring-1 ring-border/60">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              period === opt.key
                ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                : 'text-faint hover:text-muted-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Income summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-hint">Total Income</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-foreground">
            {formatCurrency(totalIncome)}
          </p>
          <p className="mt-0.5 font-mono text-xs text-faint">
            {formatCurrency(totalIncomeCzk, 'CZK')}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-hint">Est. Annual</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-foreground">
            {formatCurrency(annualIncome)}
          </p>
          <p className="mt-0.5 text-xs text-faint">projected</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-hint">Yield on Cost</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
            {yieldMetrics.length > 0 ? `${(yieldMetrics.reduce((a, m) => a + m.yieldOnCostPercent, 0) / yieldMetrics.length).toFixed(2)}%` : '0.00%'}
          </p>
          <p className="mt-0.5 text-xs text-faint">avg weighted</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-hint">Current Yield</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
            {yieldMetrics.length > 0 ? `${(yieldMetrics.reduce((a, m) => a + m.currentYieldPercent, 0) / yieldMetrics.length).toFixed(2)}%` : '0.00%'}
          </p>
          <p className="mt-0.5 text-xs text-faint">avg weighted</p>
        </div>
      </div>

      {/* Dividends history table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
            <Coins size={12} className="text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Dividend History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border/50">
                {['Symbol', 'Ex-Date', 'Pay-Date', '$/Share', 'Qty', 'Total USD', 'Total CZK', 'Tax', 'DRIP'].map(h => (
                  <th key={h} className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-[0.10em] text-faint first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginated.map(div => (
                <tr key={div.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-2.5 px-3 pl-5 text-sm font-semibold text-foreground">{div.symbol}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatShortDate(div.exDate)}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatShortDate(div.payDate)}</td>
                  <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-foreground">${div.amountPerShare.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-foreground">{div.quantity}</td>
                  <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-foreground">{formatCurrency(div.totalUsd)}</td>
                  <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-hint">{formatCurrency(div.totalCzk, 'CZK')}</td>
                  <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-red-500 dark:text-red-400">{formatCurrency(div.withholdingTaxUsd)}</td>
                  <td className="py-2.5 px-3 pr-5">
                    {div.isDrip && (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        DRIP
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {page * ROWS_PER_PAGE + 1}&ndash;{Math.min((page + 1) * ROWS_PER_PAGE, sortedDividends.length)} of {sortedDividends.length}
            </p>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming ex-dates */}
      {upcomingDividends.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/30">
              <Calendar size={12} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Upcoming Ex-Dates</h3>
          </div>
          <div className="divide-y divide-border/50">
            {upcomingDividends.map(ud => (
              <div key={ud.instrumentId} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-foreground">{ud.symbol}</span>
                  <span className="text-xs text-hint truncate max-w-[150px]">{ud.instrumentName}</span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <span className="text-muted-foreground">{formatDate(ud.exDate)}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">~${ud.estimatedAmountPerShare.toFixed(2)}/sh</span>
                  <span className="font-mono tabular-nums text-hint">×{ud.quantityHeld}</span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(ud.estimatedTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yield metrics (collapsible) */}
      {yieldMetrics.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <button
            onClick={() => setYieldOpen(!yieldOpen)}
            aria-expanded={yieldOpen}
            className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-accent/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                <BarChart3 size={12} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Yield Metrics</h3>
            </div>
            {yieldOpen ? <ChevronDown size={16} className="text-hint" aria-hidden="true" /> : <ChevronRight size={16} className="text-hint" aria-hidden="true" />}
          </button>
          {yieldOpen && (
            <div className="border-t border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      {['Symbol', 'Name', 'Yield on Cost', 'Current Yield', 'Annual USD', 'Annual CZK'].map(h => (
                        <th key={h} className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-[0.10em] text-faint first:pl-5 last:pr-5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {yieldMetrics.map(ym => (
                      <tr key={ym.positionId} className="hover:bg-accent/40 transition-colors">
                        <td className="py-2.5 px-3 pl-5 font-mono text-sm font-semibold text-foreground">{ym.symbol}</td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-[140px]">{ym.instrumentName}</td>
                        <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">{ym.yieldOnCostPercent.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">{ym.currentYieldPercent.toFixed(2)}%</td>
                        <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-foreground">{formatCurrency(ym.annualIncomeUsd)}</td>
                        <td className="py-2.5 px-3 pr-5 font-mono text-xs tabular-nums text-hint">{formatCurrency(ym.annualIncomeCzk, 'CZK')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
