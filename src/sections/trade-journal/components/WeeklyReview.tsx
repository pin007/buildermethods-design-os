import { useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  ThumbsDown,
  AlertTriangle,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Pencil,
  Save,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Crosshair,
  BookOpen,
} from 'lucide-react'
import type {
  WeeklyReviewProps,
  GoalProgress,
  GoalStatus,
  TrendDirection,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Formatting helpers
// =============================================================================

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}k`
  return `$${abs.toFixed(2)}`
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(value)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

// =============================================================================
// Goal status config
// =============================================================================

const goalStatusConfig: Record<
  GoalStatus,
  { label: string; badge: string; icon: React.ElementType; ring: string }
> = {
  met: {
    label: 'Met',
    badge:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    icon: CheckCircle2,
    ring: 'ring-emerald-200 dark:ring-emerald-800/40',
  },
  close: {
    label: 'Close',
    badge:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    icon: Clock,
    ring: 'ring-amber-200 dark:ring-amber-800/40',
  },
  missed: {
    label: 'Missed',
    badge: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    icon: XCircle,
    ring: 'ring-red-200 dark:ring-red-800/40',
  },
}

// =============================================================================
// Goal Progress Bar
// =============================================================================

function GoalProgressRow({ goal }: { goal: GoalProgress }) {
  const config = goalStatusConfig[goal.status]
  const StatusIcon = config.icon

  // Calculate progress as a percentage
  // For "max daily loss" type goals (lower is better), actual < target = good
  const isLowerBetter = goal.target > goal.actual && goal.status === 'met'
  const progress = isLowerBetter
    ? Math.min(100, 100 - (goal.actual / goal.target) * 100)
    : Math.min(100, (goal.actual / goal.target) * 100)
  const barWidth = Math.min(100, (goal.actual / goal.target) * 100)

  const barColor =
    goal.status === 'met'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : goal.status === 'close'
        ? 'bg-amber-500 dark:bg-amber-400'
        : 'bg-red-500 dark:bg-red-400'

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {goal.goalName}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ring-1 ${config.badge} ${config.ring}`}
            >
              <StatusIcon size={10} />
              {config.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${Math.min(barWidth, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-3 flex items-baseline gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Actual
          </span>
          <span
            className={`font-mono text-sm font-semibold ${
              goal.status === 'met'
                ? 'text-emerald-600 dark:text-emerald-400'
                : goal.status === 'close'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {goal.actual % 1 !== 0 ? goal.actual.toFixed(1) : goal.actual}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Target
          </span>
          <span className="font-mono text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {goal.target % 1 !== 0 ? goal.target.toFixed(1) : goal.target}
          </span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Trade Highlight Card (Best / Worst)
// =============================================================================

function TradeHighlightCard({
  label,
  icon: Icon,
  iconColor,
  instrument,
  pnl,
  processScore,
  onClick,
  accentBorder,
}: {
  label: string
  icon: React.ElementType
  iconColor: string
  instrument: string
  pnl: number
  processScore: number | null
  onClick?: () => void
  accentBorder: string
}) {
  const pnlPositive = pnl >= 0

  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 ${accentBorder}`}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconColor}`}
            >
              <Icon size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              {label}
            </span>
          </div>

          <p className="mt-3 font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {instrument}
          </p>

          {processScore !== null && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <ProcessDots score={processScore} />
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {processScore.toFixed(1)}
              </span>
            </div>
          )}
          {processScore === null && (
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-600">
              Not yet journaled
            </p>
          )}
        </div>

        <div className="text-right">
          <p
            className={`font-mono text-xl font-bold ${
              pnlPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatSignedCurrency(pnl)}
          </p>
        </div>
      </div>

      {/* Hover hint */}
      <div className="mt-3 flex items-center gap-1 text-xs text-zinc-400 transition-colors group-hover:text-pink-500 dark:text-zinc-600 dark:group-hover:text-pink-400">
        <Eye size={12} />
        <span>View entry</span>
        <ChevronRight
          size={12}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
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
// Editable Focus Areas
// =============================================================================

function FocusAreas({
  items,
  onSave,
}: {
  items: string[]
  onSave?: (items: string[]) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editItems, setEditItems] = useState<string[]>(items)

  const handleStartEdit = () => {
    setEditItems([...items])
    setIsEditing(true)
  }

  const handleSave = () => {
    const filtered = editItems.filter((item) => item.trim().length > 0)
    onSave?.(filtered)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditItems([...items])
    setIsEditing(false)
  }

  const handleItemChange = (index: number, value: string) => {
    const updated = [...editItems]
    updated[index] = value
    setEditItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index))
  }

  const handleAddItem = () => {
    if (editItems.length < 5) {
      setEditItems([...editItems, ''])
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        {editItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30 text-xs font-bold text-pink-600 dark:text-pink-400 mt-2">
              {index + 1}
            </div>
            <textarea
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              rows={2}
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus-visible:border-pink-500 focus-visible:ring-pink-500/50 focus-visible:ring-[3px] focus-visible:outline-none transition-all resize-none"
              placeholder="Focus area..."
            />
            <button
              onClick={() => handleRemoveItem(index)}
              className="mt-2 shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {editItems.length < 5 && (
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Plus size={12} />
            Add focus area
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            <Save size={13} />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No focus areas set for next week.
        </p>
        <button
          onClick={handleStartEdit}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
        >
          <Plus size={13} />
          Add Focus Areas
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 px-4 py-3"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30 text-xs font-bold text-pink-600 dark:text-pink-400">
            {index + 1}
          </div>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {item}
          </p>
        </div>
      ))}

      <button
        onClick={handleStartEdit}
        className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <Pencil size={12} />
        Edit focus areas
      </button>
    </div>
  )
}

// =============================================================================
// Week Summary Stat
// =============================================================================

function SummaryStat({
  label,
  value,
  subtext,
  valueColor,
}: {
  label: string
  value: string
  subtext?: string
  valueColor?: string
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-xl font-bold sm:text-2xl ${valueColor ?? 'text-zinc-900 dark:text-zinc-100'}`}
      >
        {value}
      </p>
      {subtext && (
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
          {subtext}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// Main WeeklyReview Component
// =============================================================================

export function WeeklyReview({
  review,
  portfolios,
  onWeekChange,
  onViewEntry,
  onSaveFocus,
  onPortfolioFilter,
  onViewBehavioralPatterns,
}: WeeklyReviewProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(
    null,
  )

  // -------------------------------------------------------------------------
  // Week navigation helpers
  // -------------------------------------------------------------------------
  const parseWeek = (w: string) => {
    const match = w.match(/^(\d{4})-W(\d{2})$/)
    if (!match) return { year: 2026, week: 1 }
    return { year: parseInt(match[1], 10), week: parseInt(match[2], 10) }
  }

  const formatWeekString = (year: number, week: number) =>
    `${year}-W${week.toString().padStart(2, '0')}`

  const { year, week } = parseWeek(review.week)

  const handlePrevWeek = () => {
    const prev = week === 1 ? formatWeekString(year - 1, 52) : formatWeekString(year, week - 1)
    onWeekChange?.(prev)
  }

  const handleNextWeek = () => {
    const next = week === 52 ? formatWeekString(year + 1, 1) : formatWeekString(year, week + 1)
    onWeekChange?.(next)
  }

  // -------------------------------------------------------------------------
  // Summary P&L color
  // -------------------------------------------------------------------------
  const pnlColor =
    review.summary.pnl >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

  const winRateColor =
    review.summary.winRate >= 60
      ? 'text-emerald-600 dark:text-emerald-400'
      : review.summary.winRate >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'

  const processScoreColor =
    review.summary.avgProcessScore >= 3.5
      ? 'text-emerald-600 dark:text-emerald-400'
      : review.summary.avgProcessScore >= 2.5
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'

  // -------------------------------------------------------------------------
  // Goals summary
  // -------------------------------------------------------------------------
  const goalsMet = review.goalsProgress.filter((g) => g.status === 'met').length
  const totalGoals = review.goalsProgress.length

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------
  if (review.summary.trades === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <WeekHeader
          dateRange={review.dateRange}
          weekLabel={review.week}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
        />

        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
            <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
                <Calendar
                  size={28}
                  className="text-zinc-400 dark:text-zinc-500"
                />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                No Trades This Week
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Review will populate as you trade.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header with Week Navigation                                       */}
      {/* ================================================================= */}
      <WeekHeader
        dateRange={review.dateRange}
        weekLabel={review.week}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
      />

      {/* ================================================================= */}
      {/* Portfolio Selector                                                 */}
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
              ${
                selectedPortfolio === null
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
                  ${
                    isActive
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
      {/* Week Summary Card                                                  */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        {/* Subtle gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.02] via-transparent to-emerald-500/[0.02] dark:from-pink-500/[0.04] dark:to-emerald-500/[0.04]" />

        <div className="relative grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800/60 sm:grid-cols-4">
          <div className="px-5 py-6">
            <SummaryStat
              label="Trades"
              value={String(review.summary.trades)}
              subtext="this week"
            />
          </div>
          <div className="px-5 py-6">
            <SummaryStat
              label="P&L"
              value={formatSignedCurrency(review.summary.pnl)}
              valueColor={pnlColor}
              subtext="total"
            />
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 px-5 py-6 sm:border-t-0">
            <SummaryStat
              label="Win Rate"
              value={`${review.summary.winRate.toFixed(1)}%`}
              valueColor={winRateColor}
            />
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 px-5 py-6 sm:border-t-0">
            <SummaryStat
              label="Avg Process"
              value={review.summary.avgProcessScore.toFixed(2)}
              valueColor={processScoreColor}
              subtext="out of 5.00"
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Main content: 2 column layout                                      */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* -------------------------------------------------------------- */}
        {/* Left column: Best/Worst + Goals + Focus                         */}
        {/* -------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-7">
          {/* Best & Worst Trade Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TradeHighlightCard
              label="Best Trade"
              icon={Trophy}
              iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              instrument={review.bestTrade.instrument}
              pnl={review.bestTrade.pnl}
              processScore={review.bestTrade.processScore}
              onClick={() => onViewEntry?.(review.bestTrade.tradeId)}
              accentBorder="bg-emerald-500"
            />
            <TradeHighlightCard
              label="Worst Trade"
              icon={ThumbsDown}
              iconColor="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              instrument={review.worstTrade.instrument}
              pnl={review.worstTrade.pnl}
              processScore={review.worstTrade.processScore}
              onClick={() => onViewEntry?.(review.worstTrade.tradeId)}
              accentBorder="bg-red-500"
            />
          </div>

          {/* Goals Progress */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
                  <Target
                    size={13}
                    className="text-pink-600 dark:text-pink-400"
                  />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Goals Progress
                </h2>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  goalsMet === totalGoals
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : goalsMet === 0
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                }`}
              >
                {goalsMet}/{totalGoals} met
              </span>
            </div>

            <div className="space-y-3 p-4">
              {review.goalsProgress.map((goal, i) => (
                <GoalProgressRow key={i} goal={goal} />
              ))}
            </div>
          </div>

          {/* Focus for Next Week */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
                  <Crosshair
                    size={13}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Focus for Next Week
                </h2>
              </div>
            </div>

            <div className="p-5">
              <FocusAreas
                items={review.focusForNextWeek}
                onSave={onSaveFocus}
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Right column: Patterns This Week                                */}
        {/* -------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-5">
          {/* Patterns This Week */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle
                    size={13}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Patterns This Week
                </h2>
                {review.patternsThisWeek.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold tabular-nums text-white">
                    {review.patternsThisWeek.length}
                  </span>
                )}
              </div>
              {review.patternsThisWeek.length > 0 && (
                <button
                  onClick={() => onViewBehavioralPatterns?.()}
                  className="group flex items-center gap-1 text-xs font-medium text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
                >
                  View All
                  <ChevronRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              )}
            </div>

            {review.patternsThisWeek.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No patterns detected
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  Great discipline this week!
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {review.patternsThisWeek.map((pattern, i) => (
                  <button
                    key={i}
                    onClick={() => onViewBehavioralPatterns?.()}
                    className="group relative w-full overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-left transition-all hover:shadow-sm"
                  >
                    <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-500/[0.06] blur-2xl dark:bg-amber-500/[0.08]" />

                    <div className="relative flex items-start gap-3">
                      <AlertTriangle
                        size={14}
                        className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
                      />
                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {pattern}
                      </p>
                    </div>

                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                      <ChevronRight
                        size={14}
                        className="text-amber-400 dark:text-amber-500"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Week Score Summary Card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <BarChart3
                    size={13}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Week Assessment
                </h2>
              </div>
            </div>

            <div className="p-6">
              <WeekAssessment review={review} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Week Header with Navigation
// =============================================================================

function WeekHeader({
  dateRange,
  weekLabel,
  onPrev,
  onNext,
}: {
  dateRange: string
  weekLabel: string
  onPrev?: () => void
  onNext?: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Weekly Review
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {dateRange}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-[0.96]"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 px-3.5 py-2">
          <Calendar
            size={14}
            className="text-zinc-400 dark:text-zinc-500"
          />
          <span className="font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {weekLabel}
          </span>
        </div>

        <button
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-[0.96]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Week Assessment — visual summary
// =============================================================================

function WeekAssessment({
  review,
}: {
  review: WeeklyReviewProps['review']
}) {
  const metrics = [
    {
      label: 'Win Rate',
      value: review.summary.winRate,
      max: 100,
      target: 60,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Process Score',
      value: review.summary.avgProcessScore,
      max: 5,
      target: 3.5,
      format: (v: number) => v.toFixed(2),
    },
  ]

  const goalsMet = review.goalsProgress.filter((g) => g.status === 'met').length
  const totalGoals = review.goalsProgress.length
  const goalsMetPercent =
    totalGoals > 0 ? (goalsMet / totalGoals) * 100 : 0

  // Overall week grade
  const winRateScore = Math.min(review.summary.winRate / 100, 1)
  const processScore = Math.min(review.summary.avgProcessScore / 5, 1)
  const goalsScore = totalGoals > 0 ? goalsMet / totalGoals : 0.5
  const overallScore = (winRateScore + processScore + goalsScore) / 3

  const getGrade = (score: number) => {
    if (score >= 0.8) return { letter: 'A', color: 'text-emerald-500' }
    if (score >= 0.65) return { letter: 'B', color: 'text-emerald-500' }
    if (score >= 0.5) return { letter: 'C', color: 'text-amber-500' }
    if (score >= 0.35) return { letter: 'D', color: 'text-amber-500' }
    return { letter: 'F', color: 'text-red-500' }
  }

  const grade = getGrade(overallScore)

  return (
    <div className="space-y-5">
      {/* Overall Grade */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${
            grade.letter === 'A' || grade.letter === 'B'
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/30'
              : grade.letter === 'C' || grade.letter === 'D'
                ? 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30'
                : 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30'
          }`}
        >
          <span className={`font-mono text-2xl font-bold ${grade.color}`}>
            {grade.letter}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Week Grade
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Based on win rate, process quality, and goals met
          </p>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="space-y-3">
        {metrics.map((metric) => {
          const percent = (metric.value / metric.max) * 100
          const aboveTarget = metric.value >= metric.target
          const targetPercent = (metric.target / metric.max) * 100

          return (
            <div key={metric.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {metric.label}
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    aboveTarget
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {metric.format(metric.value)}
                </span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ease-out ${
                    aboveTarget
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : 'bg-red-500 dark:bg-red-400'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-2 w-0.5 bg-zinc-400 dark:bg-zinc-500"
                  style={{ left: `${targetPercent}%` }}
                />
              </div>
              <p className="mt-0.5 text-right text-xs text-zinc-400 dark:text-zinc-600">
                target: {metric.format(metric.target)}
              </p>
            </div>
          )
        })}

        {/* Goals Met */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Goals Met
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                goalsMet === totalGoals
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : goalsMet === 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {goalsMet}/{totalGoals}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                goalsMet === totalGoals
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : goalsMet === 0
                    ? 'bg-red-500 dark:bg-red-400'
                    : 'bg-amber-500 dark:bg-amber-400'
              }`}
              style={{ width: `${goalsMetPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
