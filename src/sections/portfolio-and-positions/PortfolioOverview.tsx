import data from '@/../product/sections/portfolio-and-positions/data.json'
import { PortfolioOverview } from './components/PortfolioOverview'

const BASE = '/sections/portfolio-and-positions/screen-designs'

function navigate(screen: string, id?: string) {
  const q = id ? `?id=${encodeURIComponent(id)}` : ''
  window.location.href = `${BASE}/${screen}/fullscreen${q}`
}

export default function PortfolioOverviewPreview() {
  return (
    <PortfolioOverview
      aggregatedOverview={data.aggregatedOverview as any}
      portfolios={data.portfolios as any}
      onViewPortfolio={(id) => navigate('PortfolioDetail', id)}
      onConnectBroker={() => console.log('Connect broker')}
    />
  )
}
