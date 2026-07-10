import { RiskManagement } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const riskSettings = data.riskSettings as any[]
const circuitBreaker = data.riskCircuitBreaker as any
const portfolioBreakers = data.portfolioBreakers as any[]
const killSwitch = data.globalKillSwitch as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <RiskManagement
      riskSettings={riskSettings as any}
      circuitBreaker={circuitBreaker}
      portfolioBreakers={portfolioBreakers as any}
      killSwitch={killSwitch}
      onUpdateRiskSetting={() => {}}
      onResetToDefault={() => {}}
      onUpdateCircuitBreaker={() => {}}
      onResetPortfolioBreaker={() => {}}
      onToggleKillSwitch={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)

export const KillSwitchEngaged = () => (
  <div style={{ padding: 16 }}>
    <RiskManagement
      riskSettings={riskSettings as any}
      circuitBreaker={circuitBreaker}
      portfolioBreakers={portfolioBreakers as any}
      killSwitch={{ engaged: true } as any}
      onUpdateRiskSetting={() => {}}
      onResetToDefault={() => {}}
      onUpdateCircuitBreaker={() => {}}
      onResetPortfolioBreaker={() => {}}
      onToggleKillSwitch={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
