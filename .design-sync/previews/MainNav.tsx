import { MainNav, navigationGroups } from 'trading-squad-ds'

// Mark Orders active + add badges, mirroring the shell's live nav state.
const groups = (navigationGroups as any[]).map((group) => ({
  ...group,
  items: group.items.map((item: any) => ({
    ...item,
    isActive: item.href === '/orders',
    badge: item.href === '/alerts' ? 3 : item.href === '/orders' ? 2 : item.href === '/market-analysis' ? 5 : undefined,
    children: item.children?.map((child: any) => ({
      ...child,
      isActive: child.href === '/market-data/quality',
    })),
  })),
}))

export const Sidebar = () => (
  <div style={{ padding: 16 }}>
    <div className="flex h-[680px] w-[264px] flex-col rounded-lg border border-border bg-card py-3">
      <div className="px-5 pb-3 text-sm font-bold tracking-tight text-foreground">Trading Squad</div>
      <MainNav groups={groups as any} onNavigate={() => {}} />
    </div>
  </div>
)
