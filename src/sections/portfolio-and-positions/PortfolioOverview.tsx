import data from '@/../product/sections/portfolio-and-positions/data.json'
import { PortfolioOverview } from './components/PortfolioOverview'

export default function PortfolioOverviewPreview() {
  return (
    <PortfolioOverview
      aggregatedOverview={data.aggregatedOverview as any}
      portfolios={data.portfolios as any}
      onViewPortfolio={(id) => console.log('View portfolio:', id)}
      onConnectBroker={() => console.log('Connect broker')}
    />
  )
}
