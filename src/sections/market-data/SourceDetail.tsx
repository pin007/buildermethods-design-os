import data from '@/../product/sections/market-data/data.json'
import { SourceDetail } from './components/SourceDetail'

// Default to Yahoo Finance — the richest example source (5 subscriptions,
// running + failed backfills, quality alerts) — when no source is drilled into.
const DEFAULT_SOURCE_ID = 'src-yahoo'

export default function SourceDetailPreview() {
  // Match the source the user drilled into (rec #5).
  const selectedId = new URLSearchParams(window.location.search).get('id')
  const SOURCE_ID = data.dataSources.some((s) => s.id === selectedId)
    ? (selectedId as string)
    : DEFAULT_SOURCE_ID

  const dataSource = data.dataSources.find((s) => s.id === SOURCE_ID)!
  const subscriptions = data.instrumentSubscriptions.filter((s) => s.dataSourceId === SOURCE_ID)
  const fetchOperations = data.fetchOperations.filter((f) => f.dataSourceId === SOURCE_ID)
  const backfillTasks = data.backfillTasks.filter((t) => t.dataSourceId === SOURCE_ID)
  const qualityAlerts = data.qualityAlerts.filter((a) => a.dataSourceId === SOURCE_ID)

  return (
    <SourceDetail
      dataSource={dataSource as any}
      subscriptions={subscriptions as any}
      fetchOperations={fetchOperations as any}
      backfillTasks={backfillTasks as any}
      qualityAlerts={qualityAlerts as any}
      onForceRefreshAll={(id) => console.log('Force refresh all:', id)}
      onRefreshInstrument={(id) => console.log('Refresh instrument:', id)}
      onAddInstrument={(sourceId, symbol, intervals) =>
        console.log('Add instrument:', sourceId, symbol, intervals)
      }
      onRemoveInstrument={(id) => console.log('Remove instrument:', id)}
      onStartBackfill={(subId, start, end, interval, priority) =>
        console.log('Start backfill:', subId, start, end, interval, priority)
      }
      onCancelBackfill={(id) => console.log('Cancel backfill:', id)}
      onRetryFetch={(id) => console.log('Retry fetch:', id)}
      onAcknowledgeAlert={(id) => console.log('Acknowledge alert:', id)}
    />
  )
}
