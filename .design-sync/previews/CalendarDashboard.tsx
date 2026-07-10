import { CalendarDashboard } from 'trading-squad-ds'
import data from '../../product/sections/trading-calendar/data.json'

const noop = () => {}
const highImpact = (data.events as any[]).filter((e) => e.impact === 'high')

export const FullScreen = () => (
  <div style={{ padding: 16 }}>
    <CalendarDashboard
      stats={data.stats as any}
      events={data.events as any}
      onCreateAlert={noop}
      onViewInstrument={noop}
      onViewPortfolio={noop}
    />
  </div>
)

export const HighImpactOnly = () => (
  <div style={{ padding: 16 }}>
    <CalendarDashboard
      stats={data.stats as any}
      events={highImpact as any}
      onCreateAlert={noop}
      onViewInstrument={noop}
      onViewPortfolio={noop}
    />
  </div>
)
