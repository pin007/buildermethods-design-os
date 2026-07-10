import { PortfolioDetail } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

const portfolio = data.portfolios.find((p) => p.id === 'port-us-equities')!
const positions = data.positions.filter((p) => p.portfolioId === 'port-us-equities')

export const FullScreen = () => (
  <div style={{ padding: 16 }}>
    <PortfolioDetail
      portfolio={portfolio as any}
      positions={positions as any}
      watchlists={data.watchlists as any}
      dividends={data.dividends as any}
      dividendSummaries={data.dividendSummaries as any}
      upcomingDividends={data.upcomingDividends as any}
      yieldMetrics={data.yieldMetrics as any}
      benchmarkComparison={data.benchmarkComparison as any}
      marginInfo={data.marginInfo as any}
      onTradePosition={() => {}}
      onClosePosition={() => {}}
      onSetPositionAlert={() => {}}
      onCreateOrder={() => {}}
      onTradeWatchlistItem={() => {}}
      onCreateWatchlist={() => {}}
      onRenameWatchlist={() => {}}
      onDeleteWatchlist={() => {}}
      onAddWatchlistItem={() => {}}
      onRemoveWatchlistItem={() => {}}
      onEditWatchlistItem={() => {}}
      onChangeBenchmark={() => {}}
      onChangeBenchmarkPeriod={() => {}}
      onBack={() => {}}
    />
  </div>
)
