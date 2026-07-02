import data from '@/../product/sections/strategy-engine/data.json'
import type { WalkForwardDetail } from '@/../product/sections/strategy-engine/types'
import { WalkForwardResults } from './components/WalkForwardResults'

export default function WalkForwardResultsPreview() {
  return (
    <WalkForwardResults
      detail={data.walkForwardDetail as unknown as WalkForwardDetail}
      onBack={() => console.log('Navigate back')}
    />
  )
}
