import { PortfolioCurrency } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const settings = data.portfolioSettings as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <PortfolioCurrency
      settings={settings}
      onChangeBaseCurrency={() => {}}
      onToggleCurrency={() => {}}
      onToggleBenchmark={() => {}}
      onUpdateMarginThresholds={() => {}}
      onUpdateReconciliation={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
