// =============================================================================
// Data Types — Settings Categories Overview
// =============================================================================

export type BadgeVariant = 'warning' | 'info' | 'error'

export interface SettingsCategory {
  id: string
  label: string
  icon: string
  summary: string
  badge: number | null
  badgeVariant: BadgeVariant | null
}

// =============================================================================
// Data Types — Broker Gateways
// =============================================================================

export type ConnectionStatus = 'connected' | 'degraded' | 'disconnected'
export type CircuitBreakerState = 'closed' | 'half-open' | 'open'

export interface CircuitBreakerConfig {
  state: CircuitBreakerState
  failCount: number
  failMax: number
  timeoutDuration: number
}

export interface BrokerCredentials {
  hasApiKey: boolean
  maskedApiKey: string | null
  hasSecret: boolean
  maskedSecret: string | null
}

export interface BrokerStatus {
  connection: ConnectionStatus
  latencyMs: number
  lastHeartbeat: string
  uptime: string
  circuitBreaker: CircuitBreakerConfig
}

export interface BrokerRetryConfig {
  maxAttempts: number
  backoffSeconds: number
}

export interface BrokerGatewayConfig {
  host: string | null
  port: number | null
  clientId: number | null
  accountId: string | null
  paperTrading?: boolean
  testnet?: boolean
}

export interface BrokerGateway {
  id: string
  name: string
  shortName: string
  enabled: boolean
  config: BrokerGatewayConfig
  credentials: BrokerCredentials
  status: BrokerStatus
  retryConfig: BrokerRetryConfig
}

// =============================================================================
// Data Types — Market Data Pipeline
// =============================================================================

export type FetchStatus = 'success' | 'warning' | 'error'
export type InstrumentType = 'stock' | 'crypto' | 'forex' | 'option' | 'future'

export interface DataSource {
  id: string
  name: string
  provider: string
  enabled: boolean
  priority: number
  schedule: string
  scheduleLabel: string
  lastFetch: string
  lastFetchStatus: FetchStatus
  recordsFetched: number
  qualityScore: number
}

export interface RetentionTier {
  id: string
  label: string
  description: string
  retentionDays: number
  granularity: string
  storage: string
}

export interface QualityThresholds {
  completeness: number
  timeliness: number
  accuracy: number
}

export interface TrackedInstrument {
  symbol: string
  name: string
  exchange: string
  type: InstrumentType
}

// =============================================================================
// Data Types — Portfolio & Currency
// =============================================================================

export interface Benchmark {
  id: string
  label: string
  symbol: string
  enabled: boolean
}

export interface MarginAlertThresholds {
  warning: number
  critical: number
  unit: string
}

export interface ReconciliationConfig {
  enabled: boolean
  intervalSeconds: number
  runOnStartup: boolean
  lastRun: string
  lastRunStatus: 'success' | 'failure' | 'pending'
}

export interface PortfolioSettings {
  baseCurrency: string
  supportedCurrencies: string[]
  benchmarks: Benchmark[]
  marginAlertThresholds: MarginAlertThresholds
  reconciliation: ReconciliationConfig
  cacheTtlSeconds: number
}

// =============================================================================
// Data Types — Risk Management
// =============================================================================

export type RiskUnit = 'percent' | 'ratio'

export interface RiskSetting {
  id: string
  label: string
  description: string
  value: number
  defaultValue: number
  min: number
  max: number
  step: number
  unit: RiskUnit
}

export interface RiskCircuitBreaker {
  enabled: boolean
  cooldownMinutes: number
  autoResume: boolean
  monitoringIntervalSeconds: number
}

// =============================================================================
// Data Types — Tax Configuration
// =============================================================================

export interface ReportFormat {
  id: string
  label: string
  enabled: boolean
}

export interface CnbSyncConfig {
  enabled: boolean
  apiUrl: string
  schedule: string
  scheduleLabel: string
  lastSync: string
  lastSyncStatus: 'success' | 'failure'
}

export interface TaxSettings {
  method: 'FIFO'
  taxRate: number
  exemptionHoldingDays: number
  exemptionLabel: string
  cnbSync: CnbSyncConfig
  supportedCurrencies: string[]
  reportFormats: ReportFormat[]
  retentionYears: number
}

// =============================================================================
// Data Types — Strategy & Backtesting
// =============================================================================

export type ExecutionModel = 'SIMPLE' | 'VOLUME_BASED' | 'SPREAD_BASED'

export interface WalkForwardConfig {
  trainingMonths: number
  validationMonths: number
}

export interface BacktestingConfig {
  defaultCapital: number
  commissionPercent: number
  slippagePercent: number
  executionModel: ExecutionModel
  executionModels: ExecutionModel[]
  maxWorkers: number
  walkForward: WalkForwardConfig
  reportFormat: string
  reportFormats: string[]
  resultsRetentionDays: number
}

export interface StrategySettings {
  evaluationIntervalSeconds: number
  evaluationScheduleLabel: string
  defaultRiskPerTrade: number
  maxPositionSize: number
  strategyConfigDirectory: string
  backtesting: BacktestingConfig
}

// =============================================================================
// Data Types — Intelligence Sources
// =============================================================================

export interface SecConfig {
  enabled: boolean
  userAgent: string
  rateLimitPerSecond: number
  form4CheckIntervalHours: number
  filing13FCheckIntervalHours: number
}

export interface DarkPoolConfig {
  enabled: boolean
  checkIntervalHours: number
  minVolume: number
  unusualMultiplier: number
}

export interface AnalystRatingsConfig {
  enabled: boolean
  providers: string[]
  checkIntervalHours: number
  minAccuracyPercent: number
}

export interface OptionsFlowConfig {
  enabled: boolean
  note: string
  providers: string[]
  checkIntervalHours: number
}

export interface WhaleTrackingConfig {
  enabled: boolean
  providers: string[]
  minTransactionUsd: number
  checkIntervalMinutes: number
}

export interface GuruTrackerConfig {
  sec: SecConfig
  darkPool: DarkPoolConfig
  analystRatings: AnalystRatingsConfig
  optionsFlow: OptionsFlowConfig
  whaleTracking: WhaleTrackingConfig
}

export interface AnalystSchedule {
  id: string
  label: string
  cron: string
  cronLabel: string
  enabled: boolean
}

export interface MarketAnalystConfig {
  schedules: AnalystSchedule[]
  confidenceThresholds: { stocks: number; crypto: number }
  scoringWeights: { technical: number; sentiment: number; diversification: number }
  topNPublished: { stocks: number; crypto: number }
  watchlistFocused: boolean
}

export interface SignalGenerationConfig {
  minConsensusGurus: number
  minQualityScore: number
  expiryDays: number
}

export interface IntelligenceSettings {
  guruTracker: GuruTrackerConfig
  marketAnalyst: MarketAnalystConfig
  signalGeneration: SignalGenerationConfig
}

// =============================================================================
// Data Types — Trade Journal
// =============================================================================

export interface ScoringDimension {
  id: string
  label: string
  weight: number
  enabled: boolean
}

export interface BehavioralDetectionConfig {
  revengeTradingWindowMinutes: number
  overtradingThresholdPerDay: number
  positionSizeDriftPercent: number
}

export interface ReviewSchedule {
  weekly: { enabled: boolean; dayOfWeek: string }
  monthly: { enabled: boolean; dayOfMonth: number }
}

export interface JournalSettings {
  requirePreTradeNotes: boolean
  requirePostTradeNotes: boolean
  reviewPromptDelayHours: number
  scoringDimensions: ScoringDimension[]
  behavioralDetection: BehavioralDetectionConfig
  reviewSchedule: ReviewSchedule
  habitScoring: { enabled: boolean; lookbackTrades: number }
}

// =============================================================================
// Data Types — Notifications & Alerts
// =============================================================================

export type ChannelType = 'email' | 'slack' | 'discord' | 'sms' | 'pwa_push'
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface NotificationChannel {
  id: string
  type: ChannelType
  label: string
  icon: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface QuietHoursConfig {
  enabled: boolean
  start: string
  end: string
  timezone: string
  allowCritical: boolean
}

export interface NotificationRetryConfig {
  maxAttempts: number
  delaySeconds: number
  batchSize: number
}

export interface AlertSubscription {
  alertType: string
  email: boolean
  slack: boolean
  discord: boolean
  sms: boolean
  push: boolean
}

export interface NotificationPreferences {
  defaultSeverityThreshold: SeverityLevel
  severityLevels: SeverityLevel[]
  quietHours: QuietHoursConfig
  rateLimits: { perUserPerHour: number; perUserPerDay: number }
  retryConfig: NotificationRetryConfig
  subscriptionMatrix: AlertSubscription[]
}

// =============================================================================
// Data Types — Calendar & Display
// =============================================================================

export interface CalendarProvider {
  id: string
  eventType: string
  provider: string
  providers: string[]
  refreshCron: string
  refreshLabel: string
  enabled: boolean
}

export interface AlertTiming {
  eventType: string
  daysBefore?: number
  hoursBefore?: number
}

export interface DisplayConfig {
  timezone: string
  availableTimezones: string[]
  weekStart: string
  theme: 'dark' | 'light'
  dashboardRefreshSeconds: number
  priceStalenessSeconds: number
  orderStalenessSeconds: number
}

export interface CalendarDisplaySettings {
  calendarProviders: CalendarProvider[]
  alertTiming: AlertTiming[]
  economicCalendarCountries: string[]
  availableCountries: string[]
  display: DisplayConfig
}

// =============================================================================
// Component Props — Settings Overview
// =============================================================================

export interface SettingsOverviewProps {
  /** The 10 settings category cards to display on the overview page */
  categories: SettingsCategory[]
  /** Called when user clicks a category card to drill into its detail page */
  onNavigateToCategory?: (categoryId: string) => void
}

// =============================================================================
// Component Props — Broker Gateways
// =============================================================================

export interface BrokerGatewaysProps {
  /** List of configured broker gateways */
  brokers: BrokerGateway[]
  /** Called when user saves changes to a broker's configuration */
  onSave?: (brokerId: string, config: Partial<BrokerGatewayConfig>) => void
  /** Called when user clicks "Test Connection" for a broker */
  onTestConnection?: (brokerId: string) => void
  /** Called when user toggles a broker enabled/disabled */
  onToggleEnabled?: (brokerId: string, enabled: boolean) => void
  /** Called when user requests to reveal a masked credential */
  onRevealCredential?: (brokerId: string, field: 'apiKey' | 'secret') => void
  /** Called when user requests to rotate/regenerate a credential */
  onRotateCredential?: (brokerId: string, field: 'apiKey' | 'secret') => void
  /** Called when user navigates back to the settings overview */
  onBack?: () => void
}

// =============================================================================
// Component Props — Market Data Pipeline
// =============================================================================

export interface MarketDataPipelineProps {
  /** Configured data sources ordered by priority */
  dataSources: DataSource[]
  /** Data retention tier configuration */
  retentionTiers: RetentionTier[]
  /** Quality score thresholds */
  qualityThresholds: QualityThresholds
  /** Instruments being tracked for data collection */
  trackedInstruments: TrackedInstrument[]
  /** Called when user reorders data source priority */
  onReorderSources?: (sourceIds: string[]) => void
  /** Called when user toggles a data source enabled/disabled */
  onToggleSource?: (sourceId: string, enabled: boolean) => void
  /** Called when user updates a source's fetch schedule */
  onUpdateSchedule?: (sourceId: string, schedule: string) => void
  /** Called when user updates quality thresholds */
  onUpdateThresholds?: (thresholds: Partial<QualityThresholds>) => void
  /** Called when user updates retention tier config */
  onUpdateRetention?: (tierId: string, retentionDays: number) => void
  /** Called when user adds an instrument to tracking */
  onAddInstrument?: (symbol: string) => void
  /** Called when user removes an instrument from tracking */
  onRemoveInstrument?: (symbol: string) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Portfolio & Currency
// =============================================================================

export interface PortfolioCurrencyProps {
  /** Portfolio configuration settings */
  settings: PortfolioSettings
  /** Called when user changes the base currency */
  onChangeBaseCurrency?: (currency: string) => void
  /** Called when user adds/removes a supported currency */
  onToggleCurrency?: (currency: string, enabled: boolean) => void
  /** Called when user toggles a benchmark enabled/disabled */
  onToggleBenchmark?: (benchmarkId: string, enabled: boolean) => void
  /** Called when user updates margin alert thresholds */
  onUpdateMarginThresholds?: (thresholds: Partial<MarginAlertThresholds>) => void
  /** Called when user updates reconciliation settings */
  onUpdateReconciliation?: (config: Partial<ReconciliationConfig>) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Risk Management
// =============================================================================

export interface RiskManagementProps {
  /** Risk limit settings with current and default values */
  riskSettings: RiskSetting[]
  /** Circuit breaker configuration */
  circuitBreaker: RiskCircuitBreaker
  /** Called when user adjusts a risk limit value */
  onUpdateRiskSetting?: (settingId: string, value: number) => void
  /** Called when user resets a risk setting to its default */
  onResetToDefault?: (settingId: string) => void
  /** Called when user updates circuit breaker config */
  onUpdateCircuitBreaker?: (config: Partial<RiskCircuitBreaker>) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Tax Configuration
// =============================================================================

export interface TaxConfigurationProps {
  /** Tax configuration settings */
  settings: TaxSettings
  /** Called when user updates tax rate */
  onUpdateTaxRate?: (rate: number) => void
  /** Called when user updates exemption holding period */
  onUpdateExemptionDays?: (days: number) => void
  /** Called when user toggles CNB sync */
  onToggleCnbSync?: (enabled: boolean) => void
  /** Called when user toggles a report format */
  onToggleReportFormat?: (formatId: string, enabled: boolean) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Strategy & Backtesting
// =============================================================================

export interface StrategyBacktestingProps {
  /** Strategy and backtesting configuration */
  settings: StrategySettings
  /** Called when user updates evaluation interval */
  onUpdateEvaluationInterval?: (seconds: number) => void
  /** Called when user updates backtesting defaults */
  onUpdateBacktesting?: (config: Partial<BacktestingConfig>) => void
  /** Called when user updates walk-forward config */
  onUpdateWalkForward?: (config: Partial<WalkForwardConfig>) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Intelligence Sources
// =============================================================================

export interface IntelligenceSourcesProps {
  /** Intelligence source configuration */
  settings: IntelligenceSettings
  /** Called when user toggles an intelligence source */
  onToggleSource?: (source: string, enabled: boolean) => void
  /** Called when user updates guru tracker config */
  onUpdateGuruTracker?: (config: Partial<GuruTrackerConfig>) => void
  /** Called when user updates market analyst config */
  onUpdateMarketAnalyst?: (config: Partial<MarketAnalystConfig>) => void
  /** Called when user updates signal generation config */
  onUpdateSignalGeneration?: (config: Partial<SignalGenerationConfig>) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Trade Journal Settings
// =============================================================================

export interface TradeJournalSettingsProps {
  /** Journal configuration settings */
  settings: JournalSettings
  /** Called when user toggles pre/post trade note requirements */
  onToggleNoteRequirement?: (field: 'requirePreTradeNotes' | 'requirePostTradeNotes', enabled: boolean) => void
  /** Called when user updates a scoring dimension weight */
  onUpdateScoringWeight?: (dimensionId: string, weight: number) => void
  /** Called when user toggles a scoring dimension */
  onToggleScoringDimension?: (dimensionId: string, enabled: boolean) => void
  /** Called when user updates behavioral detection thresholds */
  onUpdateBehavioralDetection?: (config: Partial<BehavioralDetectionConfig>) => void
  /** Called when user updates review schedule */
  onUpdateReviewSchedule?: (schedule: Partial<ReviewSchedule>) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Notifications & Alerts
// =============================================================================

export interface NotificationsAlertsProps {
  /** Configured notification delivery channels */
  channels: NotificationChannel[]
  /** Notification preferences and subscription matrix */
  preferences: NotificationPreferences
  /** Called when user toggles a notification channel */
  onToggleChannel?: (channelId: string, enabled: boolean) => void
  /** Called when user updates channel configuration */
  onUpdateChannel?: (channelId: string, config: Record<string, unknown>) => void
  /** Called when user reveals a masked credential */
  onRevealCredential?: (channelId: string, field: string) => void
  /** Called when user rotates a credential */
  onRotateCredential?: (channelId: string, field: string) => void
  /** Called when user updates quiet hours */
  onUpdateQuietHours?: (config: Partial<QuietHoursConfig>) => void
  /** Called when user toggles an alert subscription */
  onToggleSubscription?: (alertType: string, channel: string, enabled: boolean) => void
  /** Called when user updates severity threshold */
  onUpdateSeverityThreshold?: (level: SeverityLevel) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

// =============================================================================
// Component Props — Calendar & Display
// =============================================================================

export interface CalendarDisplayProps {
  /** Calendar and display configuration */
  settings: CalendarDisplaySettings
  /** Called when user toggles a calendar provider */
  onToggleProvider?: (providerId: string, enabled: boolean) => void
  /** Called when user changes a provider's data source */
  onChangeProvider?: (providerId: string, provider: string) => void
  /** Called when user updates alert timing */
  onUpdateAlertTiming?: (eventType: string, value: number) => void
  /** Called when user toggles an economic calendar country */
  onToggleCountry?: (country: string, enabled: boolean) => void
  /** Called when user changes timezone */
  onChangeTimezone?: (timezone: string) => void
  /** Called when user toggles theme */
  onToggleTheme?: (theme: 'dark' | 'light') => void
  /** Called when user updates refresh interval */
  onUpdateRefreshInterval?: (seconds: number) => void
  /** Called when user saves all changes */
  onSave?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}
