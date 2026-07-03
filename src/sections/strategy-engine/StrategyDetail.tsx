import data from '@/../product/sections/strategy-engine/data.json'
import type {
  Strategy,
  Backtest,
  WalkForwardOptimization,
} from '@/../product/sections/strategy-engine/types'
import { StrategyDetail } from './components/StrategyDetail'

const BASE = '/sections/strategy-engine/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function StrategyDetailPreview() {
  // Match the strategy the user drilled into (rec #5); fall back to strat-005
  // (Volatility Squeeze / Composite — richest config) then the first strategy.
  const selectedId = new URLSearchParams(window.location.search).get('id')
  const strategy = data.strategies.find(
    (s) => s.id === (selectedId ?? 'strat-005')
  ) as unknown as Strategy
  const selected = strategy ?? (data.strategies[0] as unknown as Strategy)

  return (
    <StrategyDetail
      strategy={selected}
      backtests={data.backtests as unknown as Backtest[]}
      walkForwardOptimizations={data.walkForwardOptimizations as unknown as WalkForwardOptimization[]}
      onEditStrategy={(id) => console.log('Edit strategy:', id)}
      onToggleActive={(id, active) => console.log('Toggle active:', id, active)}
      onRunBacktest={(strategyId) => console.log('Run backtest:', strategyId)}
      onViewBacktest={() => navigate('BacktestResults')}
      onRunWalkForward={(strategyId) => console.log('Run walk-forward:', strategyId)}
      onViewWalkForward={() => navigate('WalkForwardResults')}
      onTabChange={(tab) => console.log('Tab change:', tab)}
    />
  )
}
