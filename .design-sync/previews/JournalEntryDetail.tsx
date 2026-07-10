import { JournalEntryDetail } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}
const entry = data.journalEntries[0]
const portfolio = data.portfolios.find((p) => p.id === entry.portfolioId)

export const Detail = () => (
  <div style={{ padding: 16 }}>
    <JournalEntryDetail
      entry={entry as any}
      portfolioName={(portfolio?.name ?? 'Portfolio') as any}
      onEdit={noop}
      onDelete={noop}
      onToggleStar={noop}
      onViewRelatedTrade={noop}
      onBack={noop}
    />
  </div>
)
