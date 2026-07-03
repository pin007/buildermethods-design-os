import data from '@/../product/sections/trade-journal/data.json'
import type {
  JournalEntry,
  UnjournaledTrade,
  Portfolio,
} from '@/../product/sections/trade-journal/types'
import { JournalEntries } from './components/JournalEntries'

const BASE = '/sections/trade-journal/screen-designs'

function navigate(screen: string, id?: string) {
  const q = id ? `?id=${encodeURIComponent(id)}` : ''
  window.location.href = `${BASE}/${screen}/fullscreen${q}`
}

export default function JournalEntriesPreview() {
  return (
    <JournalEntries
      entries={data.journalEntries as unknown as JournalEntry[]}
      unjournaledTrades={data.unjournaledTrades as unknown as UnjournaledTrade[]}
      portfolios={data.portfolios as unknown as Portfolio[]}
      onViewEntry={(id) => navigate('EntryDetail', id)}
      onEditEntry={(id) => navigate('Editor', id)}
      onDeleteEntry={(id) => console.log('Delete entry:', id)}
      onToggleStar={(id) => console.log('Toggle star:', id)}
      onJournalTrade={() => navigate('Editor')}
      onPortfolioFilter={(ids) => console.log('Portfolio filter:', ids)}
    />
  )
}
