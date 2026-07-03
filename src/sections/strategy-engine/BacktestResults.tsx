import data from '@/../product/sections/strategy-engine/data.json'
import type { BacktestDetail } from '@/../product/sections/strategy-engine/types'
import { BacktestResults } from './components/BacktestResults'

const BASE = '/sections/strategy-engine/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function BacktestResultsPreview() {
  return (
    <BacktestResults
      detail={data.backtestDetail as unknown as BacktestDetail}
      onBack={() => navigate('StrategyDetail')}
      onRerun={(id) => console.log('Re-run backtest:', id)}
      onCompare={() => navigate('StrategyComparison')}
    />
  )
}
