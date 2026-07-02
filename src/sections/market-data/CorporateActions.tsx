import data from '@/../product/sections/market-data/data.json'
import { CorporateActions } from './components/CorporateActions'

export default function CorporateActionsPreview() {
  return (
    <CorporateActions
      corporateActions={data.corporateActions as any}
      onReadjust={(id) => console.log('Re-adjust:', id)}
      onViewDetails={(id) => console.log('View details:', id)}
    />
  )
}
