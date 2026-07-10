import { TradeJournalSettings } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const settings = data.journalSettings as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <TradeJournalSettings
      settings={settings}
      onToggleNoteRequirement={() => {}}
      onUpdateScoringWeight={() => {}}
      onToggleScoringDimension={() => {}}
      onUpdateBehavioralDetection={() => {}}
      onUpdateReviewSchedule={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
