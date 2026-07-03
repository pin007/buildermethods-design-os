import data from '@/../product/sections/market-data/data.json'
import { DataQuality } from './components/DataQuality'

const BASE = '/sections/market-data/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function DataQualityPreview() {
  return (
    <DataQuality
      pipelineStats={data.pipelineStats as any}
      qualityAlerts={data.qualityAlerts as any}
      onAcknowledge={(id) => console.log('Acknowledge:', id)}
      onBulkAcknowledge={(ids) => console.log('Bulk acknowledge:', ids)}
      onViewSourceData={() => navigate('SourceDetail')}
    />
  )
}
