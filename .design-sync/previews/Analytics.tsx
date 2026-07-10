import { Analytics } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}

export const Overview = () => (
  <div style={{ padding: 16 }}>
    <Analytics
      performanceMetrics={data.performanceMetrics as any}
      processScoreAnalytics={data.processScoreAnalytics as any}
      attributionData={data.attributionData as any}
      portfolios={data.portfolios as any}
      onPortfolioFilter={noop}
      onPeriodChange={noop}
    />
  </div>
)
