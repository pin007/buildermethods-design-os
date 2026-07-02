import data from '@/../product/sections/trade-journal/data.json'
import type {
  BehavioralPattern,
  HabitScores,
  ImprovementArea,
  BehavioralPeriod,
} from '@/../product/sections/trade-journal/types'
import { BehavioralPatterns } from './components/BehavioralPatterns'

export default function BehavioralPatternsPreview() {
  return (
    <BehavioralPatterns
      patterns={data.behavioralPatterns as unknown as BehavioralPattern[]}
      habitScores={data.habitScores as unknown as HabitScores}
      improvementAreas={data.improvementAreas as unknown as ImprovementArea[]}
      onAcknowledgePattern={(id) => console.log('Acknowledge pattern:', id)}
      onPeriodChange={(period) => console.log('Period change:', period)}
    />
  )
}
