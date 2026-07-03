import data from '@/../product/sections/strategy-engine/data.json'
import type { WalkForwardDetail } from '@/../product/sections/strategy-engine/types'
import { WalkForwardResults } from './components/WalkForwardResults'

const BASE = '/sections/strategy-engine/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function WalkForwardResultsPreview() {
  return (
    <WalkForwardResults
      detail={data.walkForwardDetail as unknown as WalkForwardDetail}
      onBack={() => navigate('StrategyDetail')}
    />
  )
}
