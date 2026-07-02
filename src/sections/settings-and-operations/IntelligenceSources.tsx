import data from '@/../product/sections/settings-and-operations/data.json'
import { IntelligenceSources } from './components/IntelligenceSources'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function IntelligenceSourcesPreview() {
  return (
    <IntelligenceSources
      settings={data.intelligenceSettings as any}
      onToggleSource={(source, enabled) => console.log('Toggle source:', source, enabled)}
      onUpdateGuruTracker={(c) => console.log('Update guru tracker:', c)}
      onUpdateMarketAnalyst={(c) => console.log('Update market analyst:', c)}
      onUpdateSignalGeneration={(c) => console.log('Update signal generation:', c)}
      onSave={() => console.log('Save intelligence settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
