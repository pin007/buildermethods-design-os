// =============================================================================
// Data Types
// =============================================================================

export interface PipelineStats {
  totalTrackedInstruments: number
  activeDataSources: number
  totalDataSources: number
  dataFreshnessPercent: number
  qualityAlertsCount: number
  totalDataPoints: number
  lastUpdated: string
}

export type DataSourceStatus = 'connected' | 'degraded' | 'disconnected'

export type AssetType = 'stock' | 'option' | 'crypto'

export interface DataSourceConfig {
  primaryFor: string
  intervals: DataInterval[]
  retentionDays: number
}

export interface DataSource {
  id: string
  name: string
  shortName: string
  icon: string
  status: DataSourceStatus
  statusMessage: string
  supportsRealtime: boolean
  assetTypes: AssetType[]
  fetchSchedule: string
  fetchScheduleCron: string
  rateLimitPerMinute: number
  lastSuccessfulFetch: string
  nextScheduledFetch: string
  errorRateLast24h: number
  trackedInstrumentsCount: number
  totalDataPoints: number
  connectedSince: string
  fallbackSources: string[]
  config: DataSourceConfig
}

export type DataInterval = '1m' | '5m' | '15m' | '1h' | '1d'

export type FreshnessStatus = 'fresh' | 'stale' | 'very_stale'

export interface InstrumentSubscription {
  id: string
  dataSourceId: string
  instrumentId: string
  symbol: string
  instrumentName: string
  assetType: AssetType
  trackedIntervals: DataInterval[]
  coverageStart: string
  coverageEnd: string
  dataPoints: number
  gaps: number
  lastFetched: string
  freshness: FreshnessStatus
}

export type FetchOperationType = 'scheduled' | 'manual' | 'backfill' | 'retry'

export type FetchOperationStatus = 'success' | 'partial' | 'failed'

export interface FetchOperation {
  id: string
  dataSourceId: string
  operationType: FetchOperationType
  instrumentsAffected: string[]
  instrumentsCount: number
  dataPointsFetched: number
  durationMs: number
  status: FetchOperationStatus
  errorMessage: string | null
  timestamp: string
}

export type BackfillTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export type BackfillPriority = 'normal' | 'high'

export interface BackfillTask {
  id: string
  dataSourceId: string
  instrumentId: string
  symbol: string
  instrumentName: string
  interval: DataInterval
  startDate: string
  endDate: string
  priority: BackfillPriority
  status: BackfillTaskStatus
  progressPercent: number
  dataPointsFetched: number
  estimatedTotalPoints: number
  estimatedTimeRemainingMs: number
  errorMessage?: string
  startedAt: string
  completedAt: string | null
}

export type CorporateActionType = 'split' | 'dividend' | 'ticker_change'

export type AdjustmentStatus = 'adjusted' | 'pending' | 'failed' | 'not_required'

export interface SplitDetails {
  ratio: number
  description: string
}

export interface DividendDetails {
  amountPerShare: number
  currency: string
  exDate: string
  payDate: string
  description: string
}

export interface TickerChangeDetails {
  oldSymbol: string
  newSymbol: string
  description: string
}

export type CorporateActionDetails = SplitDetails | DividendDetails | TickerChangeDetails

export interface CorporateAction {
  id: string
  instrumentId: string
  symbol: string
  instrumentName: string
  actionType: CorporateActionType
  actionDate: string
  detectedAt: string
  dataSourceId: string
  dataSourceName: string
  details: CorporateActionDetails
  adjustmentStatus: AdjustmentStatus
  adjustedAt: string | null
  errorMessage?: string
  recordsAffected: number
  affectedPositions: string[]
}

export type QualityAlertType = 'outlier' | 'gap_filled' | 'ohlcv_invalid' | 'stale_data'

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface OHLCVDataPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface QualityAlert {
  id: string
  instrumentId: string
  symbol: string
  instrumentName: string
  dataSourceId: string
  dataSourceName: string
  alertType: QualityAlertType
  severity: AlertSeverity
  detectedAt: string
  description: string
  dataPoint: OHLCVDataPoint | null
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
}

// =============================================================================
// Component Props
// =============================================================================

export interface MarketDataOverviewProps {
  /** Aggregated pipeline health stats for the stat cards */
  pipelineStats: PipelineStats
  /** All configured data sources for the source cards */
  dataSources: DataSource[]
  /** Most recent corporate actions for the overview list */
  recentCorporateActions: CorporateAction[]
  /** Most recent quality alerts for the overview list */
  recentQualityAlerts: QualityAlert[]
  /** Called when user clicks a data source card to drill in */
  onViewSource?: (sourceId: string) => void
  /** Called when user clicks "View All" on corporate actions */
  onViewAllCorporateActions?: () => void
  /** Called when user clicks "View All" on quality alerts */
  onViewAllQualityAlerts?: () => void
  /** Called when user clicks "Configure Sources" in empty state */
  onConfigureSources?: () => void
}

export interface SourceDetailProps {
  /** The data source being viewed */
  dataSource: DataSource
  /** Instrument subscriptions for this source */
  subscriptions: InstrumentSubscription[]
  /** Fetch history for this source */
  fetchOperations: FetchOperation[]
  /** Active and recent backfill tasks for this source */
  backfillTasks: BackfillTask[]
  /** Quality alerts for instruments from this source */
  qualityAlerts: QualityAlert[]
  /** Called when user clicks "Force Refresh All" */
  onForceRefreshAll?: (sourceId: string) => void
  /** Called when user clicks "Refresh" on a single instrument */
  onRefreshInstrument?: (subscriptionId: string) => void
  /** Called when user submits the add instrument form */
  onAddInstrument?: (sourceId: string, symbol: string, intervals: DataInterval[], backfillStartDate?: string) => void
  /** Called when user confirms removing an instrument subscription */
  onRemoveInstrument?: (subscriptionId: string) => void
  /** Called when user submits a backfill request */
  onStartBackfill?: (subscriptionId: string, startDate: string, endDate: string, interval: DataInterval, priority: BackfillPriority) => void
  /** Called when user cancels an active backfill task */
  onCancelBackfill?: (taskId: string) => void
  /** Called when user clicks "Retry" on a failed fetch */
  onRetryFetch?: (fetchId: string) => void
  /** Called when user acknowledges a quality alert */
  onAcknowledgeAlert?: (alertId: string) => void
}

export interface CorporateActionsProps {
  /** Full list of corporate actions for the audit log */
  corporateActions: CorporateAction[]
  /** Called when user clicks "Re-adjust" on a failed adjustment */
  onReadjust?: (actionId: string) => void
  /** Called when user expands a row to see adjustment details */
  onViewDetails?: (actionId: string) => void
}

export interface DataQualityProps {
  /** Overview stats for the quality dashboard stat cards */
  pipelineStats: PipelineStats
  /** Full list of quality alerts */
  qualityAlerts: QualityAlert[]
  /** Called when user acknowledges a single alert */
  onAcknowledge?: (alertId: string) => void
  /** Called when user bulk-acknowledges selected alerts */
  onBulkAcknowledge?: (alertIds: string[]) => void
  /** Called when user clicks "View Data" to navigate to source detail */
  onViewSourceData?: (sourceId: string) => void
}
