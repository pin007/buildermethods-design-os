import { IntelligenceSources } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const settings = data.intelligenceSettings as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <IntelligenceSources
      settings={settings}
      onToggleSource={() => {}}
      onUpdateGuruTracker={() => {}}
      onUpdateMarketAnalyst={() => {}}
      onUpdateSignalGeneration={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
