/**
 * Skeleton loaders — recommendation #7 (async state trilogy).
 *
 * Trading surfaces stream async data; a blank flash reads as "broken". Prefer a
 * shape-matched skeleton over a spinner so layout stays stable while data
 * resolves. The shimmer respects `prefers-reduced-motion` (falls back to a
 * static tint via the `.skeleton` utility in index.css).
 */

interface SkeletonProps {
  className?: string
  /** Render a pill/full-radius block (avatars, badges). */
  rounded?: boolean
}

export function Skeleton({ className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
    />
  )
}

/** A skeleton stand-in for a StatCard while its metric loads. */
export function SkeletonStat({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-36" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

/** N skeleton table rows, matching the density of a data table. */
export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading data" className="w-full">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border/50 px-2 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-32' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
