import { useState } from 'react'
import { Calendar, Moon, Sun } from 'lucide-react'
import type { CalendarDisplayProps } from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Shared styling constants
// ---------------------------------------------------------------------------

const inputClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const selectClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CalendarDisplay({
  settings,
  onToggleProvider,
  onChangeProvider,
  onUpdateAlertTiming,
  onToggleCountry,
  onChangeTimezone,
  onToggleTheme,
  onUpdateRefreshInterval,
  onSave,
  onBack,
}: CalendarDisplayProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markDirty = () => setHasChanges(true)

  return (
    <SettingsDetailLayout
      title="Calendar & Display"
      icon={Calendar}
      description="Trading calendar providers, alert timing, and display preferences"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Calendar Providers                                                */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Calendar Providers"
        description="Data sources for trading calendar events. Each event type can use a different provider."
      >
        <div className="space-y-3">
          {settings.calendarProviders.map((cp) => (
            <div
              key={cp.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-800/30 px-4 py-3"
            >
              {/* Event type label */}
              <span className="min-w-[130px] text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {cp.eventType}
              </span>

              {/* Provider selector */}
              <select
                value={cp.provider}
                onChange={(e) => {
                  onChangeProvider?.(cp.id, e.target.value)
                  markDirty()
                }}
                className={`${selectClasses} w-44`}
              >
                {cp.providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Refresh schedule (read-only) */}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{cp.refreshLabel}</span>

              {/* Spacer to push toggle to the right */}
              <div className="ml-auto">
                <ToggleSwitch
                  enabled={cp.enabled}
                  onChange={(enabled) => {
                    onToggleProvider?.(cp.id, enabled)
                    markDirty()
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Alert Timing                                                      */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Alert Timing"
        description="How far in advance to receive alerts before calendar events."
      >
        {settings.alertTiming.map((at) => {
          const isDays = at.daysBefore !== undefined
          const value = isDays ? at.daysBefore! : at.hoursBefore!
          const unit = isDays ? 'days' : 'hours'

          return (
            <FormRow key={at.eventType} label={at.eventType} horizontal>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={value}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (Number.isNaN(v)) return
                    onUpdateAlertTiming?.(at.eventType, v)
                    markDirty()
                  }}
                  className={`${inputClasses} w-20`}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{unit} before</span>
              </div>
            </FormRow>
          )
        })}
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Economic Calendar                                                 */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Economic Calendar"
        description="Select countries whose economic events should appear on your calendar."
      >
        <div className="flex flex-wrap gap-2">
          {settings.availableCountries.map((country) => {
            const active = settings.economicCalendarCountries.includes(country)

            return (
              <button
                key={country}
                onClick={() => {
                  onToggleCountry?.(country, !active)
                  markDirty()
                }}
                className={`
                  rounded-full px-3 py-1 text-xs font-semibold transition-colors
                  ${
                    active
                      ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-600/25 dark:ring-pink-400/25'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-800'
                  }
                `}
              >
                {country}
              </button>
            )
          })}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Display Preferences                                               */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Display Preferences"
        description="Timezone, calendar week start, and visual theme."
      >
        {/* Timezone */}
        <FormRow label="Timezone">
          <select
            value={settings.display.timezone}
            onChange={(e) => {
              onChangeTimezone?.(e.target.value)
              markDirty()
            }}
            className={`${selectClasses} w-full max-w-xs`}
          >
            {settings.display.availableTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </FormRow>

        {/* Week Start */}
        <FormRow label="Week Start" horizontal>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{settings.display.weekStart}</span>
        </FormRow>

        {/* Theme toggle */}
        <FormRow label="Theme" horizontal>
          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                onToggleTheme?.('dark')
                markDirty()
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                ${
                  settings.display.theme === 'dark'
                    ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }
              `}
            >
              <Moon size={13} />
              Dark
            </button>
            <button
              onClick={() => {
                onToggleTheme?.('light')
                markDirty()
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                ${
                  settings.display.theme === 'light'
                    ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }
              `}
            >
              <Sun size={13} />
              Light
            </button>
          </div>
        </FormRow>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Data Freshness                                                    */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Data Freshness"
        description="How frequently data refreshes and when values are considered stale."
      >
        <FormRow label="Dashboard Refresh">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              step={1}
              value={settings.display.dashboardRefreshSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateRefreshInterval?.(v)
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">seconds</span>
          </div>
        </FormRow>

        <FormRow label="Price Staleness Threshold">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              step={1}
              value={settings.display.priceStalenessSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                // Would need a dedicated callback; marking dirty for design purposes
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">seconds</span>
          </div>
        </FormRow>

        <FormRow label="Order Staleness Threshold">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              step={1}
              value={settings.display.orderStalenessSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                // Would need a dedicated callback; marking dirty for design purposes
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
