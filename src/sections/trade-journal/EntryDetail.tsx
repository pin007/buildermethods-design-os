import data from '@/../product/sections/trade-journal/data.json'
import type { JournalEntry } from '@/../product/sections/trade-journal/types'
import { JournalEntryDetail } from './components/JournalEntryDetail'

const BASE = '/sections/trade-journal/screen-designs'

function navigate(screen: string, id?: string) {
  const q = id ? `?id=${encodeURIComponent(id)}` : ''
  window.location.href = `${BASE}/${screen}/fullscreen${q}`
}

export default function JournalEntryDetailPreview() {
  // Match the entry the user drilled into (rec #5); fall back to the first
  // (NVDA — most complete with pre-trade, post-trade, attachments, tags).
  const selectedId = new URLSearchParams(window.location.search).get('id')
  const entry = (data.journalEntries.find((e) => e.id === selectedId) ??
    data.journalEntries[0]) as unknown as JournalEntry
  const portfolio = data.portfolios.find((p) => p.id === entry.portfolioId)

  return (
    <JournalEntryDetail
      entry={entry}
      portfolioName={portfolio?.name ?? 'Unknown'}
      onEdit={() => navigate('Editor', entry.id)}
      onDelete={(id) => console.log('Delete entry:', id)}
      onToggleStar={(id) => console.log('Toggle star:', id)}
      onViewRelatedTrade={(tradeId) => console.log('View related trade:', tradeId)}
      onBack={() => navigate('Entries')}
    />
  )
}
