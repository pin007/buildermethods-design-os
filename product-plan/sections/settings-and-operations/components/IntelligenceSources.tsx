import { Brain } from 'lucide-react'
import { useState } from 'react'
import type {
  IntelligenceSourcesProps,
  SecConfig,
  DarkPoolConfig,
  AnalystRatingsConfig,
  OptionsFlowConfig,
  WhaleTrackingConfig,
  AnalystSchedule,
} from '../types'
import {
  SettingsDetailLayout,
  FormSection,
  FormRow,
  ToggleSwitch,
} from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const inputClasses =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const providerTagClasses =
  'rounded-full bg-pink-600/10 dark:bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-600 dark:text-pink-400'

// ---------------------------------------------------------------------------
// Sub-section wrapper: visually distinct with a left border accent
// ---------------------------------------------------------------------------

interface SubSectionProps {
  title: string
  enabled: boolean
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
  children: React.ReactNode
}

function SubSection({
  title,
  enabled,
  onToggle,
  onMarkChanged,
  children,
}: SubSectionProps) {
  return (
    <div className="border-l-2 border-pink-600/20 dark:border-pink-400/20 pl-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</h4>
        <ToggleSwitch
          enabled={enabled}
          onChange={(val) => {
            onToggle?.(val)
            onMarkChanged()
          }}
        />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Provider tags renderer
// ---------------------------------------------------------------------------

function ProviderTags({ providers }: { providers: string[] }) {
  if (providers.length === 0) {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">
        No providers configured
      </span>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {providers.map((p) => (
        <span key={p} className={providerTagClasses}>
          {p}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SEC Filing Tracker
// ---------------------------------------------------------------------------

interface SecFilingTrackerProps {
  config: SecConfig
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
}

function SecFilingTracker({ config, onToggle, onMarkChanged }: SecFilingTrackerProps) {
  return (
    <SubSection
      title="SEC Filing Tracker"
      enabled={config.enabled}
      onToggle={onToggle}
      onMarkChanged={onMarkChanged}
    >
      <FormRow label="User Agent" hint="Required by SEC EDGAR fair access policy">
        <input
          type="text"
          defaultValue={config.userAgent}
          onChange={onMarkChanged}
          className={inputClasses}
        />
      </FormRow>
      <FormRow label="Rate Limit" hint="Requests per second">
        <input
          type="number"
          defaultValue={config.rateLimitPerSecond}
          min={1}
          max={20}
          onChange={onMarkChanged}
          className={inputClasses}
        />
      </FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Form 4 Check Interval" hint="Hours">
          <input
            type="number"
            defaultValue={config.form4CheckIntervalHours}
            min={1}
            max={72}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow label="13F Check Interval" hint="Hours">
          <input
            type="number"
            defaultValue={config.filing13FCheckIntervalHours}
            min={1}
            max={168}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
      </div>
    </SubSection>
  )
}

// ---------------------------------------------------------------------------
// Dark Pool Monitor
// ---------------------------------------------------------------------------

interface DarkPoolMonitorProps {
  config: DarkPoolConfig
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
}

function DarkPoolMonitor({ config, onToggle, onMarkChanged }: DarkPoolMonitorProps) {
  return (
    <SubSection
      title="Dark Pool Monitor"
      enabled={config.enabled}
      onToggle={onToggle}
      onMarkChanged={onMarkChanged}
    >
      <FormRow label="Check Interval" hint="Hours">
        <input
          type="number"
          defaultValue={config.checkIntervalHours}
          min={1}
          max={168}
          onChange={onMarkChanged}
          className={inputClasses}
        />
      </FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Min Volume">
          <input
            type="number"
            defaultValue={config.minVolume}
            min={1000}
            step={10000}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow label="Unusual Multiplier" hint="x average volume">
          <input
            type="number"
            defaultValue={config.unusualMultiplier}
            min={1}
            max={10}
            step={0.1}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
      </div>
    </SubSection>
  )
}

// ---------------------------------------------------------------------------
// Analyst Ratings
// ---------------------------------------------------------------------------

interface AnalystRatingsProps {
  config: AnalystRatingsConfig
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
}

function AnalystRatings({ config, onToggle, onMarkChanged }: AnalystRatingsProps) {
  return (
    <SubSection
      title="Analyst Ratings"
      enabled={config.enabled}
      onToggle={onToggle}
      onMarkChanged={onMarkChanged}
    >
      <FormRow label="Providers">
        <ProviderTags providers={config.providers} />
      </FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Check Interval" hint="Hours">
          <input
            type="number"
            defaultValue={config.checkIntervalHours}
            min={1}
            max={168}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow label="Min Accuracy" hint="%">
          <input
            type="number"
            defaultValue={config.minAccuracyPercent}
            min={0}
            max={100}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
      </div>
    </SubSection>
  )
}

// ---------------------------------------------------------------------------
// Options Flow
// ---------------------------------------------------------------------------

interface OptionsFlowSectionProps {
  config: OptionsFlowConfig
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
}

function OptionsFlowSection({ config, onToggle, onMarkChanged }: OptionsFlowSectionProps) {
  return (
    <SubSection
      title="Options Flow"
      enabled={config.enabled}
      onToggle={onToggle}
      onMarkChanged={onMarkChanged}
    >
      {/* Note callout in amber */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <span className="text-xs font-medium text-amber-500 dark:text-amber-400">
          {config.note}
        </span>
      </div>
      <FormRow label="Providers">
        <ProviderTags providers={config.providers} />
      </FormRow>
      <FormRow label="Check Interval" hint="Hours">
        <input
          type="number"
          defaultValue={config.checkIntervalHours}
          min={1}
          max={168}
          onChange={onMarkChanged}
          className={inputClasses}
        />
      </FormRow>
    </SubSection>
  )
}

// ---------------------------------------------------------------------------
// Whale Tracking
// ---------------------------------------------------------------------------

interface WhaleTrackingSectionProps {
  config: WhaleTrackingConfig
  onToggle?: (enabled: boolean) => void
  onMarkChanged: () => void
}

function WhaleTrackingSection({ config, onToggle, onMarkChanged }: WhaleTrackingSectionProps) {
  return (
    <SubSection
      title="Whale Tracking"
      enabled={config.enabled}
      onToggle={onToggle}
      onMarkChanged={onMarkChanged}
    >
      <FormRow label="Providers">
        <ProviderTags providers={config.providers} />
      </FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Min Transaction" hint="USD">
          <input
            type="number"
            defaultValue={config.minTransactionUsd}
            min={1000}
            step={100000}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow label="Check Interval" hint="Minutes">
          <input
            type="number"
            defaultValue={config.checkIntervalMinutes}
            min={1}
            max={1440}
            onChange={onMarkChanged}
            className={inputClasses}
          />
        </FormRow>
      </div>
    </SubSection>
  )
}

// ---------------------------------------------------------------------------
// Research Schedule Row
// ---------------------------------------------------------------------------

interface ScheduleRowProps {
  schedule: AnalystSchedule
  onToggle?: (id: string, enabled: boolean) => void
  onMarkChanged: () => void
}

function ScheduleRow({ schedule, onToggle, onMarkChanged }: ScheduleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-800/30 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{schedule.label}</p>
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{schedule.cronLabel}</p>
      </div>
      <ToggleSwitch
        enabled={schedule.enabled}
        onChange={(val) => {
          onToggle?.(schedule.id, val)
          onMarkChanged()
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function IntelligenceSources({
  settings,
  onToggleSource,
  onUpdateGuruTracker,
  onUpdateMarketAnalyst,
  onUpdateSignalGeneration,
  onSave,
  onBack,
}: IntelligenceSourcesProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markChanged = () => setHasChanges(true)

  const { guruTracker, marketAnalyst, signalGeneration } = settings
  const { technical, sentiment, diversification } = marketAnalyst.scoringWeights
  const weightsTotal = technical + sentiment + diversification

  return (
    <SettingsDetailLayout
      title="Intelligence Sources"
      icon={Brain}
      description="AI-powered market intelligence providers and analysis configuration"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* ================================================================= */}
      {/* Guru Tracker                                                      */}
      {/* ================================================================= */}
      <FormSection
        title="Guru Tracker"
        description="Track insider filings, dark pool activity, analyst ratings, options flow, and whale transactions"
      >
        <div className="space-y-6">
          <SecFilingTracker
            config={guruTracker.sec}
            onToggle={(enabled) => onToggleSource?.('sec', enabled)}
            onMarkChanged={markChanged}
          />

          <DarkPoolMonitor
            config={guruTracker.darkPool}
            onToggle={(enabled) => onToggleSource?.('darkPool', enabled)}
            onMarkChanged={markChanged}
          />

          <AnalystRatings
            config={guruTracker.analystRatings}
            onToggle={(enabled) => onToggleSource?.('analystRatings', enabled)}
            onMarkChanged={markChanged}
          />

          <OptionsFlowSection
            config={guruTracker.optionsFlow}
            onToggle={(enabled) => onToggleSource?.('optionsFlow', enabled)}
            onMarkChanged={markChanged}
          />

          <WhaleTrackingSection
            config={guruTracker.whaleTracking}
            onToggle={(enabled) => onToggleSource?.('whaleTracking', enabled)}
            onMarkChanged={markChanged}
          />
        </div>
      </FormSection>

      {/* ================================================================= */}
      {/* Market Analyst                                                    */}
      {/* ================================================================= */}
      <FormSection
        title="Market Analyst"
        description="Research scheduling, confidence thresholds, and scoring weights for AI analysis"
      >
        {/* Research Schedules */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Research Schedules
          </h4>
          <div className="space-y-2">
            {marketAnalyst.schedules.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                onToggle={(id, enabled) => {
                  onUpdateMarketAnalyst?.({
                    schedules: marketAnalyst.schedules.map((s) =>
                      s.id === id ? { ...s, enabled } : s,
                    ),
                  })
                }}
                onMarkChanged={markChanged}
              />
            ))}
          </div>
        </div>

        {/* Confidence Thresholds */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Confidence Thresholds
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormRow label="Stocks" hint="Minimum confidence score (0-10)">
              <input
                type="number"
                defaultValue={marketAnalyst.confidenceThresholds.stocks}
                min={0}
                max={10}
                step={0.5}
                onChange={markChanged}
                className={inputClasses}
              />
            </FormRow>
            <FormRow label="Crypto" hint="Minimum confidence score (0-10)">
              <input
                type="number"
                defaultValue={marketAnalyst.confidenceThresholds.crypto}
                min={0}
                max={10}
                step={0.5}
                onChange={markChanged}
                className={inputClasses}
              />
            </FormRow>
          </div>
        </div>

        {/* Scoring Weights */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Scoring Weights
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-mono font-medium ${
                weightsTotal === 100
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {weightsTotal}/100
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormRow label="Technical">
              <div className="relative">
                <input
                  type="number"
                  defaultValue={technical}
                  min={0}
                  max={100}
                  onChange={markChanged}
                  className={inputClasses}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400">
                  %
                </span>
              </div>
            </FormRow>
            <FormRow label="Sentiment">
              <div className="relative">
                <input
                  type="number"
                  defaultValue={sentiment}
                  min={0}
                  max={100}
                  onChange={markChanged}
                  className={inputClasses}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400">
                  %
                </span>
              </div>
            </FormRow>
            <FormRow label="Diversification">
              <div className="relative">
                <input
                  type="number"
                  defaultValue={diversification}
                  min={0}
                  max={100}
                  onChange={markChanged}
                  className={inputClasses}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400">
                  %
                </span>
              </div>
            </FormRow>
          </div>
          {/* Visual weight bar */}
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="bg-pink-600 transition-all"
              style={{ width: `${(technical / Math.max(weightsTotal, 1)) * 100}%` }}
              title={`Technical: ${technical}%`}
            />
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(sentiment / Math.max(weightsTotal, 1)) * 100}%` }}
              title={`Sentiment: ${sentiment}%`}
            />
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(diversification / Math.max(weightsTotal, 1)) * 100}%` }}
              title={`Diversification: ${diversification}%`}
            />
          </div>
          <div className="mt-1 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-pink-600" />
              Technical
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Sentiment
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Diversification
            </span>
          </div>
        </div>

        {/* Top N Published */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Top N Published
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormRow label="Stocks" hint="Number of top picks to publish">
              <input
                type="number"
                defaultValue={marketAnalyst.topNPublished.stocks}
                min={1}
                max={50}
                onChange={markChanged}
                className={inputClasses}
              />
            </FormRow>
            <FormRow label="Crypto" hint="Number of top picks to publish">
              <input
                type="number"
                defaultValue={marketAnalyst.topNPublished.crypto}
                min={1}
                max={50}
                onChange={markChanged}
                className={inputClasses}
              />
            </FormRow>
          </div>
        </div>

        {/* Watchlist Focused */}
        <FormRow label="Watchlist Focused" hint="Only analyze instruments on your watchlist" horizontal>
          <ToggleSwitch
            enabled={marketAnalyst.watchlistFocused}
            onChange={(val) => {
              onUpdateMarketAnalyst?.({ watchlistFocused: val })
              markChanged()
            }}
          />
        </FormRow>
      </FormSection>

      {/* ================================================================= */}
      {/* Signal Generation                                                 */}
      {/* ================================================================= */}
      <FormSection
        title="Signal Generation"
        description="Configure consensus requirements and quality thresholds for generated trading signals"
      >
        <FormRow
          label="Min Consensus Gurus"
          hint="Minimum number of guru sources that must agree before generating a signal"
        >
          <input
            type="number"
            defaultValue={signalGeneration.minConsensusGurus}
            min={1}
            max={10}
            onChange={markChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow
          label="Min Quality Score"
          hint="Minimum quality score (0-100) required for a signal to be published"
        >
          <input
            type="number"
            defaultValue={signalGeneration.minQualityScore}
            min={0}
            max={100}
            onChange={markChanged}
            className={inputClasses}
          />
        </FormRow>
        <FormRow
          label="Signal Expiry"
          hint="Number of days before a signal expires automatically"
        >
          <input
            type="number"
            defaultValue={signalGeneration.expiryDays}
            min={1}
            max={365}
            onChange={markChanged}
            className={inputClasses}
          />
        </FormRow>
      </FormSection>
    </SettingsDetailLayout>
  )
}
