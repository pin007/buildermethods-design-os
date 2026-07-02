import data from '@/../product/sections/settings-and-operations/data.json'
import { SettingsOverview } from './components/SettingsOverview'

const BASE = '/sections/settings-and-operations/screen-designs'

const categoryScreenMap: Record<string, string> = {
  'broker-gateways': 'BrokerGateways',
  'market-data-pipeline': 'MarketDataPipeline',
  'portfolio-currency': 'PortfolioCurrency',
  'risk-management': 'RiskManagement',
  'tax-configuration': 'TaxConfiguration',
  'strategy-backtesting': 'StrategyBacktesting',
  'intelligence-sources': 'IntelligenceSources',
  'trade-journal': 'TradeJournalSettings',
  'notifications-alerts': 'NotificationsAlerts',
  'calendar-display': 'CalendarDisplay',
}

function navigateToCategory(categoryId: string) {
  const screen = categoryScreenMap[categoryId]
  if (screen) {
    window.location.href = `${BASE}/${screen}/fullscreen`
  }
}

export default function SettingsOverviewPreview() {
  return (
    <SettingsOverview
      categories={data.settingsCategories as any}
      onNavigateToCategory={navigateToCategory}
    />
  )
}
