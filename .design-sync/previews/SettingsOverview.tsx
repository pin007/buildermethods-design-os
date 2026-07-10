import { SettingsOverview } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const categories = data.settingsCategories as any[]

export const Overview = () => (
  <div style={{ padding: 16 }}>
    <SettingsOverview categories={categories as any} onNavigateToCategory={() => {}} />
  </div>
)
