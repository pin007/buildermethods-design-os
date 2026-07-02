import data from '@/../product/sections/portfolio-and-positions/data.json'
import { PortfolioDetail } from './components/PortfolioDetail'

export default function PortfolioDetailPreview() {
  // Show the first portfolio (US Equities) which has margin enabled
  const portfolio = data.portfolios[0]
  const positions = data.positions.filter(p => p.portfolioId === portfolio.id)

  return (
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
      onTradePosition={(symbol) => console.log('Trade position:', symbol)}
      onClosePosition={(symbol, qty) => console.log('Close position:', symbol, qty)}
      onSetPositionAlert={(id) => console.log('Set alert:', id)}
      onCreateOrder={() => console.log('Create order')}
      onTradeWatchlistItem={(symbol) => console.log('Trade watchlist item:', symbol)}
      onCreateWatchlist={(name) => console.log('Create watchlist:', name)}
      onRenameWatchlist={(id, name) => console.log('Rename watchlist:', id, name)}
      onDeleteWatchlist={(id) => console.log('Delete watchlist:', id)}
      onAddWatchlistItem={(wlId, instId) => console.log('Add watchlist item:', wlId, instId)}
      onRemoveWatchlistItem={(wlId, itemId) => console.log('Remove watchlist item:', wlId, itemId)}
      onEditWatchlistItem={(wlId, itemId, u) => console.log('Edit watchlist item:', wlId, itemId, u)}
      onChangeBenchmark={(b) => console.log('Change benchmark:', b)}
      onChangeBenchmarkPeriod={(p) => console.log('Change benchmark period:', p)}
      onBack={() => console.log('Navigate back to overview')}
    />
  )
}
