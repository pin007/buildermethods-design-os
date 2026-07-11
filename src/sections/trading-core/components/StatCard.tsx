import type { LucideIcon } from 'lucide-react'

type ChangeType = 'positive' | 'negative' | 'neutral' | 'warning'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  change?: string
  changeType?: ChangeType
  badge?: number
  onClick?: () => void
}

const changeColors: Record<ChangeType, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-500 dark:text-red-400',
  neutral: 'text-hint',
  warning: 'text-amber-500 dark:text-amber-400',
}

const iconColors: Record<ChangeType, string> = {
  positive: 'text-emerald-600/60 dark:text-emerald-400/50',
  negative: 'text-red-500/60 dark:text-red-400/50',
  neutral: 'text-faint',
  warning: 'text-amber-500/60 dark:text-amber-400/50',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  badge,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick

  return (
    <button
      type="button"
      className={`
        group relative w-full text-left rounded-xl border border-border
        bg-card p-5 transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
        ${isClickable
          ? 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-zinc-900/50 active:scale-[0.99]'
          : 'cursor-default'
        }
      `}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className="flex items-start justify-between">
        <div className={iconColors[changeType]}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold tabular-nums text-primary-foreground">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-hint">
        {label}
      </p>

      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>

      {change && (
        <p className={`mt-1.5 text-xs font-medium ${changeColors[changeType]}`}>
          {change}
        </p>
      )}

      {/* Hover arrow for clickable cards */}
      {isClickable && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-faint">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  )
}
