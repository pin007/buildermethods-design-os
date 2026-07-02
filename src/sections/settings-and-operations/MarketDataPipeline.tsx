import data from '@/../product/sections/settings-and-operations/data.json'
import { MarketDataPipeline } from './components/MarketDataPipeline'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function MarketDataPipelinePreview() {
  return (
    <MarketDataPipeline
      dataSources={data.dataSources as any}
      retentionTiers={data.retentionTiers as any}
      qualityThresholds={data.qualityThresholds as any}
      trackedInstruments={data.trackedInstruments as any}
      onReorderSources={(ids) => console.log('Reorder sources:', ids)}
      onToggleSource={(id, enabled) => console.log('Toggle source:', id, enabled)}
      onUpdateSchedule={(id, schedule) => console.log('Update schedule:', id, schedule)}
      onUpdateThresholds={(t) => console.log('Update thresholds:', t)}
      onUpdateRetention={(id, days) => console.log('Update retention:', id, days)}
      onAddInstrument={(symbol) => console.log('Add instrument:', symbol)}
      onRemoveInstrument={(symbol) => console.log('Remove instrument:', symbol)}
      onSave={() => console.log('Save market data settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
