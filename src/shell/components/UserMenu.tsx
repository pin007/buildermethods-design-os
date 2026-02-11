import { LogOut, User, Settings, ChevronUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface UserMenuProps {
  user: {
    name: string
    email?: string
    avatarUrl?: string
  }
  variant?: 'header' | 'sidebar'
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function UserMenu({ user, variant = 'header', onNavigate, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Keyboard navigation: Esc to close, Arrow Up/Down to navigate
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      const dropdown = dropdownRef.current
      if (!dropdown) return

      const items = Array.from(dropdown.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      const currentIndex = items.indexOf(document.activeElement as HTMLElement)

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
          break
        case 'ArrowDown':
          e.preventDefault()
          items[currentIndex < items.length - 1 ? currentIndex + 1 : 0]?.focus()
          break
        case 'ArrowUp':
          e.preventDefault()
          items[currentIndex > 0 ? currentIndex - 1 : items.length - 1]?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Focus first menu item on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        dropdownRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
      }, 0)
    }
  }, [open])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isSidebar = variant === 'sidebar'

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`
          flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent
          min-h-[44px] lg:min-h-0
          ${isSidebar ? 'text-left' : ''}
        `}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary dark:text-pink-400">
            {initials}
          </div>
        )}
        {isSidebar ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
              {user.email && (
                <p className="truncate text-[10px] text-faint">{user.email}</p>
              )}
            </div>
            <ChevronUp
              size={12}
              className={`shrink-0 text-faint transition-transform ${open ? '' : 'rotate-180'}`}
            />
          </>
        ) : (
          <span className="hidden text-sm font-medium text-foreground md:block">
            {user.name}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          role="menu"
          className={`
            absolute z-50 w-56 rounded-lg border border-border bg-popover py-1 shadow-lg
            animate-in fade-in duration-150 ease-out
            ${isSidebar ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'}
          `}
        >
          {!isSidebar && (
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              {user.email && (
                <p className="text-xs text-hint">{user.email}</p>
              )}
            </div>
          )}

          <div className="py-1">
            <button
              role="menuitem"
              onClick={() => {
                onNavigate?.('/settings')
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <User size={14} />
              Profile
            </button>
            <button
              role="menuitem"
              onClick={() => {
                onNavigate?.('/settings')
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>

          <div className="border-t border-border py-1">
            <button
              role="menuitem"
              onClick={() => {
                onLogout?.()
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive transition-colors hover:bg-accent"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
