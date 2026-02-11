import { useEffect, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface Toast {
  id: string
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string
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

  useEffect(() => {
    const timer = setTimeout(dismiss, DURATIONS[toast.variant])
    return () => clearTimeout(timer)
  }, [toast.variant, dismiss])

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
      <p className="flex-1 text-sm text-foreground">{toast.message}</p>
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

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <>
      {/* Desktop: bottom-right, stacked */}
      <div className="fixed bottom-4 right-4 z-[9999] hidden w-80 space-y-2 md:block">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Mobile: top-center, full-width */}
      <div className="fixed left-4 right-4 top-14 z-[9999] space-y-2 md:hidden">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  )
}
