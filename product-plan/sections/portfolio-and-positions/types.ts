// =============================================================================
// Enums & Union Types
// =============================================================================

export type AssetType = 'stock' | 'option' | 'crypto' | 'forex' | 'futures'

export type BrokerStatus = 'connected' | 'disconnected' | 'error'

export type TaxStatus = 'taxable' | 'exempt'

export type PositionStatus = 'open' | 'closed'

export type AllocationView = 'portfolio' | 'broker' | 'assetType'

export type EquityCurvePeriod = '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'

export type DividendPeriod = 'monthly' | 'quarterly' | 'annual'

export type BenchmarkPeriod = 'MTD' | 'QTD' | 'YTD' | '1Y' | '3Y' | 'inception'

export type OrderSide = 'BUY' | 'SELL'

// =============================================================================
// Data Types
// =============================================================================

export interface Broker {
  id: string
  name: string
  shortName: string
  status: BrokerStatus
  assetTypes: AssetType[]
  baseCurrency: string
  connectedAt: string
}

export interface Instrument {
  id: string
  symbol: string
  name: string
  assetType: AssetType
  exchange: string
  currency: string
  currentPrice: number
  dayChange: number
  dayChangePercent: number
}

export interface EquityCurvePoint {
  date: string
  value: number
}

export interface EquityCurvePointUsd {
  date: string
  valueUsd: number
}

export interface AllocationSlice {
  name: string
  value: number
  percent: number
}

export interface AllocationSliceUsd {
  name: string
  valueUsd: number
  percent: number
}

// --- Aggregated Overview ---

export interface AggregatedOverview {
  totalNetWorthUsd: number
  totalDayPnLUsd: number
  totalDayPnLPercent: number
  totalCashUsd: number
  totalUnrealizedPnLUsd: number
  totalUnrealizedPnLPercent: number
  portfolioCount: number
  positionCount: number
  combinedEquityCurve: EquityCurvePointUsd[]
  allocationByPortfolio: AllocationSliceUsd[]
  allocationByBroker: AllocationSliceUsd[]
  allocationByAssetType: AllocationSliceUsd[]
}

// --- Portfolio ---

export interface Portfolio {
  id: string
  name: string
  currency: string
  brokerId: string
  totalValue: number
  totalPositionsValue: number
  cashBalance: number
  dayPnL: number
  dayPnLPercent: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  positionCount: number
  hasMargin: boolean
  equityCurve: EquityCurvePoint[]
  allocation: AllocationSlice[]
}

// --- Positions & Cost Lots ---

export interface CostLot {
  id: string
  acquiredAt: string
  originalQuantity: number
  remainingQuantity: number
  costPerUnit: number
  totalCost: number
  currentValue: number
  unrealizedPnL: number
  daysHeld: number
  taxExemptionDate: string
}

export interface Position {
  id: string
  portfolioId: string
  instrumentId: string
  symbol: string
  instrumentName: string
  brokerId: string
  brokerShortName: string
  quantity: number
  avgCostBasis: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  dayChange: number
  dayChangePercent: number
  weightPercent: number
  currency: string
  taxStatus: TaxStatus
  earliestAcquisition: string
  daysHeld: number
  taxExemptionDate: string
  status: PositionStatus
  costLots: CostLot[]
}

// --- Watchlists ---

export interface WatchlistItem {
  id: string
  instrumentId: string
  symbol: string
  instrumentName: string
  currentPrice: number
  dayChange: number
  dayChangePercent: number
  notes: string
  alertPriceAbove: number | null
  alertPriceBelow: number | null
  alertTriggered: boolean
  addedAt: string
}

export interface Watchlist {
  id: string
  name: string
  itemCount: number
  createdAt: string
  items: WatchlistItem[]
}

// --- Dividends ---

export interface Dividend {
  id: string
  positionId: string
  portfolioId: string
  instrumentId: string
  symbol: string
  exDate: string
  payDate: string
  amountPerShare: number
  quantity: number
  totalUsd: number
  totalCzk: number
  withholdingTaxUsd: number
  exchangeRateCzkUsd: number
  isDrip: boolean
}

export interface DividendSummaryEntry {
  periodStart: string
  periodEnd: string
  totalUsd: number
  totalCzk: number
}

export interface DividendSummary {
  portfolioId: string
  period: DividendPeriod
  summaries: DividendSummaryEntry[]
}

export interface UpcomingDividend {
  instrumentId: string
  symbol: string
  instrumentName: string
  exDate: string
  estimatedAmountPerShare: number
  quantityHeld: number
  estimatedTotal: number
}

export interface YieldMetric {
  positionId: string
  symbol: string
  instrumentName: string
  yieldOnCostPercent: number
  currentYieldPercent: number
  annualIncomeUsd: number
  annualIncomeCzk: number
}

// --- Performance ---

export interface BenchmarkSeriesPoint {
  date: string
  portfolioReturn: number
  benchmarkReturn: number
}

export interface AttributionEntry {
  symbol: string
  instrumentName: string
  contributionPercent: number
}

export interface BenchmarkComparison {
  portfolioId: string
  benchmark: string
  benchmarkName: string
  period: BenchmarkPeriod
  portfolioReturnPercent: number
  benchmarkReturnPercent: number
  alphaPercent: number
  series: BenchmarkSeriesPoint[]
  attribution: AttributionEntry[]
}

// --- Margin ---

export interface MarginCallRiskEntry {
  symbol: string
  priceDropPercentToCall: number
}

export interface MarginInfo {
  portfolioId: string
  marginUsed: number
  marginAvailable: number
  marginUsagePercent: number
  buyingPower: number
  marginCallDistancePercent: number
  alertThresholdPercent: number
  alertTriggered: boolean
  marginCallRisk: MarginCallRiskEntry[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface PortfolioOverviewProps {
  /** Aggregated stats and charts across all portfolios */
  aggregatedOverview: AggregatedOverview
  /** Individual portfolios for the list table */
  portfolios: Portfolio[]
  /** Called when user clicks a portfolio row to drill into detail */
  onViewPortfolio?: (portfolioId: string) => void
  /** Called when user clicks "Connect Broker" in empty state */
  onConnectBroker?: () => void
}

export interface PortfolioDetailProps {
  /** The selected portfolio */
  portfolio: Portfolio
  /** Positions within this portfolio */
  positions: Position[]
  /** User's watchlists */
  watchlists: Watchlist[]
  /** Dividend history for this portfolio */
  dividends: Dividend[]
  /** Dividend summaries grouped by period */
  dividendSummaries: DividendSummary[]
  /** Upcoming dividend ex-dates */
  upcomingDividends: UpcomingDividend[]
  /** Yield metrics per position */
  yieldMetrics: YieldMetric[]
  /** Benchmark comparison data */
  benchmarkComparison: BenchmarkComparison | null
  /** Margin info (null if portfolio has no margin) */
  marginInfo: MarginInfo | null
  /** Called when user clicks "Trade" on a position row */
  onTradePosition?: (symbol: string) => void
  /** Called when user clicks "Close" on a position to sell full quantity */
  onClosePosition?: (symbol: string, quantity: number) => void
  /** Called when user clicks "Set Alert" on a position (future) */
  onSetPositionAlert?: (positionId: string) => void
  /** Called when user clicks "New Order" in positions empty state */
  onCreateOrder?: () => void
  /** Called when user clicks "Trade" on a watchlist item */
  onTradeWatchlistItem?: (symbol: string) => void
  /** Called when user creates a new watchlist */
  onCreateWatchlist?: (name: string) => void
  /** Called when user renames a watchlist */
  onRenameWatchlist?: (watchlistId: string, newName: string) => void
  /** Called when user deletes a watchlist */
  onDeleteWatchlist?: (watchlistId: string) => void
  /** Called when user adds an instrument to a watchlist */
  onAddWatchlistItem?: (watchlistId: string, instrumentId: string, notes?: string) => void
  /** Called when user removes an item from a watchlist */
  onRemoveWatchlistItem?: (watchlistId: string, itemId: string) => void
  /** Called when user edits a watchlist item's notes or alerts */
  onEditWatchlistItem?: (watchlistId: string, itemId: string, updates: Partial<Pick<WatchlistItem, 'notes' | 'alertPriceAbove' | 'alertPriceBelow'>>) => void
  /** Called when user changes the benchmark selection */
  onChangeBenchmark?: (benchmark: string) => void
  /** Called when user changes the benchmark period */
  onChangeBenchmarkPeriod?: (period: BenchmarkPeriod) => void
  /** Called when user navigates back to the overview */
  onBack?: () => void
}
