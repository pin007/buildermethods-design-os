import { StrategyComparison } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

export const ThreeStrategies = () => (
  <div style={{ padding: 16 }}>
    <StrategyComparison
      comparison={data.comparisonData as any}
      onBack={() => {}}
      onViewBacktest={() => {}}
    />
  </div>
)
