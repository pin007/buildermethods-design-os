import { StrategyCard } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

const strategies = data.strategies as any[]
const live = strategies.find((s) => s.promotedToLive) ?? strategies[0]
const paused = strategies.find((s) => !s.active) ?? strategies[3]

export const LivePromoted = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <StrategyCard
      strategy={live as any}
      onView={() => {}}
      onToggleActive={() => {}}
      onDelete={() => {}}
    />
  </div>
)

export const Paused = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <StrategyCard
      strategy={paused as any}
      onView={() => {}}
      onToggleActive={() => {}}
      onDelete={() => {}}
    />
  </div>
)
