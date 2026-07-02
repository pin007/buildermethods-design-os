import { useState } from 'react'
import {
  Lightbulb,
  Activity,
  Clock,
  TrendingUp,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react'
import type { MarketIntelligenceProps } from '../types'
import { RecommendationsTab } from './RecommendationsTab'
import { SentimentTab } from './SentimentTab'
import { GuruTrackerTab } from './GuruTrackerTab'
import { ResearchScheduleTab } from './ResearchScheduleTab'

type TabId = 'recommendations' | 'sentiment' | 'guru-tracker' | 'research-schedule'

const tabs: { id: TabId; label: string }[] = [
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'guru-tracker', label: 'Guru Tracker' },
  { id: 'research-schedule', label: 'Research Schedule' },
]

function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function sentimentStyle(score: number) {
  if (score >= 65)
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'text-emerald-500/50 dark:text-emerald-400/40',
      glow: 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]',
    }
  if (score >= 35)
    return {
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'text-amber-500/50 dark:text-amber-400/40',
      glow: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08]',
    }
  return {
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500/50 dark:text-red-400/40',
    glow: 'bg-red-500/[0.06] dark:bg-red-500/[0.08]',
  }
}

export function MarketIntelligence(props: MarketIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<TabId>('recommendations')
  const { dashboardStats: stats, onTabChange } = props

  const handleTab = (tab: TabId) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  const sStyle = sentimentStyle(stats.marketSentiment)

  // ── Empty state (no data yet) ──────────────────────────────────────────────
  if (
    props.recommendations.length === 0 &&
    props.guruTrades.length === 0 &&
    props.researchJobs.length === 0
  ) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
          <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
              <Sparkles size={28} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Intelligence engines are warming up
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Your first analysis results will appear here shortly.
            </p>
            <button
              onClick={() => props.onAnalyzeInstrument?.('', 'full')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
            >
              Run Analysis
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Intelligence
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Market Analysis
        </h1>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Recommendations */}
        <button
          onClick={() => handleTab('recommendations')}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-500/[0.04] blur-2xl dark:bg-pink-500/[0.07]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-pink-500/50 dark:text-pink-400/40">
                <Lightbulb size={16} strokeWidth={1.5} />
              </div>
              {stats.newSinceLastVisit > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white shadow-sm shadow-pink-600/30">
                  {stats.newSinceLastVisit}
                </span>
              )}
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Active Recommendations
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {stats.activeRecommendations}
            </p>
            <p className="mt-1 text-xs font-medium text-pink-600 dark:text-pink-400">
              {stats.newSinceLastVisit} new since last visit
            </p>
            <div className="absolute right-0 top-1/2 -translate-x-1 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </button>

        {/* Market Sentiment */}
        <button
          onClick={() => handleTab('sentiment')}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
        >
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${sStyle.glow}`} />
          <div className="relative">
            <div className={sStyle.icon}>
              <Activity size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Market Sentiment
            </p>
            <p className={`mt-1 font-mono text-2xl font-semibold tracking-tight ${sStyle.text}`}>
              {stats.marketSentiment}
            </p>
            <p className={`mt-1 text-xs font-medium capitalize ${sStyle.text}`}>
              {stats.marketSentimentLabel}
            </p>
            <div className="absolute right-0 top-1/2 -translate-x-1 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </button>

        {/* Next Research Run */}
        <button
          onClick={() => handleTab('research-schedule')}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
        >
          <div className="relative">
            <div className="text-zinc-300 dark:text-zinc-700">
              <Clock size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Next Research Run
            </p>
            {stats.nextResearchRun.isRunning ? (
              <>
                <div className="mt-1 flex items-center gap-2">
                  <Loader2
                    size={18}
                    className="animate-spin text-blue-600 dark:text-blue-400"
                  />
                  <span className="font-mono text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    Running
                  </span>
                </div>
                <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/60">
                  {stats.nextResearchRun.jobName}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {formatCountdown(stats.nextResearchRun.countdownMs)}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  {stats.nextResearchRun.jobName}
                </p>
              </>
            )}
            <div className="absolute right-0 top-1/2 -translate-x-1 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </button>

        {/* Top Guru Move */}
        <button
          onClick={() => handleTab('guru-tracker')}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.04] blur-2xl dark:bg-emerald-500/[0.07]" />
          <div className="relative">
            <div className="text-emerald-500/50 dark:text-emerald-400/40">
              <TrendingUp size={16} strokeWidth={1.5} />
            </div>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Top Guru Move
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {stats.topGuruMove.action}{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {stats.topGuruMove.symbol}
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              {stats.topGuruMove.guruName}
            </p>
            <div className="absolute right-0 top-1/2 -translate-x-1 -translate-y-1/2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        </button>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────────── */}
      <div className="-mb-px flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-pink-600 dark:text-pink-400'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-pink-600 dark:bg-pink-400" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {activeTab === 'recommendations' && (
        <RecommendationsTab
          recommendations={props.recommendations}
          onCreateOrder={props.onCreateOrder}
          onDismissRecommendation={props.onDismissRecommendation}
          onSnoozeRecommendation={props.onSnoozeRecommendation}
          onAnalyzeInstrument={props.onAnalyzeInstrument}
        />
      )}
      {activeTab === 'sentiment' && (
        <SentimentTab
          sentimentOverview={props.sentimentOverview}
          sectorSentiment={props.sectorSentiment}
          topMovers={props.topMovers}
          newsArticles={props.newsArticles}
          newsSources={props.newsSources}
          sentimentWatchlist={props.sentimentWatchlist}
          sentimentAlerts={props.sentimentAlerts}
          sectors={props.sectors}
          onAddToWatchlist={props.onAddToWatchlist}
          onRemoveFromWatchlist={props.onRemoveFromWatchlist}
          onSaveSentimentAlert={props.onSaveSentimentAlert}
          onDeleteSentimentAlert={props.onDeleteSentimentAlert}
          onToggleSentimentAlert={props.onToggleSentimentAlert}
          onChangeFinBERTSensitivity={props.onChangeFinBERTSensitivity}
          onToggleNewsSource={props.onToggleNewsSource}
          onAddNewsSource={props.onAddNewsSource}
          onRemoveNewsSource={props.onRemoveNewsSource}
          onSaveSectorGrouping={props.onSaveSectorGrouping}
          onCreateSector={props.onCreateSector}
          onDeleteSector={props.onDeleteSector}
          onReorderSectors={props.onReorderSectors}
          onTimeRangeChange={props.onTimeRangeChange}
          onAnalyzeInstrument={props.onAnalyzeInstrument}
        />
      )}
      {activeTab === 'guru-tracker' && (
        <GuruTrackerTab
          guruTrades={props.guruTrades}
          trackedGurus={props.trackedGurus}
          guruAlerts={props.guruAlerts}
          onFollowTrade={props.onFollowTrade}
          onAddGuru={props.onAddGuru}
          onRemoveGuru={props.onRemoveGuru}
          onToggleGuru={props.onToggleGuru}
          onEditGuru={props.onEditGuru}
          onSaveGuruAlert={props.onSaveGuruAlert}
          onDeleteGuruAlert={props.onDeleteGuruAlert}
          onToggleGuruAlert={props.onToggleGuruAlert}
        />
      )}
      {activeTab === 'research-schedule' && (
        <ResearchScheduleTab
          researchJobs={props.researchJobs}
          onRunResearchNow={props.onRunResearchNow}
          onCancelResearch={props.onCancelResearch}
          onCreateResearchJob={props.onCreateResearchJob}
          onEditResearchJob={props.onEditResearchJob}
          onDeleteResearchJob={props.onDeleteResearchJob}
          onToggleResearchJob={props.onToggleResearchJob}
          onViewJobRunResults={props.onViewJobRunResults}
        />
      )}
    </div>
  )
}
