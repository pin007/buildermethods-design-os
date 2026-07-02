import { useState, useMemo } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  Clock,
  Activity,
  Plus,
  Cable,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ListOrdered,
} from 'lucide-react'
import type { TradingCoreDashboardProps, RecentActivity } from '@/../product/sections/trading-core/types'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatSignedCurrency(value: number, currency: string): string {
  const formatted = formatCurrency(Math.abs(value), currency)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatTimestamp(timestamp: string): string {
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function relativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

// ---------------------------------------------------------------------------
// Activity type config
// ---------------------------------------------------------------------------

const activityConfig: Record<RecentActivity['type'], { color: string; ring: string; bg: string; label: string }> = {
  fill: {
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    bg: 'bg-emerald-500',
    label: 'Filled',
  },
  cancelled: {
    color: 'text-zinc-400',
    ring: 'ring-zinc-500/20',
    bg: 'bg-zinc-500',
    label: 'Cancelled',
  },
  rejected: {
    color: 'text-red-400',
    ring: 'ring-red-500/20',
    bg: 'bg-red-500',
    label: 'Rejected',
  },
  submitted: {
    color: 'text-blue-400',
    ring: 'ring-blue-500/20',
    bg: 'bg-blue-500',
    label: 'Submitted',
  },
  approved: {
    color: 'text-pink-400',
    ring: 'ring-pink-500/20',
    bg: 'bg-pink-500',
    label: 'Approved',
  },
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TradingDashboard({
  portfolios,
  recentActivity,
  onReviewApproval,
  onCreateOrder,
  onViewOrders,
  onConnectBroker,
}: TradingCoreDashboardProps) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolios[0]?.id)

  const selectedPortfolio = useMemo(
    () => portfolios.find((p) => p.id === selectedPortfolioId) ?? portfolios[0],
    [portfolios, selectedPortfolioId],
  )

  // -------------------------------------------------------------------------
  // Empty state — no broker connected
  // -------------------------------------------------------------------------
  if (portfolios.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* Glow effect behind card */}
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
              <Cable size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Welcome to Trading Squad
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

  if (!selectedPortfolio) return null

  const stats = selectedPortfolio.dashboardStats
  const currency = selectedPortfolio.currency
  const pnlPositive = stats.dayPnL >= 0

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header row                                                        */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
        </div>

        <button
          onClick={() => onCreateOrder?.()}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} className="transition-transform group-hover:rotate-90" />
          New Order
        </button>
      </div>

      {/* ================================================================= */}
      {/* Portfolio selector tabs                                           */}
      {/* ================================================================= */}
      {portfolios.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          {portfolios.map((portfolio) => {
            const isActive = selectedPortfolioId === portfolio.id
            return (
              <button
                key={portfolio.id}
                onClick={() => setSelectedPortfolioId(portfolio.id)}
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                  sm:flex-none
                  ${isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }
                `}
              >
                {portfolio.name}
                <span
                  className={`
                    rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider
                    ${isActive
                      ? 'bg-pink-600/10 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400'
                      : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                    }
                  `}
                >
                  {portfolio.currency}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* Stats grid — hero value + secondary stats                         */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">

        {/* -------------------------------------------------------------- */}
        {/* HERO: Portfolio Value (spans 5 columns on desktop)              */}
        {/* -------------------------------------------------------------- */}
        <div className="relative lg:col-span-5 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
          {/* Gradient glow behind value */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-500/[0.04] blur-3xl dark:bg-pink-500/[0.07]" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-pink-500/[0.03] blur-2xl dark:bg-pink-500/[0.05]" />

          <div className="relative p-6">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Wallet size={14} strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Portfolio Value
              </span>
            </div>

            <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              {formatCurrency(stats.portfolioValue, currency)}
            </p>

            {/* Day P&L inline accent */}
            <div className="mt-3 flex items-center gap-2">
              <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                pnlPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {pnlPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="font-mono">{formatPercent(stats.dayPnLPercent)}</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">today</span>
            </div>

            {/* Decorative bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-600/60 via-pink-500/20 to-transparent" />
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Secondary stats (remaining 7 columns, 2×2 grid)                */}
        {/* -------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7">

          {/* Day P&L */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            {/* Glow on positive/negative */}
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity ${
              pnlPositive ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]' : 'bg-red-500/[0.06] dark:bg-red-500/[0.08]'
            }`} />

            <div className="relative">
              <div className={`${pnlPositive ? 'text-emerald-500/50 dark:text-emerald-400/40' : 'text-red-500/50 dark:text-red-400/40'}`}>
                {pnlPositive ? <TrendingUp size={16} strokeWidth={1.5} /> : <TrendingDown size={16} strokeWidth={1.5} />}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Day P&L
              </p>
              <p className={`mt-1 font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                pnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatSignedCurrency(stats.dayPnL, currency)}
              </p>
              <p className={`mt-1 text-xs font-medium font-mono ${
                pnlPositive ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-red-500/70 dark:text-red-400/60'
              }`}>
                {formatPercent(stats.dayPnLPercent)}
              </p>
            </div>
          </div>

          {/* Cash Available */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="text-zinc-300 dark:text-zinc-700">
              <Banknote size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Cash Available
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {formatCurrency(stats.cashAvailable, currency)}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              {selectedPortfolio.currency} balance
            </p>
          </div>

          {/* Pending Approvals */}
          <button
            onClick={() => onReviewApproval?.('')}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-pink-300 dark:hover:border-pink-900/60 hover:shadow-sm"
          >
            {stats.pendingApprovals > 0 && (
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/[0.06] blur-2xl dark:bg-amber-500/[0.10]" />
            )}
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-amber-500/50 dark:text-amber-400/40">
                  <Clock size={16} strokeWidth={1.5} />
                </div>
                {stats.pendingApprovals > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white shadow-sm shadow-pink-600/30">
                    {stats.pendingApprovals}
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Pending Approvals
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {stats.pendingApprovals}
              </p>
              <p className={`mt-1 text-xs font-medium ${
                stats.pendingApprovals > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {stats.pendingApprovals > 0 ? 'Needs review' : 'All clear'}
              </p>

              {/* Hover arrow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
              </div>
            </div>
          </button>

          {/* Open Orders */}
          <button
            onClick={() => onViewOrders?.()}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-pink-300 dark:hover:border-pink-900/60 hover:shadow-sm"
          >
            <div className="relative">
              <div className="text-zinc-300 dark:text-zinc-700">
                <ListOrdered size={16} strokeWidth={1.5} />
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Open Orders
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {stats.openOrders}
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                {stats.openOrders} active
              </p>

              {/* Hover arrow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Recent Activity                                                   */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <Activity size={13} className="text-zinc-500 dark:text-zinc-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Recent Activity
            </h2>
          </div>
          <button
            onClick={() => onViewOrders?.()}
            className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
          >
            View All Orders
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Activity list */}
        {recentActivity.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/60">
              <Activity size={20} className="text-zinc-300 dark:text-zinc-700" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No recent activity
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              Your order history will appear here.
            </p>
          </div>
        ) : (
          <div className="relative px-6 py-2">
            {/* Timeline connector line */}
            <div className="absolute left-[2.15rem] top-5 bottom-5 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />

            {recentActivity.map((activity, idx) => {
              const config = activityConfig[activity.type]
              const isLast = idx === recentActivity.length - 1

              return (
                <div
                  key={activity.id}
                  className="group relative flex items-start gap-4 py-3"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center">
                    <div className={`h-2 w-2 rounded-full ${config.bg} ring-4 ring-white dark:ring-zinc-900/80`} />
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          activity.type === 'fill'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : activity.type === 'cancelled'
                            ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                            : activity.type === 'rejected'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                            : activity.type === 'submitted'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            : 'bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400'
                        }`}>
                          {config.label}
                        </span>
                        <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {activity.symbol}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
                        {activity.message}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs tabular-nums text-zinc-400 dark:text-zinc-600">
                        {relativeTime(activity.timestamp)}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-zinc-300 dark:text-zinc-700">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}