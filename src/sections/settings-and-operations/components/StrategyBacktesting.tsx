import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import type {
  StrategyBacktestingProps,
  ExecutionModel,
} from '@/../product/sections/settings-and-operations/types'
import { SettingsDetailLayout, FormSection, FormRow } from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StrategyBacktesting({
  settings,
  onUpdateEvaluationInterval,
  onUpdateBacktesting,
  onUpdateWalkForward,
  onSave,
  onBack,
}: StrategyBacktestingProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markDirty = () => setHasChanges(true)

  const inputClasses =
    'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

  const { backtesting } = settings

  // Walk-forward bar proportions
  const totalMonths = backtesting.walkForward.trainingMonths + backtesting.walkForward.validationMonths
  const trainingPct = totalMonths > 0 ? (backtesting.walkForward.trainingMonths / totalMonths) * 100 : 50
  const validationPct = totalMonths > 0 ? (backtesting.walkForward.validationMonths / totalMonths) * 100 : 50

  return (
    <SettingsDetailLayout
      title="Strategy & Backtesting"
      icon={FlaskConical}
      description="Strategy evaluation and backtesting simulation defaults"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* --------------------------------------------------------------- */}
      {/* Strategy Evaluation                                              */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Strategy Evaluation"
        description="Controls how frequently strategies are evaluated and their default risk parameters."
      >
        <FormRow label="Evaluation Interval" hint="How often the strategy engine runs its evaluation loop">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={3600}
              step={1}
              value={settings.evaluationIntervalSeconds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateEvaluationInterval?.(v)
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">seconds</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{settings.evaluationScheduleLabel}</p>
        </FormRow>

        <FormRow label="Default Risk per Trade" hint="Percentage of portfolio risked per individual trade">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0.01}
              max={100}
              step={0.1}
              value={settings.defaultRiskPerTrade}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({} as any)
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>

        <FormRow label="Max Position Size" hint="Maximum percentage of portfolio allocated to a single position">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0.1}
              max={100}
              step={0.5}
              value={settings.maxPositionSize}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>

        <FormRow label="Strategy Config Directory" hint="Read-only path to strategy configuration files">
          <div
            className="
              rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2
              font-mono text-sm text-zinc-500 dark:text-zinc-400
            "
          >
            {settings.strategyConfigDirectory}
          </div>
        </FormRow>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Backtesting Defaults                                             */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Backtesting Defaults"
        description="Default parameters applied to new backtesting simulations."
      >
        <FormRow label="Default Capital" hint="Starting capital for backtesting simulations">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1000}
              max={100000000}
              step={1000}
              value={backtesting.defaultCapital}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({ defaultCapital: v })
                markDirty()
              }}
              className={`${inputClasses} w-40`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(backtesting.defaultCapital)})
            </span>
          </div>
        </FormRow>

        <FormRow label="Commission" hint="Simulated commission cost per trade">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10}
              step={0.01}
              value={backtesting.commissionPercent}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({ commissionPercent: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>

        <FormRow label="Slippage" hint="Simulated slippage applied to each fill">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10}
              step={0.01}
              value={backtesting.slippagePercent}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({ slippagePercent: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </FormRow>

        <FormRow label="Execution Model" hint="How order fills are simulated during backtesting">
          <div className="flex flex-wrap gap-1.5">
            {backtesting.executionModels.map((model: ExecutionModel) => (
              <button
                key={model}
                onClick={() => {
                  onUpdateBacktesting?.({ executionModel: model })
                  markDirty()
                }}
                className={`
                  rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                  ${
                    backtesting.executionModel === model
                      ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-600/25 dark:ring-pink-400/25'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-800'
                  }
                `}
              >
                {model.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </FormRow>

        <FormRow label="Max Workers" hint="Maximum parallel workers for backtesting simulations">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={64}
              step={1}
              value={backtesting.maxWorkers}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({ maxWorkers: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">workers</span>
          </div>
        </FormRow>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Walk-Forward                                                     */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Walk-Forward"
        description="Configuration for walk-forward optimization periods."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Training Period" hint="Months of historical data used for strategy training">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                value={backtesting.walkForward.trainingMonths}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isNaN(v)) return
                  onUpdateWalkForward?.({ trainingMonths: v })
                  markDirty()
                }}
                className={`${inputClasses} w-24`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">months</span>
            </div>
          </FormRow>

          <FormRow label="Validation Period" hint="Months of data reserved for out-of-sample validation">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={backtesting.walkForward.validationMonths}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isNaN(v)) return
                  onUpdateWalkForward?.({ validationMonths: v })
                  markDirty()
                }}
                className={`${inputClasses} w-24`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">months</span>
            </div>
          </FormRow>
        </div>

        {/* Visual period bar */}
        <div className="mt-2">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Period Distribution</span>
            <span>{totalMonths} months total</span>
          </div>
          <div className="flex h-6 overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div
              className="flex items-center justify-center bg-pink-600/20 dark:bg-pink-500/20 text-xs font-medium text-pink-600 dark:text-pink-400 transition-all"
              style={{ width: `${trainingPct}%` }}
            >
              {backtesting.walkForward.trainingMonths}mo train
            </div>
            <div
              className="flex items-center justify-center bg-emerald-500/20 text-xs font-medium text-emerald-500 transition-all"
              style={{ width: `${validationPct}%` }}
            >
              {backtesting.walkForward.validationMonths}mo val
            </div>
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-pink-600/40 dark:bg-pink-500/40" />
              Training ({trainingPct.toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/40" />
              Validation ({validationPct.toFixed(0)}%)
            </span>
          </div>
        </div>
      </FormSection>

      {/* --------------------------------------------------------------- */}
      {/* Reports                                                          */}
      {/* --------------------------------------------------------------- */}
      <FormSection
        title="Reports"
        description="Default report format and retention for backtesting results."
      >
        <FormRow label="Report Format" hint="Output format for backtesting reports">
          <div className="flex flex-wrap gap-1.5">
            {backtesting.reportFormats.map((fmt: string) => (
              <button
                key={fmt}
                onClick={() => {
                  onUpdateBacktesting?.({ reportFormat: fmt })
                  markDirty()
                }}
                className={`
                  rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                  ${
                    backtesting.reportFormat === fmt
                      ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-600/25 dark:ring-pink-400/25'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-800'
                  }
                `}
              >
                {fmt}
              </button>
            ))}
          </div>
        </FormRow>

        <FormRow label="Results Retention" hint="Number of days backtesting results are kept before auto-cleanup">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={3650}
              step={1}
              value={backtesting.resultsRetentionDays}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) return
                onUpdateBacktesting?.({ resultsRetentionDays: v })
                markDirty()
              }}
              className={`${inputClasses} w-28`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">days</span>
          </div>
        </FormRow>
      </FormSection>
    </SettingsDetailLayout>
  )
}
