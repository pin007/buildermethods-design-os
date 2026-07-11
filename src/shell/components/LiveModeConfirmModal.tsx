import { useEffect, useRef } from 'react'
import { Radio, AlertTriangle } from 'lucide-react'
import { useFocusTrap } from '@/lib/use-focus-trap'

interface LiveModeConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmation gate for switching the trading scope from Paper into Live.
 * Going *into* Live is the only direction that risks real money, so it always
 * requires a deliberate confirmation; switching back to Paper never does.
 */
export function LiveModeConfirmModal({ open, onClose, onConfirm }: LiveModeConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  // WCAG: trap Tab focus inside the confirm dialog while open; restore on close.
  useFocusTrap(modalRef, open)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Switch to Live trading"
        className="relative mx-4 w-full max-w-md rounded-xl border border-rose-300 dark:border-rose-900/60 bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-rose-200 dark:border-rose-900/40 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
            <Radio size={20} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Switch to Live Trading</h2>
            <p className="text-xs text-rose-600 dark:text-rose-400">Real money — orders execute for real</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="text-xs text-rose-700 dark:text-rose-300">
              In Live scope the order panel only lists your <strong>live</strong> portfolios and every
              order routes to a real broker account. The Paper/Live indicator will turn red for the
              whole session until you switch back.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Only continue if you intend to place real-money trades. You can switch back to Paper at any
            time without confirmation.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Stay in Paper
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            Switch to Live
          </button>
        </div>
      </div>
    </div>
  )
}
