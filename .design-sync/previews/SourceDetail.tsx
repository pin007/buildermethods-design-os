import { SourceDetail } from 'trading-squad-ds'
import data from '../../product/sections/market-data/data.json'

const source = (data.dataSources as any[]).find((s) => s.id === 'src-yahoo') ?? data.dataSources[0]
const subs = (data.instrumentSubscriptions as any[]).filter((s) => s.dataSourceId === source.id)
const fetches = (data.fetchOperations as any[]).filter((f) => f.dataSourceId === source.id)
const backfills = (data.backfillTasks as any[]).filter((b) => b.dataSourceId === source.id)
const alerts = (data.qualityAlerts as any[]).filter((q) => q.dataSourceId === source.id)

export const Detail = () => (
  <div style={{ padding: 16 }}>
    <SourceDetail
      dataSource={source as any}
      subscriptions={subs as any}
      fetchOperations={fetches as any}
      backfillTasks={backfills as any}
      qualityAlerts={alerts as any}
      onForceRefreshAll={() => {}}
      onRefreshInstrument={() => {}}
      onAddInstrument={() => {}}
      onRemoveInstrument={() => {}}
      onStartBackfill={() => {}}
      onCancelBackfill={() => {}}
      onRetryFetch={() => {}}
      onAcknowledgeAlert={() => {}}
    />
  </div>
)
