import { DataQuality } from 'trading-squad-ds'
import data from '../../product/sections/market-data/data.json'

export const Dashboard = () => (
  <div style={{ padding: 16 }}>
    <DataQuality
      pipelineStats={data.pipelineStats as any}
      qualityAlerts={data.qualityAlerts as any}
      onAcknowledge={() => {}}
      onBulkAcknowledge={() => {}}
      onViewSourceData={() => {}}
    />
  </div>
)
