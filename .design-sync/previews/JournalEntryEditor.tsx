import { JournalEntryEditor } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}
const availableTags = Array.from(
  new Set(data.journalEntries.flatMap((e) => e.tags as string[]))
)

export const EditExisting = () => (
  <div style={{ padding: 16 }}>
    <JournalEntryEditor
      entry={data.journalEntries[0] as any}
      trade={null as any}
      availableTags={availableTags as any}
      onSave={noop}
      onCancel={noop}
      onDirtyChange={noop}
    />
  </div>
)

export const CreateFromTrade = () => (
  <div style={{ padding: 16 }}>
    <JournalEntryEditor
      entry={null as any}
      trade={data.unjournaledTrades[0] as any}
      availableTags={availableTags as any}
      onSave={noop}
      onCancel={noop}
      onDirtyChange={noop}
    />
  </div>
)
