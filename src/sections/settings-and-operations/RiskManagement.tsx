import data from '@/../product/sections/settings-and-operations/data.json'
import { RiskManagement } from './components/RiskManagement'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function RiskManagementPreview() {
  return (
    <RiskManagement
      riskSettings={data.riskSettings as any}
      circuitBreaker={data.riskCircuitBreaker as any}
      portfolioBreakers={data.portfolioBreakers as any}
      killSwitch={data.globalKillSwitch as any}
      onUpdateRiskSetting={(id, value) => console.log('Update risk:', id, value)}
      onResetToDefault={(id) => console.log('Reset to default:', id)}
      onUpdateCircuitBreaker={(c) => console.log('Update circuit breaker:', c)}
      onResetPortfolioBreaker={(id) => console.log('Reset portfolio breaker:', id)}
      onToggleKillSwitch={(engaged) => console.log('Toggle kill switch:', engaged)}
      onSave={() => console.log('Save risk settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
