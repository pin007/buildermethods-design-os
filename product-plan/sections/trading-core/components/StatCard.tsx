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
  neutral: 'text-stone-500 dark:text-zinc-500',
  warning: 'text-amber-500 dark:text-amber-400',
}

const iconColors: Record<ChangeType, string> = {
  positive: 'text-emerald-600/60 dark:text-emerald-400/50',
  negative: 'text-red-500/60 dark:text-red-400/50',
  neutral: 'text-stone-300 dark:text-zinc-600',
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
    <div
      className={`
        group relative rounded-xl border border-stone-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900 p-5 transition-all duration-200
        ${isClickable
          ? 'cursor-pointer hover:border-stone-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-zinc-900/50 active:scale-[0.99]'
          : ''
        }
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className={iconColors[changeType]}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-bold tabular-nums text-white">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
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
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-stone-300 dark:text-zinc-600">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}
