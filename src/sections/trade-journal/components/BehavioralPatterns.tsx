import { useState, useMemo } from 'react'
import { useChartColors } from '@/lib/chart-theme'
import {
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Brain,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  Eye,
  Zap,
  Scale,
  HandMetal,
  Repeat,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import type {
  BehavioralPatternsProps,
  BehavioralPattern,
  BehavioralPeriod,
  HabitScoreEntry,
  TrendDirection,
  ImprovementArea,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Constants
// =============================================================================

const PERIODS: BehavioralPeriod[] = ['1M', '3M', '6M']

const PATTERN_META: Record<string, { label: string; icon: React.ElementType }> = {
  revenge_trading: { label: 'Revenge Trading', icon: Flame },
  overtrading: { label: 'Overtrading', icon: Repeat },
  position_size_drift: { label: 'Position Size Drift', icon: Scale },
  fomo: { label: 'FOMO', icon: Zap },
  fear_cutting_winners: { label: 'Cutting Winners', icon: Eye },
  stubbornness: { label: 'Stubbornness', icon: HandMetal },
}

const SEVERITY_CONFIG = {
  high: {
    border: 'border-red-200 dark:border-red-900/40',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    glow: 'bg-red-500/[0.06] dark:bg-red-500/[0.08]',
    icon: 'text-red-500 dark:text-red-400',
    ring: 'ring-red-200/60 dark:ring-red-900/40',
    accentBar: 'bg-red-500',
  },
  moderate: {
    border: 'border-amber-200 dark:border-amber-900/40',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    glow: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08]',
    icon: 'text-amber-500 dark:text-amber-400',
    ring: 'ring-amber-200/60 dark:ring-amber-900/40',
    accentBar: 'bg-amber-500',
  },
  low: {
    border: 'border-zinc-200 dark:border-zinc-800',
    bg: 'bg-zinc-50/50 dark:bg-zinc-900/40',
    badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    glow: 'bg-zinc-500/[0.04] dark:bg-zinc-500/[0.06]',
    icon: 'text-zinc-400 dark:text-zinc-500',
    ring: 'ring-zinc-200/60 dark:ring-zinc-800/60',
    accentBar: 'bg-zinc-400 dark:bg-zinc-600',
  },
}

// =============================================================================
// Formatting helpers
// =============================================================================

function fmtSignedCurrency(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(2)}`
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// =============================================================================
// Trend arrow
// =============================================================================

function TrendArrow({ direction, size = 14 }: { direction: TrendDirection; size?: number }) {
  if (direction === 'up') return <ArrowUpRight size={size} className="text-emerald-500 dark:text-emerald-400" />
  if (direction === 'down') return <ArrowDownRight size={size} className="text-red-500 dark:text-red-400" />
  return <Minus size={size} className="text-zinc-400 dark:text-zinc-500" />
}

// =============================================================================
// Score color helper
// =============================================================================

function getScoreColor(score: number) {
  if (score >= 81) return { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Excellent' }
  if (score >= 61) return { ring: 'stroke-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Good' }
  if (score >= 41) return { ring: 'stroke-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Needs Work' }
  return { ring: 'stroke-red-400', text: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' }
}

// =============================================================================
// Mini Sparkline (SVG)
// =============================================================================

function Sparkline({
  data,
  width = 120,
  height = 32,
  color,
}: {
  data: Array<{ date: string; score: number }>
  width?: number
  height?: number
  color: string
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

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`bh-spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`${pad},${height} ${points.join(' ')} ${width - pad},${height}`}
        fill={`url(#bh-spark-${color})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(points[points.length - 1].split(',')[0])}
        cy={parseFloat(points[points.length - 1].split(',')[1])}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function BehavioralPatterns({
  patterns,
  habitScores,
  improvementAreas,
  onAcknowledgePattern,
  onPeriodChange,
}: BehavioralPatternsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<BehavioralPeriod>('3M')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  const activePatterns = useMemo(
    () => patterns.filter((p) => !p.acknowledged),
    [patterns],
  )
  const acknowledgedPatterns = useMemo(
    () => patterns.filter((p) => p.acknowledged),
    [patterns],
  )

  // Total P&L impact from active patterns
  const totalImpact = useMemo(
    () => activePatterns.reduce((sum, p) => sum + p.impactPnl, 0),
    [activePatterns],
  )

  // Empty state
  if (patterns.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
              <Brain size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              No Patterns Detected
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              No behavioral patterns detected. Keep trading consistently to build your behavioral profile.
            </p>
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
            Cross-Portfolio
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Behavioral Patterns
          </h1>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelectedPeriod(p)
                onPeriodChange?.(p)
              }}
              className={`
                rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200
                ${selectedPeriod === p
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Impact Summary Banner                                             */}
      {/* ================================================================= */}
      {activePatterns.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-red-200/60 dark:border-red-900/30 bg-gradient-to-r from-red-50 via-red-50/50 to-white dark:from-red-950/20 dark:via-red-950/10 dark:to-zinc-900/80 p-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl bg-red-500/10 dark:bg-red-500/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {activePatterns.length} Active Pattern{activePatterns.length !== 1 ? 's' : ''} Detected
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Estimated P&L impact from destructive habits
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-red-600 dark:text-red-400">
                {fmtSignedCurrency(totalImpact)}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
                combined impact
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Main content: 2 column layout                                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ---------------------------------------------------------------- */}
        {/* Left column: Patterns                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-7">

          {/* Active Patterns */}
          {activePatterns.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white">
                  {activePatterns.length}
                </span>
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Active Patterns
                </h2>
              </div>
              <div className="space-y-3">
                {activePatterns
                  .sort((a, b) => {
                    const order = { high: 0, moderate: 1, low: 2 }
                    return order[a.severity] - order[b.severity]
                  })
                  .map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onAcknowledge={() => onAcknowledgePattern?.(pattern.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Acknowledged Patterns */}
          {acknowledgedPatterns.length > 0 && (
            <div>
              <button
                onClick={() => setShowAcknowledged(!showAcknowledged)}
                className="group mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showAcknowledged ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                )}
                {acknowledgedPatterns.length} Acknowledged Pattern{acknowledgedPatterns.length !== 1 ? 's' : ''}
              </button>

              {showAcknowledged && (
                <div className="space-y-3 opacity-60">
                  {acknowledgedPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      acknowledged
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right column: Habit Scores + Improvement Areas                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-5">

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
                90-day trend
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <HabitScoreRow
                label="Consistency"
                icon={Target}
                data={habitScores.consistency}
              />
              <HabitScoreRow
                label="Emotional Control"
                icon={Brain}
                data={habitScores.emotionalControl}
              />
              <HabitScoreRow
                label="Risk Discipline"
                icon={Shield}
                data={habitScores.riskDiscipline}
              />
              <HabitScoreRow
                label="Patience"
                icon={Clock}
                data={habitScores.patience}
              />
            </div>
          </div>

          {/* Improvement Focus Areas */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
                  <Lightbulb size={13} className="text-pink-600 dark:text-pink-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Focus Areas
                </h2>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                prioritized
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {improvementAreas.map((area, i) => (
                <ImprovementRow key={i} area={area} index={i + 1} />
              ))}
            </div>

            {improvementAreas.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle2 size={20} className="mx-auto text-emerald-500 dark:text-emerald-400" />
                <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No improvement areas identified
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Pattern Card
// =============================================================================

function PatternCard({
  pattern,
  acknowledged = false,
  onAcknowledge,
}: {
  pattern: BehavioralPattern
  acknowledged?: boolean
  onAcknowledge?: () => void
}) {
  const config = SEVERITY_CONFIG[pattern.severity]
  const meta = PATTERN_META[pattern.patternType] ?? {
    label: pattern.patternType,
    icon: AlertTriangle,
  }
  const PatternIcon = meta.icon

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} transition-all ${
        acknowledged ? '' : 'hover:shadow-sm'
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-0.5 ${config.accentBar}`} />

      {/* Subtle glow */}
      {!acknowledged && (
        <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full blur-3xl ${config.glow}`} />
      )}

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              pattern.severity === 'high'
                ? 'bg-red-100 dark:bg-red-900/40'
                : pattern.severity === 'moderate'
                ? 'bg-amber-100 dark:bg-amber-900/40'
                : 'bg-zinc-100 dark:bg-zinc-800'
            }`}>
              <PatternIcon size={16} className={config.icon} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {meta.label}
                </h3>
                <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                  {pattern.severity}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                <span>{pattern.occurrences} occurrence{pattern.occurrences !== 1 ? 's' : ''}</span>
                <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                <span>Detected {fmtDate(pattern.detectedAt)}</span>
              </div>
            </div>
          </div>

          {/* P&L Impact */}
          <div className="shrink-0 text-right">
            <p className={`font-mono text-lg font-bold ${
              pattern.impactPnl >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {fmtSignedCurrency(pattern.impactPnl)}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
              P&L impact
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {pattern.description}
        </p>

        {/* Recommendation */}
        <div className="mt-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 p-3.5">
          <div className="flex items-start gap-2">
            <Lightbulb size={13} className="mt-0.5 shrink-0 text-pink-500 dark:text-pink-400" />
            <div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Recommendation
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {pattern.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {acknowledged ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600">
            <CheckCircle2 size={12} />
            <span>Acknowledged {pattern.acknowledgedAt ? fmtDate(pattern.acknowledgedAt) : ''}</span>
          </div>
        ) : (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onAcknowledge}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98]"
            >
              <CheckCircle2 size={13} />
              Acknowledge
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Habit Score Row
// =============================================================================

function HabitScoreRow({
  label,
  icon: Icon,
  data,
}: {
  label: string
  icon: React.ElementType
  data: HabitScoreEntry
}) {
  const chart = useChartColors()
  const colors = getScoreColor(data.score)

  // Map score threshold to sparkline color (palette-aware, CVD-safe)
  const sparkHex =
    data.score >= 81 ? chart.positive
    : data.score >= 61 ? chart.positive
    : data.score >= 41 ? chart.warning
    : chart.negative

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      {/* Icon + Label */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
          <Icon size={14} className={colors.text} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
          <p className={`text-xs font-medium ${colors.text}`}>{colors.label}</p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block">
        <Sparkline
          data={data.sparkline}
          width={100}
          height={28}
          color={sparkHex}
        />
      </div>

      {/* Score + Trend */}
      <div className="flex items-center gap-2">
        <span className={`font-mono text-xl font-bold ${colors.text}`}>
          {data.score}
        </span>
        <TrendArrow direction={data.trend} size={14} />
      </div>
    </div>
  )
}

// =============================================================================
// Improvement Row
// =============================================================================

function ImprovementRow({
  area,
  index,
}: {
  area: ImprovementArea
  index: number
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30 text-xs font-bold text-pink-600 dark:text-pink-400">
          {index}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {area.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {area.description}
          </p>
          {area.relatedPatternId && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-pink-600 dark:text-pink-400">
              <ExternalLink size={10} />
              View related pattern
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
