import { GuruTrackerTab } from 'trading-squad-ds'
import data from '../../product/sections/market-intelligence/data.json'

const noop = () => {}

export const Default = () => (
  <div style={{ padding: 16 }}>
    <GuruTrackerTab
      guruTrades={data.guruTrades as any}
      trackedGurus={data.trackedGurus as any}
      guruAlerts={data.guruAlerts as any}
      onFollowTrade={noop}
      onAddGuru={noop}
      onRemoveGuru={noop}
      onToggleGuru={noop}
      onEditGuru={noop}
      onSaveGuruAlert={noop}
      onDeleteGuruAlert={noop}
      onToggleGuruAlert={noop}
    />
  </div>
)
