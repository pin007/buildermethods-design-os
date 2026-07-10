import { JournalDashboard } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}

export const Dashboard = () => (
  <div style={{ padding: 16 }}>
    <JournalDashboard
      stats={data.dashboardStats as any}
      recentEntries={data.journalEntries as any}
      behavioralAlerts={data.behavioralPatterns as any}
      habitScores={data.habitScores as any}
      portfolios={data.portfolios as any}
      onPortfolioFilter={noop}
      onViewEntry={noop}
      onCreateEntry={noop}
      onViewBehavioralPatterns={noop}
    />
  </div>
)
