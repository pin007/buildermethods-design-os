import { useState } from 'react'
import { Wallet } from 'lucide-react'
import type { PortfolioCurrencyProps } from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const inputClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const selectClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const statusDotClass: Record<string, string> = {
  success: 'bg-emerald-500',
  failure: 'bg-red-500',
  pending: 'bg-amber-500',
}

const statusLabel: Record<string, string> = {
  success: 'Success',
  failure: 'Failure',
  pending: 'Pending',
}

/** All available currency codes that can be toggled. */
const ALL_CURRENCIES = ['CZK', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'HKD', 'SGD']

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PortfolioCurrency({
  settings,
  onChangeBaseCurrency,
  onToggleCurrency,
  onToggleBenchmark,
  onUpdateMarginThresholds,
  onUpdateReconciliation,
  onSave,
  onBack,
}: PortfolioCurrencyProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markDirty = () => setHasChanges(true)

  const {
    baseCurrency,
    supportedCurrencies,
    benchmarks,
    marginAlertThresholds,
    reconciliation,
    cacheTtlSeconds,
  } = settings

  return (
    <SettingsDetailLayout
      title="Portfolio & Currency"
      icon={Wallet}
      description="Currency, benchmark, and reconciliation configuration"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* --------------------------------------------------------------- */}
      {/* Base Currency                                                    */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Base Currency"
        description="Select the primary currency for portfolio valuation and toggle supported currencies."
      >
        <FormRow label="Base Currency" hint="All portfolio values and P&L will be reported in this currency">
          <select
            value={baseCurrency}
            onChange={(e) => {
              onChangeBaseCurrency?.(e.target.value)
              markDirty()
            }}
            className={`${selectClasses} w-full`}
          >
            {supportedCurrencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label="Supported Currencies" hint="Toggle currencies available for multi-currency portfolios">
          <div className="flex flex-wrap gap-2">
            {ALL_CURRENCIES.map((code) => {
              const active = supportedCurrencies.includes(code)
              return (
                <button
                  key={code}
                  onClick={() => {
                    onToggleCurrency?.(code, !active)
                    markDirty()
                  }}
                  className={`
                    rounded-full px-3 py-1 text-xs font-medium transition-colors
                    ${
                      active
                        ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-600/25 dark:ring-pink-400/25'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-800'
                    }
                  `}
                >
                  {code}
                </button>
              )
            })}
          </div>
        </FormRow>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Benchmarks                                                      */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Benchmarks"
        description="Select benchmark indices to compare portfolio performance against."
      >
        <div className="space-y-3">
          {benchmarks.map((bench) => (
            <div
              key={bench.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 px-4 py-3"
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{bench.label}</span>
                <span className="ml-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">{bench.symbol}</span>
              </div>
              <ToggleSwitch
                enabled={bench.enabled}
                onChange={(enabled) => {
                  onToggleBenchmark?.(bench.id, enabled)
                  markDirty()
                }}
              />
            </div>
          ))}
        </div>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Margin Alerts                                                   */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Margin Alerts"
        description="Configure margin utilization thresholds that trigger warning and critical alerts."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Warning Threshold" hint="Triggers a warning notification">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={marginAlertThresholds.warning}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isNaN(v)) return
                  onUpdateMarginThresholds?.({ warning: v })
                  markDirty()
                }}
                className={`${inputClasses} w-24`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
            </div>
          </FormRow>

          <FormRow label="Critical Threshold" hint="Triggers a critical alert">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={marginAlertThresholds.critical}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isNaN(v)) return
                  onUpdateMarginThresholds?.({ critical: v })
                  markDirty()
                }}
                className={`${inputClasses} w-24`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
            </div>
          </FormRow>
        </div>

        {/* Visual threshold bar */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            {/* Safe zone: 0 to warning */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500/30"
              style={{ width: `${marginAlertThresholds.warning}%` }}
            />
            {/* Warning zone: warning to critical */}
            <div
              className="absolute inset-y-0 bg-amber-500/50"
              style={{
                left: `${marginAlertThresholds.warning}%`,
                width: `${marginAlertThresholds.critical - marginAlertThresholds.warning}%`,
              }}
            />
            {/* Critical zone: critical to 100 */}
            <div
              className="absolute inset-y-0 right-0 rounded-r-full bg-red-500/50"
              style={{
                left: `${marginAlertThresholds.critical}%`,
                width: `${100 - marginAlertThresholds.critical}%`,
              }}
            />
            {/* Warning threshold marker */}
            <div
              className="absolute inset-y-0 w-0.5 bg-amber-500"
              style={{ left: `${marginAlertThresholds.warning}%` }}
              title={`Warning: ${marginAlertThresholds.warning}%`}
            />
            {/* Critical threshold marker */}
            <div
              className="absolute inset-y-0 w-0.5 bg-red-500"
              style={{ left: `${marginAlertThresholds.critical}%` }}
              title={`Critical: ${marginAlertThresholds.critical}%`}
            />
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500/50" />
              Safe
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500/50" />
              Warning ({marginAlertThresholds.warning}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500/50" />
              Critical ({marginAlertThresholds.critical}%)
            </span>
          </div>
        </div>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Reconciliation                                                  */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Reconciliation"
        description="Automatic position reconciliation between local records and broker accounts."
      >
        <FormRow label="Enabled" hint="Periodically reconcile positions with the broker" horizontal>
          <ToggleSwitch
            enabled={reconciliation.enabled}
            onChange={(enabled) => {
              onUpdateReconciliation?.({ enabled })
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="Interval" hint="Seconds between reconciliation runs">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={86400}
              step={10}
              value={reconciliation.intervalSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateReconciliation?.({ intervalSeconds: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">seconds</span>
          </div>
        </FormRow>

        <FormRow label="Run on Startup" hint="Trigger reconciliation when the system starts" horizontal>
          <ToggleSwitch
            enabled={reconciliation.runOnStartup}
            onChange={(runOnStartup) => {
              onUpdateReconciliation?.({ runOnStartup })
              markDirty()
            }}
          />
        </FormRow>

        {/* Last run info */}
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2">
          <div
            className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass[reconciliation.lastRunStatus]}`}
          />
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
            Last Run: {statusLabel[reconciliation.lastRunStatus]}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(reconciliation.lastRun).toLocaleString()}
          </span>
        </div>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Cache                                                           */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Cache"
        description="Control how long portfolio data is cached before refresh."
      >
        <FormRow label="Cache TTL" hint="Time-to-live for cached portfolio data">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={86400}
              step={1}
              value={cacheTtlSeconds}
              onChange={() => {
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">seconds</span>
          </div>
        </FormRow>
      </FormSection>
    </SettingsDetailLayout>
  )
}
