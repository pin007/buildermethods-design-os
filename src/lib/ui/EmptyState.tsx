/**
 * EmptyState — recommendation #7 (async state trilogy).
 *
 * A genuinely helpful empty state ("No open positions — place your first
 * order") beats a blank panel. Also covers the error variant with a recoverable
 * retry, since streaming data can fail transiently.
 */
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** Primary call-to-action. */
  action?: { label: string; onClick: () => void }
  /** Renders the error treatment (amber icon tint, "Retry" affordance). */
  variant?: 'empty' | 'error'
  onRetry?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'empty',
  onRetry,
  className = '',
}: EmptyStateProps) {
  const isError = variant === 'error'
  const DisplayIcon = Icon ?? (isError ? AlertTriangle : undefined)

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      {DisplayIcon && (
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isError
              ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
              : 'bg-muted text-hint'
          }`}
        >
          <DisplayIcon size={22} strokeWidth={1.75} />
        </div>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {(action || (isError && onRetry)) && (
        <div className="mt-5 flex items-center gap-2">
          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Retry
            </button>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
