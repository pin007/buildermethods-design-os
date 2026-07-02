import data from '@/../product/sections/trade-journal/data.json'
import type {
  PerformanceMetrics,
  ProcessScoreAnalytics,
  AttributionData,
  Portfolio,
  AnalyticsPeriod,
} from '@/../product/sections/trade-journal/types'
import { Analytics } from './components/Analytics'

export default function AnalyticsPreview() {
  return (
    <Analytics
      performanceMetrics={data.performanceMetrics as unknown as PerformanceMetrics}
      processScoreAnalytics={data.processScoreAnalytics as unknown as ProcessScoreAnalytics}
      attributionData={data.attributionData as unknown as AttributionData}
      portfolios={data.portfolios as unknown as Portfolio[]}
      onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
      onPeriodChange={(period) => console.log('Period change:', period)}
    />
  )
}
