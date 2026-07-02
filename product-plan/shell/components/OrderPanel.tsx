import { useState, useEffect, useRef, useCallback } from 'react'
import { ShoppingCart, Minus, X, Maximize2 } from 'lucide-react'

export type OrderPanelState = 'closed' | 'open' | 'minimized'

export interface OrderPanelProps {
  state: OrderPanelState
  onClose: () => void
  onMinimize: () => void
  onRestore: () => void
  children?: React.ReactNode
}

export function OrderPanel({ state, onClose, onMinimize, onRestore, children }: OrderPanelProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Save trigger element on open, restore focus on close
  useEffect(() => {
    if (state === 'open') {
      triggerRef.current = document.activeElement as HTMLElement
      setHasUnsavedChanges(false)
      setShowConfirmDialog(false)
      setTimeout(() => {
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"]), input, select, textarea'
        )
        firstFocusable?.focus()
      }, 50)
    } else if (state === 'closed' && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [state])

  useEffect(() => {
    if (state === 'closed') {
      setHasUnsavedChanges(false)
      setShowConfirmDialog(false)
    }
  }, [state])

  const attemptClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true)
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, onClose])

  const forceClose = useCallback(() => {
    setShowConfirmDialog(false)
    setHasUnsavedChanges(false)
    onClose()
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state !== 'open') return

      if (e.key === 'Escape') {
        e.preventDefault()
        if (showConfirmDialog) {
          setShowConfirmDialog(false)
        } else {
          attemptClose()
        }
        return
      }

      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel || !panel.contains(document.activeElement)) return

        e.preventDefault()
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        )
        if (!focusable.length) return
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey) {
          const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
          focusable[prevIndex].focus()
        } else {
          const nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1
          focusable[nextIndex].focus()
        }
      }
    },
    [state, showConfirmDialog, attemptClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleContentChange = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  if (state === 'closed') return null

  // Minimized tab
  if (state === 'minimized') {
    return (
      <div
        className="fixed inset-y-0 right-0 z-[60] flex w-16 items-center justify-center
          border-l border-border bg-background transition-[width] duration-200 ease-out"
      >
        <button
          onClick={onRestore}
          aria-label="Restore order panel"
          className="flex flex-col items-center gap-2 rounded-lg p-2 text-muted-foreground
            transition-colors hover:bg-accent hover:text-foreground"
        >
          <Maximize2 size={16} />
          <span
            className="text-xs font-semibold uppercase tracking-widest text-hint"
            style={{ writingMode: 'vertical-rl' }}
          >
            Order
          </span>
        </button>
      </div>
    )
  }

  // Open panel
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/40 animate-in fade-in duration-150"
        onClick={attemptClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Order entry panel"
        className="fixed inset-y-0 right-0 z-[60] flex w-full flex-col border-l
          border-border bg-background shadow-2xl
          animate-in slide-in-from-right duration-300 ease-out
          sm:w-[480px]"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <ShoppingCart size={16} className="text-primary dark:text-pink-400" />
          <h2 className="flex-1 text-sm font-semibold text-foreground">New Order</h2>
          <button
            onClick={onMinimize}
            aria-label="Minimize order panel"
            className="rounded-lg p-1.5 text-hint transition-colors hover:bg-accent hover:text-muted-foreground"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={attemptClose}
            aria-label="Close order panel"
            className="rounded-lg p-1.5 text-hint transition-colors hover:bg-accent hover:text-muted-foreground"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable content — no padding; content manages its own layout */}
        <div
          className="flex-1 overflow-y-auto"
          onChange={handleContentChange}
          onInput={handleContentChange}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center gap-4 border-t border-border px-4 py-2">
          <span className="flex items-center gap-1 text-xs text-faint">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd>
            close
          </span>
          <span className="flex items-center gap-1 text-xs text-faint">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
              {'\u2318'}N
            </kbd>
            toggle
          </span>
        </div>

        {/* Confirmation dialog */}
        {showConfirmDialog && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/60">
            <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-popover p-6 shadow-2xl">
              <h3 className="text-sm font-semibold text-foreground">Discard changes?</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                You have unsaved changes that will be lost.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 rounded-lg border border-border bg-muted px-3 py-2
                    text-xs font-medium text-foreground transition-colors
                    hover:bg-accent"
                >
                  Keep editing
                </button>
                <button
                  onClick={forceClose}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2
                    text-xs font-medium text-white transition-colors
                    hover:bg-red-500"
                >
                  Discard &amp; close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
