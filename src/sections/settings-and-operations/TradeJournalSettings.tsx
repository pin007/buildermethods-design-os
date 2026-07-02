import data from '@/../product/sections/settings-and-operations/data.json'
import { TradeJournalSettings } from './components/TradeJournalSettings'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function TradeJournalSettingsPreview() {
  return (
    <TradeJournalSettings
      settings={data.journalSettings as any}
      onToggleNoteRequirement={(field, enabled) => console.log('Toggle note:', field, enabled)}
      onUpdateScoringWeight={(id, weight) => console.log('Update scoring:', id, weight)}
      onToggleScoringDimension={(id, enabled) => console.log('Toggle dimension:', id, enabled)}
      onUpdateBehavioralDetection={(c) => console.log('Update behavioral:', c)}
      onUpdateReviewSchedule={(s) => console.log('Update review schedule:', s)}
      onSave={() => console.log('Save journal settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
