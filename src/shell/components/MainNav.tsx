import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Database,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
  Bell,
  ChevronDown,
  FileText,
  BarChart3,
  Activity,
  CalendarDays,
  ShieldCheck,
  Landmark,
  ArrowLeftRight,
  Calendar,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  isActive?: boolean
  badge?: number | string
  action?: () => void
  children?: NavItem[]
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
      { label: 'Calendar', href: '/calendar', icon: Calendar },
      { label: 'Portfolios', href: '/portfolios', icon: Wallet },
      {
        label: 'Market Data',
        href: '/market-data',
        icon: Database,
        children: [
          { label: 'Data Quality', href: '/market-data/quality', icon: ShieldCheck },
          { label: 'Corporate Actions', href: '/market-data/corporate-actions', icon: Landmark },
        ],
      },
    ],
  },
  {
    label: 'Intelligence',
    collapsible: true,
    items: [
      { label: 'Market Analysis', href: '/market-analysis', icon: Brain },
      {
        label: 'Strategies',
        href: '/strategies',
        icon: FlaskConical,
        children: [
          { label: 'Comparison', href: '/strategies/comparison', icon: ArrowLeftRight },
        ],
      },
    ],
  },
  {
    label: 'Review',
    collapsible: true,
    items: [
      {
        label: 'Trade Journal',
        href: '/trade-journal',
        icon: BookOpen,
        children: [
          { label: 'Entries', href: '/trade-journal/entries', icon: FileText },
          { label: 'Analytics', href: '/trade-journal/analytics', icon: BarChart3 },
          { label: 'Behavioral', href: '/trade-journal/behavioral', icon: Activity },
          { label: 'Weekly Review', href: '/trade-journal/review', icon: CalendarDays },
        ],
      },
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
    <nav aria-label="Main navigation" className="scrollbar-slim flex-1 overflow-y-auto px-3 pb-3">
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
                  text-xs font-semibold uppercase tracking-wider text-hint
                  ${group.collapsible ? 'cursor-pointer hover:text-muted-foreground' : 'cursor-default'}
                `}
              >
                <span>{group.label}</span>
                {group.collapsible && (
                  <ChevronDown
                    size={12}
                    aria-hidden="true"
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
                  const hasActiveChild = item.children?.some((child) => child.isActive) ?? false
                  const isParentHighlighted = isActive || hasActiveChild

                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => item.action ? item.action() : onNavigate?.(item.href)}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        className={`
                          group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium
                          min-h-[44px] lg:min-h-0
                          transition-colors duration-150
                          ${collapsed ? 'justify-center' : ''}
                          ${
                            isActive
                              ? 'border-l-2 border-primary bg-primary/10 text-primary dark:text-pink-400'
                              : hasActiveChild
                                ? 'border-l-2 border-primary/40 text-foreground'
                                : 'border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          aria-hidden="true"
                          className={isParentHighlighted ? 'text-primary dark:text-pink-400' : 'text-hint group-hover:text-muted-foreground'}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className={`
                                  flex h-5 min-w-5 items-center justify-center rounded-full px-1.5
                                  text-xs font-bold
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

                      {item.children && !collapsed && (
                        <ul className="mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon
                            const isChildActive = child.isActive ?? false

                            return (
                              <li key={child.href}>
                                <button
                                  onClick={() => child.action ? child.action() : onNavigate?.(child.href)}
                                  aria-current={isChildActive ? 'page' : undefined}
                                  className={`
                                    group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-10 pr-3 text-sm
                                    min-h-[44px] lg:min-h-0
                                    transition-colors duration-150
                                    ${
                                      isChildActive
                                        ? 'font-medium text-primary dark:text-pink-400'
                                        : 'text-muted-foreground/80 hover:bg-accent hover:text-foreground'
                                    }
                                  `}
                                >
                                  <ChildIcon
                                    size={15}
                                    aria-hidden="true"
                                    className={isChildActive ? 'text-primary dark:text-pink-400' : 'text-hint group-hover:text-muted-foreground'}
                                  />
                                  <span className="flex-1 text-left">{child.label}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
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
