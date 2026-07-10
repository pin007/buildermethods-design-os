import { MarketDataPipeline } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

export const Screen = () => (
  <div style={{ padding: 16 }}>
    <MarketDataPipeline
      dataSources={data.dataSources as any}
      retentionTiers={data.retentionTiers as any}
      qualityThresholds={data.qualityThresholds as any}
      trackedInstruments={data.trackedInstruments as any}
      onReorderSources={() => {}}
      onToggleSource={() => {}}
      onUpdateSchedule={() => {}}
      onUpdateThresholds={() => {}}
      onUpdateRetention={() => {}}
      onAddInstrument={() => {}}
      onRemoveInstrument={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
