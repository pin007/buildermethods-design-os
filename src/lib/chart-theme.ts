/**
 * Centralized chart palette (recommendation #6).
 *
 * Single source of truth for every chart / inline-SVG visual so they all
 * follow the app's light/dark theme AND the colorblind-safe (CVD) palette
 * toggle automatically — instead of each component hard-coding hex values.
 *
 * Colors are read at runtime from the design-token CSS custom properties
 * defined in `index.css` (`--chart-1..5`, `--ts-success/danger/warning/info`),
 * so a chart re-themes for free when `.dark` or `data-palette="cvd"` flips on
 * the document root. Static fallbacks match the dark-theme tokens for SSR /
 * first paint before styles resolve.
 */
import { useSyncExternalStore } from 'react'

export interface ChartColors {
  /** Brand magenta — primary series, focus lines, area fills. */
  primary: string
  /** Profit / positive change. CVD-aware (green → blue under `data-palette="cvd"`). */
  positive: string
  /** Loss / negative change. CVD-aware (red → orange under `data-palette="cvd"`). */
  negative: string
  /** Caution / pending. */
  warning: string
  /** Informational. */
  info: string
  /** Gridlines. */
  grid: string
  /** Axis labels / ticks. */
  axis: string
  /** Categorical sequence — use in order for multi-series charts. */
  series: string[]
}

/** Dark-theme fallbacks (match `index.css` `.dark` tokens). */
const FALLBACK: ChartColors = {
  primary: '#db2777',
  positive: '#10b981',
  negative: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
  grid: '#2a2a2e',
  axis: '#6b6b70',
  series: ['#db2777', '#10b981', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee', '#fb923c'],
}

/** CVD (deuteranopia/protanopia) swap for the profit/loss pair. */
const CVD = { positive: '#3b82f6', negative: '#f97316' }

function readVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = styles.getPropertyValue(name).trim()
  return v || fallback
}

/**
 * Resolve the current chart palette from live CSS variables + root attributes.
 * Safe to call during render; returns FALLBACK when the DOM isn't available.
 */
export function getChartColors(): ChartColors {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
    return FALLBACK
  }
  const root = document.documentElement
  const s = getComputedStyle(root)
  const cvd = root.dataset.palette === 'cvd'

  const positive = cvd ? CVD.positive : readVar(s, '--ts-success', FALLBACK.positive)
  const negative = cvd ? CVD.negative : readVar(s, '--ts-danger', FALLBACK.negative)

  return {
    primary: readVar(s, '--chart-1', FALLBACK.primary),
    positive,
    negative,
    warning: readVar(s, '--ts-warning', FALLBACK.warning),
    info: readVar(s, '--ts-info', FALLBACK.info),
    grid: readVar(s, '--border', FALLBACK.grid),
    axis: readVar(s, '--hint', FALLBACK.axis),
    series: [
      readVar(s, '--chart-1', FALLBACK.series[0]),
      positive,
      readVar(s, '--chart-3', FALLBACK.series[2]),
      readVar(s, '--chart-4', FALLBACK.series[3]),
      negative,
      FALLBACK.series[5],
      FALLBACK.series[6],
      FALLBACK.series[7],
    ],
  }
}

/**
 * Map a P&L / delta value to its semantic color, honoring the CVD palette.
 * Pass `neutral` for exact-zero handling.
 */
export function pnlColor(value: number, colors: ChartColors, neutral?: string): string {
  if (value > 0) return colors.positive
  if (value < 0) return colors.negative
  return neutral ?? colors.axis
}

// ---- Live subscription so charts recolor when theme / palette toggles ----

let observer: MutationObserver | null = null
const listeners = new Set<() => void>()

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  if (!observer && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(() => listeners.forEach((l) => l()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-palette'],
    })
  }
  return () => {
    listeners.delete(cb)
    if (listeners.size === 0 && observer) {
      observer.disconnect()
      observer = null
    }
  }
}

// Cache the snapshot so useSyncExternalStore gets a stable reference between
// mutations (avoids an infinite render loop from a fresh object each call).
let snapshot: ChartColors = FALLBACK
let snapshotKey = ''

function getSnapshot(): ChartColors {
  if (typeof document === 'undefined') return FALLBACK
  const root = document.documentElement
  const key = `${root.classList.contains('dark') ? 'd' : 'l'}:${root.dataset.palette ?? ''}`
  if (key !== snapshotKey) {
    snapshotKey = key
    snapshot = getChartColors()
  }
  return snapshot
}

/**
 * React hook returning the current chart palette, re-rendering the consumer
 * whenever the theme (`.dark`) or CVD palette (`data-palette`) changes.
 */
export function useChartColors(): ChartColors {
  return useSyncExternalStore(subscribe, getSnapshot, () => FALLBACK)
}
