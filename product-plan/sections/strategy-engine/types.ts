// =============================================================================
// Data Types
// =============================================================================

export type StrategyType = 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'COMPOSITE'

export type ExitStrategyType = 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'BREAK_EVEN'

export type BacktestStatus = 'queued' | 'running' | 'completed' | 'failed'

export type ExecutionModel = 'SIMPLE' | 'VOLUME_BASED' | 'SPREAD_BASED'

export type DataGranularity = 'DAILY' | 'HOURLY' | 'MINUTE'

export type ScheduleFrequency = 'daily' | 'interval'

export type OverfittingRisk = 'LOW' | 'MEDIUM' | 'HIGH'

export type TradeDirection = 'LONG' | 'SHORT'

export type BacktestRecommendation = 'PASS' | 'FAIL' | 'REVIEW'

export type ParameterStability = 'HIGH' | 'MEDIUM' | 'LOW'

export type WarningType = 'LOW_TRADE_COUNT' | 'POSSIBLE_OVERFITTING' | 'HIGH_DRAWDOWN' | 'SURVIVORSHIP_BIAS' | 'LOOK_AHEAD_BIAS'

export type WarningSeverity = 'info' | 'warning' | 'error'

// ── Strategy ────────────────────────────────────────────────────────────────

export interface StrategyParameter {
  name: string
  value: number | string
  description: string
  type: 'number' | 'string'
}

export interface ExitStrategyConfig {
  type: ExitStrategyType
  enabled: boolean
  parameters: StrategyParameter[]
}

export interface PositionSizing {
  riskPerTrade: number
  maxPosition: number
  volatilityAdjustment: boolean
}

export interface StrategySchedule {
  enabled: boolean
  frequency: ScheduleFrequency
  intervalMinutes?: number
  time: string | null
  timezone: string
}

export interface LastBacktestSummary {
  backtestId: string
  date: string
  sharpe: number
  cagr: number
  maxDrawdown: number
}

export interface Strategy {
  id: string
  name: string
  type: StrategyType
  description: string
  active: boolean
  createdAt: string
  updatedAt: string
  instruments: string[]
  parameters: StrategyParameter[]
  exitStrategies: ExitStrategyConfig[]
  exitPriority?: ExitStrategyType[]
  positionSizing: PositionSizing
  schedule: StrategySchedule
  lastBacktest: LastBacktestSummary | null
}

// ── Backtest ────────────────────────────────────────────────────────────────

export interface BacktestMetrics {
  totalReturn: number
  cagr: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgHoldingDays: number
}

export interface BacktestDetailMetrics extends BacktestMetrics {
  calmarRatio: number
  maxDrawdownDuration: number
  tradesPerYear: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  volatility: number
  var95: number
  cvar95: number
}

export interface Backtest {
  id: string
  strategyId: string
  strategyName: string
  status: BacktestStatus
  startDate: string
  endDate: string
  initialCapital: number
  executionModel: ExecutionModel
  dataGranularity: DataGranularity
  commission: number
  slippage: number | null
  indicatorSnapshots: boolean
  benchmarks: string[]
  createdAt: string
  completedAt: string | null
  duration: number | null
  progress?: number
  estimatedRemaining?: number
  estimatedDuration?: number
  errorMessage?: string
  metrics: BacktestMetrics | null
}

// ── Backtest Detail ─────────────────────────────────────────────────────────

export interface EquityCurvePoint {
  date: string
  strategy: number
  spy: number
  buyAndHold: number
}

export interface MonthlyReturn {
  year: number
  month: number
  return: number
}

export interface IndicatorSnapshot {
  [indicatorName: string]: number
}

export interface TradeIndicatorSnapshots {
  entry: IndicatorSnapshot
  exit: IndicatorSnapshot
}

export interface BacktestTrade {
  tradeNumber: number
  entryDate: string
  exitDate: string
  instrument: string
  direction: TradeDirection
  quantity: number
  entryPrice: number
  exitPrice: number
  pnl: number
  returnPct: number
  holdingDays: number
  indicatorSnapshots: TradeIndicatorSnapshots | null
}

export interface BenchmarkComparison {
  benchmark: string
  strategyCagr: number
  benchmarkCagr: number
  alpha: number
  strategySharpe: number
  benchmarkSharpe: number
  excessSharpe: number
  beta: number
  informationRatio: number
  strategyMaxDrawdown: number
  benchmarkMaxDrawdown: number
}

export interface AntiPatternWarning {
  type: WarningType
  severity: WarningSeverity
  message: string
  recommendation: string
}

export interface BacktestDetail {
  backtestId: string
  strategyId: string
  strategyName: string
  testPeriod: string
  initialCapital: number
  finalValue: number
  recommendation: BacktestRecommendation
  recommendationText: string
  metrics: BacktestDetailMetrics
  spyBenchmark: {
    sharpeRatio: number
    cagr: number
    maxDrawdown: number
  }
  benchmarkComparisons: BenchmarkComparison[]
  equityCurve: EquityCurvePoint[]
  monthlyReturns: MonthlyReturn[]
  trades: BacktestTrade[]
  antiPatternWarnings: AntiPatternWarning[]
}

// ── Walk-Forward Optimization ───────────────────────────────────────────────

export interface WalkForwardOptimization {
  id: string
  strategyId: string
  strategyName: string
  status: BacktestStatus
  startDate: string
  endDate: string
  trainingWindowMonths: number
  validationWindowMonths: number
  stepMonths: number
  totalWindows: number
  totalIterations: number
  paramGrid: Record<string, number[]>
  createdAt: string
  completedAt: string | null
  duration: number | null
  avgValidationSharpe: number
  avgValidationReturn: number
  overfittingRisk: OverfittingRisk
  overfittingRatio: number
}

export interface WalkForwardWindow {
  windowNumber: number
  trainStart: string
  trainEnd: string
  valStart: string
  valEnd: string
  bestParams: Record<string, number>
  trainSharpe: number
  valSharpe: number
  valReturn: number
}

export interface ParameterStabilityData {
  paramName: string
  values: number[]
  stability: ParameterStability
  mostFrequent: number
}

export interface WalkForwardDetail {
  optimizationId: string
  strategyId: string
  strategyName: string
  avgValidationSharpe: number
  avgValidationReturn: number
  overfittingRisk: OverfittingRisk
  overfittingRatio: number
  inSampleAvgSharpe: number
  windows: WalkForwardWindow[]
  parameterStability: ParameterStabilityData[]
}

// ── Strategy Comparison ─────────────────────────────────────────────────────

export interface ComparisonStrategy {
  backtestId: string
  strategyName: string
  rank: number
  cagr: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgHoldingDays: number
}

export interface NormalizedEquityCurvePoint {
  date: string
  [strategyKey: string]: string | number
}

export interface ComparisonData {
  backtestIds: string[]
  strategies: ComparisonStrategy[]
  normalizedEquityCurves: NormalizedEquityCurvePoint[]
}

// ── Strategy Types Catalog ──────────────────────────────────────────────────

export interface StrategyTypeCatalogItem {
  id: StrategyType
  label: string
  description: string
  defaultParameters: StrategyParameter[]
}

// ── Instruments ─────────────────────────────────────────────────────────────

export interface Instrument {
  symbol: string
  name: string
  exchange: string
  type: 'stock' | 'crypto' | 'option' | 'forex' | 'future'
}

// =============================================================================
// Component Props
// =============================================================================

/** Props for the Strategy List (main view) */
export interface StrategyListProps {
  strategies: Strategy[]
  backtests: Backtest[]
  /** Called when user clicks a strategy card to view its detail */
  onViewStrategy?: (id: string) => void
  /** Called when user toggles a strategy's active state */
  onToggleActive?: (id: string, active: boolean) => void
  /** Called when user clicks "New Strategy" */
  onCreateStrategy?: () => void
  /** Called when user selects strategies and clicks "Compare" */
  onCompareStrategies?: (strategyIds: string[]) => void
  /** Called when user wants to delete a strategy */
  onDeleteStrategy?: (id: string) => void
}

/** Props for the Strategy Detail view (tabbed layout) */
export interface StrategyDetailProps {
  strategy: Strategy
  backtests: Backtest[]
  walkForwardOptimizations: WalkForwardOptimization[]
  /** Called when user clicks "Edit" on the configuration tab */
  onEditStrategy?: (id: string) => void
  /** Called when user toggles active state */
  onToggleActive?: (id: string, active: boolean) => void
  /** Called when user clicks "Run Backtest" */
  onRunBacktest?: (strategyId: string) => void
  /** Called when user clicks a backtest row to view results */
  onViewBacktest?: (backtestId: string) => void
  /** Called when user clicks "Run Walk-Forward" */
  onRunWalkForward?: (strategyId: string) => void
  /** Called when user clicks a walk-forward row to view results */
  onViewWalkForward?: (optimizationId: string) => void
  /** Called when user changes the active tab */
  onTabChange?: (tab: 'configuration' | 'backtests' | 'walk-forward') => void
}

/** Props for the New Strategy / Edit Strategy form */
export interface StrategyFormProps {
  strategyTypes: StrategyTypeCatalogItem[]
  instruments: Instrument[]
  /** The strategy being edited (null for new) */
  existingStrategy?: Strategy | null
  /** Called when user saves the strategy */
  onSave?: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'lastBacktest'>) => void
  /** Called when user cancels the form */
  onCancel?: () => void
}

/** Props for the Backtest Configuration modal */
export interface BacktestConfigProps {
  strategyId: string
  strategyName: string
  /** Called when user submits the backtest configuration */
  onRunBacktest?: (config: {
    startDate: string
    endDate: string
    initialCapital: number
    executionModel: ExecutionModel
    dataGranularity: DataGranularity
    commission: number
    slippage: number | null
    indicatorSnapshots: boolean
    benchmarks: string[]
  }) => void
  /** Called when user closes the modal */
  onClose?: () => void
}

/** Props for the Backtest Results view */
export interface BacktestResultsProps {
  detail: BacktestDetail
  /** Called when user navigates back to strategy detail */
  onBack?: () => void
  /** Called when user wants to re-run this backtest with same config */
  onRerun?: (backtestId: string) => void
  /** Called when user wants to compare this backtest with others */
  onCompare?: (backtestId: string) => void
}

/** Props for the Walk-Forward Configuration modal */
export interface WalkForwardConfigProps {
  strategyId: string
  strategyName: string
  strategyParameters: StrategyParameter[]
  /** Called when user submits the walk-forward configuration */
  onRunOptimization?: (config: {
    startDate: string
    endDate: string
    trainingWindowMonths: number
    validationWindowMonths: number
    stepMonths: number
    paramGrid: Record<string, number[]>
  }) => void
  /** Called when user closes the modal */
  onClose?: () => void
}

/** Props for the Walk-Forward Results view */
export interface WalkForwardResultsProps {
  detail: WalkForwardDetail
  /** Called when user navigates back to strategy detail */
  onBack?: () => void
}

/** Props for the Strategy Comparison view */
export interface StrategyComparisonProps {
  comparison: ComparisonData
  /** Called when user navigates back to strategy list */
  onBack?: () => void
  /** Called when user clicks a strategy to view its backtest detail */
  onViewBacktest?: (backtestId: string) => void
}

/** Props for the full Strategy Engine section (top-level orchestrator) */
export interface StrategyEngineProps {
  strategies: Strategy[]
  backtests: Backtest[]
  backtestDetail: BacktestDetail
  walkForwardOptimizations: WalkForwardOptimization[]
  walkForwardDetail: WalkForwardDetail
  comparisonData: ComparisonData
  strategyTypes: StrategyTypeCatalogItem[]
  instruments: Instrument[]
  // Strategy list actions
  onViewStrategy?: (id: string) => void
  onToggleActive?: (id: string, active: boolean) => void
  onCreateStrategy?: () => void
  onDeleteStrategy?: (id: string) => void
  // Strategy detail actions
  onEditStrategy?: (id: string) => void
  onRunBacktest?: (strategyId: string) => void
  onViewBacktest?: (backtestId: string) => void
  onRunWalkForward?: (strategyId: string) => void
  onViewWalkForward?: (optimizationId: string) => void
  // Strategy form actions
  onSaveStrategy?: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'lastBacktest'>) => void
  // Backtest config actions
  onSubmitBacktestConfig?: (strategyId: string, config: {
    startDate: string
    endDate: string
    initialCapital: number
    executionModel: ExecutionModel
    dataGranularity: DataGranularity
    commission: number
    slippage: number | null
    indicatorSnapshots: boolean
    benchmarks: string[]
  }) => void
  // Walk-forward config actions
  onSubmitWalkForwardConfig?: (strategyId: string, config: {
    startDate: string
    endDate: string
    trainingWindowMonths: number
    validationWindowMonths: number
    stepMonths: number
    paramGrid: Record<string, number[]>
  }) => void
  // Backtest results actions
  onRerunBacktest?: (backtestId: string) => void
  // Comparison actions
  onCompareStrategies?: (strategyIds: string[]) => void
  onCompareBacktests?: (backtestIds: string[]) => void
  // Navigation
  onTabChange?: (tab: string) => void
  onBack?: () => void
}
