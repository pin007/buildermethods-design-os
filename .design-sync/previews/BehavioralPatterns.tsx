import { BehavioralPatterns } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}

export const Patterns = () => (
  <div style={{ padding: 16 }}>
    <BehavioralPatterns
      patterns={data.behavioralPatterns as any}
      habitScores={data.habitScores as any}
      improvementAreas={data.improvementAreas as any}
      onAcknowledgePattern={noop}
      onPeriodChange={noop}
    />
  </div>
)
