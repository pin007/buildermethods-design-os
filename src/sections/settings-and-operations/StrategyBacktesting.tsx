import data from '@/../product/sections/settings-and-operations/data.json'
import { StrategyBacktesting } from './components/StrategyBacktesting'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function StrategyBacktestingPreview() {
  return (
    <StrategyBacktesting
      settings={data.strategySettings as any}
      onUpdateEvaluationInterval={(s) => console.log('Update interval:', s)}
      onUpdateBacktesting={(c) => console.log('Update backtesting:', c)}
      onUpdateWalkForward={(c) => console.log('Update walk-forward:', c)}
      onSave={() => console.log('Save strategy settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
