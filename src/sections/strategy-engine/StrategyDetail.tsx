import data from '@/../product/sections/strategy-engine/data.json'
import type {
  Strategy,
  Backtest,
  WalkForwardOptimization,
} from '@/../product/sections/strategy-engine/types'
import { StrategyDetail } from './components/StrategyDetail'

export default function StrategyDetailPreview() {
  // Show strat-005 (Volatility Squeeze / Composite) as it has the richest config
  const strategy = data.strategies.find((s) => s.id === 'strat-005') as unknown as Strategy
  // Fallback to first strategy if not found
  const selected = strategy ?? (data.strategies[0] as unknown as Strategy)

  return (
    <StrategyDetail
      strategy={selected}
      backtests={data.backtests as unknown as Backtest[]}
      walkForwardOptimizations={data.walkForwardOptimizations as unknown as WalkForwardOptimization[]}
      onEditStrategy={(id) => console.log('Edit strategy:', id)}
      onToggleActive={(id, active) => console.log('Toggle active:', id, active)}
      onRunBacktest={(strategyId) => console.log('Run backtest:', strategyId)}
      onViewBacktest={(backtestId) => console.log('View backtest:', backtestId)}
      onRunWalkForward={(strategyId) => console.log('Run walk-forward:', strategyId)}
      onViewWalkForward={(optimizationId) => console.log('View walk-forward:', optimizationId)}
      onTabChange={(tab) => console.log('Tab change:', tab)}
    />
  )
}
