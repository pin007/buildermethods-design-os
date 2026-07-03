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
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          System
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings & Operations
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {totalCategories} categories{warningCount > 0 && (
            <> &middot; <span className="text-amber-600 dark:text-amber-400">{warningCount} {warningCount === 1 ? 'needs' : 'need'} attention</span></>
          )}
        </p>
      </div>

      {/* System Health */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-5 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          System Health
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">Brokers</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">1 connected, 1 degraded</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">Data Pipeline</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">4 sources active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">Risk Limits</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">All within bounds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="
            w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 py-2.5 pl-9 pr-9
            text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            outline-none transition-colors
            focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30
          "
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-400"
          >
            <X size={14} />
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
          <Search size={32} className="mb-3 text-zinc-400 dark:text-zinc-500" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No settings match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-pink-600 dark:text-pink-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
