import { EmergencyCloseModal } from 'trading-squad-ds'

export const Open = () => (
  <div style={{ position: 'relative', height: 620, overflow: 'hidden' }}>
    <EmergencyCloseModal
      open
      positionCount={14}
      intradayCount={6}
      swingCount={8}
      onClose={() => {}}
      onConfirm={() => {}}
    />
  </div>
)
