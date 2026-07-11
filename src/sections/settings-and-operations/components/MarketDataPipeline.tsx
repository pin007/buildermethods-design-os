import { useId, useState } from 'react'
import {
  Database,
  GripVertical,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react'
import type {
  MarketDataPipelineProps,
  DataSource,
  FetchStatus,
  InstrumentType,
} from '@/../product/sections/settings-and-operations/types'
import {
  SettingsDetailLayout,
  FormSection,
  FormRow,
  ToggleSwitch,
} from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const inputClasses =
  'rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary dark:focus:border-pink-400 focus:ring-1 focus:ring-ring/30 dark:focus:ring-pink-400/30'

function statusDot(status: FetchStatus) {
  const colors: Record<FetchStatus, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  }
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors[status]}`}
      title={status}
    />
  )
}

function qualityBadge(score: number) {
  let color: string
  if (score >= 98) {
    color = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  } else if (score >= 95) {
    color = 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  } else {
    color = 'bg-red-500/15 text-red-600 dark:text-red-400'
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      {score.toFixed(1)}%
    </span>
  )
}

function typeBadge(type: InstrumentType) {
  const styles: Record<string, string> = {
    stock: 'bg-zinc-500/15 text-muted-foreground',
    crypto: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    forex: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    option: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    future: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[type] ?? styles.stock}`}
    >
      {type}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketDataPipeline({
  dataSources,
  retentionTiers,
  qualityThresholds,
  trackedInstruments,
  onReorderSources,
  onToggleSource,
  onUpdateThresholds,
  onUpdateRetention,
  onAddInstrument,
  onRemoveInstrument,
  onSave,
  onBack,
}: MarketDataPipelineProps) {
  const retentionInputId = useId()
  const [hasChanges, setHasChanges] = useState(false)

  // Local state for sources ordering (to allow simulated reorder)
  const [orderedSources, setOrderedSources] = useState<DataSource[]>(
    [...dataSources].sort((a, b) => a.priority - b.priority)
  )

  // Local state for quality thresholds
  const [thresholds, setThresholds] = useState(qualityThresholds)

  // Local state for retention days
  const [retentionDays, setRetentionDays] = useState<Record<string, number>>(
    Object.fromEntries(retentionTiers.map((t) => [t.id, t.retentionDays]))
  )

  // Local state for tracked instruments
  const [instruments, setInstruments] = useState(trackedInstruments)

  // --- Handlers ---

  function moveSource(index: number, direction: 'up' | 'down') {
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= orderedSources.length) return

    const next = [...orderedSources]
    const temp = next[index]
    next[index] = next[swapIdx]
    next[swapIdx] = temp
    // Recalculate priority numbers
    const reordered = next.map((s, i) => ({ ...s, priority: i + 1 }))
    setOrderedSources(reordered)
    setHasChanges(true)
    onReorderSources?.(reordered.map((s) => s.id))
  }

  function handleToggleSource(sourceId: string, enabled: boolean) {
    setOrderedSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, enabled } : s))
    )
    setHasChanges(true)
    onToggleSource?.(sourceId, enabled)
  }

  function handleThresholdChange(
    field: keyof typeof thresholds,
    value: number
  ) {
    const next = { ...thresholds, [field]: value }
    setThresholds(next)
    setHasChanges(true)
    onUpdateThresholds?.({ [field]: value })
  }

  function handleRetentionChange(tierId: string, days: number) {
    setRetentionDays((prev) => ({ ...prev, [tierId]: days }))
    setHasChanges(true)
    onUpdateRetention?.(tierId, days)
  }

  function handleRemoveInstrument(symbol: string) {
    setInstruments((prev) => prev.filter((i) => i.symbol !== symbol))
    setHasChanges(true)
    onRemoveInstrument?.(symbol)
  }

  function handleAddInstrument() {
    setHasChanges(true)
    onAddInstrument?.('')
  }

  function handleSave() {
    setHasChanges(false)
    onSave?.()
  }

  // --- Render ---

  return (
    <SettingsDetailLayout
      title="Market Data Pipeline"
      icon={Database}
      description="Configure data sources, quality thresholds, retention tiers, and tracked instruments"
      hasChanges={hasChanges}
      onSave={handleSave}
      onBack={onBack}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Data Sources                                                      */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Data Sources"
        description="Priority-ordered data providers. Higher priority sources are preferred for data collection."
      >
        <div className="space-y-2">
          {orderedSources.map((source, index) => (
            <div
              key={source.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-zinc-100/30 dark:bg-zinc-800/30 px-3 py-2.5 sm:flex-nowrap"
            >
              {/* Grip + priority */}
              <div className="flex shrink-0 items-center gap-1.5">
                <GripVertical
                  size={14}
                  className="cursor-grab text-hint"
                  aria-hidden
                />
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/10 text-xs font-bold text-primary">
                  {source.priority}
                </span>
              </div>

              {/* Source name */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {source.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {source.scheduleLabel}
                </p>
              </div>

              {/* Status dot + records */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {statusDot(source.lastFetchStatus)}
                <span className="font-mono">
                  {source.recordsFetched.toLocaleString()} records
                </span>
              </div>

              {/* Quality score */}
              {qualityBadge(source.qualityScore)}

              {/* Toggle */}
              <ToggleSwitch
                label={`Enable ${source.name}`}
                enabled={source.enabled}
                onChange={(enabled) => handleToggleSource(source.id, enabled)}
              />

              {/* Reorder buttons */}
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  onClick={() => moveSource(index, 'up')}
                  disabled={index === 0}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-zinc-500 dark:disabled:hover:text-zinc-400"
                  aria-label={`Move ${source.name} up`}
                >
                  <ChevronUp size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => moveSource(index, 'down')}
                  disabled={index === orderedSources.length - 1}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-zinc-500 dark:disabled:hover:text-zinc-400"
                  aria-label={`Move ${source.name} down`}
                >
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Quality Thresholds                                                */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Quality Thresholds"
        description="Minimum acceptable quality scores for incoming market data"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <FormRow label="Completeness %" hint="Minimum data completeness">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={thresholds.completeness}
              onChange={(e) =>
                handleThresholdChange(
                  'completeness',
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full ${inputClasses}`}
            />
          </FormRow>
          <FormRow label="Timeliness %" hint="Minimum data timeliness">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={thresholds.timeliness}
              onChange={(e) =>
                handleThresholdChange(
                  'timeliness',
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full ${inputClasses}`}
            />
          </FormRow>
          <FormRow label="Accuracy %" hint="Minimum data accuracy">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={thresholds.accuracy}
              onChange={(e) =>
                handleThresholdChange(
                  'accuracy',
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full ${inputClasses}`}
            />
          </FormRow>
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Retention Tiers                                                   */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Retention Tiers"
        description="Data storage tiers controlling granularity and retention duration"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {retentionTiers.map((tier) => {
            const tierColors: Record<string, string> = {
              Hot: 'border-red-500/30 bg-red-500/5',
              Warm: 'border-amber-500/30 bg-amber-500/5',
              Cold: 'border-sky-500/30 bg-sky-500/5',
            }
            const labelColors: Record<string, string> = {
              Hot: 'text-red-600 dark:text-red-400',
              Warm: 'text-amber-600 dark:text-amber-400',
              Cold: 'text-sky-600 dark:text-sky-400',
            }
            return (
              <div
                key={tier.id}
                className={`rounded-lg border p-4 ${tierColors[tier.label] ?? 'border-border bg-zinc-100/30 dark:bg-zinc-800/30'}`}
              >
                <h3
                  className={`text-sm font-bold ${labelColors[tier.label] ?? 'text-foreground'}`}
                >
                  {tier.label}
                </h3>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                  {tier.description}
                </p>

                <div className="space-y-2">
                  <div>
                    <label
                      htmlFor={`${retentionInputId}-${tier.id}`}
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Retention (days)
                    </label>
                    <input
                      id={`${retentionInputId}-${tier.id}`}
                      type="number"
                      min={1}
                      value={retentionDays[tier.id] ?? tier.retentionDays}
                      onChange={(e) =>
                        handleRetentionChange(
                          tier.id,
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className={`w-full ${inputClasses}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Granularity</span>
                    <span className="font-mono">{tier.granularity}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Storage</span>
                    <span className="font-mono">{tier.storage}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </FormSection>

      {/* ----------------------------------------------------------------- */}
      {/* Tracked Instruments                                               */}
      {/* ----------------------------------------------------------------- */}
      <FormSection
        title="Tracked Instruments"
        description="Instruments actively tracked for market data collection"
      >
        <div className="space-y-1.5">
          {instruments.map((inst) => (
            <div
              key={inst.symbol}
              className="flex items-center gap-3 rounded-lg border border-border bg-zinc-100/30 dark:bg-zinc-800/30 px-3 py-2"
            >
              <span className="w-20 shrink-0 font-mono text-sm font-bold text-foreground">
                {inst.symbol}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {inst.name}
              </span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {inst.exchange}
              </span>
              {typeBadge(inst.type)}
              <button
                onClick={() => handleRemoveInstrument(inst.symbol)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                aria-label={`Remove ${inst.symbol}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddInstrument}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary dark:hover:border-pink-400 hover:text-primary"
        >
          <Plus size={14} aria-hidden="true" />
          Add Instrument
        </button>
      </FormSection>
    </SettingsDetailLayout>
  )
}
