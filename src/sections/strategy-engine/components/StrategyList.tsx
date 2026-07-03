import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  FlaskConical,
  ArrowUpDown,
  SlidersHorizontal,
  GitCompare,
  TrendingUp,
  GitBranch,
  Shuffle,
  X,
  Check,
} from 'lucide-react'
import type {
  Strategy,
  Backtest,
  StrategyType,
  StrategyListProps,
} from '@/../product/sections/strategy-engine/types'
import { StrategyCard } from './StrategyCard'

// =============================================================================
// Helpers
// =============================================================================

type SortKey = 'name' | 'lastBacktest' | 'sharpe' | 'cagr'
type FilterType = StrategyType | 'ALL'
type FilterActive = 'all' | 'active' | 'inactive'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'lastBacktest', label: 'Last Backtest' },
  { key: 'sharpe', label: 'Sharpe Ratio' },
  { key: 'cagr', label: 'CAGR' },
]

const typeFilters: { key: FilterType; label: string; icon: typeof TrendingUp }[] = [
  { key: 'ALL', label: 'All Types', icon: FlaskConical },
  { key: 'TREND_FOLLOWING', label: 'Trend', icon: TrendingUp },
  { key: 'MEAN_REVERSION', label: 'Mean Rev', icon: GitBranch },
  { key: 'COMPOSITE', label: 'Composite', icon: Shuffle },
]

function sortStrategies(strategies: Strategy[], sortKey: SortKey, ascending: boolean): Strategy[] {
  const sorted = [...strategies].sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'lastBacktest': {
        const dateA = a.lastBacktest?.date ?? ''
        const dateB = b.lastBacktest?.date ?? ''
        return dateB.localeCompare(dateA) // newest first by default
      }
      case 'sharpe': {
        const sharpeA = a.lastBacktest?.sharpe ?? -Infinity
        const sharpeB = b.lastBacktest?.sharpe ?? -Infinity
        return sharpeB - sharpeA // highest first by default
      }
      case 'cagr': {
        const cagrA = a.lastBacktest?.cagr ?? -Infinity
        const cagrB = b.lastBacktest?.cagr ?? -Infinity
        return cagrB - cagrA // highest first by default
      }
      default:
        return 0
    }
  })
  return ascending && sortKey === 'name' ? sorted : ascending ? sorted.reverse() : sorted
}

// =============================================================================
// Component
// =============================================================================

export function StrategyList({
  strategies,
  backtests,
  onViewStrategy,
  onToggleActive,
  onCreateStrategy,
  onCompareStrategies,
  onDeleteStrategy,
}: StrategyListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('lastBacktest')
  const [sortAscending, setSortAscending] = useState(false)
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL')
  const [activeFilter, setActiveFilter] = useState<FilterActive>('all')
  const [instrumentFilter, setInstrumentFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [compareMode, setCompareMode] = useState(false)

  // Get all unique instruments across strategies
  const allInstruments = useMemo(() => {
    const instSet = new Set<string>()
    strategies.forEach((s) => s.instruments.forEach((i) => instSet.add(i)))
    return Array.from(instSet).sort()
  }, [strategies])

  // Filter and sort strategies
  const filteredStrategies = useMemo(() => {
    let result = strategies

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.instruments.some((i) => i.toLowerCase().includes(q))
      )
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter((s) => s.type === typeFilter)
    }

    // Active filter
    if (activeFilter === 'active') {
      result = result.filter((s) => s.active)
    } else if (activeFilter === 'inactive') {
      result = result.filter((s) => !s.active)
    }

    // Instrument filter
    if (instrumentFilter) {
      result = result.filter((s) => s.instruments.includes(instrumentFilter))
    }

    // Sort
    return sortStrategies(result, sortKey, sortAscending)
  }, [strategies, searchQuery, typeFilter, activeFilter, instrumentFilter, sortKey, sortAscending])

  const hasActiveFilters = typeFilter !== 'ALL' || activeFilter !== 'all' || instrumentFilter !== null

  function toggleCompareSelection(id: string) {
    setSelectedForCompare((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  function handleCompare() {
    if (selectedForCompare.size >= 2) {
      onCompareStrategies?.(Array.from(selectedForCompare))
      setCompareMode(false)
      setSelectedForCompare(new Set())
    }
  }

  // ── Section header ────────────────────────────────────────────────────

  const sectionHeader = (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Intelligence
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Strategies
      </h1>
    </div>
  )

  // ── Empty state ───────────────────────────────────────────────────────

  if (strategies.length === 0) {
    return (
      <div className="space-y-6">
        {sectionHeader}
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-5">
            <FlaskConical size={28} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No strategies configured yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6">
            Create your first strategy to start backtesting. Choose from trend following, mean reversion, or composite patterns.
          </p>
          <button
            onClick={onCreateStrategy}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 dark:hover:bg-pink-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <Plus size={16} strokeWidth={2} />
            Create Strategy
          </button>
        </div>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {sectionHeader}
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:border-pink-600 focus-visible:ring-pink-600/20 focus-visible:ring-[3px] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Compare button */}
          {compareMode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedForCompare.size} of 2-4 selected
              </span>
              <button
                onClick={handleCompare}
                disabled={selectedForCompare.size < 2}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <GitCompare size={13} strokeWidth={2} />
                Compare
              </button>
              <button
                onClick={() => { setCompareMode(false); setSelectedForCompare(new Set()) }}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCompareMode(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <GitCompare size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              hasActiveFilters
                ? 'border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                {(typeFilter !== 'ALL' ? 1 : 0) + (activeFilter !== 'all' ? 1 : 0) + (instrumentFilter ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowUpDown size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Sort</span>
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg dark:shadow-zinc-950/50 py-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        if (sortKey === opt.key) {
                          setSortAscending(!sortAscending)
                        } else {
                          setSortKey(opt.key)
                          setSortAscending(false)
                        }
                        setShowSort(false)
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                        sortKey === opt.key
                          ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {opt.label}
                      {sortKey === opt.key && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {sortAscending ? 'ASC' : 'DESC'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New Strategy button */}
          <button
            onClick={onCreateStrategy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 dark:hover:bg-pink-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <Plus size={15} strokeWidth={2} />
            <span className="hidden sm:inline">New Strategy</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3">
          {/* Type filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mr-1">Type:</span>
            {typeFilters.map((tf) => {
              const Icon = tf.icon
              return (
                <button
                  key={tf.key}
                  onClick={() => setTypeFilter(tf.key)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    typeFilter === tf.key
                      ? 'bg-pink-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Icon size={11} strokeWidth={2} />
                  {tf.label}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

          {/* Active filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mr-1">Status:</span>
            {(['all', 'active', 'inactive'] as FilterActive[]).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  activeFilter === f
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

          {/* Instrument filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mr-1">Instrument:</span>
            <select
              value={instrumentFilter ?? ''}
              onChange={(e) => setInstrumentFilter(e.target.value || null)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 outline-none focus-visible:border-pink-600 focus-visible:ring-pink-600/20 focus-visible:ring-[3px]"
            >
              <option value="">All</option>
              {allInstruments.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setTypeFilter('ALL')
                setActiveFilter('all')
                setInstrumentFilter(null)
              }}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {filteredStrategies.length} of {strategies.length} strategies
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </p>
      </div>

      {/* Strategy grid */}
      {filteredStrategies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="relative">
              {/* Compare checkbox overlay */}
              {compareMode && (
                <button
                  onClick={() => toggleCompareSelection(strategy.id)}
                  className={`absolute -left-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                    selectedForCompare.has(strategy.id)
                      ? 'border-pink-600 bg-pink-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:border-pink-400'
                  }`}
                >
                  {selectedForCompare.has(strategy.id) && <Check size={12} strokeWidth={3} />}
                </button>
              )}
              <StrategyCard
                strategy={strategy}
                onView={() => onViewStrategy?.(strategy.id)}
                onToggleActive={(active) => onToggleActive?.(strategy.id, active)}
                onDelete={() => onDeleteStrategy?.(strategy.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Search size={24} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">No strategies match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setTypeFilter('ALL')
              setActiveFilter('all')
              setInstrumentFilter(null)
            }}
            className="text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
