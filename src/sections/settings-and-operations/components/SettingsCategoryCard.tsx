import {
  Cable,
  Database,
  Wallet,
  ShieldAlert,
  Receipt,
  FlaskConical,
  Brain,
  BookOpen,
  Bell,
  CalendarCog,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { SettingsCategory, BadgeVariant } from '@/../product/sections/settings-and-operations/types'

const iconMap: Record<string, LucideIcon> = {
  Cable,
  Database,
  Wallet,
  ShieldAlert,
  Receipt,
  FlaskConical,
  Brain,
  BookOpen,
  Bell,
  CalendarCog,
}

interface SettingsCategoryCardProps {
  category: SettingsCategory
  onClick?: () => void
}

function badgeClasses(variant: BadgeVariant): string {
  switch (variant) {
    case 'warning':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/25'
    case 'error':
      return 'bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/25'
    case 'info':
      return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25'
    default:
      return 'bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/25'
  }
}

export function SettingsCategoryCard({ category, onClick }: SettingsCategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Cable

  return (
    <button
      onClick={onClick}
      className="
        group relative flex w-full flex-col items-start gap-4 rounded-xl
        border border-border bg-card p-5
        text-left transition-all duration-200
        hover:border-primary/30 hover:bg-primary/[0.03]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        focus-visible:ring-offset-white dark:ring-offset-zinc-950
      "
    >
      {/* Top row: icon + badge */}
      <div className="flex w-full items-start justify-between">
        <div
          className="
            flex h-10 w-10 items-center justify-center rounded-lg
            bg-primary/10 text-primary
            transition-colors duration-200
            group-hover:bg-primary/15
          "
        >
          <Icon size={20} aria-hidden="true" />
        </div>
        {category.badge !== null && category.badgeVariant && (
          <span
            className={`
              flex h-5 min-w-5 items-center justify-center rounded-full
              px-1.5 text-xs font-bold
              ${badgeClasses(category.badgeVariant)}
            `}
          >
            {category.badge}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {category.label}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {category.summary}
        </p>
      </div>

      {/* Hover arrow */}
      <div
        className="
          absolute bottom-5 right-5
          flex h-6 w-6 items-center justify-center rounded-full
          bg-transparent text-transparent
          transition-all duration-200
          group-hover:bg-primary/10 group-hover:text-primary
        "
      >
        <ChevronRight size={14} aria-hidden="true" />
      </div>
    </button>
  )
}
