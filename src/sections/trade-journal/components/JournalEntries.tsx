import { useState, useMemo, useCallback, useId } from 'react'
import {
  BookOpen,
  Star,
  Inbox,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Trash2,
  FileEdit,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  List,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type {
  JournalEntriesProps,
  JournalEntry,
  UnjournaledTrade,
  Portfolio,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Formatting helpers
// =============================================================================

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${day} ${month}`
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000) return `$${(abs / 1000).toFixed(1)}k`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(value)
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(value).toFixed(2)}%`
}

const strategyLabels: Record<string, string> = {
  trend_following: 'Trend Following',
  breakout: 'Breakout',
  momentum: 'Momentum',
  mean_reversion: 'Mean Reversion',
  manual: 'Manual',
}

// =============================================================================
// Types
// =============================================================================

type Tab = 'needs-review' | 'all-entries' | 'starred'
type SortField = 'date' | 'instrument' | 'side' | 'pnl' | 'processScore' | 'strategy'
type SortDir = 'asc' | 'desc'

// =============================================================================
// Main Component
// =============================================================================

export function JournalEntries({
  entries,
  unjournaledTrades,
  portfolios,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleStar,
  onJournalTrade,
  onPortfolioFilter,
}: JournalEntriesProps) {
  const [activeTab, setActiveTab] = useState<Tab>('needs-review')
  const [groupByPortfolio, setGroupByPortfolio] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null)

  // Filter state
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'loss'>('all')
  const strategySelectId = useId()

  // -------------------------------------------------------------------------
  // Filtered and sorted entries
  // -------------------------------------------------------------------------
  const filteredEntries = useMemo(() => {
    let result = activeTab === 'starred' ? entries.filter((e) => e.starred) : entries

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.tradeSummary.instrument.toLowerCase().includes(q) ||
          e.tradeSummary.instrumentName.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    // Portfolio filter
    if (selectedPortfolios.length > 0) {
      result = result.filter((e) => selectedPortfolios.includes(e.portfolioId))
    }

    // Strategy filter
    if (selectedStrategy) {
      result = result.filter((e) => e.tradeSummary.strategy === selectedStrategy)
    }

    // Outcome filter
    if (outcomeFilter === 'win') {
      result = result.filter((e) => e.tradeSummary.pnl >= 0)
    } else if (outcomeFilter === 'loss') {
      result = result.filter((e) => e.tradeSummary.pnl < 0)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp =
            new Date(a.tradeSummary.exitDate).getTime() -
            new Date(b.tradeSummary.exitDate).getTime()
          break
        case 'instrument':
          cmp = a.tradeSummary.instrument.localeCompare(b.tradeSummary.instrument)
          break
        case 'side':
          cmp = a.tradeSummary.side.localeCompare(b.tradeSummary.side)
          break
        case 'pnl':
          cmp = a.tradeSummary.pnl - b.tradeSummary.pnl
          break
        case 'processScore':
          cmp = a.processScores.overall - b.processScores.overall
          break
        case 'strategy':
          cmp = a.tradeSummary.strategy.localeCompare(b.tradeSummary.strategy)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [entries, activeTab, searchQuery, selectedPortfolios, selectedStrategy, outcomeFilter, sortField, sortDir])

  // Filtered unjournaled trades
  const filteredUnjournaled = useMemo(() => {
    let result = unjournaledTrades
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.instrument.toLowerCase().includes(q) ||
          t.instrumentName.toLowerCase().includes(q),
      )
    }
    if (selectedPortfolios.length > 0) {
      result = result.filter((t) => selectedPortfolios.includes(t.portfolioId))
    }
    return [...result].sort(
      (a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime(),
    )
  }, [unjournaledTrades, searchQuery, selectedPortfolios])

  // Group by portfolio
  const groupedEntries = useMemo(() => {
    if (!groupByPortfolio) return null
    const groups: Record<string, JournalEntry[]> = {}
    for (const entry of filteredEntries) {
      if (!groups[entry.portfolioId]) groups[entry.portfolioId] = []
      groups[entry.portfolioId].push(entry)
    }
    return groups
  }, [filteredEntries, groupByPortfolio])

  const groupedUnjournaled = useMemo(() => {
    if (!groupByPortfolio) return null
    const groups: Record<string, UnjournaledTrade[]> = {}
    for (const trade of filteredUnjournaled) {
      if (!groups[trade.portfolioId]) groups[trade.portfolioId] = []
      groups[trade.portfolioId].push(trade)
    }
    return groups
  }, [filteredUnjournaled, groupByPortfolio])

  // All unique strategies
  const strategies = useMemo(() => {
    const set = new Set(entries.map((e) => e.tradeSummary.strategy))
    return Array.from(set).sort()
  }, [entries])

  // Portfolio lookup
  const portfolioMap = useMemo(() => {
    const map: Record<string, Portfolio> = {}
    for (const p of portfolios) map[p.id] = p
    return map
  }, [portfolios])

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('desc')
      }
    },
    [sortField],
  )

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedPortfolios([])
    setSelectedStrategy('')
    setOutcomeFilter('all')
  }, [])

  const hasActiveFilters = selectedPortfolios.length > 0 || selectedStrategy !== '' || outcomeFilter !== 'all'

  // -------------------------------------------------------------------------
  // Tab config
  // -------------------------------------------------------------------------
  const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'needs-review', label: 'Needs Review', count: unjournaledTrades.length, icon: Inbox },
    { id: 'all-entries', label: 'All Entries', count: entries.length, icon: BookOpen },
    { id: 'starred', label: 'Starred', count: entries.filter((e) => e.starred).length, icon: Star },
  ]

  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Trade Journal
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Journal Entries
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Group toggle */}
          <div className="flex rounded-lg bg-muted p-0.5 ring-1 ring-border/60">
            <button
              onClick={() => setGroupByPortfolio(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                groupByPortfolio
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-hint hover:text-foreground'
              }`}
              title="Group by portfolio"
              aria-label="Group by portfolio"
            >
              <Layers size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Grouped</span>
            </button>
            <button
              onClick={() => setGroupByPortfolio(false)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                !groupByPortfolio
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-hint hover:text-foreground'
              }`}
              title="Flat list"
              aria-label="Flat list"
            >
              <List size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Flat</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tabs                                                              */}
      {/* ================================================================= */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-foreground'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                }
              `}
            >
              <Icon size={14} aria-hidden="true" className={isActive ? 'text-primary' : ''} />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    isActive
                      ? tab.id === 'needs-review'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-pink-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Search + Filters                                                  */}
      {/* ================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-hint"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by instrument, name, or tag..."
              aria-label="Search journal entries"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus-visible:border-pink-400 dark:focus-visible:ring-pink-400/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-hint hover:text-muted-foreground"
                aria-label="Clear search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((f) => !f)}
            aria-expanded={showFilters}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/40 dark:bg-pink-950/20 dark:text-pink-400'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <Filter size={14} aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {(selectedPortfolios.length > 0 ? 1 : 0) + (selectedStrategy ? 1 : 0) + (outcomeFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            {/* Portfolio filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-hint">Portfolio</label>
              <div className="flex gap-1">
                {portfolios.map((p) => {
                  const isSelected = selectedPortfolios.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setSelectedPortfolios((prev) =>
                          isSelected ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                        )
                      }
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:ring-zinc-600'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Strategy filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor={strategySelectId} className="text-xs font-semibold text-hint">Strategy</label>
              <select
                id={strategySelectId}
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="">All</option>
                {strategies.map((s) => (
                  <option key={s} value={s}>
                    {strategyLabels[s] ?? s}
                  </option>
                ))}
              </select>
            </div>

            {/* Outcome filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-hint">Outcome</label>
              <div className="flex gap-1">
                {(['all', 'win', 'loss'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOutcomeFilter(o)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      outcomeFilter === o
                        ? 'bg-primary text-white'
                        : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:ring-zinc-600'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950/20"
              >
                <X size={12} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Content: Needs Review Tab                                         */}
      {/* ================================================================= */}
      {activeTab === 'needs-review' && (
        <NeedsReviewContent
          trades={filteredUnjournaled}
          groupedTrades={groupedUnjournaled}
          groupByPortfolio={groupByPortfolio}
          portfolioMap={portfolioMap}
          onJournalTrade={onJournalTrade}
          onSwitchTab={() => setActiveTab('all-entries')}
        />
      )}

      {/* ================================================================= */}
      {/* Content: All Entries / Starred Tab                                */}
      {/* ================================================================= */}
      {(activeTab === 'all-entries' || activeTab === 'starred') && (
        <EntriesTableContent
          entries={filteredEntries}
          groupedEntries={groupedEntries}
          groupByPortfolio={groupByPortfolio}
          portfolioMap={portfolioMap}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onViewEntry={onViewEntry}
          onEditEntry={onEditEntry}
          onDeleteEntry={(entry) => setDeleteTarget(entry)}
          onToggleStar={onToggleStar}
          isStarredTab={activeTab === 'starred'}
          onSwitchTab={() => setActiveTab('all-entries')}
        />
      )}

      {/* ================================================================= */}
      {/* Delete Confirmation Modal                                         */}
      {/* ================================================================= */}
      {deleteTarget && (
        <DeleteConfirmationModal
          entry={deleteTarget}
          onConfirm={() => {
            onDeleteEntry?.(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// =============================================================================
// Needs Review Content
// =============================================================================

function NeedsReviewContent({
  trades,
  groupedTrades,
  groupByPortfolio,
  portfolioMap,
  onJournalTrade,
  onSwitchTab,
}: {
  trades: UnjournaledTrade[]
  groupedTrades: Record<string, UnjournaledTrade[]> | null
  groupByPortfolio: boolean
  portfolioMap: Record<string, Portfolio>
  onJournalTrade?: (tradeId: string) => void
  onSwitchTab: () => void
}) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 size={24} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          All caught up!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          No trades waiting for review.
        </p>
        <button
          onClick={onSwitchTab}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary"
        >
          View All Entries
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    )
  }

  if (groupByPortfolio && groupedTrades) {
    return (
      <div className="space-y-3">
        {Object.entries(groupedTrades).map(([portfolioId, groupTrades]) => (
          <CollapsiblePortfolioGroup
            key={portfolioId}
            portfolioName={portfolioMap[portfolioId]?.name ?? portfolioId}
            count={groupTrades.length}
          >
            <div className="divide-y divide-border">
              {groupTrades.map((trade) => (
                <UnjournaledTradeRow
                  key={trade.tradeId}
                  trade={trade}
                  onJournal={() => onJournalTrade?.(trade.tradeId)}
                />
              ))}
            </div>
          </CollapsiblePortfolioGroup>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {trades.map((trade) => (
          <UnjournaledTradeRow
            key={trade.tradeId}
            trade={trade}
            portfolioName={portfolioMap[trade.portfolioId]?.name}
            onJournal={() => onJournalTrade?.(trade.tradeId)}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Unjournaled Trade Row
// =============================================================================

function UnjournaledTradeRow({
  trade,
  portfolioName,
  onJournal,
}: {
  trade: UnjournaledTrade
  portfolioName?: string
  onJournal?: () => void
}) {
  const pnlPositive = trade.pnl >= 0

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 sm:gap-4">
      {/* Side bar */}
      <div
        className={`h-8 w-1 shrink-0 rounded-full ${
          trade.side === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {trade.instrument}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                trade.side === 'BUY'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}
            >
              {trade.side}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-faint">
            {trade.instrumentName}
            {portfolioName && ` \u00b7 ${portfolioName}`}
          </p>
        </div>

        {/* Close date */}
        <div className="hidden text-right sm:block">
          <p className="text-xs text-hint">Closed</p>
          <p className="font-mono text-xs text-faint">
            {formatShortDate(trade.exitDate)}
          </p>
        </div>

        {/* P&L */}
        <div className="w-20 text-right">
          <p
            className={`font-mono text-sm font-semibold ${
              pnlPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatSignedCurrency(trade.pnl)}
          </p>
          <p
            className={`font-mono text-xs ${
              pnlPositive
                ? 'text-emerald-600/60 dark:text-emerald-400/50'
                : 'text-red-500/60 dark:text-red-400/50'
            }`}
          >
            {formatPercent(trade.pnlPercent)}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onJournal}
          aria-label={`Journal ${trade.instrument} trade`}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-pink-600/20 transition-all hover:bg-primary hover:shadow-pink-600/30 active:scale-[0.97]"
        >
          <span className="hidden sm:inline">Journal This Trade</span>
          <span className="sm:hidden">
            <FileEdit size={14} aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Entries Table Content
// =============================================================================

function EntriesTableContent({
  entries,
  groupedEntries,
  groupByPortfolio,
  portfolioMap,
  sortField,
  sortDir,
  onSort,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleStar,
  isStarredTab,
  onSwitchTab,
}: {
  entries: JournalEntry[]
  groupedEntries: Record<string, JournalEntry[]> | null
  groupByPortfolio: boolean
  portfolioMap: Record<string, Portfolio>
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  onViewEntry?: (id: string) => void
  onEditEntry?: (id: string) => void
  onDeleteEntry: (entry: JournalEntry) => void
  onToggleStar?: (id: string) => void
  isStarredTab: boolean
  onSwitchTab: () => void
}) {
  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          {isStarredTab ? (
            <Star size={24} className="text-faint" />
          ) : (
            <BookOpen size={24} className="text-faint" />
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {isStarredTab ? 'No starred entries' : 'No entries found'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isStarredTab
            ? 'Star important entries to find them quickly.'
            : 'Try adjusting your filters.'}
        </p>
        {isStarredTab && (
          <button
            onClick={onSwitchTab}
            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary"
          >
            View All Entries
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }

  const sortHeader = (label: string, field: SortField) => {
    const isActive = sortField === field
    return (
      <button
        onClick={() => onSort(field)}
        className={`group inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
          isActive
            ? 'text-primary'
            : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
        }`}
      >
        {label}
        {isActive ? (
          sortDir === 'asc' ? (
            <ArrowUp size={12} aria-hidden="true" />
          ) : (
            <ArrowDown size={12} aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown size={12} aria-hidden="true" className="opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    )
  }

  const renderTable = (tableEntries: JournalEntry[], showPortfolio = true) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-8 px-2 py-3" />
            <th className="px-3 py-3 text-left">{sortHeader('Date', 'date')}</th>
            <th className="px-3 py-3 text-left">{sortHeader('Instrument', 'instrument')}</th>
            <th className="px-3 py-3 text-left">{sortHeader('Side', 'side')}</th>
            {showPortfolio && (
              <th className="hidden px-3 py-3 text-left lg:table-cell">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-hint">
                  Portfolio
                </span>
              </th>
            )}
            <th className="px-3 py-3 text-right">{sortHeader('P&L', 'pnl')}</th>
            <th className="px-3 py-3 text-center">{sortHeader('Score', 'processScore')}</th>
            <th className="hidden px-3 py-3 text-left md:table-cell">
              {sortHeader('Strategy', 'strategy')}
            </th>
            <th className="hidden px-3 py-3 text-left lg:table-cell">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-hint">
                Tags
              </span>
            </th>
            <th className="px-3 py-3 text-right">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-hint">
                Actions
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
          {tableEntries.map((entry) => (
            <JournalEntryRow
              key={entry.id}
              entry={entry}
              portfolioName={portfolioMap[entry.portfolioId]?.name}
              showPortfolio={showPortfolio}
              onView={() => onViewEntry?.(entry.id)}
              onEdit={() => onEditEntry?.(entry.id)}
              onDelete={() => onDeleteEntry(entry)}
              onToggleStar={() => onToggleStar?.(entry.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )

  if (groupByPortfolio && groupedEntries) {
    return (
      <div className="space-y-3">
        {Object.entries(groupedEntries).map(([portfolioId, groupEntries]) => (
          <CollapsiblePortfolioGroup
            key={portfolioId}
            portfolioName={portfolioMap[portfolioId]?.name ?? portfolioId}
            count={groupEntries.length}
          >
            {renderTable(groupEntries, false)}
          </CollapsiblePortfolioGroup>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {renderTable(entries)}
    </div>
  )
}

// =============================================================================
// Journal Entry Row
// =============================================================================

function JournalEntryRow({
  entry,
  portfolioName,
  showPortfolio,
  onView,
  onEdit,
  onDelete,
  onToggleStar,
}: {
  entry: JournalEntry
  portfolioName?: string
  showPortfolio: boolean
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStar?: () => void
}) {
  const pnlPositive = entry.tradeSummary.pnl >= 0

  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-accent/30"
      onClick={onView}
    >
      {/* Star */}
      <td className="px-2 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar?.()
          }}
          className="rounded p-1 transition-colors hover:bg-accent"
          title={entry.starred ? 'Remove star' : 'Add star'}
          aria-label={
            entry.starred
              ? `Remove star from ${entry.tradeSummary.instrument} entry`
              : `Star ${entry.tradeSummary.instrument} entry`
          }
        >
          <Star
            size={14}
            aria-hidden="true"
            className={
              entry.starred
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-300 hover:text-amber-400 dark:text-zinc-700 dark:hover:text-amber-400'
            }
          />
        </button>
      </td>

      {/* Date */}
      <td className="px-3 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(entry.tradeSummary.exitDate)}
        </span>
      </td>

      {/* Instrument */}
      <td className="px-3 py-3">
        <div>
          <span className="font-mono text-sm font-semibold text-foreground">
            {entry.tradeSummary.instrument}
          </span>
          <p className="mt-0.5 truncate text-xs text-faint">
            {entry.tradeSummary.instrumentName}
          </p>
        </div>
      </td>

      {/* Side */}
      <td className="px-3 py-3">
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
            entry.tradeSummary.side === 'BUY'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          }`}
        >
          {entry.tradeSummary.side}
        </span>
      </td>

      {/* Portfolio */}
      {showPortfolio && (
        <td className="hidden px-3 py-3 lg:table-cell">
          <span className="text-xs text-muted-foreground">{portfolioName}</span>
        </td>
      )}

      {/* P&L */}
      <td className="px-3 py-3 text-right">
        <span
          className={`font-mono text-sm font-semibold ${
            pnlPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatSignedCurrency(entry.tradeSummary.pnl)}
        </span>
        <p
          className={`font-mono text-xs ${
            pnlPositive
              ? 'text-emerald-600/60 dark:text-emerald-400/50'
              : 'text-red-500/60 dark:text-red-400/50'
          }`}
        >
          {formatPercent(entry.tradeSummary.pnlPercent)}
        </p>
      </td>

      {/* Process Score */}
      <td className="px-3 py-3 text-center">
        <ProcessScoreBadge score={entry.processScores.overall} />
      </td>

      {/* Strategy */}
      <td className="hidden px-3 py-3 md:table-cell">
        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {strategyLabels[entry.tradeSummary.strategy] ?? entry.tradeSummary.strategy}
        </span>
      </td>

      {/* Tags */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-pink-50 px-1.5 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-950/20 dark:text-pink-400"
            >
              {tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
              +{entry.tags.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Edit"
            aria-label={`Edit ${entry.tradeSummary.instrument} entry`}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            title="Delete"
            aria-label={`Delete ${entry.tradeSummary.instrument} entry`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// =============================================================================
// Process Score Badge
// =============================================================================

function ProcessScoreBadge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 4) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    if (s >= 3) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    if (s >= 2) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${getColor(score)}`}>
      {score.toFixed(1)}
    </span>
  )
}

// =============================================================================
// Collapsible Portfolio Group
// =============================================================================

function CollapsiblePortfolioGroup({
  portfolioName,
  count,
  children,
}: {
  portfolioName: string
  count: number
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/30"
      >
        <div className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown size={14} aria-hidden="true" className="text-hint" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {portfolioName}
        </span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
          {count}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Delete Confirmation Modal
// =============================================================================

function DeleteConfirmationModal({
  entry,
  onConfirm,
  onCancel,
}: {
  entry: JournalEntry
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Delete Journal Entry
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to delete this journal entry for{' '}
              <span className="font-mono font-semibold text-foreground">
                {entry.tradeSummary.instrument}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-all hover:bg-red-500 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
