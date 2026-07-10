import { NotificationsAlerts } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const channels = data.notificationChannels as any[]
const preferences = data.notificationPreferences as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <NotificationsAlerts
      channels={channels as any}
      preferences={preferences}
      onToggleChannel={() => {}}
      onUpdateChannel={() => {}}
      onRevealCredential={() => {}}
      onRotateCredential={() => {}}
      onUpdateQuietHours={() => {}}
      onToggleSubscription={() => {}}
      onUpdateSeverityThreshold={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
