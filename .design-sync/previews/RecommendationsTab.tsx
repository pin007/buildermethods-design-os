import { RecommendationsTab } from 'trading-squad-ds'
import data from '../../product/sections/market-intelligence/data.json'

const noop = () => {}
const active = (data.recommendations as any[]).filter((r) => r.status === 'active')

export const Default = () => (
  <div style={{ padding: 16 }}>
    <RecommendationsTab
      recommendations={data.recommendations as any}
      onCreateOrder={noop}
      onDismissRecommendation={noop}
      onSnoozeRecommendation={noop}
      onAnalyzeInstrument={noop}
    />
  </div>
)

export const ActiveOnly = () => (
  <div style={{ padding: 16 }}>
    <RecommendationsTab
      recommendations={active as any}
      onCreateOrder={noop}
      onDismissRecommendation={noop}
      onSnoozeRecommendation={noop}
      onAnalyzeInstrument={noop}
    />
  </div>
)
