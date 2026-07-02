// =============================================================================
// Enums & Union Types
// =============================================================================

export type CalendarEventType = 'earnings' | 'economic' | 'dividend' | 'options' | 'ipo'

export type ImpactLevel = 'high' | 'medium' | 'low'

export type EarningsTiming = 'before_market' | 'after_market' | 'during_market'

export type DividendFrequency = 'quarterly' | 'semi_annual' | 'annual' | 'monthly' | 'special'

export type OptionsExpirationType = 'monthly' | 'weekly' | 'quarterly'

export type IpoStatus = 'upcoming' | 'pricing' | 'recent'

export type CalendarView = 'month' | 'week'

// =============================================================================
// Event Detail Types
// =============================================================================

export interface EarningsDetails {
  companyName: string
  fiscalQuarter: string
  timing: EarningsTiming
  epsEstimate: number | null
  epsPrior: number | null
  revenueEstimate: number | null
  revenuePrior: number | null
  confirmed: boolean
}

export interface EconomicDetails {
  indicator: string
  country: string
  eventTime: string
  timeZone: string
  consensus: number | null
  prior: number | null
  unit: string
  description: string
}

export interface DividendDetails {
  companyName: string
  exDate: string
  recordDate: string
  paymentDate: string
  amount: number
  currency: string
  yield: number
  frequency: DividendFrequency
  portfolioShares: number | null
  expectedPayment: number | null
}

export interface OptionsDetails {
  expirationType: OptionsExpirationType
  exchange: string
  isThirdFriday: boolean
  affectedPositions: OptionsPosition[]
}

export interface OptionsPosition {
  instrument: string
  option: string
  quantity: number
  currentValue: number
  itm: boolean
}

export interface IpoDetails {
  companyName: string
  ticker: string | null
  exchange: string
  priceLow: number | null
  priceHigh: number | null
  sharesOffered: number | null
  valuation: number | null
  leadUnderwriters: string[]
  industry: string
  status: IpoStatus
}

// =============================================================================
// Core Data Types
// =============================================================================

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  date: string
  instrument: string | null
  impact: ImpactLevel
  inPortfolio: boolean
  details: EarningsDetails | EconomicDetails | DividendDetails | OptionsDetails | IpoDetails
}

export interface CalendarStats {
  thisWeekTotal: number
  thisWeekByType: Record<CalendarEventType, number>
  portfolioEvents: number
  highImpactNext7Days: number
  upcomingDividendIncome: number
  upcomingDividendCurrency: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface CalendarDashboardProps {
  /** Summary stats for the stats bar */
  stats: CalendarStats
  /** All calendar events to display */
  events: CalendarEvent[]
  /** Called when user creates an alert for an event */
  onCreateAlert?: (eventId: string) => void
  /** Called when user clicks an instrument ticker to navigate */
  onViewInstrument?: (symbol: string) => void
  /** Called when user clicks "View Portfolio" from a portfolio event */
  onViewPortfolio?: () => void
}
