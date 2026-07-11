import { useState } from 'react'
import { Receipt, Info } from 'lucide-react'
import type { TaxConfigurationProps } from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Shared styling constants
// ---------------------------------------------------------------------------

const inputClasses =
  'rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring/30'

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
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {settings.method}
          </span>
        </FormRow>

        <FormRow label="Tax Rate">
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Tax Rate"
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
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </FormRow>

        <FormRow
          label="Exemption Holding Period"
          hint={settings.exemptionLabel}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Exemption Holding Period"
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
            <span className="text-xs text-muted-foreground">days</span>
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
            label="Auto-sync CNB exchange rates"
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
              rounded-lg border border-border bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2
              font-mono text-sm text-muted-foreground break-all
            "
          >
            {settings.cnbSync.apiUrl}
          </div>
        </FormRow>

        <FormRow label="Sync Schedule" horizontal>
          <span className="text-sm text-muted-foreground">
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
            <span className="text-sm text-muted-foreground">
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
                inline-flex items-center rounded-full bg-primary/10
                px-3 py-1 text-xs font-semibold text-primary
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
              label={`Enable ${format.label} report format`}
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
              aria-label="Retention Period"
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
            <span className="text-xs text-muted-foreground">years</span>
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
