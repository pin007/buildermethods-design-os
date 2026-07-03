import data from '@/../product/sections/trade-journal/data.json'
import type {
  WeeklyReview,
  Portfolio,
} from '@/../product/sections/trade-journal/types'
import { WeeklyReview as WeeklyReviewComponent } from './components/WeeklyReview'

const BASE = '/sections/trade-journal/screen-designs'

function navigate(screen: string) {
  window.location.href = `${BASE}/${screen}/fullscreen`
}

export default function WeeklyReviewPreview() {
  return (
    <WeeklyReviewComponent
      review={data.weeklyReview as unknown as WeeklyReview}
      portfolios={data.portfolios as unknown as Portfolio[]}
      onWeekChange={(week) => console.log('Week change:', week)}
      onViewEntry={() => navigate('EntryDetail')}
      onSaveFocus={(items) => console.log('Save focus:', items)}
      onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
      onViewBehavioralPatterns={() => navigate('Behavioral')}
    />
  )
}
