import { OrdersScreen } from 'trading-squad-ds'
import data from '../../product/sections/trading-core/data.json'

export const FullScreen = () => (
  <div style={{ padding: 16 }}>
    <OrdersScreen
      orders={data.orders as any}
      orderEvents={data.orderEvents as any}
      onViewOrder={() => {}}
      onAmendOrder={() => {}}
      onCancelOrder={() => {}}
      onCancelBracket={() => {}}
      onReviewApproval={() => {}}
      onCreateOrder={() => {}}
    />
  </div>
)
