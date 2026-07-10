import { StrategyBacktesting } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

export const Screen = () => (
  <div style={{ padding: 16 }}>
    <StrategyBacktesting
      settings={data.strategySettings as any}
      onUpdateEvaluationInterval={() => {}}
      onUpdateBacktesting={() => {}}
      onUpdateWalkForward={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
