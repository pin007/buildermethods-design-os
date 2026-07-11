import { Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { SettingsOverviewProps } from '@/../product/sections/settings-and-operations/types'
import { SettingsCategoryCard } from './SettingsCategoryCard'

export function SettingsOverview({
  categories,
  onNavigateToCategory,
}: SettingsOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
    )
  }, [categories, searchQuery])

  const warningCount = categories.filter(
    (c) => c.badge !== null && c.badgeVariant === 'warning'
  ).length
  const totalCategories = categories.length

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
          System
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Settings & Operations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCategories} categories{warningCount > 0 && (
            <> &middot; <span className="text-amber-600 dark:text-amber-400">{warningCount} {warningCount === 1 ? 'needs' : 'need'} attention</span></>
          )}
        </p>
      </div>

      {/* System Health */}
      <div className="rounded-lg border border-border bg-zinc-100/50 dark:bg-zinc-800/50 px-5 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">
          System Health
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-foreground">Brokers</p>
              <p className="text-xs text-muted-foreground">1 connected, 1 degraded</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-foreground">Data Pipeline</p>
              <p className="text-xs text-muted-foreground">4 sources active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-foreground">Risk Limits</p>
              <p className="text-xs text-muted-foreground">All within bounds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-hint"
        />
        <input
          type="text"
          aria-label="Search settings"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="
            w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-9
            text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            outline-none transition-colors
            focus:border-primary focus:ring-1 focus:ring-ring/30
          "
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-hint hover:text-muted-foreground"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <SettingsCategoryCard
              key={category.id}
              category={category}
              onClick={() => onNavigateToCategory?.(category.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={32} className="mb-3 text-hint" />
          <p className="text-sm font-medium text-muted-foreground">
            No settings match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
