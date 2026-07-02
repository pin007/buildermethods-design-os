import data from '@/../product/sections/strategy-engine/data.json'
import type { ComparisonData } from '@/../product/sections/strategy-engine/types'
import { StrategyComparison } from './components/StrategyComparison'

export default function StrategyComparisonPreview() {
  return (
    <StrategyComparison
      comparison={data.comparisonData as unknown as ComparisonData}
      onBack={() => console.log('Navigate back')}
      onViewBacktest={(id) => console.log('View backtest:', id)}
    />
  )
}
