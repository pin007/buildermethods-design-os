import data from '@/../product/sections/settings-and-operations/data.json'
import { TaxConfiguration } from './components/TaxConfiguration'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function TaxConfigurationPreview() {
  return (
    <TaxConfiguration
      settings={data.taxSettings as any}
      onUpdateTaxRate={(rate) => console.log('Update tax rate:', rate)}
      onUpdateExemptionDays={(days) => console.log('Update exemption days:', days)}
      onToggleCnbSync={(enabled) => console.log('Toggle CNB sync:', enabled)}
      onToggleReportFormat={(id, enabled) => console.log('Toggle report format:', id, enabled)}
      onSave={() => console.log('Save tax settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
