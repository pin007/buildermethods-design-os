import data from '@/../product/sections/trade-journal/data.json'
import type {
  JournalEntry,
  UnjournaledTrade,
  Portfolio,
} from '@/../product/sections/trade-journal/types'
import { JournalEntries } from './components/JournalEntries'

export default function JournalEntriesPreview() {
  return (
    <JournalEntries
      entries={data.journalEntries as unknown as JournalEntry[]}
      unjournaledTrades={data.unjournaledTrades as unknown as UnjournaledTrade[]}
      portfolios={data.portfolios as unknown as Portfolio[]}
      onViewEntry={(id) => console.log('View entry:', id)}
      onEditEntry={(id) => console.log('Edit entry:', id)}
      onDeleteEntry={(id) => console.log('Delete entry:', id)}
      onToggleStar={(id) => console.log('Toggle star:', id)}
      onJournalTrade={(tradeId) => console.log('Journal trade:', tradeId)}
      onPortfolioFilter={(ids) => console.log('Portfolio filter:', ids)}
    />
  )
}
