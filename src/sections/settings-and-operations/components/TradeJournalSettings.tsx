import { useState } from 'react'
import { BookOpen, Check, AlertTriangle } from 'lucide-react'
import type { TradeJournalSettingsProps } from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Distinct color shades for the scoring dimension bar segments. */
const DIMENSION_COLORS = [
  'bg-pink-500',
  'bg-pink-400',
  'bg-pink-600',
  'bg-emerald-500',
  'bg-emerald-400',
]

const inputClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const selectClasses =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TradeJournalSettings({
  settings,
  onToggleNoteRequirement,
  onUpdateScoringWeight,
  onToggleScoringDimension,
  onUpdateBehavioralDetection,
  onUpdateReviewSchedule,
  onSave,
  onBack,
}: TradeJournalSettingsProps) {
  const [hasChanges, setHasChanges] = useState(false)
  const markDirty = () => setHasChanges(true)

  // Compute totals for the scoring dimensions summary
  const enabledDimensions = settings.scoringDimensions.filter((d) => d.enabled)
  const totalWeight = enabledDimensions.reduce((sum, d) => sum + d.weight, 0)
  const weightsBalanced = totalWeight === 100

  return (
    <SettingsDetailLayout
      title="Trade Journal"
      icon={BookOpen}
      description="Journaling requirements, scoring, and behavioral detection"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* --------------------------------------------------------------- */}
      {/* Journaling Requirements                                         */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Journaling Requirements"
        description="Control when trade notes are required and review prompts."
      >
        <FormRow label="Require pre-trade notes" hint="Traders must document thesis before entry" horizontal>
          <ToggleSwitch
            enabled={settings.requirePreTradeNotes}
            onChange={(enabled) => {
              onToggleNoteRequirement?.('requirePreTradeNotes', enabled)
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="Require post-trade notes" hint="Traders must document outcome after exit" horizontal>
          <ToggleSwitch
            enabled={settings.requirePostTradeNotes}
            onChange={(enabled) => {
              onToggleNoteRequirement?.('requirePostTradeNotes', enabled)
              markDirty()
            }}
          />
        </FormRow>

        <FormRow label="Review prompt delay" hint="Hours after trade close before prompting for review">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={168}
              step={1}
              value={settings.reviewPromptDelayHours}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">hours</span>
          </div>
        </FormRow>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Scoring Dimensions                                              */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Scoring Dimensions"
        description="Define how trades are scored across multiple dimensions. Weights should sum to 100%."
      >
        <div className="space-y-3">
          {settings.scoringDimensions.map((dim, idx) => (
            <div
              key={dim.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 px-4 py-3"
            >
              {/* Dimension label + color indicator */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-3 w-3 shrink-0 rounded-full ${dim.enabled ? DIMENSION_COLORS[idx % DIMENSION_COLORS.length] : 'bg-zinc-600'}`} />
                <span className={`text-sm font-medium ${dim.enabled ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400 line-through'}`}>
                  {dim.label}
                </span>
              </div>

              {/* Controls: weight input + toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={dim.weight}
                    disabled={!dim.enabled}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (Number.isNaN(v)) return
                      onUpdateScoringWeight?.(dim.id, v)
                      markDirty()
                    }}
                    className={`${inputClasses} w-20 text-right disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
                </div>
                <ToggleSwitch
                  enabled={dim.enabled}
                  onChange={(enabled) => {
                    onToggleScoringDimension?.(dim.id, enabled)
                    markDirty()
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Visual summary bar */}
        {enabledDimensions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              {enabledDimensions.map((dim) => {
                const originalIdx = settings.scoringDimensions.findIndex((d) => d.id === dim.id)
                const widthPct = totalWeight > 0 ? (dim.weight / totalWeight) * 100 : 0
                return (
                  <div
                    key={dim.id}
                    className={`${DIMENSION_COLORS[originalIdx % DIMENSION_COLORS.length]} transition-all duration-300`}
                    style={{ width: `${widthPct}%` }}
                    title={`${dim.label}: ${dim.weight}%`}
                  />
                )
              })}
            </div>

            {/* Total weight indicator */}
            <div className="flex items-center gap-2">
              {weightsBalanced ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">
                    Weights sum to 100%
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-xs text-amber-500 font-medium">
                    Weights sum to {totalWeight}% (should be 100%)
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Behavioral Detection                                            */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Behavioral Detection"
        description="Automated detection of harmful trading patterns."
      >
        <FormRow
          label="Revenge trading window"
          hint="Time window after a loss to flag follow-up trades"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={240}
              step={5}
              value={settings.behavioralDetection.revengeTradingWindowMinutes}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateBehavioralDetection?.({ revengeTradingWindowMinutes: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">minutes</span>
          </div>
        </FormRow>

        <FormRow
          label="Overtrading threshold"
          hint="Max trades per day before flagging"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={settings.behavioralDetection.overtradingThresholdPerDay}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateBehavioralDetection?.({ overtradingThresholdPerDay: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">trades / day</span>
          </div>
        </FormRow>

        <FormRow
          label="Position size drift"
          hint="% deviation from plan before flagging"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={200}
              step={5}
              value={settings.behavioralDetection.positionSizeDriftPercent}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateBehavioralDetection?.({ positionSizeDriftPercent: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Review Schedule                                                 */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Review Schedule"
        description="Recurring review reminders to reflect on trading performance."
      >
        {/* Weekly review */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 px-4 py-3 space-y-3">
          <FormRow label="Weekly review" horizontal>
            <ToggleSwitch
              enabled={settings.reviewSchedule.weekly.enabled}
              onChange={(enabled) => {
                onUpdateReviewSchedule?.({ weekly: { ...settings.reviewSchedule.weekly, enabled } })
                markDirty()
              }}
            />
          </FormRow>
          {settings.reviewSchedule.weekly.enabled && (
            <FormRow label="Day of week" hint="Which day to prompt for the weekly review">
              <select
                value={settings.reviewSchedule.weekly.dayOfWeek}
                onChange={(e) => {
                  onUpdateReviewSchedule?.({ weekly: { ...settings.reviewSchedule.weekly, dayOfWeek: e.target.value } })
                  markDirty()
                }}
                className={`${selectClasses} w-44`}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </FormRow>
          )}
        </div>

        {/* Monthly review */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 px-4 py-3 space-y-3">
          <FormRow label="Monthly review" horizontal>
            <ToggleSwitch
              enabled={settings.reviewSchedule.monthly.enabled}
              onChange={(enabled) => {
                onUpdateReviewSchedule?.({ monthly: { ...settings.reviewSchedule.monthly, enabled } })
                markDirty()
              }}
            />
          </FormRow>
          {settings.reviewSchedule.monthly.enabled && (
            <FormRow label="Day of month" hint="Which day of the month to prompt for the monthly review">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={28}
                  step={1}
                  value={settings.reviewSchedule.monthly.dayOfMonth}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (Number.isNaN(v)) return
                    onUpdateReviewSchedule?.({ monthly: { ...settings.reviewSchedule.monthly, dayOfMonth: v } })
                    markDirty()
                  }}
                  className={`${inputClasses} w-28`}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">of each month</span>
              </div>
            </FormRow>
          )}
        </div>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Habit Scoring                                                   */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Habit Scoring"
        description="Track consistency of trading habits over recent trades."
      >
        <FormRow label="Enabled" hint="Calculate a habit consistency score based on recent trades" horizontal>
          <ToggleSwitch
            enabled={settings.habitScoring.enabled}
            onChange={() => {
              markDirty()
            }}
          />
        </FormRow>

        {settings.habitScoring.enabled && (
          <FormRow label="Lookback trades" hint="Number of recent trades to include in the habit score calculation">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={500}
                step={10}
                value={settings.habitScoring.lookbackTrades}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isNaN(v)) return
                  markDirty()
                }}
                className={`${inputClasses} w-28`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">trades</span>
            </div>
          </FormRow>
        )}
      </FormSection>
    </SettingsDetailLayout>
  )
}
