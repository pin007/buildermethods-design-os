// =============================================================================
// Data Types — Market Intelligence
// =============================================================================

// --- Recommendations ---

export type RecommendationSource = 'ai-research' | 'strategy-signal'
export type RecommendationStatus = 'active' | 'accepted' | 'dismissed' | 'snoozed' | 'expired'
export type RecommendationAction = 'BUY' | 'SELL'

export interface SentimentBreakdown {
  score: number
  positive: number
  negative: number
  neutral: number
  articleCount: number
}

export interface CorrelationAnalysis {
  coefficient: number
  assessment: string
}

export interface RecommendationReasoning {
  technical: string[]
  sentiment: SentimentBreakdown
  correlation: CorrelationAnalysis
}

export interface ScoreBreakdown {
  technical: number
  sentiment: number
  diversification: number
  overall: number
}

export interface TargetPrices {
  entryPrice: number
  currentPrice: number
  takeProfit: number
  takeProfitPercent: number
  stopLoss: number
  stopLossPercent: number
}

export interface StrategyContext {
  strategyName: string
  timeframe: string
  positionSizing: string
}

export interface Recommendation {
  id: string
  instrumentId: string
  symbol: string
  instrumentName: string
  action: RecommendationAction
  confidence: number
  source: RecommendationSource
  status: RecommendationStatus
  reasoningSummary: string
  reasoning: RecommendationReasoning
  scoreBreakdown: ScoreBreakdown
  targets: TargetPrices
  strategyContext: StrategyContext | null
  snoozedUntil?: string
  expiresAt: string
  createdAt: string
}

// --- Sentiment ---

export type SentimentLabel = 'bullish' | 'neutral' | 'bearish'
export type SentimentTrend = 'up' | 'down'
export type FinBERTSensitivity = 'conservative' | 'balanced' | 'aggressive'

export interface AssetClassSentiment {
  score: number
  label: SentimentLabel
  trend: SentimentTrend
  trendDelta: number
  articleCount: number
}

export interface SentimentOverview {
  overallScore: number
  overallLabel: SentimentLabel
  trend: SentimentTrend
  trendDelta: number
  previousScore: number
  articleCount24h: number
  lastUpdated: string
  assetClassBreakdown: {
    stocks: AssetClassSentiment
    crypto: AssetClassSentiment
  }
  finbertSensitivity: FinBERTSensitivity
}

export interface SectorSentiment {
  id: string
  name: string
  score: number
  label: SentimentLabel
  instrumentCount: number
  isSystem: boolean
}

export interface TopMover {
  instrumentId: string
  symbol: string
  name: string
  sentimentScore: number
  change24h: number
  articleCount: number
  sparkline: number[]
}

export interface TopMovers {
  bullish: TopMover[]
  bearish: TopMover[]
}

// --- News ---

export type NewsSentiment = 'positive' | 'negative' | 'neutral'
export type NewsSourceType = 'news-wire' | 'social' | 'blockchain'
export type NewsSourceStatus = 'active' | 'degraded' | 'offline'

export interface NewsArticle {
  id: string
  headline: string
  summary: string
  source: string
  sourceId: string
  sentiment: NewsSentiment
  sentimentConfidence: number
  instrumentTags: string[]
  publishedAt: string
}

export interface NewsSource {
  id: string
  name: string
  type: NewsSourceType
  status: NewsSourceStatus
  enabled: boolean
  feedUrl: string
  articleVolume24h: number
  avgArticlesPerDay: number
  lastFetchAt: string | null
  errorCount24h: number
}

// --- Sentiment Watchlist & Alerts ---

export interface SentimentWatchlistItem {
  instrumentId: string
  symbol: string
  name: string
  sentimentScore: number
  trend: SentimentTrend
  hasAlert: boolean
}

export type AlertDirection = 'above' | 'below'
export type AlertStatus = 'active' | 'triggered' | 'disabled'

export interface SentimentAlert {
  id: string
  instrumentId: string
  symbol: string
  direction: AlertDirection
  threshold: number
  status: AlertStatus
  lastTriggeredAt: string | null
  createdAt: string
}

// --- Guru/Whale Tracker ---

export type GuruType = 'institutional' | 'hedge-fund' | 'crypto-whale'
export type GuruTradeAction = 'BUY' | 'SELL' | 'INCREASE' | 'DECREASE'
export type GuruAlertActionFilter = 'any' | 'buy' | 'sell'

export interface GuruTrade {
  id: string
  guruId: string
  guruName: string
  guruType: GuruType
  instrumentId: string
  symbol: string
  instrumentName: string
  action: GuruTradeAction
  shareCount: number
  dollarValue: number
  holdingChangePercent: number
  filedAt: string
  sourceAttribution: string
}

export interface TrackedGuru {
  id: string
  name: string
  displayName: string
  type: GuruType
  enabled: boolean
  recentTradeCount: number
  avatarUrl: string | null
  addedAt: string
}

export interface GuruAlertTriggers {
  anyTrade: boolean
  specificInstruments: string[]
  minTradeSize: number | null
  actionFilter: GuruAlertActionFilter
}

export interface GuruAlert {
  id: string
  guruId: string
  guruName: string
  triggers: GuruAlertTriggers
  status: AlertStatus
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string
}

// --- Research Jobs ---

export type ScheduleType = 'daily' | 'interval'
export type JobUniverse = 'full' | 'watchlist' | 'custom'
export type JobStatus = 'idle' | 'running' | 'error' | 'disabled'
export type JobRunStatus = 'completed' | 'failed' | 'cancelled'
export type JobTriggerType = 'scheduled' | 'manual'

export interface JobRunHistory {
  id: string
  timestamp: string
  duration: string
  opportunitiesFound: number
  opportunitiesPublished: number
  status: JobRunStatus
  triggerType: JobTriggerType
}

export interface JobLastRun {
  timestamp: string
  duration: string
  durationMs: number
  opportunitiesFound: number
  opportunitiesPublished: number
  status: JobRunStatus
  error?: string
}

export interface ResearchJob {
  id: string
  name: string
  isSystem: boolean
  scheduleType: ScheduleType
  scheduleTime: string | null
  scheduleTimezone: string
  scheduleInterval: number | null
  universe: JobUniverse
  customInstruments: string[]
  confidenceThreshold: number
  maxResults: number
  enabled: boolean
  status: JobStatus
  lastRun: JobLastRun | null
  nextRunAt: string | null
  runningElapsedMs?: number
  history: JobRunHistory[]
}

// --- Sectors ---

export interface Sector {
  id: string
  name: string
  isSystem: boolean
  instruments: string[]
}

// --- Dashboard Stats ---

export interface DashboardNextRun {
  jobName: string
  countdownMs: number
  isRunning: boolean
}

export interface DashboardTopGuruMove {
  guruName: string
  action: string
  symbol: string
}

export interface DashboardStats {
  activeRecommendations: number
  newSinceLastVisit: number
  marketSentiment: number
  marketSentimentLabel: SentimentLabel
  nextResearchRun: DashboardNextRun
  topGuruMove: DashboardTopGuruMove
}

// =============================================================================
// Component Props
// =============================================================================

export interface MarketIntelligenceProps {
  /** Dashboard stat cards data */
  dashboardStats: DashboardStats
  /** AI-generated trade suggestions from Market Analyst and Trading Advisor */
  recommendations: Recommendation[]
  /** Aggregated market sentiment overview */
  sentimentOverview: SentimentOverview
  /** Per-sector sentiment scores for bar chart */
  sectorSentiment: SectorSentiment[]
  /** Instruments with largest sentiment changes */
  topMovers: TopMovers
  /** Recent news headlines with FinBERT analysis */
  newsArticles: NewsArticle[]
  /** Configurable news feed sources */
  newsSources: NewsSource[]
  /** Instruments pinned for sentiment tracking */
  sentimentWatchlist: SentimentWatchlistItem[]
  /** Threshold-based sentiment alerts */
  sentimentAlerts: SentimentAlert[]
  /** Notable institutional/whale trades */
  guruTrades: GuruTrade[]
  /** Gurus being tracked */
  trackedGurus: TrackedGuru[]
  /** Per-guru alert configurations */
  guruAlerts: GuruAlert[]
  /** Scheduled research jobs */
  researchJobs: ResearchJob[]
  /** Sector groupings for sentiment chart */
  sectors: Sector[]

  // --- Recommendation actions ---
  /** Called when user clicks "Create Order" on a recommendation */
  onCreateOrder?: (recommendationId: string) => void
  /** Called when user dismisses a recommendation */
  onDismissRecommendation?: (recommendationId: string) => void
  /** Called when user snoozes a recommendation for 24h */
  onSnoozeRecommendation?: (recommendationId: string) => void
  /** Called when user requests on-demand analysis of an instrument */
  onAnalyzeInstrument?: (symbol: string, analysisType: 'quick' | 'full') => void

  // --- Sentiment actions ---
  /** Called when user adds an instrument to the sentiment watchlist */
  onAddToWatchlist?: (instrumentId: string) => void
  /** Called when user removes an instrument from the watchlist */
  onRemoveFromWatchlist?: (instrumentId: string) => void
  /** Called when user creates or updates a sentiment alert */
  onSaveSentimentAlert?: (alert: { instrumentId: string; direction: AlertDirection; threshold: number }) => void
  /** Called when user deletes a sentiment alert */
  onDeleteSentimentAlert?: (alertId: string) => void
  /** Called when user toggles a sentiment alert enabled/disabled */
  onToggleSentimentAlert?: (alertId: string, enabled: boolean) => void
  /** Called when user changes FinBERT sensitivity setting */
  onChangeFinBERTSensitivity?: (sensitivity: FinBERTSensitivity) => void
  /** Called when user toggles a news source enabled/disabled */
  onToggleNewsSource?: (sourceId: string, enabled: boolean) => void
  /** Called when user adds a new news source */
  onAddNewsSource?: (source: { name: string; type: NewsSourceType; feedUrl: string }) => void
  /** Called when user removes a news source */
  onRemoveNewsSource?: (sourceId: string) => void
  /** Called when user saves sector grouping changes */
  onSaveSectorGrouping?: (sectorId: string, instruments: string[]) => void
  /** Called when user creates a new custom sector */
  onCreateSector?: (name: string, instruments: string[]) => void
  /** Called when user deletes a custom sector */
  onDeleteSector?: (sectorId: string) => void
  /** Called when user reorders sectors */
  onReorderSectors?: (sectorIds: string[]) => void
  /** Called when sentiment time range filter changes */
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void

  // --- Guru Tracker actions ---
  /** Called when user clicks "Follow Trade" on a guru trade */
  onFollowTrade?: (tradeId: string) => void
  /** Called when user adds a new guru to tracking */
  onAddGuru?: (guru: { name: string; type: GuruType; walletAddress?: string; displayName?: string; alertOnAnyTrade: boolean }) => void
  /** Called when user removes a tracked guru */
  onRemoveGuru?: (guruId: string) => void
  /** Called when user enables/disables a tracked guru */
  onToggleGuru?: (guruId: string, enabled: boolean) => void
  /** Called when user edits a guru's display name or type */
  onEditGuru?: (guruId: string, updates: { displayName?: string; type?: GuruType }) => void
  /** Called when user saves a guru alert configuration */
  onSaveGuruAlert?: (guruId: string, triggers: GuruAlertTriggers) => void
  /** Called when user deletes a guru alert */
  onDeleteGuruAlert?: (alertId: string) => void
  /** Called when user toggles a guru alert enabled/disabled */
  onToggleGuruAlert?: (alertId: string, enabled: boolean) => void

  // --- Research Schedule actions ---
  /** Called when user triggers an ad-hoc research run */
  onRunResearchNow?: (jobId: string, options: { universe: JobUniverse; confidenceThreshold: number }) => void
  /** Called when user cancels a running research job */
  onCancelResearch?: (jobId: string) => void
  /** Called when user creates a new research job */
  onCreateResearchJob?: (job: {
    name: string
    scheduleType: ScheduleType
    scheduleTime?: string
    scheduleTimezone: string
    scheduleInterval?: number
    universe: JobUniverse
    customInstruments?: string[]
    confidenceThreshold: number
    maxResults: number
  }) => void
  /** Called when user updates an existing research job */
  onEditResearchJob?: (jobId: string, updates: Partial<{
    name: string
    scheduleType: ScheduleType
    scheduleTime: string
    scheduleTimezone: string
    scheduleInterval: number
    universe: JobUniverse
    customInstruments: string[]
    confidenceThreshold: number
    maxResults: number
    enabled: boolean
  }>) => void
  /** Called when user deletes a research job */
  onDeleteResearchJob?: (jobId: string) => void
  /** Called when user enables/disables a research job */
  onToggleResearchJob?: (jobId: string, enabled: boolean) => void

  // --- Navigation ---
  /** Called when user clicks a tab to navigate */
  onTabChange?: (tab: 'dashboard' | 'recommendations' | 'sentiment' | 'guru-tracker' | 'research-schedule') => void
  /** Called when user clicks a link to view job run recommendations */
  onViewJobRunResults?: (runId: string) => void
}
