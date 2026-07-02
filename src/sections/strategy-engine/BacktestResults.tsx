import data from '@/../product/sections/strategy-engine/data.json'
import type { BacktestDetail } from '@/../product/sections/strategy-engine/types'
import { BacktestResults } from './components/BacktestResults'

export default function BacktestResultsPreview() {
  return (
    <BacktestResults
      detail={data.backtestDetail as unknown as BacktestDetail}
      onBack={() => console.log('Navigate back')}
      onRerun={(id) => console.log('Re-run backtest:', id)}
      onCompare={(id) => console.log('Compare backtest:', id)}
    />
  )
}
