import data from '@/../product/sections/strategy-engine/data.json'
import type { Strategy, Backtest } from '@/../product/sections/strategy-engine/types'
import { StrategyList } from './components/StrategyList'

const BASE = '/sections/strategy-engine/screen-designs'

function navigate(screen: string, id?: string) {
  const q = id ? `?id=${encodeURIComponent(id)}` : ''
  window.location.href = `${BASE}/${screen}/fullscreen${q}`
}

export default function StrategyListPreview() {
  return (
    <StrategyList
      strategies={data.strategies as Strategy[]}
      backtests={data.backtests as Backtest[]}
      onViewStrategy={(id) => navigate('StrategyDetail', id)}
      onToggleActive={(id, active) => console.log('Toggle active:', id, active)}
      onCreateStrategy={() => console.log('Create new strategy')}
      onCompareStrategies={() => navigate('StrategyComparison')}
      onDeleteStrategy={(id) => console.log('Delete strategy:', id)}
    />
  )
}
