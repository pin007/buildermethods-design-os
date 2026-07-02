import data from '@/../product/sections/strategy-engine/data.json'
import type { Strategy, Backtest } from '@/../product/sections/strategy-engine/types'
import { StrategyList } from './components/StrategyList'

export default function StrategyListPreview() {
  return (
    <StrategyList
      strategies={data.strategies as Strategy[]}
      backtests={data.backtests as Backtest[]}
      onViewStrategy={(id) => console.log('View strategy:', id)}
      onToggleActive={(id, active) => console.log('Toggle active:', id, active)}
      onCreateStrategy={() => console.log('Create new strategy')}
      onCompareStrategies={(ids) => console.log('Compare strategies:', ids)}
      onDeleteStrategy={(id) => console.log('Delete strategy:', id)}
    />
  )
}
