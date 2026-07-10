import { SettingsCategoryCard } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const categories = data.settingsCategories as any[]
const withWarning = categories.find((c) => c.badgeVariant === 'warning') ?? categories[0]
const withInfo = categories.find((c) => c.badgeVariant === 'info') ?? categories[1]
const plain = categories.find((c) => !c.badge) ?? categories[2]

export const Warning = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <SettingsCategoryCard category={withWarning as any} onClick={() => {}} />
  </div>
)

export const Info = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <SettingsCategoryCard category={withInfo as any} onClick={() => {}} />
  </div>
)

export const Plain = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <SettingsCategoryCard category={plain as any} onClick={() => {}} />
  </div>
)

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20, maxWidth: 860 }}>
    {categories.slice(0, 6).map((c) => (
      <SettingsCategoryCard key={c.id} category={c as any} onClick={() => {}} />
    ))}
  </div>
)
