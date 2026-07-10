import { WalkForwardResults } from 'trading-squad-ds'
import data from '../../product/sections/strategy-engine/data.json'

export const LowOverfitting = () => (
  <div style={{ padding: 16 }}>
    <WalkForwardResults
      detail={data.walkForwardDetail as any}
      onBack={() => {}}
    />
  </div>
)
