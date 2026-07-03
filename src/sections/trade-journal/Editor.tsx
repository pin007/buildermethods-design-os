import data from '@/../product/sections/trade-journal/data.json'
import type { JournalEntry, UnjournaledTrade } from '@/../product/sections/trade-journal/types'
import { JournalEntryEditor } from './components/JournalEntryEditor'

const BASE = '/sections/trade-journal/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function JournalEntryEditorPreview() {
  // Edit mode: use the first entry (NVDA) — most complete with pre-trade, post-trade, tags
  const entry = data.journalEntries[0] as unknown as JournalEntry
  const availableTags = [
    'momentum',
    'earnings',
    'breakout',
    'trend-following',
    'mean-reversion',
    'high-conviction',
    'swing',
    'scalp',
    'gap-fill',
    'reversal',
  ]

  return (
    <JournalEntryEditor
      entry={entry}
      trade={null}
      availableTags={availableTags}
      onSave={() => navigate('Entries')}
      onCancel={() => navigate('Entries')}
      onDirtyChange={(isDirty) => console.log('Dirty state:', isDirty)}
    />
  )
}
