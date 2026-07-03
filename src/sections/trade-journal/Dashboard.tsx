import data from '@/../product/sections/trade-journal/data.json'
import type {
  DashboardStats,
  JournalEntry,
  BehavioralPattern,
  HabitScores,
  Portfolio,
} from '@/../product/sections/trade-journal/types'
import { JournalDashboard } from './components/JournalDashboard'

const BASE = '/sections/trade-journal/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function JournalDashboardPreview() {
  return (
    <JournalDashboard
      stats={data.dashboardStats as unknown as DashboardStats}
      recentEntries={data.journalEntries as unknown as JournalEntry[]}
      behavioralAlerts={data.behavioralPatterns as unknown as BehavioralPattern[]}
      habitScores={data.habitScores as unknown as HabitScores}
      portfolios={data.portfolios as unknown as Portfolio[]}
      onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
      onViewEntry={() => navigate('EntryDetail')}
      onCreateEntry={() => navigate('Editor')}
      onViewBehavioralPatterns={() => navigate('Behavioral')}
    />
  )
}
