import { X, AlertTriangle, WifiOff, Clock } from 'lucide-react'

export interface Banner {
  id: string
  variant: 'approval' | 'disconnect' | 'session'
  message: string
  actionLabel?: string
  actionHref?: string
  countdown?: string
}

interface SystemBannerProps {
  banner: Banner
  onDismiss?: (id: string) => void
  onAction?: () => void
}

const BANNER_STYLES: Record<Banner['variant'], { bg: string; icon: typeof AlertTriangle; role: 'alert' | 'status' }> = {
  approval: {
    bg: 'border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
    icon: AlertTriangle,
    role: 'status',
  },
  disconnect: {
    bg: 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200',
    icon: WifiOff,
    role: 'alert',
  },
  session: {
    bg: 'border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
    icon: Clock,
    role: 'alert',
  },
}

export function SystemBanner({ banner, onDismiss, onAction }: SystemBannerProps) {
  const style = BANNER_STYLES[banner.variant]
  const Icon = style.icon

  return (
    <div
      role={style.role}
      className={`flex items-center gap-3 border-b px-6 py-2.5 text-sm ${style.bg}`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">
        {banner.message}
        {banner.countdown && (
          <span className="ml-1 font-mono font-semibold">{banner.countdown}</span>
        )}
      </span>
      {banner.actionLabel && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 rounded-md bg-white/80 dark:bg-white/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white dark:hover:bg-white/20"
        >
          {banner.actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          onClick={() => onDismiss(banner.id)}
          aria-label="Dismiss banner"
          className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
