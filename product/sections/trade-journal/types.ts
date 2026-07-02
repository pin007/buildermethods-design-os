// =============================================================================
// Enums / Union Types
// =============================================================================

/** Side of the trade */
export type TradeSide = 'BUY' | 'SELL'

/** Broker identifier */
export type BrokerType = 'IB' | 'Binance'

/** Market conditions at time of trade */
export type MarketCondition = 'trending' | 'ranging' | 'volatile' | 'calm' | 'uncertain'

/** Emotional states before a trade */
export type EmotionalStateBefore = 'calm' | 'confident' | 'anxious' | 'excited' | 'fearful' | 'neutral' | 'frustrated'

/** Emotional states after a trade */
export type EmotionalStateAfter = 'satisfied' | 'disappointed' | 'relieved' | 'frustrated' | 'neutral' | 'regretful' | 'proud'

/** Behavioral pattern types */
export type PatternType = 'revenge_trading' | 'overtrading' | 'position_size_drift' | 'fomo' | 'fear_cutting_winners' | 'stubbornness'

/** Pattern severity */
export type PatternSeverity = 'low' | 'moderate' | 'high'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'flat'

/** Goal status */
export type GoalStatus = 'met' | 'close' | 'missed'

/** Analytics period */
export type AnalyticsPeriod = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'

/** Behavioral lookback period */
export type BehavioralPeriod = '1M' | '3M' | '6M'

// =============================================================================
// Data Types
// =============================================================================

/** Portfolio for filtering/grouping */
export interface Portfolio {
  id: string
  name: string
  description: string
}

/** Trade summary embedded in journal entry */
export interface TradeSummary {
  instrument: string
  instrumentName: string
  side: TradeSide
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  holdingPeriod: number
  broker: BrokerType
  strategy: string
}

/** Pre-trade analysis section */
export interface PreTrade {
  thesis: string
  entryCriteria: string
  targetPrice: number
  plannedStopLoss: number
  riskRewardRatio: number
  positionSizeRationale: string
  confidenceLevel: 1 | 2 | 3 | 4 | 5
  marketConditions: MarketCondition
  emotionalStateBefore: EmotionalStateBefore
}

/** Post-trade review section */
export interface PostTrade {
  whatWorked: string
  whatDidntWork: string
  lessonsLearned: string
  emotionalStateAfter: EmotionalStateAfter
  wouldTakeAgain: boolean
}

/** Process scores (1-5 scale) */
export interface ProcessScores {
  discipline: 1 | 2 | 3 | 4 | 5
  emotionalManagement: 1 | 2 | 3 | 4 | 5
  riskManagement: 1 | 2 | 3 | 4 | 5
  entryQuality: 1 | 2 | 3 | 4 | 5
  exitQuality: 1 | 2 | 3 | 4 | 5
  overall: number
}

/** Attachment on a journal entry */
export interface Attachment {
  id: string
  type: string
  fileName: string
  url: string
}

/** The main journal entry entity */
export interface JournalEntry {
  id: string
  tradeId: string
  portfolioId: string
  starred: boolean
  tradeSummary: TradeSummary
  preTrade: PreTrade | null
  postTrade: PostTrade | null
  processScores: ProcessScores
  tags: string[]
  relatedTrades: string[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

/** Trade that hasn't been journaled yet */
export interface UnjournaledTrade {
  tradeId: string
  portfolioId: string
  instrument: string
  instrumentName: string
  side: TradeSide
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  broker: BrokerType
  strategy: string
}

/** Dashboard aggregate statistics */
export interface DashboardStats {
  totalEntries: number
  avgProcessScore: number
  avgProcessScoreTrend: TrendDirection
  journalCompletionRate: number
  entriesThisWeek: number
  processScoreTrend: Array<{ date: string; score: number }>
}

/** Performance analytics metrics */
export interface PerformanceMetrics {
  period: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  averageWin: number
  averageLoss: number
  winLossRatio: number
  profitFactor: number
  totalPnl: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdownPct: number
  maxDrawdownDays: number
  averageHoldingPeriodDays: number
  winRateTrend: Array<{ month: string; winRate: number }>
  pnlDistribution: Array<{ bucket: string; count: number }>
  cumulativePnl: Array<{ date: string; pnl: number }>
}

/** Process score analytics */
export interface ProcessScoreAnalytics {
  overallAverage: number
  trend: TrendDirection
  byDimension: {
    discipline: number
    emotionalManagement: number
    riskManagement: number
    entryQuality: number
    exitQuality: number
  }
  monthlyTrend: Array<{
    month: string
    discipline: number
    emotionalManagement: number
    riskManagement: number
    entryQuality: number
    exitQuality: number
    overall: number
  }>
  processVsOutcome: {
    skilledCount: number
    unluckyCount: number
    luckyCount: number
    needsWorkCount: number
  }
}

/** Attribution analytics */
export interface AttributionData {
  byStrategy: Array<{
    strategy: string
    trades: number
    winRate: number
    profitFactor: number
    pnl: number
  }>
  byDayOfWeek: Array<{
    day: string
    trades: number
    winRate: number
    averagePnl: number
  }>
  byTimeOfDay: Array<{
    session: string
    trades: number
    winRate: number
    averagePnl: number
  }>
}

/** Detected behavioral pattern */
export interface BehavioralPattern {
  id: string
  patternType: PatternType
  severity: PatternSeverity
  occurrences: number
  description: string
  impactPnl: number
  recommendation: string
  acknowledged: boolean
  acknowledgedAt: string | null
  detectedAt: string
}

/** Single habit score with trend */
export interface HabitScoreEntry {
  score: number
  trend: TrendDirection
  sparkline: Array<{ date: string; score: number }>
}

/** All four habit scores */
export interface HabitScores {
  consistency: HabitScoreEntry
  emotionalControl: HabitScoreEntry
  riskDiscipline: HabitScoreEntry
  patience: HabitScoreEntry
}

/** Improvement focus area */
export interface ImprovementArea {
  title: string
  description: string
  relatedPatternId: string | null
}

/** Weekly review goal progress */
export interface GoalProgress {
  goalName: string
  target: number
  actual: number
  status: GoalStatus
}

/** Weekly review data */
export interface WeeklyReview {
  week: string
  dateRange: string
  summary: {
    trades: number
    pnl: number
    winRate: number
    avgProcessScore: number
  }
  bestTrade: {
    tradeId: string
    instrument: string
    pnl: number
    processScore: number
  }
  worstTrade: {
    tradeId: string
    instrument: string
    pnl: number
    processScore: number
  }
  patternsThisWeek: string[]
  goalsProgress: GoalProgress[]
  focusForNextWeek: string[]
}

// =============================================================================
// Component Props
// =============================================================================

/** Props for the Journal Dashboard view */
export interface JournalDashboardProps {
  stats: DashboardStats
  recentEntries: JournalEntry[]
  behavioralAlerts: BehavioralPattern[]
  habitScores: HabitScores
  portfolios: Portfolio[]
  /** Called when user selects a portfolio filter */
  onPortfolioFilter?: (portfolioId: string | null) => void
  /** Called when user clicks a journal entry to view detail */
  onViewEntry?: (id: string) => void
  /** Called when user clicks "Create Entry" */
  onCreateEntry?: () => void
  /** Called when user clicks "View Details" on a behavioral alert */
  onViewBehavioralPatterns?: () => void
}

/** Props for the Journal Entries list view */
export interface JournalEntriesProps {
  entries: JournalEntry[]
  unjournaledTrades: UnjournaledTrade[]
  portfolios: Portfolio[]
  /** Called when user clicks an entry to view detail */
  onViewEntry?: (id: string) => void
  /** Called when user clicks Edit on an entry */
  onEditEntry?: (id: string) => void
  /** Called when user confirms deletion of an entry */
  onDeleteEntry?: (id: string) => void
  /** Called when user stars/unstars an entry */
  onToggleStar?: (id: string) => void
  /** Called when user clicks "Journal This Trade" on an unjournaled trade */
  onJournalTrade?: (tradeId: string) => void
  /** Called when user applies portfolio filter */
  onPortfolioFilter?: (portfolioIds: string[]) => void
}

/** Props for the Journal Entry Detail view */
export interface JournalEntryDetailProps {
  entry: JournalEntry
  portfolioName: string
  /** Called when user clicks Edit */
  onEdit?: (id: string) => void
  /** Called when user confirms deletion */
  onDelete?: (id: string) => void
  /** Called when user toggles star */
  onToggleStar?: (id: string) => void
  /** Called when user clicks a related trade */
  onViewRelatedTrade?: (tradeId: string) => void
  /** Called when user navigates back */
  onBack?: () => void
}

/** Props for the Journal Entry Editor (create/edit form) */
export interface JournalEntryEditorProps {
  /** Existing entry when editing, null when creating */
  entry: JournalEntry | null
  /** Trade data when creating from Needs Review */
  trade: UnjournaledTrade | null
  /** Available tags for typeahead */
  availableTags: string[]
  /** Called when user saves the entry */
  onSave?: (data: Partial<JournalEntry>) => void
  /** Called when user cancels */
  onCancel?: () => void
  /** Called when form dirty state changes (for unsaved changes warning) */
  onDirtyChange?: (isDirty: boolean) => void
}

/** Props for the Analytics view */
export interface AnalyticsProps {
  performanceMetrics: PerformanceMetrics
  processScoreAnalytics: ProcessScoreAnalytics
  attributionData: AttributionData
  portfolios: Portfolio[]
  /** Called when user changes portfolio filter */
  onPortfolioFilter?: (portfolioId: string | null) => void
  /** Called when user changes period */
  onPeriodChange?: (period: AnalyticsPeriod) => void
}

/** Props for the Behavioral Patterns view */
export interface BehavioralPatternsProps {
  patterns: BehavioralPattern[]
  habitScores: HabitScores
  improvementAreas: ImprovementArea[]
  /** Called when user acknowledges a pattern */
  onAcknowledgePattern?: (id: string) => void
  /** Called when user changes lookback period */
  onPeriodChange?: (period: BehavioralPeriod) => void
}

/** Props for the Weekly Review view */
export interface WeeklyReviewProps {
  review: WeeklyReview
  portfolios: Portfolio[]
  /** Called when user navigates to a different week */
  onWeekChange?: (week: string) => void
  /** Called when user clicks best/worst trade to view entry */
  onViewEntry?: (tradeId: string) => void
  /** Called when user saves updated focus areas */
  onSaveFocus?: (items: string[]) => void
  /** Called when user changes portfolio filter */
  onPortfolioFilter?: (portfolioId: string | null) => void
  /** Called when user clicks to view behavioral patterns */
  onViewBehavioralPatterns?: () => void
}
