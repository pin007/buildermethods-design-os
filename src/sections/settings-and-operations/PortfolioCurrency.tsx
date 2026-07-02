import data from '@/../product/sections/settings-and-operations/data.json'
import { PortfolioCurrency } from './components/PortfolioCurrency'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function PortfolioCurrencyPreview() {
  return (
    <PortfolioCurrency
      settings={data.portfolioSettings as any}
      onChangeBaseCurrency={(c) => console.log('Change base currency:', c)}
      onToggleCurrency={(c, e) => console.log('Toggle currency:', c, e)}
      onToggleBenchmark={(id, e) => console.log('Toggle benchmark:', id, e)}
      onUpdateMarginThresholds={(t) => console.log('Update margin:', t)}
      onUpdateReconciliation={(c) => console.log('Update reconciliation:', c)}
      onSave={() => console.log('Save portfolio settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
