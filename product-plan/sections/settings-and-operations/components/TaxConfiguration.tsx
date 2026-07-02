import { useState } from 'react'
import { Receipt, Info } from 'lucide-react'
import type { TaxConfigurationProps } from '../types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Shared styling constants
// ---------------------------------------------------------------------------

const inputClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const infoBoxClasses =
  'rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-600 dark:text-sky-400'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TaxConfiguration({
  settings,
  onUpdateTaxRate,
  onUpdateExemptionDays,
  onToggleCnbSync,
  onToggleReportFormat,
  onSave,
  onBack,
}: TaxConfigurationProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markDirty = () => setHasChanges(true)

  return (
    <SettingsDetailLayout
      title="Tax Configuration"
      icon={Receipt}
      description="Czech tax reporting, FIFO method, and CNB exchange rates"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Tax Method                                                        */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Tax Method"
        description="Czech capital gains tax calculation method and exemption rules."
      >
        <FormRow label="Method" horizontal>
          <span className="inline-flex items-center rounded-full bg-pink-600/10 dark:bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
            {settings.method}
          </span>
        </FormRow>

        <FormRow label="Tax Rate">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.taxRate}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                onUpdateTaxRate?.(v)
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>

        <FormRow
          label="Exemption Holding Period"
          hint={settings.exemptionLabel}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={settings.exemptionHoldingDays}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateExemptionDays?.(v)
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">days</span>
          </div>
        </FormRow>

        <div className={`flex items-start gap-2 ${infoBoxClasses}`}>
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Positions held longer than 1,095 days (3 years) are exempt from Czech capital gains tax
          </span>
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* CNB Exchange Rates                                                */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="CNB Exchange Rates"
        description="Czech National Bank exchange rate synchronization for CZK conversions."
      >
        <FormRow label="Enabled" hint="Automatically sync exchange rates from CNB" horizontal>
          <ToggleSwitch
            enabled={settings.cnbSync.enabled}
            onChange={(enabled) => {
              onToggleCnbSync?.(enabled)
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="API URL">
          <div
            className="
              rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2
              font-mono text-sm text-zinc-500 dark:text-zinc-400 break-all
            "
          >
            {settings.cnbSync.apiUrl}
          </div>
        </FormRow>

        <FormRow label="Sync Schedule" horizontal>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {settings.cnbSync.scheduleLabel}
          </span>
        </FormRow>

        <FormRow label="Last Sync" horizontal>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                settings.cnbSync.lastSyncStatus === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date(settings.cnbSync.lastSync).toLocaleString()}
            </span>
          </div>
        </FormRow>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Currencies                                                        */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Currencies"
        description="Currency codes supported for tax reporting and exchange rate conversion."
      >
        <div className="flex flex-wrap gap-2">
          {settings.supportedCurrencies.map((currency) => (
            <span
              key={currency}
              className="
                inline-flex items-center rounded-full bg-pink-600/10 dark:bg-pink-500/10
                px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400
              "
            >
              {currency}
            </span>
          ))}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Report Formats                                                    */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Report Formats"
        description="Enable or disable available tax report output formats."
      >
        {settings.reportFormats.map((format) => (
          <FormRow key={format.id} label={format.label} horizontal>
            <ToggleSwitch
              enabled={format.enabled}
              onChange={(enabled) => {
                onToggleReportFormat?.(format.id, enabled)
                markDirty()
              }}
            />
          </FormRow>
        ))}
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Data Retention                                                    */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Data Retention"
        description="How long trade records are retained for Czech tax compliance."
      >
        <FormRow label="Retention Period">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              value={settings.retentionYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                // No dedicated callback in props; would be added as needed
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">years</span>
          </div>
        </FormRow>

        <div className={`flex items-start gap-2 ${infoBoxClasses}`}>
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Czech tax law requires 10-year data retention for all trade records
          </span>
        </div>
      </FormSection>
    </SettingsDetailLayout>
  )
}
