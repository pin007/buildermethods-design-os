import { StrategyDetail } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

const strategy = (data.strategies as any[]).find((s) => s.id === 'strat-001') ?? data.strategies[0]
const backtests = (data.backtests as any[]).filter((b) => b.strategyId === strategy.id)
const wfos = (data.walkForwardOptimizations as any[]).filter((w) => w.strategyId === strategy.id)

export const Overview = () => (
  <div style={{ padding: 16 }}>
    <StrategyDetail
      strategy={strategy as any}
      backtests={backtests as any}
      walkForwardOptimizations={wfos as any}
      onEditStrategy={() => {}}
      onToggleActive={() => {}}
      onRunBacktest={() => {}}
      onViewBacktest={() => {}}
      onRunWalkForward={() => {}}
      onViewWalkForward={() => {}}
      onTabChange={() => {}}
    />
  </div>
)
