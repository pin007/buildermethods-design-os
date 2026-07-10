import { UserMenu } from 'trading-squad-ds'

const user = { name: 'Alex Morgan', email: 'alex@tradingsquad.io' }

export const Header = () => (
  <div style={{ padding: 24, display: 'flex', justifyContent: 'flex-end' }}>
    <UserMenu user={user} variant="header" onNavigate={() => {}} onLogout={() => {}} />
  </div>
)

export const Sidebar = () => (
  <div style={{ padding: 16 }}>
    <div className="w-[248px] rounded-lg border border-border bg-card p-2">
      <UserMenu user={user} variant="sidebar" onNavigate={() => {}} onLogout={() => {}} />
    </div>
  </div>
)
