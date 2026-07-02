import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ArrowRight, type LucideIcon } from 'lucide-react'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  category: string
  action: () => void
}

interface CommandPaletteProps {
  items: CommandItem[]
  open: boolean
  onClose: () => void
}

export function CommandPalette({ items, open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const paletteRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatFiltered = Object.values(grouped).flat()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatFiltered[selectedIndex]) {
            flatFiltered[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'Tab': {
          e.preventDefault()
          const palette = paletteRef.current
          if (!palette) break
          const focusable = Array.from(
            palette.querySelectorAll<HTMLElement>(
              'input, button, [tabindex]:not([tabindex="-1"])'
            )
          )
          if (!focusable.length) break
          const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
          if (e.shiftKey) {
            const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
            focusable[prevIndex].focus()
          } else {
            const nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1
            focusable[nextIndex].focus()
          }
          break
        }
      }
    },
    [open, flatFiltered, selectedIndex, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else if (triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        ref={paletteRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-200 ease-out"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={16} className="shrink-0 text-hint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, instruments, actions..."
            className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-faint outline-none"
          />
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-hint">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {flatFiltered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-faint">
              No results found
            </p>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-faint">
                  {category}
                </p>
                {categoryItems.map((item) => {
                  const globalIndex = flatFiltered.indexOf(item)
                  const isSelected = globalIndex === selectedIndex
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`
                        flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors
                        ${isSelected ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'}
                      `}
                    >
                      {Icon && (
                        <Icon
                          size={16}
                          className={isSelected ? 'text-primary dark:text-pink-400' : 'text-faint'}
                        />
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-faint">
                          {item.description}
                        </span>
                      )}
                      {isSelected && (
                        <ArrowRight size={14} className="text-faint" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2">
          <span className="flex items-center gap-1 text-xs text-faint">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">{'\u2191\u2193'}</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-xs text-faint">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">{'\u21B5'}</kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-xs text-faint">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}
