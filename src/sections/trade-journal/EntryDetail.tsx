import data from '@/../product/sections/trade-journal/data.json'
import type { JournalEntry } from '@/../product/sections/trade-journal/types'
import { JournalEntryDetail } from './components/JournalEntryDetail'

export default function JournalEntryDetailPreview() {
  // Use the first entry (NVDA) — most complete with pre-trade, post-trade, attachments, tags
  const entry = data.journalEntries[0] as unknown as JournalEntry
  const portfolio = data.portfolios.find((p) => p.id === entry.portfolioId)

  return (
    <JournalEntryDetail
      entry={entry}
      portfolioName={portfolio?.name ?? 'Unknown'}
      onEdit={(id) => console.log('Edit entry:', id)}
      onDelete={(id) => console.log('Delete entry:', id)}
      onToggleStar={(id) => console.log('Toggle star:', id)}
      onViewRelatedTrade={(tradeId) => console.log('View related trade:', tradeId)}
      onBack={() => console.log('Navigate back')}
    />
  )
}
