import { useState, useEffect, useRef } from 'react'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { useTradingScope } from '@/lib/trading-scope'

interface EmergencyCloseModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (filter: 'all' | 'intraday' | 'swing') => void
  positionCount: number
  intradayCount: number
  swingCount: number
}

export function EmergencyCloseModal({
  open,
  onClose,
  onConfirm,
  positionCount,
  intradayCount,
  swingCount,
}: EmergencyCloseModalProps) {
  const [filter, setFilter] = useState<'all' | 'intraday' | 'swing'>('all')
  const [confirmText, setConfirmText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  // WCAG: trap Tab focus inside the modal while open; restore focus on close.
  useFocusTrap(modalRef, open)
  const scope = useTradingScope()
  const isLive = scope === 'live'

  const affectedCount = filter === 'all' ? positionCount : filter === 'intraday' ? intradayCount : swingCount

  useEffect(() => {
    if (open) {
      setFilter('all')
      setConfirmText('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const canConfirm = confirmText === 'CLOSE ALL'

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Emergency close all positions"
        className="relative mx-4 w-full max-w-md rounded-xl border border-red-300 dark:border-red-900/60 bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-red-200 dark:border-red-900/40 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <ShieldAlert size={20} className="text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Close All Positions</h2>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isLive
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-400/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {isLive ? 'Live' : 'Paper'}
              </span>
            </div>
            <p className="text-xs text-destructive">This action cannot be undone</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">
              This closes only positions in the active <span className="font-semibold uppercase">{scope}</span> scope
              {isLive ? ' — real-money positions' : ' — simulated positions only'}. Market close orders are sent for
              all selected positions immediately; estimated market impact depends on current liquidity.
            </p>
          </div>

          {/* Position type filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Position type</label>
            <div className="flex gap-2">
              {([
                { value: 'all' as const, label: 'All', count: positionCount },
                { value: 'intraday' as const, label: 'Intraday', count: intradayCount },
                { value: 'swing' as const, label: 'Swing', count: swingCount },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`
                    flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors
                    ${
                      filter === opt.value
                        ? 'border-red-400 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-destructive'
                        : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                    }
                  `}
                >
                  {opt.label} ({opt.count})
                </button>
              ))}
            </div>
          </div>

          {/* Position summary */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Positions to close</span>
              <span className="font-mono font-semibold text-destructive">{affectedCount}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. market impact</span>
              <span className="font-mono text-hint">~0.1–0.3%</span>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label htmlFor="emergency-close-confirm" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Type <span className="font-mono font-bold text-destructive">CLOSE ALL</span> to confirm
            </label>
            <input
              ref={inputRef}
              id="emergency-close-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CLOSE ALL"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground
                placeholder:text-faint outline-none
                focus:border-red-400 dark:focus:border-red-800 focus:ring-1 focus:ring-red-400 dark:focus:ring-red-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => canConfirm && onConfirm(filter)}
            disabled={!canConfirm}
            className={`
              flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors
              ${
                canConfirm
                  ? 'bg-red-600 text-white hover:bg-red-500 cursor-pointer'
                  : 'bg-red-600/30 text-red-300 cursor-not-allowed'
              }
            `}
          >
            Close {affectedCount} Position{affectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
