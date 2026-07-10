import { MarketDataOverview } from 'trading-squad-ds'
import data from '../../product/sections/market-data/data.json'

export const Overview = () => (
  <div style={{ padding: 16 }}>
    <MarketDataOverview
      pipelineStats={data.pipelineStats as any}
      dataSources={data.dataSources as any}
      recentCorporateActions={data.corporateActions as any}
      recentQualityAlerts={data.qualityAlerts as any}
      onViewSource={() => {}}
      onViewAllCorporateActions={() => {}}
      onViewAllQualityAlerts={() => {}}
      onConfigureSources={() => {}}
    />
  </div>
)
