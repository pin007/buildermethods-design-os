import { useState, useMemo } from 'react'
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  Bell,
  BellOff,
  ShoppingCart,
  X,
  ChevronDown,
  Star,
} from 'lucide-react'
import type { Watchlist, WatchlistItem } from '@/../product/sections/portfolio-and-positions/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AlertIndicator({ item }: { item: WatchlistItem }) {
  const hasAlert = item.alertPriceAbove !== null || item.alertPriceBelow !== null
  if (!hasAlert) return <BellOff size={13} className="text-faint" />

  const parts: string[] = []
  if (item.alertPriceAbove !== null) parts.push(`Above $${item.alertPriceAbove}`)
  if (item.alertPriceBelow !== null) parts.push(`Below $${item.alertPriceBelow}`)

  return (
    <span title={parts.join(' · ')} className="relative">
      <Bell size={13} className={item.alertTriggered ? 'text-amber-500 animate-pulse' : 'text-primary'} />
      {item.alertTriggered && (
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface WatchlistsTabProps {
  watchlists: Watchlist[]
  onTradeWatchlistItem?: (symbol: string) => void
  onCreateWatchlist?: (name: string) => void
  onRenameWatchlist?: (watchlistId: string, newName: string) => void
  onDeleteWatchlist?: (watchlistId: string) => void
  onAddWatchlistItem?: (watchlistId: string, instrumentId: string, notes?: string) => void
  onRemoveWatchlistItem?: (watchlistId: string, itemId: string) => void
  onEditWatchlistItem?: (watchlistId: string, itemId: string, updates: Partial<Pick<WatchlistItem, 'notes' | 'alertPriceAbove' | 'alertPriceBelow'>>) => void
}

export function WatchlistsTab({
  watchlists,
  onTradeWatchlistItem,
  onCreateWatchlist,
  onRenameWatchlist,
  onDeleteWatchlist,
  onAddWatchlistItem,
  onRemoveWatchlistItem,
  onEditWatchlistItem,
}: WatchlistsTabProps) {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(watchlists[0]?.id ?? '')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')

  const selected = useMemo(
    () => watchlists.find(w => w.id === selectedWatchlistId),
    [watchlists, selectedWatchlistId],
  )

  // Empty state — no watchlists
  if (watchlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-primary/5 blur-xl dark:bg-primary/10" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
            <Star size={24} className="text-faint" />
          </div>
        </div>
        <p className="mt-5 text-sm font-medium text-foreground">
          Create a watchlist to track instruments you're interested in.
        </p>
        <button
          onClick={() => onCreateWatchlist?.('My Watchlist')}
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-primary hover:shadow-pink-600/30 active:scale-[0.98]"
        >
          <Plus size={14} aria-hidden="true" />
          New Watchlist
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Watchlist selector + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={selectedWatchlistId}
            onChange={e => setSelectedWatchlistId(e.target.value)}
            aria-label="Select watchlist"
            className="h-9 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm font-semibold text-foreground focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] transition-all"
          >
            {watchlists.map(wl => (
              <option key={wl.id} value={wl.id}>
                {wl.name} ({wl.itemCount})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint" />
        </div>

        <button
          onClick={() => setShowNewForm(!showNewForm)}
          aria-expanded={showNewForm}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Plus size={13} aria-hidden="true" />
          New
        </button>
        {selected && (
          <>
            <button
              onClick={() => onRenameWatchlist?.(selected.id, selected.name)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Pencil size={13} aria-hidden="true" />
              Rename
            </button>
            <button
              onClick={() => onDeleteWatchlist?.(selected.id)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 px-3 py-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={13} aria-hidden="true" />
              Delete
            </button>
          </>
        )}
      </div>

      {/* New watchlist inline form */}
      {showNewForm && (
        <div className="flex items-center gap-2 rounded-xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/10 px-4 py-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Watchlist name..."
            aria-label="New watchlist name"
            className="h-8 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px]"
            autoFocus
          />
          <button
            onClick={() => { if (newName.trim()) { onCreateWatchlist?.(newName.trim()); setNewName(''); setShowNewForm(false) } }}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => { setShowNewForm(false); setNewName('') }}
            aria-label="Cancel new watchlist"
            className="rounded-lg p-1.5 text-hint hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Watchlist items table */}
      {selected && selected.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-border bg-card">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Eye size={20} className="text-faint" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            This watchlist is empty
          </p>
          <p className="mt-1 text-xs text-hint">
            Add instruments to start tracking.
          </p>
        </div>
      ) : selected ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-3 pl-5 pr-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-hint">Symbol</th>
                  <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-hint">Price</th>
                  <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-hint">Change $</th>
                  <th className="py-3 px-2 text-right text-xs font-bold uppercase tracking-[0.12em] text-hint">Change %</th>
                  <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-hint">Notes</th>
                  <th className="py-3 px-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-hint">Alert</th>
                  <th className="py-3 pl-2 pr-5 text-right text-xs font-bold uppercase tracking-[0.12em] text-hint">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {selected.items.map(item => {
                  const dayPositive = item.dayChange >= 0
                  return (
                    <tr key={item.id} className="group hover:bg-accent/40 transition-colors">
                      <td className="py-3 pl-5 pr-2">
                        <p className="text-sm font-semibold text-foreground">{item.symbol}</p>
                        <p className="text-xs text-faint truncate max-w-[140px]">{item.instrumentName}</p>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-sm tabular-nums text-foreground">
                        {formatCurrency(item.currentPrice)}
                      </td>
                      <td className={`py-3 px-2 text-right font-mono text-xs font-semibold tabular-nums ${
                        dayPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {formatSignedCurrency(item.dayChange)}
                      </td>
                      <td className={`py-3 px-2 text-right font-mono text-xs tabular-nums ${
                        dayPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {formatPercent(item.dayChangePercent)}
                      </td>
                      <td className="py-3 px-2 max-w-[200px]">
                        <p className="text-xs text-muted-foreground truncate" title={item.notes}>
                          {item.notes || <span className="text-faint">&mdash;</span>}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <AlertIndicator item={item} />
                      </td>
                      <td className="py-3 pl-2 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditWatchlistItem?.(selected.id, item.id, {})}
                            title="Edit"
                            aria-label={`Edit ${item.symbol}`}
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onRemoveWatchlistItem?.(selected.id, item.id)}
                            title="Remove"
                            aria-label={`Remove ${item.symbol} from watchlist`}
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onTradeWatchlistItem?.(item.symbol)}
                            title="Trade"
                            aria-label={`Trade ${item.symbol}`}
                            className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950/20 transition-colors"
                          >
                            <ShoppingCart size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Quick-add row */}
          <div className="flex items-center gap-2 border-t border-border/50 px-5 py-3">
            <Plus size={13} className="shrink-0 text-faint" />
            <input
              type="text"
              placeholder="Search instrument to add..."
              aria-label="Search instrument to add"
              className="h-7 flex-1 rounded-md border-0 bg-transparent px-2 text-xs text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onAddWatchlistItem?.(selected.id, e.currentTarget.value.trim())
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
