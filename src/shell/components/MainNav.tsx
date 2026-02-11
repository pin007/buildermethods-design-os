import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  CandlestickChart,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
  Bell,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  isActive?: boolean
  badge?: number | string
  action?: () => void
}

export interface NavGroup {
  label: string
  items: NavItem[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface MainNavProps {
  groups: NavGroup[]
  collapsed?: boolean
  onNavigate?: (href: string) => void
}

export const navigationGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Alerts', href: '/alerts', icon: Bell },
    ],
  },
  {
    label: 'Trading',
    collapsible: true,
    items: [
      { label: 'Orders', href: '/orders', icon: ShoppingCart },
      { label: 'Positions', href: '/positions', icon: Wallet },
      { label: 'Charts', href: '/charts', icon: CandlestickChart },
    ],
  },
  {
    label: 'Intelligence',
    collapsible: true,
    items: [
      { label: 'Market Analysis', href: '/market-analysis', icon: Brain },
      { label: 'Strategies', href: '/strategies', icon: FlaskConical },
    ],
  },
  {
    label: 'Review',
    collapsible: true,
    items: [
      { label: 'Trade Journal', href: '/trade-journal', icon: BookOpen },
    ],
  },
  {
    label: 'System',
    collapsible: true,
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function MainNav({ groups, collapsed = false, onNavigate }: MainNavProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const group of groups) {
      if (group.defaultCollapsed) initial.add(group.label)
    }
    return initial
  })

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 pb-3">
      {groups.map((group) => {
        const isGroupCollapsed = collapsedGroups.has(group.label)

        return (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <button
                onClick={group.collapsible ? () => toggleGroup(group.label) : undefined}
                aria-expanded={group.collapsible ? !isGroupCollapsed : undefined}
                className={`
                  mb-1.5 flex w-full items-center justify-between px-3
                  text-[11px] font-semibold uppercase tracking-wider text-hint
                  ${group.collapsible ? 'cursor-pointer hover:text-muted-foreground' : 'cursor-default'}
                `}
              >
                <span>{group.label}</span>
                {group.collapsible && (
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${isGroupCollapsed ? '-rotate-90' : ''}`}
                  />
                )}
              </button>
            )}

            {!isGroupCollapsed && (
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.isActive ?? false

                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => item.action ? item.action() : onNavigate?.(item.href)}
                        title={collapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        className={`
                          group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium
                          min-h-[44px] lg:min-h-0
                          transition-colors duration-150
                          ${collapsed ? 'justify-center' : ''}
                          ${
                            isActive
                              ? 'border-l-2 border-primary bg-primary/10 text-primary dark:text-pink-400'
                              : 'border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          className={isActive ? 'text-primary dark:text-pink-400' : 'text-hint group-hover:text-muted-foreground'}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className={`
                                  flex h-5 min-w-5 items-center justify-center rounded-full px-1.5
                                  text-[10px] font-bold
                                  ${
                                    typeof item.badge === 'number' && item.badge > 0
                                      ? 'bg-primary/20 text-primary dark:text-pink-400'
                                      : 'bg-muted text-hint'
                                  }
                                `}
                              >
                                {typeof item.badge === 'number' && item.badge > 9
                                  ? '9+'
                                  : item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
