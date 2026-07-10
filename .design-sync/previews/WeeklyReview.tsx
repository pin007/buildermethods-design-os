import { WeeklyReview } from 'trading-squad-ds'
import data from '../../product/sections/trade-journal/data.json'

const noop = () => {}

export const Review = () => (
  <div style={{ padding: 16 }}>
    <WeeklyReview
      review={data.weeklyReview as any}
      portfolios={data.portfolios as any}
      onWeekChange={noop}
      onViewEntry={noop}
      onSaveFocus={noop}
      onPortfolioFilter={noop}
      onViewBehavioralPatterns={noop}
    />
  </div>
)
