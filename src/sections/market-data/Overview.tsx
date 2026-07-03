import data from '@/../product/sections/market-data/data.json'
import { MarketDataOverview } from './components/MarketDataOverview'

const BASE = '/sections/market-data/screen-designs'

function navigate(screen: string, id?: string) {
  const q = id ? `?id=${encodeURIComponent(id)}` : ''
  window.location.href = `${BASE}/${screen}/fullscreen${q}`
}

export default function OverviewPreview() {
  return (
    <MarketDataOverview
      pipelineStats={data.pipelineStats as any}
      dataSources={data.dataSources as any}
      recentCorporateActions={data.corporateActions as any}
      recentQualityAlerts={data.qualityAlerts as any}
      onViewSource={(id) => navigate('SourceDetail', id)}
      onViewAllCorporateActions={() => navigate('CorporateActions')}
      onViewAllQualityAlerts={() => navigate('DataQuality')}
      onConfigureSources={() => console.log('Configure sources')}
    />
  )
}
