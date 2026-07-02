import { useState, useMemo } from 'react'
import {
  Brain,
  FlaskConical,
  TrendingUp,
  FileText,
  GitBranch,
  ChevronDown,
  Search,
  Lightbulb,
  Clock,
} from 'lucide-react'
import type {
  Recommendation,
  RecommendationSource,
  RecommendationAction,
  RecommendationStatus,
} from '../types'

// =============================================================================
// Props
// =============================================================================

interface RecommendationsTabProps {
  recommendations: Recommendation[]
  onCreateOrder?: (recommendationId: string) => void
  onDismissRecommendation?: (recommendationId: string) => void
  onSnoozeRecommendation?: (recommendationId: string) => void
  onAnalyzeInstrument?: (symbol: string, analysisType: 'quick' | 'full') => void
}

// =============================================================================
// Helpers
// =============================================================================

type SortKey = 'confidence' | 'date' | 'instrument'

function relativeTimeUntil(isoString: string): string {
  const now = Date.now()
  const target = new Date(isoString).getTime()
  const diffMs = target - now
  if (diffMs <= 0) return 'Expired'
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

function relativeTimeAgo(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

function relativeTimeUntilFull(isoString: string): string {
  const now = Date.now()
  const target = new Date(isoString).getTime()
  const diffMs = target - now
  if (diffMs <= 0) return 'Expired'
  const d = Math.floor(diffMs / 86400000)
  const h = Math.floor((diffMs % 86400000) / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return (parts.join(' ') || '< 1m') + ' left'
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return value.toFixed(2)
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function confidenceColor(confidence: number): {
  bg: string
  text: string
  ring: string
} {
  if (confidence >= 75)
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-200 dark:ring-emerald-800/50',
    }
  if (confidence >= 50)
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-200 dark:ring-amber-800/50',
    }
  return {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-500 dark:text-zinc-400',
    ring: 'ring-zinc-200 dark:ring-zinc-700',
  }
}

function statusBadgeClasses(status: RecommendationStatus): string {
  switch (status) {
    case 'active':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
    case 'accepted':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
    case 'dismissed':
      return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
    case 'snoozed':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
    case 'expired':
      return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 opacity-50'
  }
}

function cardBorderClass(status: RecommendationStatus): string {
  switch (status) {
    case 'accepted':
      return 'border-l-emerald-500 dark:border-l-emerald-600'
    case 'snoozed':
      return 'border-l-amber-500 dark:border-l-amber-600'
    default:
      return 'border-l-transparent'
  }
}

function cardOpacity(status: RecommendationStatus): string {
  if (status === 'dismissed') return 'opacity-60'
  if (status === 'expired') return 'opacity-50'
  return ''
}

const PAGE_SIZE = 5

// =============================================================================
// Component
// =============================================================================

export function RecommendationsTab({
  recommendations,
  onCreateOrder,
  onDismissRecommendation,
  onSnoozeRecommendation,
  onAnalyzeInstrument,
}: RecommendationsTabProps) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [analysisType, setAnalysisType] = useState<'quick' | 'full'>('quick')
  const [sourceFilter, setSourceFilter] = useState<'all' | RecommendationSource>('all')
  const [actionFilter, setActionFilter] = useState<'all' | RecommendationAction>('all')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0)
  const [sortBy, setSortBy] = useState<SortKey>('confidence')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // ── Toggle expanded card ──────────────────────────────────────────────────
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Filter & sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...recommendations]

    if (sourceFilter !== 'all') {
      result = result.filter((r) => r.source === sourceFilter)
    }
    if (actionFilter !== 'all') {
      result = result.filter((r) => r.action === actionFilter)
    }
    if (confidenceThreshold > 0) {
      result = result.filter((r) => r.confidence >= confidenceThreshold)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'instrument':
          return a.symbol.localeCompare(b.symbol)
        default:
          return 0
      }
    })

    return result
  }, [recommendations, sourceFilter, actionFilter, confidenceThreshold, sortBy])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // ── On-demand analysis submit ─────────────────────────────────────────────
  const handleAnalyze = () => {
    const trimmed = searchQuery.trim()
    if (trimmed) {
      onAnalyzeInstrument?.(trimmed, analysisType)
      setSearchQuery('')
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
          <Lightbulb size={24} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          No recommendations available
        </p>
        <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-600">
          Our AI is analyzing markets — check back soon.
        </p>
        <button
          onClick={() => onAnalyzeInstrument?.('', 'full')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
        >
          Run Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ================================================================= */}
      {/* On-Demand Analysis Bar                                            */}
      {/* ================================================================= */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          On-Demand Analysis
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze()
              }}
              placeholder="Analyze any instrument..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Analysis type toggle */}
          <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
            {(['quick', 'full'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setAnalysisType(type)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                  analysisType === type
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500 active:scale-[0.98] transition-all"
          >
            Analyze
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Filter / Sort Bar                                                 */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source filter */}
          <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
            {(
              [
                { value: 'all', label: 'All' },
                { value: 'ai-research', label: 'AI Research' },
                { value: 'strategy-signal', label: 'Strategy Signal' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSourceFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  sourceFilter === value
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action filter */}
          <div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
            {(
              [
                { value: 'all', label: 'All' },
                { value: 'BUY', label: 'BUY' },
                { value: 'SELL', label: 'SELL' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActionFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  actionFilter === value
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-700/50'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Confidence threshold */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Min confidence
            </label>
            <select
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
            >
              <option value={0}>Any</option>
              <option value={50}>50%+</option>
              <option value={60}>60%+</option>
              <option value={70}>70%+</option>
              <option value={75}>75%+</option>
              <option value={80}>80%+</option>
              <option value={90}>90%+</option>
            </select>
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
          >
            <option value="confidence">Confidence</option>
            <option value="date">Date</option>
            <option value="instrument">Instrument</option>
          </select>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Recommendation Cards                                              */}
      {/* ================================================================= */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <Search size={20} className="text-zinc-300 dark:text-zinc-700" />
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No recommendations match your filters
          </p>
          <button
            onClick={() => {
              setSourceFilter('all')
              setActionFilter('all')
              setConfidenceThreshold(0)
            }}
            className="mt-3 text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-500"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((rec) => {
            const isExpanded = expandedIds.has(rec.id)
            const confStyle = confidenceColor(rec.confidence)
            const isExpired = rec.status === 'expired'

            return (
              <div
                key={rec.id}
                className={`overflow-hidden rounded-2xl border border-l-[3px] border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 transition-all ${cardBorderClass(rec.status)} ${cardOpacity(rec.status)}`}
              >
                {/* ─── Collapsed header ──────────────────────────────── */}
                <button
                  onClick={() => toggleExpanded(rec.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
                >
                  {/* Instrument */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {rec.symbol}
                      </span>
                      <span className="hidden truncate text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
                        {rec.instrumentName}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {rec.reasoningSummary}
                    </p>
                  </div>

                  {/* Badges row */}
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Action badge */}
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        rec.action === 'BUY'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                      }`}
                    >
                      {rec.action}
                    </span>

                    {/* Confidence circle */}
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ${confStyle.bg} ${confStyle.text} ${confStyle.ring}`}
                    >
                      {rec.confidence}
                    </div>

                    {/* Source badge */}
                    <span className="hidden items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 sm:inline-flex">
                      {rec.source === 'ai-research' ? (
                        <Brain size={12} />
                      ) : (
                        <FlaskConical size={12} />
                      )}
                      <span className="hidden md:inline">
                        {rec.source === 'ai-research'
                          ? 'AI Research'
                          : 'Strategy Signal'}
                      </span>
                    </span>

                    {/* Expiry countdown */}
                    <span
                      className={`hidden items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600 lg:inline-flex ${
                        isExpired ? 'line-through' : ''
                      }`}
                    >
                      <Clock size={12} />
                      {isExpired ? 'Expired' : relativeTimeUntil(rec.expiresAt)}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${statusBadgeClasses(rec.status)}`}
                    >
                      {rec.status}
                    </span>

                    {/* Chevron */}
                    <ChevronDown
                      size={16}
                      className={`text-zinc-400 dark:text-zinc-600 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* ─── Expanded detail ───────────────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800/60 px-4 pb-5 pt-4 sm:px-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Left column */}
                      <div className="space-y-5">
                        {/* Transparent reasoning */}
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            Reasoning
                          </p>

                          {/* Technical signals */}
                          <div className="space-y-1.5">
                            {rec.reasoning.technical.map((signal, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300"
                              >
                                <TrendingUp
                                  size={13}
                                  className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
                                />
                                <span>{signal}</span>
                              </div>
                            ))}
                          </div>

                          {/* Sentiment */}
                          <div className="mt-3 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                            <FileText
                              size={13}
                              className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
                            />
                            <span>
                              Sentiment score:{' '}
                              <span className="font-mono font-semibold">
                                {rec.reasoning.sentiment.score.toFixed(2)}
                              </span>{' '}
                              (
                              {Math.round(
                                rec.reasoning.sentiment.positive * 100,
                              )}
                              % positive,{' '}
                              {Math.round(
                                rec.reasoning.sentiment.negative * 100,
                              )}
                              % negative,{' '}
                              {Math.round(
                                rec.reasoning.sentiment.neutral * 100,
                              )}
                              % neutral) from{' '}
                              {rec.reasoning.sentiment.articleCount} articles
                            </span>
                          </div>

                          {/* Correlation */}
                          <div className="mt-1.5 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                            <GitBranch
                              size={13}
                              className="mt-0.5 shrink-0 text-purple-500 dark:text-purple-400"
                            />
                            <span>
                              Correlation:{' '}
                              <span className="font-mono font-semibold">
                                {rec.reasoning.correlation.coefficient.toFixed(
                                  2,
                                )}
                              </span>{' '}
                              — {rec.reasoning.correlation.assessment}
                            </span>
                          </div>
                        </div>

                        {/* Scoring breakdown bar */}
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            Score Breakdown
                          </p>
                          <div className="flex h-3 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-blue-500 dark:bg-blue-400"
                              style={{ width: '50%' }}
                              title={`Technical: ${rec.scoreBreakdown.technical.toFixed(1)}`}
                            />
                            <div
                              className="bg-amber-500 dark:bg-amber-400"
                              style={{ width: '30%' }}
                              title={`Sentiment: ${rec.scoreBreakdown.sentiment.toFixed(1)}`}
                            />
                            <div
                              className="bg-purple-500 dark:bg-purple-400"
                              style={{ width: '20%' }}
                              title={`Diversification: ${rec.scoreBreakdown.diversification.toFixed(1)}`}
                            />
                          </div>
                          <div className="mt-1.5 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                              Technical{' '}
                              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                                {rec.scoreBreakdown.technical.toFixed(1)}
                              </span>{' '}
                              (50%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                              Sentiment{' '}
                              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                                {rec.scoreBreakdown.sentiment.toFixed(1)}
                              </span>{' '}
                              (30%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                              Diversification{' '}
                              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                                {rec.scoreBreakdown.diversification.toFixed(1)}
                              </span>{' '}
                              (20%)
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                            Overall:{' '}
                            <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                              {rec.scoreBreakdown.overall.toFixed(2)}
                            </span>{' '}
                            / 10
                          </p>
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="space-y-5">
                        {/* Target prices */}
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            Target Prices
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {/* Entry */}
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/40 p-3 text-center">
                              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                Entry
                              </p>
                              <p className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(rec.targets.entryPrice)}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
                                Now: {formatCurrency(rec.targets.currentPrice)}
                              </p>
                            </div>
                            {/* Take profit */}
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/40 p-3 text-center">
                              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                Take-Profit
                              </p>
                              <p className="mt-1 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(rec.targets.takeProfit)}
                              </p>
                              <p className="mt-0.5 font-mono text-xs text-emerald-600/70 dark:text-emerald-400/60">
                                {formatPercent(rec.targets.takeProfitPercent)}
                              </p>
                            </div>
                            {/* Stop loss */}
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/40 p-3 text-center">
                              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                Stop-Loss
                              </p>
                              <p className="mt-1 font-mono text-sm font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(rec.targets.stopLoss)}
                              </p>
                              <p className="mt-0.5 font-mono text-xs text-red-600/70 dark:text-red-400/60">
                                {formatPercent(rec.targets.stopLossPercent)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Strategy context (if source is strategy-signal) */}
                        {rec.strategyContext && (
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                              Strategy Context
                            </p>
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/40 p-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-zinc-400 dark:text-zinc-600">
                                  Strategy:
                                </span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                  {rec.strategyContext.strategyName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-zinc-400 dark:text-zinc-600">
                                  Timeframe:
                                </span>
                                <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">
                                  {rec.strategyContext.timeframe}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-zinc-400 dark:text-zinc-600">
                                  Position Sizing:
                                </span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                  {rec.strategyContext.positionSizing}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Snoozed until */}
                        {rec.status === 'snoozed' && rec.snoozedUntil && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Snoozed until{' '}
                            {new Date(rec.snoozedUntil).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short',
                              },
                            )}
                          </p>
                        )}

                        {/* Meta line: created + expiry */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-600">
                          <span>
                            Created {relativeTimeAgo(rec.createdAt)}
                          </span>
                          <span className={isExpired ? 'line-through' : ''}>
                            <Clock size={11} className="mr-1 inline-block" />
                            {isExpired
                              ? 'Expired'
                              : relativeTimeUntilFull(rec.expiresAt)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        {rec.status === 'active' && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onCreateOrder?.(rec.id)
                              }}
                              className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500 active:scale-[0.98] transition-all"
                            >
                              Create Order
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDismissRecommendation?.(rec.id)
                              }}
                              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onSnoozeRecommendation?.(rec.id)
                              }}
                              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              Snooze 24h
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* Load More                                                         */}
      {/* ================================================================= */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
