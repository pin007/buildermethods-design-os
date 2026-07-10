import { CalendarDisplay } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const settings = data.calendarDisplaySettings as any

export const Default = () => (
  <div style={{ padding: 16 }}>
    <CalendarDisplay
      settings={settings}
      onToggleProvider={() => {}}
      onChangeProvider={() => {}}
      onUpdateAlertTiming={() => {}}
      onToggleCountry={() => {}}
      onChangeTimezone={() => {}}
      onToggleTheme={() => {}}
      onUpdateRefreshInterval={() => {}}
      onSave={() => {}}
      onBack={() => {}}
    />
  </div>
)
