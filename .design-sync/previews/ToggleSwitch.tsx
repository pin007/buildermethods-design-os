import { ToggleSwitch } from 'trading-squad-ds'

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</span>
    {children}
  </div>
)

export const On = () => (
  <div style={{ padding: 20, maxWidth: 300 }}>
    <Row label="CNB Rate Sync">
      <ToggleSwitch enabled={true} onChange={() => {}} />
    </Row>
  </div>
)

export const Off = () => (
  <div style={{ padding: 20, maxWidth: 300 }}>
    <Row label="Options Flow">
      <ToggleSwitch enabled={false} onChange={() => {}} />
    </Row>
  </div>
)

export const Stack = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, maxWidth: 300 }}>
    <Row label="Pre-Trade Notes">
      <ToggleSwitch enabled={true} onChange={() => {}} />
    </Row>
    <Row label="Post-Trade Notes">
      <ToggleSwitch enabled={false} onChange={() => {}} />
    </Row>
    <Row label="Weekly Reviews">
      <ToggleSwitch enabled={true} onChange={() => {}} />
    </Row>
  </div>
)
