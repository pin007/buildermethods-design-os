import data from '@/../product/sections/trading-calendar/data.json'
import { CalendarDashboard } from './components/CalendarDashboard'

export default function DashboardPreview() {
  return (
    <CalendarDashboard
      stats={data.stats as any}
      events={data.events as any}
      onCreateAlert={(id) => console.log('Create alert:', id)}
      onViewInstrument={(symbol) => console.log('View instrument:', symbol)}
      onViewPortfolio={() => console.log('View portfolio')}
    />
  )
}
