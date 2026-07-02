// =============================================================================
// Trading Squad — UI Data Shapes (core entities)
// Frontend data contract — the shapes components expect as props.
// Translate to Python dataclasses / Pydantic models as needed.
// =============================================================================

// =============================================================================
// Enums & Union Types
// =============================================================================

export type OrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'submitted'
  | 'acknowledged'
  | 'partially_filled'
  | 'filled'
  | 'cancelled'
  | 'rejected'
  | 'expired'
  | 'amended'
  | 'failed'

export type OrderSide = 'BUY' | 'SELL'

export type OrderType = 'market' | 'limit' | 'stop_loss'

export type TimeInForce = 'DAY' | 'GTC' | 'GTD' | 'IOC' | 'FOK'

export type AssetType = 'stock' | 'option' | 'crypto' | 'forex' | 'futures'

export type BrokerStatus = 'connected' | 'disconnected' | 'error'

export type BracketRole = 'parent' | 'stop_loss' | 'take_profit'

export type RiskLevel = 'low' | 'medium' | 'high'

export type RecommendationStatus = 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'expired'

export type ActivityType = 'fill' | 'cancelled' | 'rejected' | 'submitted' | 'approved'

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

export interface DashboardStats {
  portfolioValue: number
  dayPnL: number
  dayPnLPercent: number
  cashAvailable: number
  pendingApprovals: number
  openOrders: number
}

export interface Portfolio {
  id: string
  name: string
  currency: string
  brokerId: string
  dashboardStats: DashboardStats
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
  week52High: number
  week52Low: number
  recentVolatility: number
}

export interface RiskAnalysis {
  portfolioImpactPercent: number
  positionSizePercent: number
  cashBalanceAfter: number
  riskLevel: RiskLevel
  warnings: string[]
}

export interface ApprovalContext {
  expiresAt: string
  riskAnalysis: RiskAnalysis
}

export interface AmendedField {
  from: number
  to: number
}

export interface Order {
  id: string
  portfolioId: string
  instrumentId: string
  symbol: string
  instrumentName: string
  side: OrderSide
  orderType: OrderType
  quantity: number
  limitPrice: number | null
  stopPrice: number | null
  status: OrderStatus
  brokerId: string
  brokerShortName: string
  timeInForce: TimeInForce
  bracketGroupId: string | null
  bracketRole: BracketRole | null
  recommendationId: string | null
  fillPrice: number | null
  filledQuantity: number
  commission: number | null
  createdAt: string
  updatedAt: string
  /** Present only on pending_approval orders */
  approvalContext?: ApprovalContext
  /** Present only on rejected orders */
  rejectionReason?: string
  /** Present only on failed orders */
  errorMessage?: string
  /** Present only on amended orders */
  amendedFields?: Record<string, AmendedField>
  /** Present only on OCO child legs */
  ocoLinkedOrderId?: string
}

export interface OrderEvent {
  id: string
  orderId: string
  status: OrderStatus
  timestamp: string
  message: string
  data: Record<string, unknown>
}

export interface Trade {
  id: string
  orderId: string
  instrumentId: string
  symbol: string
  side: OrderSide
  quantity: number
  price: number
  total: number
  commission: number
  currency: string
  brokerId: string
  executedAt: string
}

export interface TargetPrices {
  entry: number
  target: number
  stopLoss: number
}

export interface Recommendation {
  id: string
  instrumentId: string
  symbol: string
  instrumentName: string
  portfolioId: string
  action: OrderSide
  quantity: number
  orderType: OrderType
  confidence: number
  riskScore: number
  status: RecommendationStatus
  strategyName: string
  reasoning: string
  targetPrices: TargetPrices
  orderId: string | null
  createdAt: string
}

export interface RecentActivity {
  id: string
  type: ActivityType
  message: string
  orderId: string
  symbol: string
  timestamp: string
}
