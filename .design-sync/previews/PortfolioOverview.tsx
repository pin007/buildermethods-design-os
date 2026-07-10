import { PortfolioOverview } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

export const FullScreen = () => (
  <div style={{ padding: 16 }}>
    <PortfolioOverview
      aggregatedOverview={data.aggregatedOverview as any}
      portfolios={data.portfolios as any}
      onViewPortfolio={() => {}}
      onConnectBroker={() => {}}
    />
  </div>
)

export const EmptyState = () => (
  <div style={{ padding: 16 }}>
    <PortfolioOverview
      aggregatedOverview={{
        ...data.aggregatedOverview,
        totalNetWorthUsd: 0,
        totalDayPnLUsd: 0,
        totalDayPnLPercent: 0,
        totalCashUsd: 0,
        totalUnrealizedPnLUsd: 0,
        totalUnrealizedPnLPercent: 0,
        portfolioCount: 0,
        positionCount: 0,
        allocationByPortfolio: [],
        allocationByBroker: [],
        allocationByAssetType: [],
        combinedEquityCurve: [],
      } as any}
      portfolios={[] as any}
      onViewPortfolio={() => {}}
      onConnectBroker={() => {}}
    />
  </div>
)
