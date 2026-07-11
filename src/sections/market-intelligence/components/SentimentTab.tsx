import { useState, useMemo } from 'react'
import { useChartColors } from '@/lib/chart-theme'
import {
  Activity,
  Settings2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Bell,
  BellOff,
  Eye,
  Newspaper,
  Trash2,
  Lock,
  Edit,
} from 'lucide-react'
import type {
  SentimentOverview,
  SectorSentiment,
  TopMovers,
  TopMover,
  NewsArticle,
  NewsSource,
  NewsSourceType,
  NewsSourceStatus,
  SentimentWatchlistItem,
  SentimentAlert,
  AlertDirection,
  FinBERTSensitivity,
  Sector,
  SentimentLabel,
  NewsSentiment,
} from '@/../product/sections/market-intelligence/types'

// =============================================================================
// Props
// =============================================================================

interface SentimentTabProps {
  sentimentOverview: SentimentOverview
  sectorSentiment: SectorSentiment[]
  topMovers: TopMovers
  newsArticles: NewsArticle[]
  newsSources: NewsSource[]
  sentimentWatchlist: SentimentWatchlistItem[]
  sentimentAlerts: SentimentAlert[]
  sectors: Sector[]
  onAddToWatchlist?: (instrumentId: string) => void
  onRemoveFromWatchlist?: (instrumentId: string) => void
  onSaveSentimentAlert?: (alert: { instrumentId: string; direction: AlertDirection; threshold: number }) => void
  onDeleteSentimentAlert?: (alertId: string) => void
  onToggleSentimentAlert?: (alertId: string, enabled: boolean) => void
  onChangeFinBERTSensitivity?: (sensitivity: FinBERTSensitivity) => void
  onToggleNewsSource?: (sourceId: string, enabled: boolean) => void
  onAddNewsSource?: (source: { name: string; type: NewsSourceType; feedUrl: string }) => void
  onRemoveNewsSource?: (sourceId: string) => void
  onSaveSectorGrouping?: (sectorId: string, instruments: string[]) => void
  onCreateSector?: (name: string, instruments: string[]) => void
  onDeleteSector?: (sectorId: string) => void
  onReorderSectors?: (sectorIds: string[]) => void
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void
  onAnalyzeInstrument?: (symbol: string, analysisType: 'quick' | 'full') => void
}

// =============================================================================
// Helpers
// =============================================================================

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

function shortTimestamp(timestamp: string): string {
  const d = new Date(timestamp)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function sentimentColor(score: number): string {
  if (score >= 65) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 35) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function sentimentBg(score: number): string {
  if (score >= 65) return 'bg-emerald-500'
  if (score >= 35) return 'bg-amber-500'
  return 'bg-red-500'
}

function sentimentBgBar(score: number): string {
  if (score >= 65) return 'bg-emerald-500/80 dark:bg-emerald-500/70'
  if (score >= 35) return 'bg-amber-500/80 dark:bg-amber-500/70'
  return 'bg-red-500/80 dark:bg-red-500/70'
}

function sentimentLabel(label: SentimentLabel): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function sourceStatusDot(status: NewsSourceStatus): string {
  if (status === 'active') return 'bg-emerald-500'
  if (status === 'degraded') return 'bg-amber-500'
  return 'bg-red-500'
}

function sourceTypeBadge(type: NewsSourceType): { label: string; classes: string } {
  switch (type) {
    case 'news-wire':
      return { label: 'News', classes: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' }
    case 'social':
      return { label: 'Social', classes: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' }
    case 'blockchain':
      return { label: 'Chain', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' }
  }
}

function newsSentimentBadge(sentiment: NewsSentiment): { label: string; classes: string } {
  switch (sentiment) {
    case 'positive':
      return { label: 'Positive', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' }
    case 'negative':
      return { label: 'Negative', classes: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' }
    case 'neutral':
      return { label: 'Neutral', classes: 'bg-muted text-muted-foreground' }
  }
}

// =============================================================================
// Sparkline (mini SVG)
// =============================================================================

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chart = useChartColors()
  if (data.length < 2) return null
  const w = 80
  const h = 24
  const pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad)
      const y = h - pad - ((v - min) / range) * (h - 2 * pad)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? chart.positive : chart.negative}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// =============================================================================
// Sentiment Gauge (SVG)
// =============================================================================

function SentimentGauge({
  score,
  label,
  trend,
  trendDelta,
  previousScore,
  size = 200,
}: {
  score: number
  label: SentimentLabel
  trend: 'up' | 'down'
  trendDelta: number
  previousScore: number
  size?: number
}) {
  const chart = useChartColors()
  const cx = size / 2
  const cy = size / 2 + 10
  const r = size / 2 - 16
  const strokeW = 12

  // Arc helpers (semi-circle, left to right)
  const startAngle = Math.PI // 180 deg
  const endAngle = 0 // 0 deg (right)
  const scoreAngle = startAngle - (score / 100) * Math.PI

  function polarToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    }
  }

  // Background arc segments (red / yellow / green)
  function arcPath(from: number, to: number, radius: number) {
    const s = polarToXY(from, radius)
    const e = polarToXY(to, radius)
    const sweep = from - to > Math.PI ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${sweep} 1 ${e.x} ${e.y}`
  }

  // Color zone boundaries in angle space
  const zone34 = startAngle - (34 / 100) * Math.PI
  const zone65 = startAngle - (65 / 100) * Math.PI

  // Needle
  const needleLen = r - 10
  const nEnd = polarToXY(scoreAngle, needleLen)

  return (
    <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
      {/* Red zone (0-34) */}
      <path
        d={arcPath(startAngle, zone34, r)}
        fill="none"
        stroke={chart.negative}
        strokeWidth={strokeW}
        strokeLinecap="round"
        opacity={0.25}
      />
      {/* Yellow zone (35-64) */}
      <path
        d={arcPath(zone34, zone65, r)}
        fill="none"
        stroke={chart.warning}
        strokeWidth={strokeW}
        strokeLinecap="round"
        opacity={0.25}
      />
      {/* Green zone (65-100) */}
      <path
        d={arcPath(zone65, endAngle, r)}
        fill="none"
        stroke={chart.positive}
        strokeWidth={strokeW}
        strokeLinecap="round"
        opacity={0.25}
      />
      {/* Active arc (colored by score zone) */}
      <path
        d={arcPath(startAngle, scoreAngle, r)}
        fill="none"
        stroke={score >= 65 ? chart.positive : score >= 35 ? chart.warning : chart.negative}
        strokeWidth={strokeW}
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nEnd.x}
        y2={nEnd.y}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="text-foreground"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={5} className="fill-zinc-700 dark:fill-zinc-300" />
      {/* Score text */}
      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        className="fill-zinc-900 dark:fill-zinc-100"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size >= 200 ? 28 : 22, fontWeight: 700 }}
      >
        {score}
      </text>
    </svg>
  )
}

// =============================================================================
// Toggle Switch
// =============================================================================

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: (val: boolean) => void
  label?: string
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function SentimentTab({
  sentimentOverview,
  sectorSentiment,
  topMovers,
  newsArticles,
  newsSources,
  sentimentWatchlist,
  sentimentAlerts,
  sectors,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onSaveSentimentAlert,
  onDeleteSentimentAlert,
  onToggleSentimentAlert,
  onChangeFinBERTSensitivity,
  onToggleNewsSource,
  onAddNewsSource,
  onRemoveNewsSource,
  onSaveSectorGrouping,
  onCreateSector,
  onDeleteSector,
  onReorderSectors,
  onTimeRangeChange,
  onAnalyzeInstrument,
}: SentimentTabProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [showSensitivity, setShowSensitivity] = useState(false)
  const [showSectorManagement, setShowSectorManagement] = useState(false)
  const [showSourceManagement, setShowSourceManagement] = useState(false)
  const [watchlistOpen, setWatchlistOpen] = useState(true)
  const [alertsOpen, setAlertsOpen] = useState(true)
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set())
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  // ── Derived data ───────────────────────────────────────────────────────────
  const sortedSectors = useMemo(
    () => [...sectorSentiment].sort((a, b) => b.score - a.score),
    [sectorSentiment],
  )
  const maxSectorScore = useMemo(
    () => Math.max(...sortedSectors.map((s) => s.score), 1),
    [sortedSectors],
  )

  // ── Empty state ────────────────────────────────────────────────────────────
  if (
    sentimentOverview.articleCount24h === 0 &&
    sectorSentiment.length === 0 &&
    newsArticles.length === 0
  ) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm">
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl dark:bg-primary/10" />
          <div className="relative rounded-2xl border border-dashed border-border/80 bg-card px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
              <Activity size={28} className="text-hint" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-foreground">
              Sentiment data is being collected...
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your sentiment analysis will appear here once articles are processed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTimeRange = (range: '24h' | '7d' | '30d') => {
    setTimeRange(range)
    onTimeRangeChange?.(range)
  }

  const handleSensitivity = (s: FinBERTSensitivity) => {
    onChangeFinBERTSensitivity?.(s)
    setShowSensitivity(false)
  }

  const toggleSectorExpand = (id: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSourceExpand = (id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const overview = sentimentOverview
  const stocks = overview.assetClassBreakdown.stocks
  const crypto = overview.assetClassBreakdown.crypto

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* Header + Time Range Pills                                         */}
      {/* ================================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
          Sentiment Analysis
        </p>

        {/* Time range pill toggle */}
        <div className="flex gap-1 rounded-xl bg-muted p-1 ring-1 ring-border/60">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRange(range)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-hint hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2-column layout                                                    */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ─── Left column (~60%) ──────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-3">
          {/* ── Sentiment Gauge ──────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Market Sentiment
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-faint">
                  {sentimentLabel(overview.finbertSensitivity)} sensitivity
                </span>
                <button
                  onClick={() => setShowSensitivity(!showSensitivity)}
                  aria-label="Configure FinBERT sensitivity"
                  aria-expanded={showSensitivity}
                  className="rounded-lg p-1.5 text-hint transition-colors hover:bg-accent hover:text-muted-foreground"
                >
                  <Settings2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Sensitivity inline radio */}
            {showSensitivity && (
              <div className="border-b border-border px-6 py-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                  FinBERT Sensitivity
                </p>
                <div className="flex gap-2">
                  {(['conservative', 'balanced', 'aggressive'] as FinBERTSensitivity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSensitivity(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        overview.finbertSensitivity === s
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center px-6 py-6">
              {/* Responsive gauge */}
              <div className="hidden sm:block">
                <SentimentGauge
                  score={overview.overallScore}
                  label={overview.overallLabel}
                  trend={overview.trend}
                  trendDelta={overview.trendDelta}
                  previousScore={overview.previousScore}
                  size={200}
                />
              </div>
              <div className="sm:hidden">
                <SentimentGauge
                  score={overview.overallScore}
                  label={overview.overallLabel}
                  trend={overview.trend}
                  trendDelta={overview.trendDelta}
                  previousScore={overview.previousScore}
                  size={150}
                />
              </div>

              {/* Label + trend */}
              <p className={`mt-1 text-lg font-semibold capitalize ${sentimentColor(overview.overallScore)}`}>
                {sentimentLabel(overview.overallLabel)}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {overview.trend === 'up' ? (
                  <ArrowUp size={12} className="text-emerald-500" />
                ) : (
                  <ArrowDown size={12} className="text-red-500" />
                )}
                <span className="font-mono">
                  {overview.trendDelta > 0 ? '+' : ''}
                  {overview.trendDelta} from {overview.previousScore}
                </span>
              </div>
              <p className="mt-2 text-xs text-faint">
                {overview.articleCount24h} articles analyzed (24h)
              </p>
            </div>
          </div>

          {/* ── Sentiment by Sector ──────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Sentiment by Sector
              </h2>
              <button
                onClick={() => setShowSectorManagement(!showSectorManagement)}
                aria-expanded={showSectorManagement}
                className="text-xs font-medium text-primary transition-colors hover:text-primary dark:hover:text-pink-300"
              >
                {showSectorManagement ? 'Close' : 'Edit Sectors'}
              </button>
            </div>

            {/* Sector management panel */}
            {showSectorManagement && (
              <div className="border-b border-border px-6 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    Sector Groupings
                  </p>
                  <button
                    onClick={() => onCreateSector?.('New Sector', [])}
                    className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={12} aria-hidden="true" />
                    New Sector
                  </button>
                </div>
                {sectors.map((sector) => (
                  <div key={sector.id} className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => toggleSectorExpand(sector.id)}
                      aria-expanded={expandedSectors.has(sector.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {sector.isSystem && <Lock size={12} aria-hidden="true" className="text-faint" />}
                        <span className="text-sm font-medium text-foreground">
                          {sector.name}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-faint">
                          {sector.instruments.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!sector.isSystem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteSector?.(sector.id)
                            }}
                            aria-label={`Delete ${sector.name} sector`}
                            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        )}
                        {expandedSectors.has(sector.id) ? (
                          <ChevronUp size={14} aria-hidden="true" className="text-faint" />
                        ) : (
                          <ChevronDown size={14} aria-hidden="true" className="text-faint" />
                        )}
                      </div>
                    </button>
                    {expandedSectors.has(sector.id) && (
                      <div className="border-t border-border px-4 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {sector.instruments.map((inst) => (
                            <span
                              key={inst}
                              className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                            >
                              {inst}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bar chart */}
            <div className="px-6 py-4 space-y-3">
              {sortedSectors.map((sector) => (
                <div key={sector.id} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-xs font-medium text-muted-foreground">
                    {sector.name}
                  </span>
                  <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${sentimentBgBar(sector.score)}`}
                      style={{ width: `${(sector.score / maxSectorScore) * 100}%` }}
                    />
                  </div>
                  <span className={`w-8 shrink-0 text-right font-mono text-xs font-semibold ${sentimentColor(sector.score)}`}>
                    {sector.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sentiment Watchlist (collapsible) ────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              onClick={() => setWatchlistOpen(!watchlistOpen)}
              aria-expanded={watchlistOpen}
              className="flex w-full items-center justify-between border-b border-border px-6 py-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                  <Eye size={13} className="text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Sentiment Watchlist
                </h2>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-hint">
                  {sentimentWatchlist.length}
                </span>
              </div>
              {watchlistOpen ? (
                <ChevronUp size={16} aria-hidden="true" className="text-faint" />
              ) : (
                <ChevronDown size={16} aria-hidden="true" className="text-faint" />
              )}
            </button>

            {watchlistOpen && (
              <div className="px-6 py-4">
                {sentimentWatchlist.length === 0 ? (
                  <p className="py-4 text-center text-xs text-faint">
                    No instruments in watchlist. Click "Add" to start tracking.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sentimentWatchlist.map((item) => (
                      <button
                        key={item.instrumentId}
                        onClick={() => onAnalyzeInstrument?.(item.symbol, 'quick')}
                        className="group flex items-center gap-2 rounded-xl border border-border bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2 transition-colors hover:border-pink-300 dark:hover:border-pink-900/60"
                      >
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {item.symbol}
                        </span>
                        <span className={`font-mono text-xs font-bold ${sentimentColor(item.sentimentScore * 10)}`}>
                          {item.sentimentScore.toFixed(1)}
                        </span>
                        {item.trend === 'up' ? (
                          <ArrowUp size={10} className="text-emerald-500" />
                        ) : (
                          <ArrowDown size={10} className="text-red-500" />
                        )}
                        {item.hasAlert && (
                          <Bell size={10} className="text-amber-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveFromWatchlist?.(item.instrumentId)
                          }}
                          aria-label={`Remove ${item.symbol} from watchlist`}
                          className="rounded p-0.5 text-faint opacity-0 transition-all group-hover:opacity-100 hover:text-red-400 dark:hover:text-red-400"
                        >
                          <X size={10} aria-hidden="true" />
                        </button>
                      </button>
                    ))}
                    <button
                      onClick={() => onAddToWatchlist?.('')}
                      className="flex items-center gap-1 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-pink-400 hover:text-primary dark:text-zinc-600 dark:hover:border-pink-800 dark:hover:text-pink-400"
                    >
                      <Plus size={12} aria-hidden="true" />
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Active Alerts (collapsible) ──────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              aria-expanded={alertsOpen}
              className="flex w-full items-center justify-between border-b border-border px-6 py-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                  <Bell size={13} className="text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Sentiment Alerts
                </h2>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-hint">
                  {sentimentAlerts.length}
                </span>
              </div>
              {alertsOpen ? (
                <ChevronUp size={16} aria-hidden="true" className="text-faint" />
              ) : (
                <ChevronDown size={16} aria-hidden="true" className="text-faint" />
              )}
            </button>

            {alertsOpen && (
              <div className="px-6 py-4">
                {sentimentAlerts.length === 0 ? (
                  <p className="py-4 text-center text-xs text-faint">
                    No alerts configured.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                            Instrument
                          </th>
                          <th className="pb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                            Direction
                          </th>
                          <th className="pb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                            Threshold
                          </th>
                          <th className="pb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                            Status
                          </th>
                          <th className="pb-2 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                            Last Triggered
                          </th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {sentimentAlerts.map((alert) => (
                          <tr
                            key={alert.id}
                            className="border-b border-zinc-50 dark:border-zinc-800/40 last:border-0"
                          >
                            <td className="py-2.5 pr-3">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {alert.symbol}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="text-xs text-muted-foreground capitalize">
                                {alert.direction}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {alert.threshold}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <Toggle
                                enabled={alert.status === 'active'}
                                onChange={(val) => onToggleSentimentAlert?.(alert.id, val)}
                                label={`Toggle alert for ${alert.symbol}`}
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="text-xs text-faint">
                                {alert.lastTriggeredAt
                                  ? relativeTime(alert.lastTriggeredAt)
                                  : 'Never'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <button
                                onClick={() => onDeleteSentimentAlert?.(alert.id)}
                                aria-label={`Delete alert for ${alert.symbol}`}
                                className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              >
                                <Trash2 size={13} aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() =>
                      onSaveSentimentAlert?.({
                        instrumentId: '',
                        direction: 'below',
                        threshold: 5.0,
                      })
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    <Plus size={14} aria-hidden="true" />
                    Create Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Top Movers ───────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Top Movers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Most Bullish */}
              <div className="px-6 py-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                  Most Bullish
                </p>
                <div className="space-y-2">
                  {topMovers.bullish.map((mover) => (
                    <MoverRow
                      key={mover.instrumentId}
                      mover={mover}
                      positive
                      onWatch={() => onAddToWatchlist?.(mover.instrumentId)}
                    />
                  ))}
                </div>
              </div>

              {/* Most Bearish */}
              <div className="px-6 py-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-red-600 dark:text-red-400">
                  Most Bearish
                </p>
                <div className="space-y-2">
                  {topMovers.bearish.map((mover) => (
                    <MoverRow
                      key={mover.instrumentId}
                      mover={mover}
                      positive={false}
                      onWatch={() => onAddToWatchlist?.(mover.instrumentId)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right column (~40%) ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* ── Asset Class Comparison ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <AssetClassCard
              label="Stocks"
              sentiment={stocks}
            />
            <AssetClassCard
              label="Crypto"
              sentiment={crypto}
            />
          </div>

          {/* ── News Feed ────────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                  <Newspaper size={13} className="text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  News Feed
                </h2>
              </div>
              <button
                onClick={() => setShowSourceManagement(!showSourceManagement)}
                aria-expanded={showSourceManagement}
                className="text-xs font-medium text-primary transition-colors hover:text-primary dark:hover:text-pink-300"
              >
                {showSourceManagement ? 'Close' : 'Manage Sources'}
              </button>
            </div>

            {/* Source management panel */}
            {showSourceManagement && (
              <div className="border-b border-border px-6 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    News Sources
                  </p>
                  <button
                    onClick={() =>
                      onAddNewsSource?.({
                        name: 'New Source',
                        type: 'news-wire',
                        feedUrl: '',
                      })
                    }
                    className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={12} aria-hidden="true" />
                    Add Source
                  </button>
                </div>

                {newsSources.map((source) => {
                  const typeBadge = sourceTypeBadge(source.type)
                  const isExpanded = expandedSources.has(source.id)

                  return (
                    <div
                      key={source.id}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <button
                          onClick={() => toggleSourceExpand(source.id)}
                          aria-expanded={isExpanded}
                          className="flex items-center gap-2 text-left min-w-0"
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${sourceStatusDot(source.status)}`} />
                          <span className="truncate text-sm font-medium text-foreground">
                            {source.name}
                          </span>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${typeBadge.classes}`}>
                            {typeBadge.label}
                          </span>
                          <span className="shrink-0 text-xs text-faint">
                            {source.articleVolume24h}/24h
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={12} aria-hidden="true" className="shrink-0 text-faint" />
                          ) : (
                            <ChevronDown size={12} aria-hidden="true" className="shrink-0 text-faint" />
                          )}
                        </button>
                        <div className="flex items-center gap-2 ml-2">
                          <Toggle
                            enabled={source.enabled}
                            onChange={(val) => onToggleNewsSource?.(source.id, val)}
                            label={`Toggle ${source.name} source`}
                          />
                          <button
                            onClick={() => onRemoveNewsSource?.(source.id)}
                            aria-label={`Remove ${source.name} source`}
                            className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-border px-4 py-2.5 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-faint">URL</span>
                            <span className="truncate ml-2 font-mono text-muted-foreground max-w-[200px]">
                              {source.feedUrl}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-faint">Last Fetch</span>
                            <span className="text-muted-foreground">
                              {source.lastFetchAt ? relativeTime(source.lastFetchAt) : 'Never'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-faint">Errors (24h)</span>
                            <span className={source.errorCount24h > 0 ? 'text-red-500' : 'text-muted-foreground'}>
                              {source.errorCount24h}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-faint">Avg Articles/Day</span>
                            <span className="text-muted-foreground">
                              {source.avgArticlesPerDay}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Article list */}
            <div className="max-h-[600px] overflow-y-auto">
              {newsArticles.length === 0 ? (
                <div className="py-10 text-center">
                  <Newspaper size={20} className="mx-auto text-faint" />
                  <p className="mt-3 text-xs text-faint">
                    No articles yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {newsArticles.map((article) => {
                    const sBadge = newsSentimentBadge(article.sentiment)
                    const source = newsSources.find((s) => s.id === article.sourceId)

                    return (
                      <div key={article.id} className="px-6 py-4 space-y-2">
                        {/* Headline */}
                        <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                          {article.headline}
                        </p>

                        {/* Source + time */}
                        <div className="flex items-center gap-2 text-xs">
                          {source && (
                            <>
                              <span className={`h-2 w-2 shrink-0 rounded-full ${sourceStatusDot(source.status)}`} />
                              <span className="text-muted-foreground">
                                {article.source}
                              </span>
                            </>
                          )}
                          {!source && (
                            <span className="text-muted-foreground">
                              {article.source}
                            </span>
                          )}
                          <span className="text-faint">|</span>
                          <span className="text-faint">
                            {relativeTime(article.publishedAt)}
                          </span>
                        </div>

                        {/* FinBERT badge + instrument tags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${sBadge.classes}`}>
                            {sBadge.label}
                          </span>
                          <span className="font-mono text-xs text-faint">
                            {(article.sentimentConfidence * 100).toFixed(0)}%
                          </span>
                          {article.instrumentTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

function AssetClassCard({
  label,
  sentiment,
}: {
  label: string
  sentiment: {
    score: number
    label: SentimentLabel
    trend: 'up' | 'down'
    trendDelta: number
    articleCount: number
  }
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-bold tracking-tight ${sentimentColor(sentiment.score)}`}>
        {sentiment.score}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {sentiment.trend === 'up' ? (
          <ArrowUp size={12} className="text-emerald-500" />
        ) : (
          <ArrowDown size={12} className="text-red-500" />
        )}
        <span className="font-mono text-xs text-muted-foreground">
          {sentiment.trendDelta > 0 ? '+' : ''}
          {sentiment.trendDelta}
        </span>
      </div>
      <p className="mt-2 text-xs text-faint">
        {sentiment.articleCount} articles
      </p>
      <p className={`mt-0.5 text-xs font-medium capitalize ${sentimentColor(sentiment.score)}`}>
        {sentimentLabel(sentiment.label)}
      </p>
    </div>
  )
}

function MoverRow({
  mover,
  positive,
  onWatch,
}: {
  mover: TopMover
  positive: boolean
  onWatch: () => void
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/40">
      {/* Symbol + Name */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">
            {mover.symbol}
          </span>
          <span className="truncate text-xs text-faint">
            {mover.name}
          </span>
        </div>
      </div>

      {/* Score */}
      <span className={`shrink-0 font-mono text-xs font-bold ${sentimentColor(mover.sentimentScore * 10)}`}>
        {mover.sentimentScore.toFixed(1)}
      </span>

      {/* 24h Change */}
      <div className="flex shrink-0 items-center gap-0.5">
        {mover.change24h >= 0 ? (
          <ArrowUp size={10} className="text-emerald-500" />
        ) : (
          <ArrowDown size={10} className="text-red-500" />
        )}
        <span
          className={`font-mono text-xs ${
            mover.change24h >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {mover.change24h > 0 ? '+' : ''}
          {mover.change24h.toFixed(1)}
        </span>
      </div>

      {/* Article count */}
      <span className="shrink-0 text-xs tabular-nums text-faint">
        {mover.articleCount}
      </span>

      {/* Sparkline */}
      <Sparkline data={mover.sparkline} positive={positive} />

      {/* Watch button */}
      <button
        onClick={onWatch}
        className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        Watch
      </button>
    </div>
  )
}
