import { useState, useMemo, useEffect, useCallback, useId } from 'react'
import {
  Building2,
  Landmark,
  Bitcoin,
  Plus,
  X,
  MoreHorizontal,
  Bell,
  Search,
  Users,
  Trash2,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react'
import type {
  GuruTrade,
  TrackedGuru,
  GuruAlert,
  GuruType,
  GuruTradeAction,
  GuruAlertTriggers,
  GuruAlertActionFilter,
} from '@/../product/sections/market-intelligence/types'

// =============================================================================
// Props
// =============================================================================

interface GuruTrackerTabProps {
  guruTrades: GuruTrade[]
  trackedGurus: TrackedGuru[]
  guruAlerts: GuruAlert[]
  onFollowTrade?: (tradeId: string) => void
  onAddGuru?: (guru: {
    name: string
    type: GuruType
    walletAddress?: string
    displayName?: string
    alertOnAnyTrade: boolean
  }) => void
  onRemoveGuru?: (guruId: string) => void
  onToggleGuru?: (guruId: string, enabled: boolean) => void
  onEditGuru?: (guruId: string, updates: { displayName?: string; type?: GuruType }) => void
  onSaveGuruAlert?: (guruId: string, triggers: GuruAlertTriggers) => void
  onDeleteGuruAlert?: (alertId: string) => void
  onToggleGuruAlert?: (alertId: string, enabled: boolean) => void
}

// =============================================================================
// Helpers
// =============================================================================

type SortField = 'date' | 'size' | 'instrument'
type SortDirection = 'asc' | 'desc'

const GURU_TYPE_LABELS: Record<GuruType, string> = {
  institutional: 'Institutional',
  'hedge-fund': 'Hedge Fund',
  'crypto-whale': 'Crypto Whale',
}

function guruTypeIcon(type: GuruType, size = 14) {
  switch (type) {
    case 'institutional':
      return <Building2 size={size} aria-hidden="true" />
    case 'hedge-fund':
      return <Landmark size={size} aria-hidden="true" />
    case 'crypto-whale':
      return <Bitcoin size={size} aria-hidden="true" />
  }
}

function formatDollarCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  return `$${value.toLocaleString('en-US')}`
}

function formatShareCount(count: number): string {
  return count.toLocaleString('en-US')
}

function relativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  return `${Math.floor(diffDay / 30)}mo ago`
}

const ACTION_BADGE_CLASSES: Record<GuruTradeAction, string> = {
  BUY: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  SELL: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  INCREASE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  DECREASE: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
}

const ACTION_FILTER_OPTIONS: { value: GuruTradeAction | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BUY', label: 'BUY' },
  { value: 'SELL', label: 'SELL' },
  { value: 'INCREASE', label: 'INCREASE' },
  { value: 'DECREASE', label: 'DECREASE' },
]

const TYPE_FILTER_OPTIONS: { value: GuruType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'hedge-fund', label: 'Hedge Fund' },
  { value: 'crypto-whale', label: 'Crypto Whale' },
]

function describeTriggers(triggers: GuruAlertTriggers): string {
  const parts: string[] = []
  if (triggers.anyTrade) {
    parts.push('Any trade')
  }
  if (triggers.specificInstruments.length > 0) {
    parts.push(`Instruments: ${triggers.specificInstruments.join(', ')}`)
  }
  if (triggers.minTradeSize !== null) {
    parts.push(`Min size: ${formatDollarCompact(triggers.minTradeSize)}`)
  }
  if (triggers.actionFilter !== 'any') {
    parts.push(`Action: ${triggers.actionFilter.toUpperCase()}`)
  }
  return parts.length > 0 ? parts.join(' | ') : 'No triggers configured'
}

// =============================================================================
// Escape key + backdrop click hook
// =============================================================================

function useModalClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])
}

// =============================================================================
// Sub-components
// =============================================================================

/** Pill toggle selector */
function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-muted p-1 ring-1 ring-border/60">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              active
                ? 'bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-border/60 text-foreground'
                : 'text-hint hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Modal shell */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  useModalClose(open, onClose)
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl max-w-md w-full mx-4 p-6">
        {children}
      </div>
    </div>
  )
}

/** Guru chip for the summary row */
function GuruChip({
  guru,
  isActive,
  onSelect,
  onContextAction,
}: {
  guru: TrackedGuru
  isActive: boolean
  onSelect: () => void
  onContextAction: (action: 'alert' | 'toggle' | 'remove') => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        onClick={onSelect}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
          guru.enabled ? '' : 'opacity-50'
        } ${
          isActive
            ? 'ring-2 ring-ring dark:ring-pink-400 border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-800'
            : 'border-border bg-card hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <span className="text-muted-foreground">
          {guruTypeIcon(guru.type)}
        </span>
        <span className="whitespace-nowrap text-foreground">
          {guru.displayName}
        </span>
        {guru.recentTradeCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold tabular-nums text-primary-foreground">
            {guru.recentTradeCount}
          </span>
        )}
      </button>

      {/* Context menu trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen(!menuOpen)
        }}
        aria-label={`Options for ${guru.displayName}`}
        aria-expanded={menuOpen}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors"
      >
        <MoreHorizontal size={10} aria-hidden="true" />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-card shadow-lg py-1">
            <button
              onClick={() => {
                onContextAction('alert')
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
            >
              <Bell size={12} aria-hidden="true" />
              Edit Alert
            </button>
            <button
              onClick={() => {
                onContextAction('toggle')
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
            >
              {guru.enabled ? 'Disable' : 'Enable'}
            </button>
            <button
              onClick={() => {
                onContextAction('remove')
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 size={12} aria-hidden="true" />
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/** Single trade card */
function TradeCard({
  trade,
  onFollowTrade,
}: {
  trade: GuruTrade
  onFollowTrade?: (tradeId: string) => void
}) {
  const changePositive = trade.holdingChangePercent >= 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left side */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Guru name + type */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {guruTypeIcon(trade.guruType)}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {trade.guruName}
            </span>
          </div>

          {/* Instrument */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {trade.symbol}
            </span>
            <span className="text-sm text-muted-foreground">
              {trade.instrumentName}
            </span>
          </div>

          {/* Action + size row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                ACTION_BADGE_CLASSES[trade.action]
              }`}
            >
              {trade.action}
            </span>
            <span className="font-mono text-xs text-foreground">
              {formatShareCount(trade.shareCount)} shares
            </span>
            <span className="font-mono text-xs font-medium text-foreground">
              {formatDollarCompact(trade.dollarValue)}
            </span>
          </div>

          {/* Date + change + source */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {relativeTime(trade.filedAt)}
            </span>
            <span
              className={`flex items-center gap-0.5 font-medium ${
                changePositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {changePositive ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {changePositive ? '+' : ''}
              {trade.holdingChangePercent.toFixed(1)}% position change
            </span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {trade.sourceAttribution}
            </span>
          </div>
        </div>

        {/* Follow trade button */}
        <div className="shrink-0">
          <button
            onClick={() => onFollowTrade?.(trade.id)}
            className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Follow Trade
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Add Guru Modal
// =============================================================================

function AddGuruModal({
  open,
  onClose,
  onAddGuru,
}: {
  open: boolean
  onClose: () => void
  onAddGuru?: GuruTrackerTabProps['onAddGuru']
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<GuruType>('institutional')
  const [walletAddress, setWalletAddress] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [alertOnAnyTrade, setAlertOnAnyTrade] = useState(true)
  const walletId = useId()
  const nameId = useId()
  const displayNameId = useId()

  const reset = useCallback(() => {
    setName('')
    setType('institutional')
    setWalletAddress('')
    setDisplayName('')
    setAlertOnAnyTrade(true)
  }, [])

  const handleSubmit = () => {
    if (!name && type !== 'crypto-whale') return
    if (type === 'crypto-whale' && !walletAddress) return
    onAddGuru?.({
      name: type === 'crypto-whale' ? walletAddress : name,
      type,
      walletAddress: type === 'crypto-whale' ? walletAddress : undefined,
      displayName: displayName || undefined,
      alertOnAnyTrade,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">
          Add Guru
        </h3>
        <button
          onClick={onClose}
          aria-label="Close add guru dialog"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-accent transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
            Type
          </label>
          <PillToggle<GuruType>
            options={[
              { value: 'institutional', label: 'Institutional' },
              { value: 'hedge-fund', label: 'Hedge Fund' },
              { value: 'crypto-whale', label: 'Crypto Whale' },
            ]}
            value={type}
            onChange={setType}
          />
        </div>

        {/* Name / Wallet input */}
        {type === 'crypto-whale' ? (
          <div>
            <label htmlFor={walletId} className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
              Wallet Address
            </label>
            <input
              id={walletId}
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400 font-mono"
            />
          </div>
        ) : (
          <div>
            <label htmlFor={nameId} className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
              Search Name
            </label>
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Search institutional / hedge fund name..."
                className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 pl-9 pr-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400"
              />
            </div>
          </div>
        )}

        {/* Display name */}
        <div>
          <label htmlFor={displayNameId} className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
            Display Name <span className="normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <input
            id={displayNameId}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Custom display name"
            className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400"
          />
        </div>

        {/* Alert checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={alertOnAnyTrade}
            onChange={(e) => setAlertOnAnyTrade(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-ring/30"
          />
          <span className="text-sm text-foreground">
            Alert me on any trade
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Add &amp; Track
          </button>
        </div>
      </div>
    </Modal>
  )
}

// =============================================================================
// Remove Guru Confirmation Modal
// =============================================================================

function RemoveGuruModal({
  guru,
  onClose,
  onRemove,
}: {
  guru: TrackedGuru | null
  onClose: () => void
  onRemove: () => void
}) {
  useModalClose(!!guru, onClose)
  if (!guru) return null

  return (
    <Modal open={true} onClose={onClose}>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Remove {guru.displayName}?
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        This will remove all their trades from your feed and delete associated alerts.
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </Modal>
  )
}

// =============================================================================
// Alert Configuration Modal
// =============================================================================

function AlertConfigModal({
  guru,
  existingAlert,
  onClose,
  onSave,
}: {
  guru: TrackedGuru | null
  existingAlert: GuruAlert | null
  onClose: () => void
  onSave: (guruId: string, triggers: GuruAlertTriggers) => void
}) {
  const [anyTrade, setAnyTrade] = useState(existingAlert?.triggers.anyTrade ?? true)
  const [specificInstruments, setSpecificInstruments] = useState<string[]>(
    existingAlert?.triggers.specificInstruments ?? [],
  )
  const [instrumentInput, setInstrumentInput] = useState('')
  const [minTradeSize, setMinTradeSize] = useState<string>(
    existingAlert?.triggers.minTradeSize?.toString() ?? '',
  )
  const [actionFilter, setActionFilter] = useState<GuruAlertActionFilter>(
    existingAlert?.triggers.actionFilter ?? 'any',
  )
  const instrumentInputId = useId()
  const minTradeSizeId = useId()

  useEffect(() => {
    if (existingAlert) {
      setAnyTrade(existingAlert.triggers.anyTrade)
      setSpecificInstruments(existingAlert.triggers.specificInstruments)
      setMinTradeSize(existingAlert.triggers.minTradeSize?.toString() ?? '')
      setActionFilter(existingAlert.triggers.actionFilter)
    } else {
      setAnyTrade(true)
      setSpecificInstruments([])
      setMinTradeSize('')
      setActionFilter('any')
    }
  }, [existingAlert])

  if (!guru) return null

  const handleAddInstrument = () => {
    const trimmed = instrumentInput.trim().toUpperCase()
    if (trimmed && !specificInstruments.includes(trimmed)) {
      setSpecificInstruments([...specificInstruments, trimmed])
    }
    setInstrumentInput('')
  }

  const handleRemoveInstrument = (symbol: string) => {
    setSpecificInstruments(specificInstruments.filter((s) => s !== symbol))
  }

  const handleSave = () => {
    onSave(guru.id, {
      anyTrade,
      specificInstruments,
      minTradeSize: minTradeSize ? Number(minTradeSize) : null,
      actionFilter,
    })
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">
          Alert for {guru.displayName}
        </h3>
        <button
          onClick={onClose}
          aria-label="Close alert configuration dialog"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-accent transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Any trade */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={anyTrade}
            onChange={(e) => setAnyTrade(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-ring/30"
          />
          <span className="text-sm text-foreground">Any trade</span>
        </label>

        {/* Specific instruments */}
        <div>
          <label htmlFor={instrumentInputId} className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
            Specific Instruments
          </label>
          <div className="flex gap-2">
            <input
              id={instrumentInputId}
              type="text"
              value={instrumentInput}
              onChange={(e) => setInstrumentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddInstrument()
              }}
              placeholder="AAPL, BTC/EUR..."
              className="flex-1 rounded-lg border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400 font-mono"
            />
            <button
              onClick={handleAddInstrument}
              className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Add
            </button>
          </div>
          {specificInstruments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {specificInstruments.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-mono text-foreground"
                >
                  {sym}
                  <button
                    onClick={() => handleRemoveInstrument(sym)}
                    aria-label={`Remove ${sym} from alert instruments`}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X size={10} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Size threshold */}
        <div>
          <label htmlFor={minTradeSizeId} className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
            Minimum Trade Size ($)
          </label>
          <input
            id={minTradeSizeId}
            type="number"
            value={minTradeSize}
            onChange={(e) => setMinTradeSize(e.target.value)}
            placeholder="e.g. 10000000"
            className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400 font-mono"
          />
        </div>

        {/* Action filter */}
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.15em] text-hint mb-1.5 block">
            Action Filter
          </label>
          <PillToggle<GuruAlertActionFilter>
            options={[
              { value: 'any', label: 'Any' },
              { value: 'buy', label: 'Buy' },
              { value: 'sell', label: 'Sell' },
            ]}
            value={actionFilter}
            onChange={setActionFilter}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Save Alert
          </button>
        </div>
      </div>
    </Modal>
  )
}

// =============================================================================
// Alerts Management Panel
// =============================================================================

function AlertsPanel({
  alerts,
  onToggle,
  onDelete,
  onEdit,
  trackedGurus,
}: {
  alerts: GuruAlert[]
  onToggle?: (alertId: string, enabled: boolean) => void
  onDelete?: (alertId: string) => void
  onEdit?: (alert: GuruAlert) => void
  trackedGurus: TrackedGuru[]
}) {
  const [expanded, setExpanded] = useState(true)

  if (alerts.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">
            Alerts
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {alerts.length}
          </span>
        </div>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`text-faint transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    Guru
                  </th>
                  <th className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    Triggers
                  </th>
                  <th className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    Status
                  </th>
                  <th className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint">
                    Last Triggered
                  </th>
                  <th className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-hint text-right">
                    Count
                  </th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onEdit?.(alert)}
                    className="border-b border-zinc-50 dark:border-zinc-800/40 last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                      {alert.guruName}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[240px] truncate">
                      {describeTriggers(alert.triggers)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggle?.(alert.id, alert.status !== 'active')
                        }}
                        role="switch"
                        aria-checked={alert.status === 'active'}
                        aria-label={`Toggle alert for ${alert.guruName}`}
                        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                        style={{
                          backgroundColor:
                            alert.status === 'active' ? undefined : undefined,
                        }}
                      >
                        <span
                          className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            alert.status === 'active'
                              ? 'bg-primary'
                              : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              alert.status === 'active'
                                ? 'translate-x-[1.15rem]'
                                : 'translate-x-[0.2rem]'
                            }`}
                          />
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {alert.lastTriggeredAt
                        ? relativeTime(alert.lastTriggeredAt)
                        : 'Never'}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-foreground text-right">
                      {alert.triggerCount}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(alert.id)
                        }}
                        aria-label={`Delete alert for ${alert.guruName}`}
                        className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function GuruTrackerTab({
  guruTrades,
  trackedGurus,
  guruAlerts,
  onFollowTrade,
  onAddGuru,
  onRemoveGuru,
  onToggleGuru,
  onEditGuru,
  onSaveGuruAlert,
  onDeleteGuruAlert,
  onToggleGuruAlert,
}: GuruTrackerTabProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [addGuruOpen, setAddGuruOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TrackedGuru | null>(null)
  const [alertConfigGuru, setAlertConfigGuru] = useState<TrackedGuru | null>(null)
  const [alertConfigAlert, setAlertConfigAlert] = useState<GuruAlert | null>(null)

  const [guruFilter, setGuruFilter] = useState<string | null>(null) // guruId or null for all
  const [typeFilter, setTypeFilter] = useState<GuruType | 'ALL'>('ALL')
  const [actionFilter, setActionFilter] = useState<GuruTradeAction | 'ALL'>('ALL')
  const [instrumentSearch, setInstrumentSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [visibleCount, setVisibleCount] = useState(10)

  // ---------------------------------------------------------------------------
  // Filtered + sorted trades
  // ---------------------------------------------------------------------------
  const filteredTrades = useMemo(() => {
    let trades = [...guruTrades]

    // Guru filter
    if (guruFilter) {
      trades = trades.filter((t) => t.guruId === guruFilter)
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      trades = trades.filter((t) => t.guruType === typeFilter)
    }

    // Action filter
    if (actionFilter !== 'ALL') {
      trades = trades.filter((t) => t.action === actionFilter)
    }

    // Instrument search
    if (instrumentSearch.trim()) {
      const q = instrumentSearch.trim().toLowerCase()
      trades = trades.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.instrumentName.toLowerCase().includes(q),
      )
    }

    // Sort
    trades.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp = new Date(a.filedAt).getTime() - new Date(b.filedAt).getTime()
          break
        case 'size':
          cmp = a.dollarValue - b.dollarValue
          break
        case 'instrument':
          cmp = a.symbol.localeCompare(b.symbol)
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return trades
  }, [guruTrades, guruFilter, typeFilter, actionFilter, instrumentSearch, sortField, sortDir])

  const visibleTrades = filteredTrades.slice(0, visibleCount)
  const hasMore = visibleCount < filteredTrades.length

  // ---------------------------------------------------------------------------
  // Helpers for context menu actions
  // ---------------------------------------------------------------------------
  const handleChipAction = (guru: TrackedGuru, action: 'alert' | 'toggle' | 'remove') => {
    switch (action) {
      case 'alert': {
        const existing = guruAlerts.find((a) => a.guruId === guru.id) ?? null
        setAlertConfigGuru(guru)
        setAlertConfigAlert(existing)
        break
      }
      case 'toggle':
        onToggleGuru?.(guru.id, !guru.enabled)
        break
      case 'remove':
        setRemoveTarget(guru)
        break
    }
  }

  const handleAlertEdit = (alert: GuruAlert) => {
    const guru = trackedGurus.find((g) => g.id === alert.guruId) ?? null
    if (guru) {
      setAlertConfigGuru(guru)
      setAlertConfigAlert(alert)
    }
  }

  // Cycle sort
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  // ---------------------------------------------------------------------------
  // Empty state — no gurus tracked
  // ---------------------------------------------------------------------------
  if (trackedGurus.length === 0) {
    return (
      <>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl dark:bg-primary/10" />
            <div className="relative rounded-2xl border border-dashed border-border/80 bg-card px-8 py-16 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
                <Users size={28} className="text-hint" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">
                Start tracking institutional moves
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Follow hedge funds, institutions, and crypto whales to see their latest trades in real time.
              </p>
              <button
                onClick={() => setAddGuruOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-pink-600/20 transition-all hover:bg-primary/90 hover:shadow-pink-600/30 active:scale-[0.98]"
              >
                <Plus size={15} aria-hidden="true" />
                Add Your First Guru
              </button>
            </div>
          </div>
        </div>

        <AddGuruModal
          open={addGuruOpen}
          onClose={() => setAddGuruOpen(false)}
          onAddGuru={onAddGuru}
        />
      </>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* ================================================================= */}
      {/* Guru Summary Row (horizontally scrollable)                        */}
      {/* ================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {trackedGurus.map((guru) => (
          <GuruChip
            key={guru.id}
            guru={guru}
            isActive={guruFilter === guru.id}
            onSelect={() =>
              setGuruFilter((prev) => (prev === guru.id ? null : guru.id))
            }
            onContextAction={(action) => handleChipAction(guru, action)}
          />
        ))}
        <button
          onClick={() => setAddGuruOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm font-medium text-hint hover:border-pink-400 hover:text-primary dark:hover:border-pink-700 dark:hover:text-pink-400 transition-colors"
        >
          <Plus size={14} aria-hidden="true" />
          Add Guru
        </button>
      </div>

      {/* ================================================================= */}
      {/* Alerts Management Panel (collapsible)                             */}
      {/* ================================================================= */}
      <AlertsPanel
        alerts={guruAlerts}
        trackedGurus={trackedGurus}
        onToggle={onToggleGuruAlert}
        onDelete={onDeleteGuruAlert}
        onEdit={handleAlertEdit}
      />

      {/* ================================================================= */}
      {/* Filter / Sort Bar                                                 */}
      {/* ================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <PillToggle
              options={TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
            />
            {/* Action filter */}
            <PillToggle
              options={ACTION_FILTER_OPTIONS}
              value={actionFilter}
              onChange={setActionFilter}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Instrument search */}
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                type="text"
                value={instrumentSearch}
                onChange={(e) => setInstrumentSearch(e.target.value)}
                placeholder="Search instrument..."
                aria-label="Search instrument"
                className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 pl-9 pr-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary focus:ring-1 focus:ring-ring/30 placeholder:text-zinc-400 lg:w-52"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1">
              <Filter size={12} aria-hidden="true" className="text-faint" />
              {(['date', 'size', 'instrument'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    sortField === field
                      ? 'bg-muted text-foreground'
                      : 'text-hint hover:text-foreground'
                  }`}
                >
                  {field === 'date'
                    ? 'Date'
                    : field === 'size'
                    ? 'Size'
                    : 'Instrument'}
                  {sortField === field && (
                    <span className="ml-0.5">{sortDir === 'desc' ? '\u2193' : '\u2191'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Trades Feed                                                       */}
      {/* ================================================================= */}
      {filteredTrades.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Users size={20} className="text-faint" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No notable trades detected recently
          </p>
          <p className="mt-1 text-xs text-faint">
            Trades from your tracked gurus will appear here when new filings or on-chain activity is detected.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTrades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onFollowTrade={onFollowTrade}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((c) => c + 10)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Load more ({filteredTrades.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Modals                                                            */}
      {/* ================================================================= */}
      <AddGuruModal
        open={addGuruOpen}
        onClose={() => setAddGuruOpen(false)}
        onAddGuru={onAddGuru}
      />

      <RemoveGuruModal
        guru={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onRemove={() => {
          if (removeTarget) {
            onRemoveGuru?.(removeTarget.id)
            if (guruFilter === removeTarget.id) setGuruFilter(null)
          }
          setRemoveTarget(null)
        }}
      />

      <AlertConfigModal
        guru={alertConfigGuru}
        existingAlert={alertConfigAlert}
        onClose={() => {
          setAlertConfigGuru(null)
          setAlertConfigAlert(null)
        }}
        onSave={(guruId, triggers) => {
          onSaveGuruAlert?.(guruId, triggers)
        }}
      />
    </div>
  )
}
