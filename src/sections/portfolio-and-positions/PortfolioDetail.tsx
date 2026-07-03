import data from '@/../product/sections/portfolio-and-positions/data.json'
import { PortfolioDetail } from './components/PortfolioDetail'

const BASE = '/sections/portfolio-and-positions/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

function openOrderPanel() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
  )
}

export default function PortfolioDetailPreview() {
  // Match the portfolio the user drilled into (rec #5), falling back to the
  // first (US Equities, which has margin enabled) for direct/nav entry.
  const selectedId = new URLSearchParams(window.location.search).get('id')
  const portfolio = data.portfolios.find(p => p.id === selectedId) ?? data.portfolios[0]
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
      onTradePosition={() => openOrderPanel()}
      onClosePosition={(symbol, qty) => console.log('Close position:', symbol, qty)}
      onSetPositionAlert={(id) => console.log('Set alert:', id)}
      onCreateOrder={() => openOrderPanel()}
      onTradeWatchlistItem={() => openOrderPanel()}
      onCreateWatchlist={(name) => console.log('Create watchlist:', name)}
      onRenameWatchlist={(id, name) => console.log('Rename watchlist:', id, name)}
      onDeleteWatchlist={(id) => console.log('Delete watchlist:', id)}
      onAddWatchlistItem={(wlId, instId) => console.log('Add watchlist item:', wlId, instId)}
      onRemoveWatchlistItem={(wlId, itemId) => console.log('Remove watchlist item:', wlId, itemId)}
      onEditWatchlistItem={(wlId, itemId, u) => console.log('Edit watchlist item:', wlId, itemId, u)}
      onChangeBenchmark={(b) => console.log('Change benchmark:', b)}
      onChangeBenchmarkPeriod={(p) => console.log('Change benchmark period:', p)}
      onBack={() => navigate('PortfolioOverview')}
    />
  )
}
