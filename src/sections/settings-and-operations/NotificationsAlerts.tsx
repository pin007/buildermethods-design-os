import data from '@/../product/sections/settings-and-operations/data.json'
import { NotificationsAlerts } from './components/NotificationsAlerts'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function NotificationsAlertsPreview() {
  return (
    <NotificationsAlerts
      channels={data.notificationChannels as any}
      preferences={data.notificationPreferences as any}
      onToggleChannel={(id, enabled) => console.log('Toggle channel:', id, enabled)}
      onUpdateChannel={(id, config) => console.log('Update channel:', id, config)}
      onRevealCredential={(id, field) => console.log('Reveal:', id, field)}
      onRotateCredential={(id, field) => console.log('Rotate:', id, field)}
      onUpdateQuietHours={(c) => console.log('Update quiet hours:', c)}
      onToggleSubscription={(type, channel, enabled) => console.log('Toggle sub:', type, channel, enabled)}
      onUpdateSeverityThreshold={(level) => console.log('Update severity:', level)}
      onSave={() => console.log('Save notification settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
