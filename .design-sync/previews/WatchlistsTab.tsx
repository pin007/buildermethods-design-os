import { WatchlistsTab } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

export const Populated = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <WatchlistsTab
      watchlists={data.watchlists as any}
      onTradeWatchlistItem={() => {}}
      onCreateWatchlist={() => {}}
      onRenameWatchlist={() => {}}
      onDeleteWatchlist={() => {}}
      onAddWatchlistItem={() => {}}
      onRemoveWatchlistItem={() => {}}
      onEditWatchlistItem={() => {}}
    />
  </div>
)

export const Empty = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <WatchlistsTab
      watchlists={[] as any}
      onTradeWatchlistItem={() => {}}
      onCreateWatchlist={() => {}}
      onRenameWatchlist={() => {}}
      onDeleteWatchlist={() => {}}
      onAddWatchlistItem={() => {}}
      onRemoveWatchlistItem={() => {}}
      onEditWatchlistItem={() => {}}
    />
  </div>
)
