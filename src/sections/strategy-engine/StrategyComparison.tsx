import data from '@/../product/sections/strategy-engine/data.json'
import type { ComparisonData } from '@/../product/sections/strategy-engine/types'
import { StrategyComparison } from './components/StrategyComparison'

const BASE = '/sections/strategy-engine/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function StrategyComparisonPreview() {
  return (
    <StrategyComparison
      comparison={data.comparisonData as unknown as ComparisonData}
      onBack={() => navigate('StrategyList')}
      onViewBacktest={() => navigate('BacktestResults')}
    />
  )
}
