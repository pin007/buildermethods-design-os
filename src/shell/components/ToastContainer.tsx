import { useEffect, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string
  /**
   * Persistent notifications represent standing conditions (pending approvals,
   * broker disconnect, session expiry). They don't auto-dismiss and sort above
   * transient toasts at the top of the stack.
   */
  persistent?: boolean
  /** Optional inline action button, e.g. "Review", "Reconnect", "Extend". */
  action?: ToastAction
  /** Optional monospace suffix appended to the message (e.g. a session countdown). */
  countdown?: string
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const DURATIONS: Record<Toast['variant'], number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
}

const ICONS: Record<Toast['variant'], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES: Record<Toast['variant'], { container: string; icon: string }> = {
  success: {
    container: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    container: 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
  },
  warning: {
    container: 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    container: 'border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/30',
    icon: 'text-sky-600 dark:text-sky-400',
  },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const dismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss])

  // Transient toasts auto-dismiss; persistent (standing-condition) ones stay
  // until resolved or manually dismissed.
  useEffect(() => {
    if (toast.persistent) return
    const timer = setTimeout(dismiss, DURATIONS[toast.variant])
    return () => clearTimeout(timer)
  }, [toast.variant, toast.persistent, dismiss])

  const Icon = ICONS[toast.variant]
  const style = STYLES[toast.variant]
  const ariaRole = toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status'

  return (
    <div
      role={ariaRole}
      className={`
        flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg
        animate-in slide-in-from-right-full duration-300 ease-out
        ${style.container}
      `}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${style.icon}`} />
      <p className="flex-1 text-sm text-foreground">
        {toast.message}
        {toast.countdown && (
          <span className="ml-1 font-mono font-semibold">{toast.countdown}</span>
        )}
      </p>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick()
            dismiss()
          }}
          className="shrink-0 rounded-md bg-white/80 dark:bg-white/10 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-white dark:hover:bg-white/20"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-hint transition-colors hover:text-muted-foreground"
      >
        <X size={14} />
      </button>
    </div>
  )
}

/** Persistent (sticky) notifications sort above transient ones; order is stable within each group. */
function orderToasts(toasts: Toast[]): Toast[] {
  return [...toasts].sort((a, b) => Number(Boolean(b.persistent)) - Number(Boolean(a.persistent)))
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  const ordered = orderToasts(toasts)

  return (
    <>
      {/* Desktop: top-right, stacked (sticky notifications on top) */}
      <div className="fixed right-4 top-4 z-[9999] hidden w-80 space-y-2 md:block">
        {ordered.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Mobile: top, full-width */}
      <div className="fixed left-4 right-4 top-14 z-[9999] space-y-2 md:hidden">
        {ordered.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  )
}
