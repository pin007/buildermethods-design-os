import { NewOrderForm } from 'trading-squad-ds'
import data from '../../product/sections/trading-core/data.json'

export const BuyOrder = () => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <NewOrderForm
      instruments={data.instruments as any}
      portfolios={data.portfolios as any}
      brokers={data.brokers as any}
      prefillSymbol="AAPL"
      prefillSide="BUY"
      onSubmit={() => {}}
      onClose={() => {}}
      onDirtyChange={() => {}}
    />
  </div>
)
