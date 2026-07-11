import { useState } from 'react'
import { ShieldAlert, RotateCcw, Lock, Power, AlertOctagon } from 'lucide-react'
import type {
  RiskManagementProps,
  RiskSetting,
  PortfolioBreakerStatus,
} from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUnit(unit: RiskSetting['unit']): string {
  return unit === 'percent' ? '%' : ''
}

function formatValue(value: number, unit: RiskSetting['unit']): string {
  if (unit === 'ratio') {
    return value.toFixed(2)
  }
  // For percent values, show integer if whole, otherwise one decimal
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** Position of a value along the slider range as a percentage (0-100). */
function pctPosition(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100
}

function EnvBadge({ environment }: { environment: PortfolioBreakerStatus['environment'] }) {
  const live = environment === 'live'
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
        live
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          : 'bg-blue-400/10 text-blue-600 dark:text-blue-400'
      }`}
    >
      {live ? 'Live' : 'Paper'}
    </span>
  )
}

function PortfolioBreakerRow({
  breaker,
  onReset,
}: {
  breaker: PortfolioBreakerStatus
  onReset?: (portfolioId: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/50 dark:bg-zinc-900/40 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {breaker.portfolioName}
          </span>
          <EnvBadge environment={breaker.environment} />
        </div>
        {breaker.halted && breaker.haltReason && (
          <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{breaker.haltReason}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ${
            breaker.halted
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {breaker.halted ? 'Halted' : 'Active'}
        </span>
        {breaker.halted && (
          <button
            onClick={() => onReset?.(breaker.portfolioId)}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline sub-components
// ---------------------------------------------------------------------------

interface RiskSliderCardProps {
  setting: RiskSetting
  onUpdate?: (settingId: string, value: number) => void
  onResetToDefault?: (settingId: string) => void
  onDirty: () => void
}

function RiskSliderCard({ setting, onUpdate, onResetToDefault, onDirty }: RiskSliderCardProps) {
  const isModified = setting.value !== setting.defaultValue
  const defaultPct = pctPosition(setting.defaultValue, setting.min, setting.max)

  return (
    <div className="rounded-lg border border-border bg-white/50 dark:bg-zinc-900/40 p-4 transition-colors">
      {/* Header row */}
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground">{setting.label}</span>
          <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>
        </div>

        {isModified && (
          <button
            onClick={() => {
              onResetToDefault?.(setting.id)
              onDirty()
            }}
            className="
              flex shrink-0 items-center gap-1 rounded-md border border-border
              px-2 py-1 text-xs font-medium text-muted-foreground
              transition-colors hover:bg-accent hover:text-foreground
            "
          >
            <RotateCcw size={12} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Slider + value input row */}
      <div className="mt-3 flex items-center gap-3">
        {/* Slider wrapper with default marker */}
        <div className="relative flex-1">
          {/* Default-value marker (thin vertical line) */}
          <div
            className="pointer-events-none absolute -top-0.5 z-10 h-3.5 w-px bg-zinc-500/50 dark:bg-zinc-400/50"
            style={{ left: `${defaultPct}%` }}
            title={`Default: ${formatValue(setting.defaultValue, setting.unit)}${formatUnit(setting.unit)}`}
          />
          <input
            type="range"
            aria-label={setting.label}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={setting.value}
            onChange={(e) => {
              const next = parseFloat(e.target.value)
              onUpdate?.(setting.id, next)
              onDirty()
            }}
            className="h-1.5 w-full appearance-none rounded-full bg-zinc-200 dark:bg-zinc-800 accent-pink-600"
          />
          {/* Min / Max labels */}
          <div className="mt-0.5 flex justify-between text-xs text-hint">
            <span>{formatValue(setting.min, setting.unit)}{formatUnit(setting.unit)}</span>
            <span>{formatValue(setting.max, setting.unit)}{formatUnit(setting.unit)}</span>
          </div>
        </div>

        {/* Numeric readout input */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            aria-label={`${setting.label} value`}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={setting.value}
            onChange={(e) => {
              let next = parseFloat(e.target.value)
              if (Number.isNaN(next)) return
              next = Math.min(setting.max, Math.max(setting.min, next))
              onUpdate?.(setting.id, next)
              onDirty()
            }}
            className="
              w-20 rounded-lg border border-border bg-card px-3 py-2
              font-mono text-sm text-foreground outline-none transition-colors
              focus:border-primary focus:ring-1 focus:ring-ring/30
              [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
            "
          />
          <span className="text-xs text-muted-foreground">{formatUnit(setting.unit)}</span>
        </div>
      </div>

      {/* Modified indicator */}
      {isModified && (
        <p className="mt-2 text-xs text-primary">
          Changed from default ({formatValue(setting.defaultValue, setting.unit)}{formatUnit(setting.unit)})
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RiskManagement({
  riskSettings,
  circuitBreaker,
  portfolioBreakers,
  killSwitch,
  onUpdateRiskSetting,
  onResetToDefault,
  onUpdateCircuitBreaker,
  onResetPortfolioBreaker,
  onToggleKillSwitch,
  onSave,
  onBack,
}: RiskManagementProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markDirty = () => setHasChanges(true)

  const inputClasses =
    'rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring/30'

  return (
    <SettingsDetailLayout
      title="Risk Management"
      icon={ShieldAlert}
      description="Configure risk limits and circuit breaker protections"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Risk Limit Controls                                               */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Risk Limits"
        description="Define maximum exposure thresholds for position sizing, concentration, and drawdown."
      >
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-border bg-background/40 px-4 py-3">
          <Lock size={14} className="mt-0.5 shrink-0 text-hint" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            These limits are the <span className="font-semibold text-foreground">single source of truth</span> for
            risk enforcement — stored in the database and audited on every change. The risk engine reads them from here;
            environment variables and YAML config are never consulted for these values.
          </p>
        </div>
        <div className="space-y-4">
          {riskSettings.map((setting) => (
            <RiskSliderCard
              key={setting.id}
              setting={setting}
              onUpdate={onUpdateRiskSetting}
              onResetToDefault={onResetToDefault}
              onDirty={markDirty}
            />
          ))}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Circuit Breaker                                                   */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Circuit Breaker"
        description="Automatic trading halt when risk limits are breached."
      >
        <FormRow label="Enabled" hint="Halt all trading when daily loss or drawdown limits are hit" horizontal>
          <ToggleSwitch
            label="Enable circuit breaker"
            enabled={circuitBreaker.enabled}
            onChange={(enabled) => {
              onUpdateCircuitBreaker?.({ enabled })
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="Cooldown Period" hint="Minutes to wait after circuit breaker triggers before allowing new trades">
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Cooldown Period"
              min={1}
              max={1440}
              step={1}
              value={circuitBreaker.cooldownMinutes}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateCircuitBreaker?.({ cooldownMinutes: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>
        </FormRow>

        <FormRow label="Auto-Resume" hint="Automatically resume trading after cooldown period expires" horizontal>
          <ToggleSwitch
            label="Auto-resume trading after cooldown"
            enabled={circuitBreaker.autoResume}
            onChange={(autoResume) => {
              onUpdateCircuitBreaker?.({ autoResume })
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="Monitoring Interval" hint="How often the risk engine checks for limit breaches">
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Monitoring Interval"
              min={1}
              max={3600}
              step={1}
              value={circuitBreaker.monitoringIntervalSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateCircuitBreaker?.({ monitoringIntervalSeconds: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-muted-foreground">seconds</span>
          </div>
        </FormRow>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Trading Halt Status & Kill Switch                                 */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Trading Halt & Kill Switch"
        description="Live halt state. Circuit-breaker halts are per-portfolio; the global kill switch stops all trading at once. Reset and kill-switch actions are Trader-only and audited."
      >
        {/* Global manual kill switch */}
        <div
          className={`rounded-lg border px-4 py-4 ${
            killSwitch.engaged
              ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20'
              : 'border-border bg-white/50 dark:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  killSwitch.engaged
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Power size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Global Kill Switch</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {killSwitch.engaged
                    ? `Engaged${killSwitch.engagedBy ? ` by ${killSwitch.engagedBy}` : ''} — all trading halted across every portfolio.`
                    : 'Halts all trading across every portfolio immediately, independent of the automatic breakers.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleKillSwitch?.(!killSwitch.engaged)
                markDirty()
              }}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                killSwitch.engaged
                  ? 'border-2 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-950/30'
                  : 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700'
              }`}
            >
              <Power size={15} aria-hidden="true" />
              {killSwitch.engaged ? 'Clear Kill Switch' : 'Engage Kill Switch'}
            </button>
          </div>
        </div>

        {/* Per-portfolio breaker status */}
        <div className="mt-2">
          <div className="mb-2 flex items-center gap-2">
            <AlertOctagon size={13} className="text-hint" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-hint">
              Per-Portfolio Breakers
            </h4>
          </div>
          {portfolioBreakers.length > 0 ? (
            <div className="space-y-2">
              {portfolioBreakers.map((b) => (
                <PortfolioBreakerRow
                  key={b.portfolioId}
                  breaker={b}
                  onReset={(id) => {
                    onResetPortfolioBreaker?.(id)
                    markDirty()
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-white/50 dark:bg-zinc-900/40 px-4 py-3 text-xs text-hint italic">
              No portfolios configured.
            </p>
          )}
        </div>
      </FormSection>
    </SettingsDetailLayout>
  )
}
