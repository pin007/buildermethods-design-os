import { CorporateActions } from 'trading-squad-ds'
import data from '../../product/sections/market-data/data.json'

export const AuditLog = () => (
  <div style={{ padding: 16 }}>
    <CorporateActions
      corporateActions={data.corporateActions as any}
      onReadjust={() => {}}
      onViewDetails={() => {}}
    />
  </div>
)
