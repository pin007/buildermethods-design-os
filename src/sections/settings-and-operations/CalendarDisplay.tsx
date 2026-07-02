import data from '@/../product/sections/settings-and-operations/data.json'
import { CalendarDisplay } from './components/CalendarDisplay'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function CalendarDisplayPreview() {
  return (
    <CalendarDisplay
      settings={data.calendarDisplaySettings as any}
      onToggleProvider={(id, enabled) => console.log('Toggle provider:', id, enabled)}
      onChangeProvider={(id, provider) => console.log('Change provider:', id, provider)}
      onUpdateAlertTiming={(type, value) => console.log('Update timing:', type, value)}
      onToggleCountry={(country, enabled) => console.log('Toggle country:', country, enabled)}
      onChangeTimezone={(tz) => console.log('Change timezone:', tz)}
      onToggleTheme={(theme) => console.log('Toggle theme:', theme)}
      onUpdateRefreshInterval={(s) => console.log('Update refresh:', s)}
      onSave={() => console.log('Save calendar settings')}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
