import { DividendsTab } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

export const Populated = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <DividendsTab
      dividends={data.dividends as any}
      dividendSummaries={data.dividendSummaries as any}
      upcomingDividends={data.upcomingDividends as any}
      yieldMetrics={data.yieldMetrics as any}
    />
  </div>
)
