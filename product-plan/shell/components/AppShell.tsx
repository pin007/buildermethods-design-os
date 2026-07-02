import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Menu, X, Sun, Moon, Search, ShieldAlert } from 'lucide-react'
import { MainNav, type NavGroup } from './MainNav'
import { UserMenu } from './UserMenu'
import { CommandPalette, type CommandItem } from './CommandPalette'
import { OrderPanel, type OrderPanelState } from './OrderPanel'
import { ToastContainer, type Toast } from './ToastContainer'
import { SystemBanner, type Banner } from './SystemBanner'
import { EmergencyCloseModal } from './EmergencyCloseModal'

export interface BrokerStatus {
  name: string
  status: 'connected' | 'degraded' | 'disconnected'
}

interface AppShellProps {
  children: React.ReactNode
  navigationGroups: NavGroup[]
  user?: { name: string; email?: string; avatarUrl?: string }
  brokers?: BrokerStatus[]
  commandItems?: CommandItem[]
  orderPanelContent?: React.ReactNode
  banners?: Banner[]
  breadcrumb?: React.ReactNode
  pageTitle?: string
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onEmergencyClose?: (filter: 'all' | 'intraday' | 'swing') => void
  onDismissBanner?: (id: string) => void
  onSessionExtend?: () => void
  onSessionLogin?: () => void
  toastRef?: React.MutableRefObject<((toast: Omit<Toast, 'id'>) => void) | null>
}

const SIDEBAR_MIN = 220
const SIDEBAR_MAX = 400
const SIDEBAR_DEFAULT = 280
const SIDEBAR_COLLAPSED = 64

const statusColor: Record<BrokerStatus['status'], string> = {
  connected: 'bg-emerald-400',
  degraded: 'bg-amber-400',
  disconnected: 'bg-red-400',
}

const statusLabel: Record<BrokerStatus['status'], string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
}

function SidebarLogo({ collapsed = false, darkMode = true }: { collapsed?: boolean; darkMode?: boolean }) {
  // Light-mode bar fills — lighter tones visible against light bg
  const bar1 = darkMode ? '#2A2A2E' : '#D6D3D1'
  const bar2 = darkMode ? '#3A3A3F' : '#A8A29E'
  const bar3 = darkMode ? '#6B6B70' : '#78716C'
  const wordmarkFill = darkMode ? '#F5F5F5' : '#1C1917'

  if (collapsed) {
    return (
      <div className="flex justify-center pb-5">
        <svg viewBox="0 0 100 110" className="h-8 w-8">
          <defs>
            <linearGradient id="sidebarPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <rect x="5" y="60" width="16" height="35" rx="3" fill={bar1} />
          <rect x="27" y="45" width="16" height="50" rx="3" fill={bar2} />
          <rect x="49" y="25" width="16" height="70" rx="3" fill={bar3} />
          <rect x="71" y="5" width="16" height="90" rx="3" fill="url(#sidebarPrimaryGrad)" />
        </svg>
      </div>
    )
  }

  return (
    <div className="px-5 pb-5">
      <svg
        viewBox="0 0 380 120"
        className="h-12 w-auto"
      >
        <defs>
          <linearGradient id="sidebarPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
        </defs>
        <g transform="translate(10, 10)">
          <rect x="0" y="65" width="18" height="35" rx="3" fill={bar1} />
          <rect x="24" y="50" width="18" height="50" rx="3" fill={bar2} />
          <rect x="48" y="30" width="18" height="70" rx="3" fill={bar3} />
          <rect x="72" y="10" width="18" height="90" rx="3" fill="url(#sidebarPrimaryGrad)" />
        </g>
        <text x="120" y="60" fontFamily="'DM Sans', sans-serif" fontSize="48" fill={wordmarkFill} fontWeight="800" letterSpacing="-2">TRADING</text>
        <text x="124" y="100" fontFamily="'DM Sans', sans-serif" fontSize="36" fill="url(#sidebarPrimaryGrad)" fontWeight="400" letterSpacing="10">SQUAD</text>
      </svg>
    </div>
  )
}

export default function AppShell({
  children,
  navigationGroups = [],
  user,
  brokers = [],
  commandItems = [],
  orderPanelContent,
  banners = [],
  breadcrumb,
  pageTitle,
  onNavigate,
  onLogout,
  onEmergencyClose,
  onDismissBanner,
  onSessionExtend,
  onSessionLogin,
  toastRef,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (document.documentElement.classList.contains('dark')) return true
    const stored = localStorage.getItem('theme')
    if (stored === 'light') return false
    if (stored === 'dark') return true
    return true
  })
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [orderPanelState, setOrderPanelState] = useState<OrderPanelState>('closed')
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [emergencyCloseOpen, setEmergencyCloseOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(SIDEBAR_DEFAULT)

  const openOrderPanel = useCallback(() => setOrderPanelState('open'), [])
  const closeOrderPanel = useCallback(() => setOrderPanelState('closed'), [])
  const minimizeOrderPanel = useCallback(() => setOrderPanelState('minimized'), [])
  const restoreOrderPanel = useCallback(() => setOrderPanelState('open'), [])

  const collapsed = isTablet && !sidebarHovered

  // Toast API — exposed via ref for sections to call
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Expose addToast via ref
  useEffect(() => {
    if (toastRef) toastRef.current = addToast
  }, [toastRef, addToast])

  // Sync dark mode to document root and localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Update document title on pageTitle change
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - Trading Squad`
    } else {
      document.title = 'Trading Squad'
    }
  }, [pageTitle])

  // Enhance command items: intercept 'act-new-order' to open order panel
  const enhancedCommandItems = useMemo(
    () =>
      commandItems.map((item) =>
        item.id === 'act-new-order'
          ? {
              ...item,
              action: () => {
                item.action()
                openOrderPanel()
              },
            }
          : item
      ),
    [commandItems, openOrderPanel]
  )

  // Detect tablet breakpoint (768px - 1023px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    setIsTablet(mq.matches)
    function onChange(e: MediaQueryListEvent) {
      setIsTablet(e.matches)
      if (!e.matches) setSidebarHovered(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Cmd+K / Ctrl+K and Cmd+N / Ctrl+N listener
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setOrderPanelState((prev) => (prev === 'open' ? 'closed' : 'open'))
      }
    }
    document.addEventListener('keydown', handleGlobalKey)
    return () => document.removeEventListener('keydown', handleGlobalKey)
  }, [])

  // Resize sidebar by dragging
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sidebarWidth])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return
      const delta = e.clientX - dragStartX.current
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, dragStartWidth.current + delta))
      setSidebarWidth(newWidth)
    }

    function onMouseUp() {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip navigation link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED : sidebarWidth }}
        onMouseEnter={() => isTablet && setSidebarHovered(true)}
        onMouseLeave={() => isTablet && setSidebarHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col pt-6
          bg-sidebar
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${isTablet ? 'transition-[width] duration-200 overflow-hidden' : ''}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarLogo collapsed={collapsed} darkMode={darkMode} />

        {/* Search trigger */}
        <div className={collapsed ? 'flex justify-center pb-4' : 'px-3 pb-4'}>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title={collapsed ? 'Search (\u2318K)' : undefined}
            className={
              collapsed
                ? 'flex items-center justify-center rounded-lg p-2 text-hint transition-colors hover:bg-hover hover:text-muted-foreground'
                : 'flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-hint transition-colors hover:border-sidebar-border hover:text-muted-foreground min-h-[44px] lg:min-h-0'
            }
          >
            <Search size={14} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-xs">Search...</span>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs font-medium text-faint">
                  {'\u2318'}K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation — inject theme toggle into System group */}
        <MainNav
          collapsed={collapsed}
          groups={navigationGroups.map((group) =>
            group.label === 'System'
              ? {
                  ...group,
                  items: [
                    ...group.items,
                    {
                      label: darkMode ? 'Light Mode' : 'Dark Mode',
                      href: '#theme',
                      icon: darkMode ? Sun : Moon,
                      action: () => setDarkMode(!darkMode),
                    },
                  ],
                }
              : group
          )}
          onNavigate={(href) => {
            onNavigate?.(href)
            setSidebarOpen(false)
          }}
        />

        {/* Sidebar footer: emergency close, brokers, user */}
        <div className="mt-auto border-t border-border">
          {/* Emergency close all positions */}
          <div className={collapsed ? 'flex justify-center py-2' : 'px-3 py-2'}>
            <button
              onClick={() => setEmergencyCloseOpen(true)}
              title={collapsed ? 'Close All Positions' : undefined}
              className={
                collapsed
                  ? 'flex items-center justify-center rounded-lg p-2 text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-950/50'
                  : `flex w-full items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50
                    bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-xs font-medium text-destructive
                    transition-colors hover:border-red-300 dark:hover:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50`
              }
            >
              <ShieldAlert size={14} />
              {!collapsed && <span>Close All Positions</span>}
            </button>
          </div>

          {/* Broker status */}
          {brokers.length > 0 && (
            <div className={collapsed ? 'flex flex-col items-center gap-1 py-2' : 'flex items-center gap-3 px-5 py-2'}>
              {brokers.map((broker) => (
                <div
                  key={broker.name}
                  role="status"
                  aria-label={`${broker.name}: ${statusLabel[broker.status]}`}
                  className={collapsed ? 'flex items-center justify-center' : 'flex items-center gap-1.5 min-h-[44px] lg:min-h-0'}
                  title={`${broker.name}: ${statusLabel[broker.status]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColor[broker.status]}`} />
                  {!collapsed && (
                    <span className="text-xs font-medium text-faint">
                      {broker.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* User */}
          {user && (
            <div className={collapsed ? 'flex justify-center border-t border-border/50 py-2' : 'border-t border-border/50 px-3 py-2'}>
              <UserMenu
                user={user}
                onNavigate={onNavigate}
                onLogout={onLogout}
                variant={collapsed ? 'header' : 'sidebar'}
              />
            </div>
          )}
        </div>

        {/* Resize handle */}
        <div
          role="separator"
          aria-label="Resize sidebar"
          onMouseDown={onMouseDown}
          className="
            absolute right-0 top-0 bottom-0 z-50 hidden w-1 cursor-col-resize
            transition-colors hover:bg-primary/30 lg:block
          "
        />
      </aside>

      {/* Main area — visually disconnected from sidebar */}
      <div
        className="flex flex-1 flex-col overflow-hidden transition-[margin] duration-200"
        style={{ marginRight: orderPanelState === 'minimized' ? 64 : 0 }}
      >
        {/* Mobile hamburger — only visible on small screens */}
        <div className="flex h-12 shrink-0 items-center bg-background px-6 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* System banners */}
        {banners.length > 0 && (
          <div className="shrink-0">
            {banners.map((banner) => (
              <SystemBanner
                key={banner.id}
                banner={banner}
                onDismiss={onDismissBanner}
                onAction={
                  banner.variant === 'session'
                    ? onSessionExtend
                    : banner.actionHref
                      ? () => onNavigate?.(banner.actionHref!)
                      : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Scrollable content area — 24px padding */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-background p-6">
          {/* Optional breadcrumb area */}
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="mb-4">
              {breadcrumb}
            </nav>
          )}
          {children}
        </main>
      </div>

      {/* Command palette overlay */}
      <CommandPalette
        items={enhancedCommandItems}
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Order panel slide-over */}
      <OrderPanel
        state={orderPanelState}
        onClose={closeOrderPanel}
        onMinimize={minimizeOrderPanel}
        onRestore={restoreOrderPanel}
      >
        {orderPanelContent}
      </OrderPanel>

      {/* Emergency close confirmation modal */}
      <EmergencyCloseModal
        open={emergencyCloseOpen}
        onClose={() => setEmergencyCloseOpen(false)}
        onConfirm={(filter) => {
          onEmergencyClose?.(filter)
          setEmergencyCloseOpen(false)
        }}
        positionCount={12}
        intradayCount={5}
        swingCount={7}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
