import data from '@/../product/sections/market-data/data.json'
import { DataQuality } from './components/DataQuality'

export default function DataQualityPreview() {
  return (
    <DataQuality
      pipelineStats={data.pipelineStats as any}
      qualityAlerts={data.qualityAlerts as any}
      onAcknowledge={(id) => console.log('Acknowledge:', id)}
      onBulkAcknowledge={(ids) => console.log('Bulk acknowledge:', ids)}
      onViewSourceData={(sourceId) => console.log('View source data:', sourceId)}
    />
  )
}
