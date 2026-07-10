import { TaxConfiguration } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const settings = data.taxSettings as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <TaxConfiguration
      settings={settings}
      onUpdateTaxRate={() => {}}
      onUpdateExemptionDays={() => {}}
      onToggleCnbSync={() => {}}
      onToggleReportFormat={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
