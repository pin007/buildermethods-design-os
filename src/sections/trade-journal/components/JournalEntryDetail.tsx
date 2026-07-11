import { useState } from 'react'
import { useChartColors } from '@/lib/chart-theme'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  ChevronRight,
  Image,
  Paperclip,
  Tag,
  Link2,
  X,
  CheckCircle2,
  XCircle,
  Brain,
  Shield,
  Crosshair,
  LogOut,
  Gauge,
} from 'lucide-react'
import type {
  JournalEntryDetailProps,
  PreTrade,
  PostTrade,
  ProcessScores,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Formatting helpers
// =============================================================================

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year}, ${hh}:${mm}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(value)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(value).toFixed(2)}%`
}

function formatPrice(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

const strategyLabels: Record<string, string> = {
  trend_following: 'Trend Following',
  breakout: 'Breakout',
  momentum: 'Momentum',
  mean_reversion: 'Mean Reversion',
  manual: 'Manual',
}

const marketConditionLabels: Record<string, string> = {
  trending: 'Trending',
  ranging: 'Ranging',
  volatile: 'Volatile',
  calm: 'Calm',
  uncertain: 'Uncertain',
}

const emotionalLabels: Record<string, string> = {
  calm: 'Calm',
  confident: 'Confident',
  anxious: 'Anxious',
  excited: 'Excited',
  fearful: 'Fearful',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  satisfied: 'Satisfied',
  disappointed: 'Disappointed',
  relieved: 'Relieved',
  regretful: 'Regretful',
  proud: 'Proud',
}

// =============================================================================
// Main Component
// =============================================================================

export function JournalEntryDetail({
  entry,
  portfolioName,
  onEdit,
  onDelete,
  onToggleStar,
  onViewRelatedTrade,
  onBack,
}: JournalEntryDetailProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const ts = entry.tradeSummary
  const pnlPositive = ts.pnl >= 0

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header with back nav + actions                                    */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack?.()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-foreground active:scale-95"
            aria-label="Back to journal"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Trade Journal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {ts.instrument}{' '}
              <span className="text-faint">{ts.instrumentName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStar?.(entry.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              entry.starred
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <Star
              size={14}
              aria-hidden="true"
              className={entry.starred ? 'fill-amber-400 text-amber-400' : ''}
            />
            {entry.starred ? 'Starred' : 'Star'}
          </button>
          <button
            onClick={() => onEdit?.(entry.id)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-600/20 transition-all hover:bg-primary hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900/80 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Trade Summary Card                                                */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${
          pnlPositive
            ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent'
            : 'bg-gradient-to-r from-red-500 via-red-400 to-transparent'
        }`} />

        <div className="p-6">
          {/* Top row: instrument + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
              ts.side === 'BUY'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
            }`}>
              {ts.side}
            </span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {strategyLabels[ts.strategy] ?? ts.strategy}
            </span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {ts.broker}
            </span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
              {portfolioName}
            </span>
          </div>

          {/* P&L hero */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className={`font-mono text-3xl font-bold tracking-tight sm:text-4xl ${
              pnlPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatSignedCurrency(ts.pnl)}
            </span>
            <span className={`font-mono text-lg font-semibold ${
              pnlPositive
                ? 'text-emerald-600/70 dark:text-emerald-400/60'
                : 'text-red-600/70 dark:text-red-400/60'
            }`}>
              {formatPercent(ts.pnlPercent)}
            </span>
          </div>

          {/* Grid of details */}
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            <DetailField label="Entry Date" value={formatDate(ts.entryDate)} />
            <DetailField label="Exit Date" value={formatDate(ts.exitDate)} />
            <DetailField label="Entry Price" value={formatPrice(ts.entryPrice)} mono />
            <DetailField label="Exit Price" value={formatPrice(ts.exitPrice)} mono />
            <DetailField label="Quantity" value={ts.quantity.toString()} mono />
            <DetailField
              label="Holding Period"
              value={`${ts.holdingPeriod} day${ts.holdingPeriod !== 1 ? 's' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Two-column layout: Pre-trade + Post-trade                         */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Pre-Trade Section */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Target size={13} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Pre-Trade Analysis
            </h2>
          </div>

          {entry.preTrade ? (
            <PreTradeContent preTrade={entry.preTrade} onEdit={() => onEdit?.(entry.id)} />
          ) : (
            <EmptySection
              message="No pre-trade notes recorded"
              onEdit={() => onEdit?.(entry.id)}
            />
          )}
        </div>

        {/* Post-Trade Section */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Post-Trade Review
            </h2>
          </div>

          {entry.postTrade ? (
            <PostTradeContent postTrade={entry.postTrade} onEdit={() => onEdit?.(entry.id)} />
          ) : (
            <EmptySection
              message="No post-trade review recorded"
              onEdit={() => onEdit?.(entry.id)}
            />
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Process Scores                                                    */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
            <Gauge size={13} className="text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Process Scores
          </h2>
          <span className={`ml-auto rounded-lg px-2.5 py-1 font-mono text-lg font-bold ${
            entry.processScores.overall >= 4
              ? 'text-emerald-600 dark:text-emerald-400'
              : entry.processScores.overall >= 3
              ? 'text-blue-600 dark:text-blue-400'
              : entry.processScores.overall >= 2
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {entry.processScores.overall.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-faint">/ 5</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:gap-8">
          {/* Radar Chart */}
          <div className="shrink-0">
            <RadarChart scores={entry.processScores} />
          </div>

          {/* Horizontal bars */}
          <div className="w-full flex-1 space-y-3">
            <ScoreBar label="Discipline" value={entry.processScores.discipline} icon={Shield} />
            <ScoreBar label="Emotional Management" value={entry.processScores.emotionalManagement} icon={Brain} />
            <ScoreBar label="Risk Management" value={entry.processScores.riskManagement} icon={Target} />
            <ScoreBar label="Entry Quality" value={entry.processScores.entryQuality} icon={Crosshair} />
            <ScoreBar label="Exit Quality" value={entry.processScores.exitQuality} icon={LogOut} />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tags + Related Trades + Attachments                               */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Tags */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <Tag size={13} className="text-hint" />
            <h2 className="text-sm font-semibold text-foreground">Tags</h2>
          </div>
          <div className="p-5">
            {entry.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 dark:bg-pink-950/20 dark:text-pink-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No tags</p>
            )}
          </div>
        </div>

        {/* Related Trades */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <Link2 size={13} className="text-hint" />
            <h2 className="text-sm font-semibold text-foreground">Related Trades</h2>
          </div>
          <div className="p-5">
            {entry.relatedTrades.length > 0 ? (
              <div className="space-y-2">
                {entry.relatedTrades.map((tradeId) => (
                  <button
                    key={tradeId}
                    onClick={() => onViewRelatedTrade?.(tradeId)}
                    className="group flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition-colors hover:border-pink-300 hover:bg-pink-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-pink-900/40 dark:hover:bg-pink-950/10"
                  >
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {tradeId}
                    </span>
                    <ChevronRight
                      size={12}
                      aria-hidden="true"
                      className="ml-auto text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No related trades</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <Paperclip size={13} className="text-hint" />
            <h2 className="text-sm font-semibold text-foreground">Attachments</h2>
            {entry.attachments.length > 0 && (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                {entry.attachments.length}
              </span>
            )}
          </div>
          <div className="p-5">
            {entry.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {entry.attachments.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => setLightboxUrl(att.url)}
                    aria-label={`View attachment ${att.fileName}`}
                    className="group relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 transition-all hover:border-pink-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:border-pink-900/40"
                  >
                    <div className="flex h-full items-center justify-center">
                      <Image size={20} className="text-faint" />
                    </div>
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="px-2 py-1.5 text-xs font-medium text-white truncate">
                        {att.fileName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No attachments</p>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Metadata                                                          */}
      {/* ================================================================= */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
        <span>Created: {formatDateTime(entry.createdAt)}</span>
        <span>\u00b7</span>
        <span>Updated: {formatDateTime(entry.updatedAt)}</span>
      </div>

      {/* ================================================================= */}
      {/* Delete Confirmation Modal                                         */}
      {/* ================================================================= */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Delete Journal Entry
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Are you sure you want to delete this journal entry for{' '}
                  <span className="font-mono font-semibold text-foreground">
                    {ts.instrument}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.(entry.id)
                  setDeleteModalOpen(false)
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-all hover:bg-red-500 active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Lightbox                                                          */}
      {/* ================================================================= */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8">
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label="Close image preview"
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <div className="flex h-full max-h-[80vh] w-full max-w-4xl items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <Image size={48} className="text-zinc-600" />
              <p className="text-sm text-zinc-400">Image preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Detail Field
// =============================================================================

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
        {label}
      </p>
      <p className={`mt-0.5 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  )
}

// =============================================================================
// Pre-Trade Content
// =============================================================================

function PreTradeContent({
  preTrade,
  onEdit,
}: {
  preTrade: PreTrade
  onEdit?: () => void
}) {
  return (
    <div className="space-y-4 p-6">
      {/* Thesis */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
          Thesis
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {preTrade.thesis}
        </p>
      </div>

      {/* Entry Criteria */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
          Entry Criteria
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {preTrade.entryCriteria}
        </p>
      </div>

      {/* Grid: target, stop, R:R */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
            Target
          </p>
          <p className="mt-0.5 font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {formatPrice(preTrade.targetPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
            Stop Loss
          </p>
          <p className="mt-0.5 font-mono text-sm font-medium text-red-600 dark:text-red-400">
            {formatPrice(preTrade.plannedStopLoss)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
            R:R Ratio
          </p>
          <p className="mt-0.5 font-mono text-sm font-medium text-foreground">
            {preTrade.riskRewardRatio.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Position size rationale */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-hint">
          Position Size Rationale
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {preTrade.positionSizeRationale}
        </p>
      </div>

      {/* Badges row: confidence, market conditions, emotional state */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Confidence */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-hint">Confidence</span>
          <ConfidenceDots value={preTrade.confidenceLevel} />
        </div>

        {/* Market Conditions */}
        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
          {marketConditionLabels[preTrade.marketConditions] ?? preTrade.marketConditions}
        </span>

        {/* Emotional State */}
        <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
          {emotionalLabels[preTrade.emotionalStateBefore] ?? preTrade.emotionalStateBefore}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// Post-Trade Content
// =============================================================================

function PostTradeContent({
  postTrade,
  onEdit,
}: {
  postTrade: PostTrade
  onEdit?: () => void
}) {
  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-500 dark:text-emerald-400">
          What Worked
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {postTrade.whatWorked}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-red-500 dark:text-red-400">
          What Didn&apos;t Work
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {postTrade.whatDidntWork}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-500 dark:text-amber-400">
          Lessons Learned
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {postTrade.lessonsLearned}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
          {emotionalLabels[postTrade.emotionalStateAfter] ?? postTrade.emotionalStateAfter}
        </span>

        <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
          postTrade.wouldTakeAgain
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
        }`}>
          {postTrade.wouldTakeAgain ? (
            <><CheckCircle2 size={12} /> Would take again</>
          ) : (
            <><XCircle size={12} /> Would not take again</>
          )}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// Empty Section
// =============================================================================

function EmptySection({
  message,
  onEdit,
}: {
  message: string
  onEdit?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <p className="text-sm text-hint">{message}</p>
      <button
        onClick={onEdit}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary"
      >
        <Pencil size={12} aria-hidden="true" />
        Edit to add
      </button>
    </div>
  )
}

// =============================================================================
// Confidence Dots
// =============================================================================

function ConfidenceDots({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`h-2 w-2 rounded-full ${
            dot <= value
              ? 'bg-primary dark:bg-pink-400'
              : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

// =============================================================================
// Score Bar
// =============================================================================

function ScoreBar({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  const percentage = (value / 5) * 100

  const getColor = (v: number) => {
    if (v >= 4) return 'bg-emerald-500 dark:bg-emerald-400'
    if (v >= 3) return 'bg-blue-500 dark:bg-blue-400'
    if (v >= 2) return 'bg-amber-500 dark:bg-amber-400'
    return 'bg-red-500 dark:bg-red-400'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-40 items-center gap-2 shrink-0 sm:w-48">
        <Icon size={14} className="shrink-0 text-hint" />
        <span className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-muted">
          <div
            className={`h-2 rounded-full transition-all ${getColor(value)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-6 text-right font-mono text-xs font-bold text-foreground">
          {value}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// Radar Chart (SVG)
// =============================================================================

function RadarChart({ scores }: { scores: ProcessScores }) {
  const chart = useChartColors()
  const size = 180
  const center = size / 2
  const radius = 70
  const levels = 5

  const dimensions = [
    { key: 'discipline' as const, label: 'DIS' },
    { key: 'emotionalManagement' as const, label: 'EMO' },
    { key: 'riskManagement' as const, label: 'RSK' },
    { key: 'entryQuality' as const, label: 'ENT' },
    { key: 'exitQuality' as const, label: 'EXT' },
  ]

  const angleStep = (2 * Math.PI) / dimensions.length
  const startAngle = -Math.PI / 2

  // Get coordinates for a value (0-5) at a given dimension index
  const getPoint = (value: number, index: number) => {
    const angle = startAngle + index * angleStep
    const r = (value / 5) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  // Grid lines
  const gridLevels = Array.from({ length: levels }, (_, i) => i + 1)

  // Data polygon
  const dataPoints = dimensions.map((dim, i) => getPoint(scores[dim.key], i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const points = dimensions
          .map((_, i) => {
            const p = getPoint(level, i)
            return `${p.x},${p.y}`
          })
          .join(' ')
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const p = getPoint(5, i)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Data fill */}
      <path d={dataPath} fill={chart.primary} fillOpacity={0.1} />

      {/* Data stroke */}
      <path
        d={dataPath}
        fill="none"
        stroke={chart.primary}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={chart.primary} />
      ))}

      {/* Labels */}
      {dimensions.map((dim, i) => {
        const angle = startAngle + i * angleStep
        const labelR = radius + 16
        const x = center + labelR * Math.cos(angle)
        const y = center + labelR * Math.sin(angle)
        return (
          <text
            key={dim.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-zinc-400 dark:fill-zinc-500"
            fontSize={10}
            fontWeight={600}
            fontFamily="JetBrains Mono, monospace"
          >
            {dim.label}
          </text>
        )
      })}
    </svg>
  )
}
