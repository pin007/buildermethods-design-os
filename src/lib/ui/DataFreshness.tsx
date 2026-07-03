/**
 * DataFreshness — recommendation #2.
 *
 * A compact, reusable indicator communicating how "live" and how recent a data
 * surface is. Traders distrust numbers they can't date, so any streaming value
 * (prices, P&L, equity curve, feed status) should carry one of these.
 *
 * - `live`         green pulsing dot   — streaming, fresh
 * - `delayed`      amber dot           — throttled / delayed feed
 * - `stale`        amber dot, dimmed   — no update within tolerance
 * - `disconnected` red dot             — feed lost
 *
 * The status text is wrapped in an `aria-live="polite"` region so screen
 * readers announce material freshness changes without stealing focus.
 */
import { useEffect, useState } from 'react'

export type FreshnessStatus = 'live' | 'delayed' | 'stale' | 'disconnected'

interface DataFreshnessProps {
  status?: FreshnessStatus
  /** Epoch ms of the last update; drives the auto-ticking "updated Ns ago" copy. */
  updatedAt?: number
  /** Overrides the computed relative label (e.g. for static previews). */
  label?: string
  /** Hide the textual label, keeping only the status dot (dense contexts). */
  dotOnly?: boolean
  className?: string
}

const DOT: Record<FreshnessStatus, string> = {
  live: 'bg-emerald-400',
  delayed: 'bg-amber-400',
  stale: 'bg-amber-400 opacity-60',
  disconnected: 'bg-red-400',
}

const STATUS_TEXT: Record<FreshnessStatus, string> = {
  live: 'Live',
  delayed: 'Delayed',
  stale: 'Stale',
  disconnected: 'Disconnected',
}

function relativeTime(updatedAt: number, now: number): string {
  const secs = Math.max(0, Math.round((now - updatedAt) / 1000))
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  return `${hrs}h ago`
}

export function DataFreshness({
  status = 'live',
  updatedAt,
  label,
  dotOnly = false,
  className = '',
}: DataFreshnessProps) {
  // Re-render each second so the relative timestamp stays honest.
  const [now, setNow] = useState(() => (updatedAt ? updatedAt : 0))
  useEffect(() => {
    if (!updatedAt || label) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [updatedAt, label])

  const relative = label ?? (updatedAt ? `updated ${relativeTime(updatedAt, now || updatedAt)}` : undefined)

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-faint ${className}`}
      title={`${STATUS_TEXT[status]}${relative ? ` — ${relative}` : ''}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {status === 'live' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      </span>
      {!dotOnly && (
        <span aria-live="polite" className="tabular whitespace-nowrap">
          <span className="font-medium text-muted-foreground">{STATUS_TEXT[status]}</span>
          {relative && <span className="text-faint"> · {relative}</span>}
        </span>
      )}
    </span>
  )
}
