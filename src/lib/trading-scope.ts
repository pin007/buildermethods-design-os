import { useSyncExternalStore } from 'react'

/**
 * Trading scope (Paper vs Live) — the single source of truth for which
 * trading environment the app is operating in.
 *
 * This is intentionally a shared store rather than local component state: the
 * shell's Paper/Live indicator (AppShell) and the order-entry flow
 * (ShellWrapper → NewOrderForm) must agree at all times. A portfolio carries
 * its own `environment`; the scope decides which portfolios are even
 * selectable, so the user can never place a live order while "Paper" is shown.
 *
 * Persisted under the legacy `trading-mode` key so an existing preference
 * carries over. Defaults to the safer `paper` when nothing is stored — a
 * session never silently starts in Live.
 */
export type TradingScope = 'paper' | 'live'

const STORAGE_KEY = 'trading-mode'

const listeners = new Set<() => void>()

function read(): TradingScope {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'live' ? 'live' : 'paper'
  } catch {
    return 'paper'
  }
}

/** Update the active scope and notify every subscriber (shell + order flow). */
export function setTradingScope(scope: TradingScope): void {
  try {
    localStorage.setItem(STORAGE_KEY, scope)
  } catch {
    /* storage unavailable — keep going with in-memory notification only */
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Reactively read the active trading scope. */
export function useTradingScope(): TradingScope {
  return useSyncExternalStore(subscribe, read, () => 'paper')
}
