import { useState, useMemo } from 'react'
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  CalendarDays,
  Star,
  Plus,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Brain,
  Shield,
  Clock,
} from 'lucide-react'
import type {
  JournalDashboardProps,
  JournalEntry,
  BehavioralPattern,
  HabitScoreEntry,
  TrendDirection,
} from '../types'

// =============================================================================
// Formatting helpers
// =============================================================================

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${day} ${month}`
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) {
    return `$${(abs / 1000).toFixed(1)}k`
  }
  return `$${abs.toFixed(2)}`
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(value)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(value).toFixed(1)}%`
}

// =============================================================================
// Trend arrow helper
// =============================================================================

function TrendArrow({ direction, size = 14 }: { direction: TrendDirection; size?: number }) {
  if (direction === 'up') {
    return <ArrowUpRight size={size} className="text-emerald-500 dark:text-emerald-400" />
  }
  if (direction === 'down') {
    return <ArrowDownRight size={size} className="text-red-500 dark:text-red-400" />
  }
  return <Minus size={size} className="text-zinc-400 dark:text-zinc-500" />
}

// =============================================================================
// Mini Sparkline (SVG)
// =============================================================================

function Sparkline({
  data,
  width = 120,
  height = 32,
  color = 'pink',
}: {
  data: Array<{ date: string; score: number }>
  width?: number
  height?: number
  color?: 'pink' | 'emerald' | 'zinc'
}) {
  if (data.length < 2) return null

  const scores = data.map((d) => d.score)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const pad = 2

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((d.score - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const colorMap = {
    pink: { stroke: '#db2777', fill: '#db2777' },
    emerald: { stroke: '#10b981', fill: '#10b981' },
    zinc: { stroke: '#71717a', fill: '#71717a' },
  }

  const c = colorMap[color]

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.fill} stopOpacity={0.15} />
          <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polygon
        points={`${pad},${height} ${points.join(' ')} ${width - pad},${height}`}
        fill={`url(#spark-grad-${color})`}
      />
      {/* Line */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={c.stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={parseFloat(points[points.length - 1].split(',')[0])}
        cy={parseFloat(points[points.length - 1].split(',')[1])}
        r={2.5}
        fill={c.fill}
      />
    </svg>
  )
}

// =============================================================================
// Circular Gauge (SVG)
// =============================================================================

function HabitGauge({
  label,
  score,
  trend,
  icon: Icon,
}: {
  label: string
  score: number
  trend: TrendDirection
  icon: React.ElementType
}) {
  const radius = 36
  const stroke = 5
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const center = radius + stroke

  // Color based on score ranges
  const getColor = (s: number) => {
    if (s >= 81) return { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    if (s >= 61) return { ring: 'stroke-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    if (s >= 41) return { ring: 'stroke-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' }
    return { ring: 'stroke-red-400', text: 'text-red-400', bg: 'bg-red-500/10' }
  }

  const colors = getColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width={(radius + stroke) * 2}
          height={(radius + stroke) * 2}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={stroke}
          />
          {/* Filled arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className={colors.ring}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filled}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-lg font-bold ${colors.text}`}>
            {score}
          </span>
          <TrendArrow direction={trend} size={12} />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Icon size={12} className="text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// Severity config for behavioral patterns
// =============================================================================

const severityConfig = {
  high: {
    border: 'border-red-200 dark:border-red-900/40',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    glow: 'bg-red-500/[0.06] dark:bg-red-500/[0.08]',
    icon: 'text-red-500 dark:text-red-400',
  },
  moderate: {
    border: 'border-amber-200 dark:border-amber-900/40',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    glow: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08]',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  low: {
    border: 'border-zinc-200 dark:border-zinc-800',
    bg: 'bg-zinc-50/50 dark:bg-zinc-900/40',
    badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    glow: 'bg-zinc-500/[0.04] dark:bg-zinc-500/[0.06]',
    icon: 'text-zinc-400 dark:text-zinc-500',
  },
}

const patternLabels: Record<string, string> = {
  revenge_trading: 'Revenge Trading',
  overtrading: 'Overtrading',
  position_size_drift: 'Position Size Drift',
  fomo: 'FOMO',
  fear_cutting_winners: 'Cutting Winners',
  stubbornness: 'Stubbornness',
}

// =============================================================================
// Main Dashboard Component
// =============================================================================

export function JournalDashboard({
  stats,
  recentEntries,
  behavioralAlerts,
  habitScores,
  portfolios,
  onPortfolioFilter,
  onViewEntry,
  onCreateEntry,
  onViewBehavioralPatterns,
}: JournalDashboardProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null)

  // Filter active (not acknowledged) alerts, moderate or high severity
  const activeAlerts = useMemo(
    () =>
      behavioralAlerts.filter(
        (p) => !p.acknowledged && (p.severity === 'high' || p.severity === 'moderate'),
      ),
    [behavioralAlerts],
  )

  const last5Entries = recentEntries.slice(0, 5)

  // -------------------------------------------------------------------------
  // Empty state — no journal entries
  // -------------------------------------------------------------------------
  if (stats.totalEntries === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
              <BookOpen size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Start Your Trading Journal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Start journaling your trades to track improvement over time.
            </p>
            <button
              onClick={() => onCreateEntry?.()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              <Plus size={15} />
              Create Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Journal Dashboard
          </h1>
        </div>

        <button
          onClick={() => onCreateEntry?.()}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} className="transition-transform group-hover:rotate-90" />
          Create Entry
        </button>
      </div>

      {/* ================================================================= */}
      {/* Portfolio Selector                                                */}
      {/* ================================================================= */}
      {portfolios.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          <button
            onClick={() => {
              setSelectedPortfolio(null)
              onPortfolioFilter?.(null)
            }}
            className={`
              flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
              sm:flex-none
              ${selectedPortfolio === null
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }
            `}
          >
            All Portfolios
          </button>
          {portfolios.map((portfolio) => {
            const isActive = selectedPortfolio === portfolio.id
            return (
              <button
                key={portfolio.id}
                onClick={() => {
                  setSelectedPortfolio(portfolio.id)
                  onPortfolioFilter?.(portfolio.id)
                }}
                className={`
                  flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                  sm:flex-none
                  ${isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }
                `}
              >
                {portfolio.name}
              </button>
            )
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* Stat Cards Grid                                                   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">

        {/* Total Journal Entries */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="text-pink-500/40 dark:text-pink-400/30">
            <BookOpen size={16} strokeWidth={1.5} />
          </div>
          <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Total Entries
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {stats.totalEntries}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            journal entries
          </p>
        </div>

        {/* Average Process Score */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl bg-pink-500/[0.04] dark:bg-pink-500/[0.06]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-emerald-500/40 dark:text-emerald-400/30">
                <Target size={16} strokeWidth={1.5} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                stats.avgProcessScoreTrend === 'up'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : stats.avgProcessScoreTrend === 'down'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
              }`}>
                <TrendArrow direction={stats.avgProcessScoreTrend} size={12} />
                <span>{stats.avgProcessScoreTrend === 'up' ? 'Improving' : stats.avgProcessScoreTrend === 'down' ? 'Declining' : 'Stable'}</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Avg Process Score
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {stats.avgProcessScore.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              out of 5.00
            </p>
          </div>
        </div>

        {/* Journal Completion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className={`${stats.journalCompletionRate >= 80 ? 'text-emerald-500/40 dark:text-emerald-400/30' : stats.journalCompletionRate >= 50 ? 'text-amber-500/40 dark:text-amber-400/30' : 'text-red-500/40 dark:text-red-400/30'}`}>
            <CheckCircle2 size={16} strokeWidth={1.5} />
          </div>
          <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Completion Rate
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {stats.journalCompletionRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            trades journaled
          </p>
          {/* Mini progress bar */}
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-1 rounded-full transition-all ${
                stats.journalCompletionRate >= 80
                  ? 'bg-emerald-500'
                  : stats.journalCompletionRate >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.journalCompletionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Entries This Week */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="text-zinc-300 dark:text-zinc-700">
            <CalendarDays size={16} strokeWidth={1.5} />
          </div>
          <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            This Week
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {stats.entriesThisWeek}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            entries added
          </p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Main content: 2 column layout                                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* -------------------------------------------------------------- */}
        {/* Left column: Process Score Trend + Recent Entries               */}
        {/* -------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-7">

          {/* Process Score Trend */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
                  <TrendingUp size={13} className="text-pink-600 dark:text-pink-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Process Score Trend
                </h2>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">30-day rolling</span>
            </div>

            <div className="px-6 py-5">
              {/* Full-width sparkline */}
              <ProcessScoreChart data={stats.processScoreTrend} />
            </div>
          </div>

          {/* Recent Entries */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
                  <BookOpen size={13} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Recent Entries
                </h2>
              </div>
              <button
                onClick={() => onViewEntry?.(last5Entries[0]?.id ?? '')}
                className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
              >
                View All
                <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {last5Entries.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/60">
                  <BookOpen size={20} className="text-zinc-300 dark:text-zinc-700" />
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No entries yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {last5Entries.map((entry) => (
                  <RecentEntryRow
                    key={entry.id}
                    entry={entry}
                    onClick={() => onViewEntry?.(entry.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Right column: Behavioral Alerts + Habit Scores                  */}
        {/* -------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-5">

          {/* Behavioral Alerts */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Active Alerts
                </h2>
                {activeAlerts.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white">
                    {activeAlerts.length}
                  </span>
                )}
              </div>
              {activeAlerts.length > 0 && (
                <button
                  onClick={() => onViewBehavioralPatterns?.()}
                  className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
                >
                  View Details
                  <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {activeAlerts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No active alerts
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  Your trading habits look healthy.
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {activeAlerts.map((pattern) => (
                  <BehavioralAlertCard
                    key={pattern.id}
                    pattern={pattern}
                    onClick={() => onViewBehavioralPatterns?.()}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Habit Scores */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Habit Scores
                </h2>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                cross-portfolio
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 lg:grid-cols-2">
              <HabitGauge
                label="Consistency"
                score={habitScores.consistency.score}
                trend={habitScores.consistency.trend}
                icon={Target}
              />
              <HabitGauge
                label="Emotional"
                score={habitScores.emotionalControl.score}
                trend={habitScores.emotionalControl.trend}
                icon={Brain}
              />
              <HabitGauge
                label="Risk Discipline"
                score={habitScores.riskDiscipline.score}
                trend={habitScores.riskDiscipline.trend}
                icon={Shield}
              />
              <HabitGauge
                label="Patience"
                score={habitScores.patience.score}
                trend={habitScores.patience.trend}
                icon={Clock}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Process Score Chart (wider sparkline with axis labels)
// =============================================================================

function ProcessScoreChart({ data }: { data: Array<{ date: string; score: number }> }) {
  if (data.length < 2) return null

  const width = 600
  const height = 100
  const padX = 32
  const padY = 12

  const scores = data.map((d) => d.score)
  const min = Math.min(...scores) - 0.05
  const max = Math.max(...scores) + 0.05
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2)
    const y = height - padY - ((d.score - min) / range) * (height - padY * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`

  // Y-axis labels
  const yLabels = [min, (min + max) / 2, max].map((v) => ({
    value: v.toFixed(2),
    y: height - padY - ((v - min) / range) * (height - padY * 2),
  }))

  // First and last date labels
  const firstDate = formatDate(data[0].date)
  const lastDate = formatDate(data[data.length - 1].date)

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="process-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#db2777" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#db2777" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((label, i) => (
        <line
          key={i}
          x1={padX}
          y1={label.y}
          x2={width - padX}
          y2={label.y}
          className="stroke-zinc-100 dark:stroke-zinc-800/60"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Y-axis labels */}
      {yLabels.map((label, i) => (
        <text
          key={i}
          x={padX - 6}
          y={label.y + 3}
          textAnchor="end"
          className="fill-zinc-400 dark:fill-zinc-600"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
        >
          {label.value}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#process-area-grad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#db2777"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot with pulse */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={6}
        fill="#db2777"
        fillOpacity={0.15}
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill="#db2777"
      />

      {/* Date labels */}
      <text
        x={padX}
        y={height + 14}
        className="fill-zinc-400 dark:fill-zinc-600"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
      >
        {firstDate}
      </text>
      <text
        x={width - padX}
        y={height + 14}
        textAnchor="end"
        className="fill-zinc-400 dark:fill-zinc-600"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
      >
        {lastDate}
      </text>
    </svg>
  )
}

// =============================================================================
// Recent Entry Row
// =============================================================================

function RecentEntryRow({
  entry,
  onClick,
}: {
  entry: JournalEntry
  onClick?: () => void
}) {
  const pnlPositive = entry.tradeSummary.pnl >= 0

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 px-6 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
    >
      {/* Instrument + Side */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Side indicator bar */}
        <div className={`h-8 w-1 rounded-full ${
          entry.tradeSummary.side === 'BUY'
            ? 'bg-emerald-500'
            : 'bg-red-500'
        }`} />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {entry.tradeSummary.instrument}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              entry.tradeSummary.side === 'BUY'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
            }`}>
              {entry.tradeSummary.side}
            </span>
            {entry.starred && (
              <Star size={12} className="fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
            {formatDate(entry.tradeSummary.exitDate)}
          </p>
        </div>
      </div>

      {/* Process Score */}
      <div className="flex items-center gap-1.5">
        <ProcessDots score={entry.processScores.overall} />
        <span className="w-7 text-right font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {entry.processScores.overall.toFixed(1)}
        </span>
      </div>

      {/* P&L */}
      <div className="w-20 text-right">
        <p className={`font-mono text-sm font-semibold ${
          pnlPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatSignedCurrency(entry.tradeSummary.pnl)}
        </p>
        <p className={`text-xs font-mono ${
          pnlPositive
            ? 'text-emerald-600/60 dark:text-emerald-400/50'
            : 'text-red-500/60 dark:text-red-400/50'
        }`}>
          {formatPercent(entry.tradeSummary.pnlPercent)}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={14}
        className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-700"
      />
    </button>
  )
}

// =============================================================================
// Process Score Dots (mini 1-5 visualization)
// =============================================================================

function ProcessDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((dot) => {
        const filled = score >= dot
        const partial = !filled && score > dot - 1

        return (
          <div
            key={dot}
            className={`h-1.5 w-1.5 rounded-full ${
              filled
                ? 'bg-pink-600 dark:bg-pink-400'
                : partial
                ? 'bg-pink-600/40 dark:bg-pink-400/40'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          />
        )
      })}
    </div>
  )
}

// =============================================================================
// Behavioral Alert Card
// =============================================================================

function BehavioralAlertCard({
  pattern,
  onClick,
}: {
  pattern: BehavioralPattern
  onClick?: () => void
}) {
  const config = severityConfig[pattern.severity]

  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-xl border ${config.border} ${config.bg} p-4 text-left transition-all hover:shadow-sm`}
    >
      {/* Subtle glow */}
      <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-2xl ${config.glow}`} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className={config.icon} />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {patternLabels[pattern.patternType] ?? pattern.patternType}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                {pattern.severity}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pattern.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">
              {formatSignedCurrency(pattern.impactPnl)}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
              {pattern.occurrences} times
            </p>
          </div>
        </div>

        {/* Hover arrow */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
          <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
        </div>
      </div>
    </button>
  )
}
