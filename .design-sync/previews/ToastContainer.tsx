import { ToastContainer } from 'trading-squad-ds'

const toasts = [
  {
    id: 't-approval',
    variant: 'warning' as const,
    message: 'You have 2 orders pending approval',
    persistent: true,
    action: { label: 'Review', onClick: () => {} },
  },
  {
    id: 't-session',
    variant: 'info' as const,
    message: 'Session expires in',
    persistent: true,
    countdown: '04:58',
    action: { label: 'Extend', onClick: () => {} },
  },
  {
    id: 't-sync',
    variant: 'success' as const,
    message: 'Portfolio sync complete — 12 positions updated',
  },
  {
    id: 't-reject',
    variant: 'error' as const,
    message: 'Order AAPL rejected — insufficient buying power',
  },
]

export const Stack = () => (
  <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
    <ToastContainer toasts={toasts} onDismiss={() => {}} />
  </div>
)

export const Single = () => (
  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
    <ToastContainer toasts={[toasts[2]]} onDismiss={() => {}} />
  </div>
)
