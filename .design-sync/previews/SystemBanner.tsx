import { SystemBanner } from 'trading-squad-ds'

export const Approval = () => (
  <div style={{ padding: 0 }}>
    <SystemBanner
      banner={{
        id: 'pending-approvals',
        variant: 'approval',
        message: 'You have 2 orders pending approval',
        actionLabel: 'Review',
        actionHref: '/orders',
      }}
      onAction={() => {}}
      onDismiss={() => {}}
    />
  </div>
)

export const Disconnect = () => (
  <div style={{ padding: 0 }}>
    <SystemBanner
      banner={{
        id: 'broker-disconnect',
        variant: 'disconnect',
        message: 'Binance gateway disconnected — live orders are paused',
        actionLabel: 'Reconnect',
      }}
      onAction={() => {}}
      onDismiss={() => {}}
    />
  </div>
)

export const Session = () => (
  <div style={{ padding: 0 }}>
    <SystemBanner
      banner={{
        id: 'session-expiry',
        variant: 'session',
        message: 'Your trading session expires in',
        countdown: '04:58',
        actionLabel: 'Extend',
      }}
      onAction={() => {}}
      onDismiss={() => {}}
    />
  </div>
)
