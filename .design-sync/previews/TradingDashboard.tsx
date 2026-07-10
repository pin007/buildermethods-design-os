import { TradingDashboard } from 'trading-squad-ds'
import data from '../../product/sections/trading-core/data.json'

export const Dashboard = () => (
  <div style={{ padding: 16 }}>
    <TradingDashboard
      portfolios={data.portfolios as any}
      recentActivity={data.recentActivity as any}
      onReviewApproval={() => {}}
      onCreateOrder={() => {}}
      onViewOrders={() => {}}
      onConnectBroker={() => {}}
    />
  </div>
)
