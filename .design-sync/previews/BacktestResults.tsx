import { BacktestResults } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

export const PassRecommendation = () => (
  <div style={{ padding: 16 }}>
    <BacktestResults
      detail={data.backtestDetail as any}
      onBack={() => {}}
      onRerun={() => {}}
      onCompare={() => {}}
    />
  </div>
)
