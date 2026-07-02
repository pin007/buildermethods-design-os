import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Target,
  CheckCircle2,
  Gauge,
  Tag,
  Upload,
  X,
  AlertCircle,
  Shield,
  Brain,
  Crosshair,
  LogOut,
  Info,
  Image,
} from 'lucide-react'
import type {
  JournalEntryEditorProps,
  JournalEntry,
  MarketCondition,
  EmotionalStateBefore,
  EmotionalStateAfter,
} from '@/../product/sections/trade-journal/types'

// =============================================================================
// Formatting helpers
// =============================================================================

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatPrice(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

function formatSignedCurrency(value: number): string {
  const formatted = formatPrice(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `\u2212${formatted}`
}

// =============================================================================
// Option configs
// =============================================================================

const marketConditions: { value: MarketCondition; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'ranging', label: 'Ranging' },
  { value: 'volatile', label: 'Volatile' },
  { value: 'calm', label: 'Calm' },
  { value: 'uncertain', label: 'Uncertain' },
]

const emotionalStatesBefore: { value: EmotionalStateBefore; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'confident', label: 'Confident' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'excited', label: 'Excited' },
  { value: 'fearful', label: 'Fearful' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'frustrated', label: 'Frustrated' },
]

const emotionalStatesAfter: { value: EmotionalStateAfter; label: string }[] = [
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'disappointed', label: 'Disappointed' },
  { value: 'relieved', label: 'Relieved' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'regretful', label: 'Regretful' },
  { value: 'proud', label: 'Proud' },
]

const dimensionTooltips: Record<string, string> = {
  discipline: 'Did you follow your trading plan and rules without deviation?',
  emotionalManagement: 'Did you manage emotions effectively throughout the trade?',
  riskManagement: 'Was position sizing appropriate and was the stop-loss respected?',
  entryQuality: 'Was the entry timing and price level optimal for the setup?',
  exitQuality: 'Did you exit at a good level relative to your plan and price action?',
}

// =============================================================================
// Main Component
// =============================================================================

export function JournalEntryEditor({
  entry,
  trade,
  availableTags,
  onSave,
  onCancel,
  onDirtyChange,
}: JournalEntryEditorProps) {
  const isEditing = !!entry
  const isFromTrade = !!trade

  // Form state derived from entry or trade
  const [preTradeOpen, setPreTradeOpen] = useState(true)
  const [postTradeOpen, setPostTradeOpen] = useState(true)

  // Pre-trade fields
  const [thesis, setThesis] = useState(entry?.preTrade?.thesis ?? '')
  const [entryCriteria, setEntryCriteria] = useState(entry?.preTrade?.entryCriteria ?? '')
  const [targetPrice, setTargetPrice] = useState(entry?.preTrade?.targetPrice?.toString() ?? '')
  const [plannedStopLoss, setPlannedStopLoss] = useState(entry?.preTrade?.plannedStopLoss?.toString() ?? '')
  const [riskRewardManual, setRiskRewardManual] = useState('')
  const [positionSizeRationale, setPositionSizeRationale] = useState(entry?.preTrade?.positionSizeRationale ?? '')
  const [confidenceLevel, setConfidenceLevel] = useState<number>(entry?.preTrade?.confidenceLevel ?? 0)
  const [marketCondition, setMarketCondition] = useState<string>(entry?.preTrade?.marketConditions ?? '')
  const [emotionalBefore, setEmotionalBefore] = useState<string>(entry?.preTrade?.emotionalStateBefore ?? '')

  // Post-trade fields
  const [whatWorked, setWhatWorked] = useState(entry?.postTrade?.whatWorked ?? '')
  const [whatDidntWork, setWhatDidntWork] = useState(entry?.postTrade?.whatDidntWork ?? '')
  const [lessonsLearned, setLessonsLearned] = useState(entry?.postTrade?.lessonsLearned ?? '')
  const [emotionalAfter, setEmotionalAfter] = useState<string>(entry?.postTrade?.emotionalStateAfter ?? '')
  const [wouldTakeAgain, setWouldTakeAgain] = useState<boolean | null>(entry?.postTrade?.wouldTakeAgain ?? null)

  // Process scores
  const [discipline, setDiscipline] = useState<number>(entry?.processScores?.discipline ?? 0)
  const [emotionalMgmt, setEmotionalMgmt] = useState<number>(entry?.processScores?.emotionalManagement ?? 0)
  const [riskMgmt, setRiskMgmt] = useState<number>(entry?.processScores?.riskManagement ?? 0)
  const [entryQuality, setEntryQuality] = useState<number>(entry?.processScores?.entryQuality ?? 0)
  const [exitQuality, setExitQuality] = useState<number>(entry?.processScores?.exitQuality ?? 0)

  // Tags
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  // Validation
  const [showErrors, setShowErrors] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  // Dirty tracking
  const isDirty = useRef(false)
  useEffect(() => {
    isDirty.current = true
    onDirtyChange?.(true)
  }, [thesis, entryCriteria, targetPrice, plannedStopLoss, positionSizeRationale, confidenceLevel, marketCondition, emotionalBefore, whatWorked, whatDidntWork, lessonsLearned, emotionalAfter, wouldTakeAgain, discipline, emotionalMgmt, riskMgmt, entryQuality, exitQuality, tags, onDirtyChange])

  // Computed R:R ratio
  const computedRR = useMemo(() => {
    if (riskRewardManual) return parseFloat(riskRewardManual)
    const target = parseFloat(targetPrice)
    const stop = parseFloat(plannedStopLoss)
    const entryP = trade?.entryPrice ?? entry?.tradeSummary?.entryPrice
    if (!entryP || !target || !stop) return null
    const reward = Math.abs(target - entryP)
    const risk = Math.abs(entryP - stop)
    if (risk === 0) return null
    return reward / risk
  }, [targetPrice, plannedStopLoss, riskRewardManual, trade, entry])

  // Computed overall score
  const overallScore = useMemo(() => {
    const scores = [discipline, emotionalMgmt, riskMgmt, entryQuality, exitQuality]
    const filled = scores.filter((s) => s > 0)
    if (filled.length === 0) return 0
    return filled.reduce((a, b) => a + b, 0) / filled.length
  }, [discipline, emotionalMgmt, riskMgmt, entryQuality, exitQuality])

  // Validation
  const hasPreTradeContent = thesis || entryCriteria || targetPrice || plannedStopLoss || positionSizeRationale
  const hasPostTradeContent = whatWorked || whatDidntWork || lessonsLearned
  const allScoresFilled = discipline > 0 && emotionalMgmt > 0 && riskMgmt > 0 && entryQuality > 0 && exitQuality > 0
  const hasContentSection = hasPreTradeContent || hasPostTradeContent
  const isValid = allScoresFilled && hasContentSection

  // Tag suggestions
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return availableTags.filter((t) => !tags.includes(t)).slice(0, 5)
    const q = tagInput.toLowerCase()
    return availableTags
      .filter((t) => t.toLowerCase().includes(q) && !tags.includes(t))
      .slice(0, 5)
  }, [tagInput, availableTags, tags])

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase()
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed])
      }
      setTagInput('')
      setShowTagSuggestions(false)
    },
    [tags],
  )

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleSave = useCallback(() => {
    setShowErrors(true)
    if (!isValid) return

    const data: Partial<JournalEntry> = {
      preTrade: hasPreTradeContent
        ? {
            thesis,
            entryCriteria,
            targetPrice: parseFloat(targetPrice) || 0,
            plannedStopLoss: parseFloat(plannedStopLoss) || 0,
            riskRewardRatio: computedRR ?? 0,
            positionSizeRationale,
            confidenceLevel: (confidenceLevel || 3) as 1 | 2 | 3 | 4 | 5,
            marketConditions: (marketCondition || 'uncertain') as MarketCondition,
            emotionalStateBefore: (emotionalBefore || 'neutral') as EmotionalStateBefore,
          }
        : null,
      postTrade: hasPostTradeContent
        ? {
            whatWorked,
            whatDidntWork,
            lessonsLearned,
            emotionalStateAfter: (emotionalAfter || 'neutral') as EmotionalStateAfter,
            wouldTakeAgain: wouldTakeAgain ?? false,
          }
        : null,
      processScores: {
        discipline: discipline as 1 | 2 | 3 | 4 | 5,
        emotionalManagement: emotionalMgmt as 1 | 2 | 3 | 4 | 5,
        riskManagement: riskMgmt as 1 | 2 | 3 | 4 | 5,
        entryQuality: entryQuality as 1 | 2 | 3 | 4 | 5,
        exitQuality: exitQuality as 1 | 2 | 3 | 4 | 5,
        overall: overallScore,
      },
      tags,
    }

    onSave?.(data)
  }, [isValid, thesis, entryCriteria, targetPrice, plannedStopLoss, computedRR, positionSizeRationale, confidenceLevel, marketCondition, emotionalBefore, whatWorked, whatDidntWork, lessonsLearned, emotionalAfter, wouldTakeAgain, discipline, emotionalMgmt, riskMgmt, entryQuality, exitQuality, overallScore, tags, hasPreTradeContent, hasPostTradeContent, onSave])

  const handleCancel = useCallback(() => {
    if (isDirty.current) {
      setCancelModalOpen(true)
    } else {
      onCancel?.()
    }
  }, [onCancel])

  // Trade summary data
  const tradeSummary = entry?.tradeSummary ?? (trade
    ? {
        instrument: trade.instrument,
        instrumentName: trade.instrumentName,
        side: trade.side,
        entryDate: trade.entryDate,
        exitDate: trade.exitDate,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        broker: trade.broker,
        strategy: trade.strategy,
      }
    : null)

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onCancel?.()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 active:scale-95"
          aria-label="Back to journal"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Trade Journal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h1>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Trade Summary (read-only)                                         */}
      {/* ================================================================= */}
      {tradeSummary && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {tradeSummary.instrument}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {tradeSummary.instrumentName}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              tradeSummary.side === 'BUY'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
            }`}>
              {tradeSummary.side}
            </span>
            <span className={`font-mono text-sm font-semibold ${
              tradeSummary.pnl >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatSignedCurrency(tradeSummary.pnl)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-600">
            <span>{formatDate(tradeSummary.entryDate)} \u2192 {formatDate(tradeSummary.exitDate)}</span>
            <span>{formatPrice(tradeSummary.entryPrice)} \u2192 {formatPrice(tradeSummary.exitPrice)}</span>
            <span>Qty: {tradeSummary.quantity}</span>
            <span>{tradeSummary.broker}</span>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Pre-Trade Section (collapsible)                                   */}
      {/* ================================================================= */}
      <CollapsibleSection
        title="Pre-Trade Analysis"
        icon={Target}
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        iconColor="text-blue-600 dark:text-blue-400"
        isOpen={preTradeOpen}
        onToggle={() => setPreTradeOpen((o) => !o)}
      >
        <div className="space-y-4 p-6">
          <FormField label="Thesis" required={false}>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={3}
              placeholder="What's your trading thesis? Why are you taking this trade?"
              className="form-textarea"
            />
          </FormField>

          <FormField label="Entry Criteria">
            <textarea
              value={entryCriteria}
              onChange={(e) => setEntryCriteria(e.target.value)}
              rows={2}
              placeholder="What conditions need to be met for entry?"
              className="form-textarea"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Target Price">
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="form-input"
              />
            </FormField>

            <FormField label="Planned Stop-Loss">
              <input
                type="number"
                value={plannedStopLoss}
                onChange={(e) => setPlannedStopLoss(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="form-input"
              />
            </FormField>

            <FormField label="Risk/Reward Ratio">
              <div className="relative">
                <input
                  type="number"
                  value={riskRewardManual || (computedRR?.toFixed(2) ?? '')}
                  onChange={(e) => setRiskRewardManual(e.target.value)}
                  placeholder="Auto"
                  step="0.01"
                  className="form-input"
                />
                {computedRR && !riskRewardManual && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-600">
                    auto
                  </span>
                )}
              </div>
            </FormField>
          </div>

          <FormField label="Position Size Rationale">
            <textarea
              value={positionSizeRationale}
              onChange={(e) => setPositionSizeRationale(e.target.value)}
              rows={2}
              placeholder="Why this position size? Risk per share, % of portfolio, etc."
              className="form-textarea"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Confidence Level">
              <DotSelector
                value={confidenceLevel}
                onChange={setConfidenceLevel}
                max={5}
              />
            </FormField>

            <FormField label="Market Conditions">
              <select
                value={marketCondition}
                onChange={(e) => setMarketCondition(e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                {marketConditions.map((mc) => (
                  <option key={mc.value} value={mc.value}>
                    {mc.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Emotional State Before">
              <select
                value={emotionalBefore}
                onChange={(e) => setEmotionalBefore(e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                {emotionalStatesBefore.map((es) => (
                  <option key={es.value} value={es.value}>
                    {es.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </CollapsibleSection>

      {/* ================================================================= */}
      {/* Post-Trade Section (collapsible)                                  */}
      {/* ================================================================= */}
      <CollapsibleSection
        title="Post-Trade Review"
        icon={CheckCircle2}
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        isOpen={postTradeOpen}
        onToggle={() => setPostTradeOpen((o) => !o)}
      >
        <div className="space-y-4 p-6">
          <FormField label="What Worked">
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              rows={2}
              placeholder="What went well with this trade?"
              className="form-textarea"
            />
          </FormField>

          <FormField label="What Didn't Work">
            <textarea
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              rows={2}
              placeholder="What could have been better?"
              className="form-textarea"
            />
          </FormField>

          <FormField label="Lessons Learned">
            <textarea
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              rows={2}
              placeholder="Key takeaways from this trade"
              className="form-textarea"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Emotional State After">
              <select
                value={emotionalAfter}
                onChange={(e) => setEmotionalAfter(e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                {emotionalStatesAfter.map((es) => (
                  <option key={es.value} value={es.value}>
                    {es.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Would Take Again?">
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setWouldTakeAgain(true)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    wouldTakeAgain === true
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setWouldTakeAgain(false)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    wouldTakeAgain === false
                      ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  No
                </button>
              </div>
            </FormField>
          </div>
        </div>
      </CollapsibleSection>

      {/* ================================================================= */}
      {/* Process Scores (always visible)                                   */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/30">
              <Gauge size={13} className="text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Process Scores
            </h2>
            <span className="text-xs text-red-500 dark:text-red-400">*required</span>
          </div>

          {/* Overall score */}
          {overallScore > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">Overall</span>
              <span className={`font-mono text-xl font-bold ${
                overallScore >= 4
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : overallScore >= 3
                  ? 'text-blue-600 dark:text-blue-400'
                  : overallScore >= 2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {overallScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 p-6">
          <ScoreSelector
            label="Discipline"
            tooltip={dimensionTooltips.discipline}
            value={discipline}
            onChange={setDiscipline}
            icon={Shield}
            error={showErrors && discipline === 0}
          />
          <ScoreSelector
            label="Emotional Management"
            tooltip={dimensionTooltips.emotionalManagement}
            value={emotionalMgmt}
            onChange={setEmotionalMgmt}
            icon={Brain}
            error={showErrors && emotionalMgmt === 0}
          />
          <ScoreSelector
            label="Risk Management"
            tooltip={dimensionTooltips.riskManagement}
            value={riskMgmt}
            onChange={setRiskMgmt}
            icon={Target}
            error={showErrors && riskMgmt === 0}
          />
          <ScoreSelector
            label="Entry Quality"
            tooltip={dimensionTooltips.entryQuality}
            value={entryQuality}
            onChange={setEntryQuality}
            icon={Crosshair}
            error={showErrors && entryQuality === 0}
          />
          <ScoreSelector
            label="Exit Quality"
            tooltip={dimensionTooltips.exitQuality}
            value={exitQuality}
            onChange={setExitQuality}
            icon={LogOut}
            error={showErrors && exitQuality === 0}
          />

          {showErrors && !allScoresFilled && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
              <AlertCircle size={12} />
              All five process scores are required
            </p>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tags                                                              */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
          <Tag size={13} className="text-zinc-400 dark:text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tags</h2>
        </div>

        <div className="p-6">
          {/* Current tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 dark:bg-pink-950/20 dark:text-pink-400"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 transition-colors hover:bg-pink-200 dark:hover:bg-pink-900/40"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag input */}
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setShowTagSuggestions(true)
              }}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
              placeholder="Type to add a tag..."
              className="form-input"
            />

            {/* Suggestions dropdown */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {tagSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      addTag(suggestion)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Attachments                                                       */}
      {/* ================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800/60 px-6 py-4">
          <Image size={13} className="text-zinc-400 dark:text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Attachments</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-8 transition-colors hover:border-pink-300 hover:bg-pink-50/30 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-pink-900/40 dark:hover:bg-pink-950/10">
            <Upload size={24} className="text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Drag & drop charts or screenshots
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              or click to browse \u00b7 Images only, max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Validation summary                                                */}
      {/* ================================================================= */}
      {showErrors && !isValid && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Please fix the following:
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-red-600 dark:text-red-400/80">
                {!allScoresFilled && <li>All five process scores are required</li>}
                {!hasContentSection && <li>At least one of pre-trade or post-trade section must have content</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Action buttons                                                    */}
      {/* ================================================================= */}
      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-end">
        <button
          onClick={handleCancel}
          className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
        >
          {isEditing ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>

      {/* ================================================================= */}
      {/* Cancel Confirmation Modal                                         */}
      {/* ================================================================= */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCancelModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Discard changes?
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You have unsaved changes. Are you sure you want to leave?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Keep editing
              </button>
              <button
                onClick={() => {
                  setCancelModalOpen(false)
                  onCancel?.()
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 active:scale-[0.98]"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Shared form styles (Tailwind @apply alternative via inline)        */}
      {/* ================================================================= */}
      <style>{`
        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          border-color: rgb(228 228 231);
          background-color: white;
          color: rgb(24 24 27);
        }
        .dark .form-input,
        .dark .form-textarea,
        .dark .form-select {
          border-color: rgb(63 63 70);
          background-color: rgb(24 24 27 / 0.8);
          color: rgb(244 244 245);
        }
        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgb(161 161 170);
        }
        .dark .form-input::placeholder,
        .dark .form-textarea::placeholder {
          color: rgb(82 82 91);
        }
        .form-input:focus-visible,
        .form-textarea:focus-visible,
        .form-select:focus-visible {
          outline: none;
          border-color: #db2777;
          box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.2);
        }
        .dark .form-input:focus-visible,
        .dark .form-textarea:focus-visible,
        .dark .form-select:focus-visible {
          border-color: #f472b6;
          box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.2);
        }
        .form-textarea {
          resize: vertical;
          min-height: 2.5rem;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// Collapsible Section
// =============================================================================

function CollapsibleSection({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-6 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={13} className={iconColor} />
        </div>
        <h2 className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h2>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform dark:text-zinc-500 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800/60">
          {children}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Form Field
// =============================================================================

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

// =============================================================================
// Dot Selector (1-5)
// =============================================================================

function DotSelector({
  value,
  onChange,
  max = 5,
}: {
  value: number
  onChange: (v: number) => void
  max?: number
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((dot) => (
        <button
          key={dot}
          onClick={() => onChange(dot === value ? 0 : dot)}
          className={`h-5 w-5 rounded-full border-2 transition-all ${
            dot <= value
              ? 'border-pink-600 bg-pink-600 dark:border-pink-400 dark:bg-pink-400'
              : 'border-zinc-300 bg-white hover:border-pink-300 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-pink-600'
          }`}
          title={`${dot} of ${max}`}
        />
      ))}
      {value > 0 && (
        <span className="ml-1 font-mono text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          {value}/{max}
        </span>
      )}
    </div>
  )
}

// =============================================================================
// Score Selector (with label, tooltip, icon)
// =============================================================================

function ScoreSelector({
  label,
  tooltip,
  value,
  onChange,
  icon: Icon,
  error,
}: {
  label: string
  tooltip: string
  value: number
  onChange: (v: number) => void
  icon: React.ElementType
  error: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
      error ? 'bg-red-50/50 ring-1 ring-red-200 dark:bg-red-950/10 dark:ring-red-900/40' : ''
    }`}>
      <div className="flex w-40 items-center gap-2 shrink-0 sm:w-48">
        <Icon size={14} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
          {label}
        </span>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="rounded p-0.5 text-zinc-300 transition-colors hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          >
            <Info size={12} />
          </button>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-zinc-700">
              {tooltip}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((dot) => (
          <button
            key={dot}
            onClick={() => onChange(dot === value ? 0 : dot)}
            className={`h-7 w-7 rounded-full border-2 text-xs font-bold transition-all ${
              dot <= value
                ? 'border-pink-600 bg-pink-600 text-white dark:border-pink-400 dark:bg-pink-400 dark:text-zinc-900'
                : 'border-zinc-200 bg-white text-zinc-400 hover:border-pink-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-600 dark:hover:border-pink-600'
            }`}
          >
            {dot}
          </button>
        ))}
      </div>

      {value > 0 && (
        <span className={`font-mono text-sm font-bold ${
          value >= 4
            ? 'text-emerald-600 dark:text-emerald-400'
            : value >= 3
            ? 'text-blue-600 dark:text-blue-400'
            : value >= 2
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {value}
        </span>
      )}
    </div>
  )
}
