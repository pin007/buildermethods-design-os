import { JournalEntries } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}

export const List = () => (
  <div style={{ padding: 16 }}>
    <JournalEntries
      entries={data.journalEntries as any}
      unjournaledTrades={data.unjournaledTrades as any}
      portfolios={data.portfolios as any}
      onViewEntry={noop}
      onEditEntry={noop}
      onDeleteEntry={noop}
      onToggleStar={noop}
      onJournalTrade={noop}
      onPortfolioFilter={noop}
    />
  </div>
)
