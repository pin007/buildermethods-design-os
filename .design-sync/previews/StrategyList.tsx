import { StrategyList } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

export const AllStrategies = () => (
  <div style={{ padding: 16 }}>
    <StrategyList
      strategies={data.strategies as any}
      backtests={data.backtests as any}
      onViewStrategy={() => {}}
      onToggleActive={() => {}}
      onCreateStrategy={() => {}}
      onCompareStrategies={() => {}}
      onDeleteStrategy={() => {}}
    />
  </div>
)
