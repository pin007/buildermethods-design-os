import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Clock,
  Loader2,
  AlertTriangle,
  Play,
  Square,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  Search,
  Calendar,
  Timer,
  Shield,
} from 'lucide-react'
import type {
  ResearchJob,
  ScheduleType,
  JobUniverse,
  JobStatus,
  JobRunHistory,
  JobRunStatus,
  JobTriggerType,
} from '@/../product/sections/market-intelligence/types'

// =============================================================================
// Props
// =============================================================================

interface ResearchScheduleTabProps {
  researchJobs: ResearchJob[]
  onRunResearchNow?: (jobId: string, options: { universe: JobUniverse; confidenceThreshold: number }) => void
  onCancelResearch?: (jobId: string) => void
  onCreateResearchJob?: (job: {
    name: string
    scheduleType: ScheduleType
    scheduleTime?: string
    scheduleTimezone: string
    scheduleInterval?: number
    universe: JobUniverse
    customInstruments?: string[]
    confidenceThreshold: number
    maxResults: number
  }) => void
  onEditResearchJob?: (jobId: string, updates: Partial<{
    name: string; scheduleType: ScheduleType; scheduleTime: string
    scheduleTimezone: string; scheduleInterval: number; universe: JobUniverse
    customInstruments: string[]; confidenceThreshold: number; maxResults: number; enabled: boolean
  }>) => void
  onDeleteResearchJob?: (jobId: string) => void
  onToggleResearchJob?: (jobId: string, enabled: boolean) => void
  onViewJobRunResults?: (runId: string) => void
}

// =============================================================================
// Constants
// =============================================================================

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Australia/Sydney',
]

const TIMEZONE_LABELS: Record<string, string> = {
  'America/New_York': 'ET (New York)',
  'America/Chicago': 'CT (Chicago)',
  'America/Denver': 'MT (Denver)',
  'America/Los_Angeles': 'PT (Los Angeles)',
  'UTC': 'UTC',
  'Europe/London': 'GMT (London)',
  'Europe/Berlin': 'CET (Berlin)',
  'Europe/Paris': 'CET (Paris)',
  'Asia/Tokyo': 'JST (Tokyo)',
  'Asia/Hong_Kong': 'HKT (Hong Kong)',
  'Asia/Singapore': 'SGT (Singapore)',
  'Australia/Sydney': 'AEST (Sydney)',
}

// =============================================================================
// Formatting helpers
// =============================================================================

function formatDurationMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

function formatCountdown(targetIso: string): string {
  const diff = new Date(targetIso).getTime() - Date.now()
  if (diff <= 0) return 'imminent'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `in ${hours}h ${minutes}m`
  return `in ${minutes}m`
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function formatSchedule(job: ResearchJob): string {
  if (job.scheduleType === 'daily' && job.scheduleTime) {
    const tzShort = TIMEZONE_LABELS[job.scheduleTimezone]?.split(' ')[0] ?? job.scheduleTimezone
    return `Daily at ${job.scheduleTime} ${tzShort}`
  }
  if (job.scheduleType === 'interval' && job.scheduleInterval) {
    return `Every ${job.scheduleInterval} hour${job.scheduleInterval !== 1 ? 's' : ''}`
  }
  return 'Not configured'
}

function universeLabel(u: JobUniverse): string {
  if (u === 'full') return 'Full Market'
  if (u === 'watchlist') return 'Watchlist'
  return 'Custom'
}

// =============================================================================
// Status badge
// =============================================================================

function StatusBadge({ status }: { status: JobStatus }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold'
  switch (status) {
    case 'idle':
      return (
        <span className={`${base} bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500`}>
          Idle
        </span>
      )
    case 'running':
      return (
        <span className={`${base} bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 animate-pulse`}>
          <Loader2 size={12} className="animate-spin" />
          Running
        </span>
      )
    case 'error':
      return (
        <span className={`${base} bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400`}>
          <AlertTriangle size={12} />
          Error
        </span>
      )
    case 'disabled':
      return (
        <span className={`${base} bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 opacity-60`}>
          Disabled
        </span>
      )
  }
}

// =============================================================================
// Run status badge (for history table)
// =============================================================================

function RunStatusBadge({ status }: { status: JobRunStatus }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  switch (status) {
    case 'completed':
      return <span className={`${base} bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400`}>Completed</span>
    case 'failed':
      return <span className={`${base} bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400`}>Failed</span>
    case 'cancelled':
      return <span className={`${base} bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500`}>Cancelled</span>
  }
}

// =============================================================================
// Trigger type badge (for history table)
// =============================================================================

function TriggerBadge({ trigger }: { trigger: JobTriggerType }) {
  if (trigger === 'scheduled') {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-0.5 text-xs font-medium">
        <Calendar size={10} className="mr-1" />
        Scheduled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400 px-2 py-0.5 text-xs font-medium">
      <Play size={10} className="mr-1" />
      Manual
    </span>
  )
}

// =============================================================================
// Toggle switch
// =============================================================================

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-pink-600' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 translate-y-0.5 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

// =============================================================================
// Elapsed timer hook
// =============================================================================

function useElapsedTimer(initialMs: number | undefined, running: boolean): string {
  const [elapsed, setElapsed] = useState(initialMs ?? 0)

  useEffect(() => {
    if (!running) {
      setElapsed(initialMs ?? 0)
      return
    }
    setElapsed(initialMs ?? 0)
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [running, initialMs])

  return formatDurationMs(elapsed)
}

// =============================================================================
// Form state interface
// =============================================================================

interface JobFormState {
  name: string
  scheduleType: ScheduleType
  scheduleTime: string
  scheduleTimezone: string
  scheduleInterval: number
  universe: JobUniverse
  customInstruments: string[]
  confidenceThreshold: number
  maxResults: number
}

const defaultFormState: JobFormState = {
  name: '',
  scheduleType: 'daily',
  scheduleTime: '06:00',
  scheduleTimezone: 'America/New_York',
  scheduleInterval: 12,
  universe: 'full',
  customInstruments: [],
  confidenceThreshold: 7.0,
  maxResults: 10,
}

// =============================================================================
// Job Card component
// =============================================================================

function JobCard({
  job,
  onRunNow,
  onCancel,
  onEdit,
  onDelete,
  onToggle,
  onViewRunResults,
}: {
  job: ResearchJob
  onRunNow?: (jobId: string) => void
  onCancel?: (jobId: string) => void
  onEdit?: (job: ResearchJob) => void
  onDelete?: (job: ResearchJob) => void
  onToggle?: (jobId: string, enabled: boolean) => void
  onViewRunResults?: (runId: string) => void
}) {
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const elapsedStr = useElapsedTimer(job.runningElapsedMs, job.status === 'running')

  const isRunning = job.status === 'running'
  const isError = job.status === 'error'

  const borderClass = isRunning
    ? 'border-blue-300 dark:border-blue-900/60'
    : isError
    ? 'border-red-300 dark:border-red-900/60'
    : 'border-zinc-200 dark:border-zinc-800/80'

  return (
    <div
      className={`relative rounded-2xl border bg-white dark:bg-zinc-900/80 ${borderClass} ${
        isRunning ? 'shadow-sm shadow-blue-500/5' : ''
      } transition-all`}
    >
      {/* Running pulse ring */}
      {isRunning && (
        <div className="absolute -inset-px rounded-2xl border border-blue-400/30 dark:border-blue-500/20 animate-pulse pointer-events-none" />
      )}

      <div className="p-5">
        {/* Top row: name + toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.name}
              </h3>
              {job.isSystem && (
                <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 text-xs rounded px-1.5 py-0.5">
                  <Shield size={10} />
                  System
                </span>
              )}
            </div>
            <div className="mt-1">
              <StatusBadge status={job.status} />
            </div>
          </div>

          <Toggle
            checked={job.enabled}
            onChange={(val) => onToggle?.(job.id, val)}
          />
        </div>

        {/* Schedule */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar size={12} className="shrink-0" />
            <span>{formatSchedule(job)}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Timer size={12} className="shrink-0" />
            <span>Universe: {universeLabel(job.universe)}</span>
            {job.universe === 'custom' && job.customInstruments.length > 0 && (
              <span className="text-zinc-400 dark:text-zinc-600">
                ({job.customInstruments.length} instruments)
              </span>
            )}
          </div>
        </div>

        {/* Running state: elapsed timer */}
        {isRunning && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50/50 dark:bg-blue-950/20 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              <Loader2 size={12} className="animate-spin" />
              <span>Running... {elapsedStr}</span>
            </div>
            <button
              onClick={() => onCancel?.(job.id)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              Cancel Run
            </button>
          </div>
        )}

        {/* Error state */}
        {isError && job.lastRun?.error && (
          <div className="mt-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 px-3 py-2">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              <AlertTriangle size={12} className="mr-1 inline-block" />
              {job.lastRun.error}
            </p>
          </div>
        )}

        {/* Last run / Next run / Results */}
        <div className="mt-4 space-y-1.5">
          {job.lastRun && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">Last run</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-mono">
                  {formatTimestamp(job.lastRun.timestamp)} ({job.lastRun.duration})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">Results</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-mono">
                  {job.lastRun.opportunitiesFound} found, {job.lastRun.opportunitiesPublished} published
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 dark:text-zinc-500">Next run</span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono">
              {job.nextRunAt ? formatCountdown(job.nextRunAt) : '\u2014'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
          {isError ? (
            <button
              onClick={() => onRunNow?.(job.id)}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Play size={12} className="mr-1 inline-block" />
              Retry
            </button>
          ) : (
            <button
              onClick={() => onRunNow?.(job.id)}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              disabled={isRunning}
            >
              <Play size={12} className="mr-1 inline-block" />
              Run Now
            </button>
          )}
          <button
            onClick={() => onEdit?.(job)}
            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Pencil size={12} className="mr-1 inline-block" />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(job)}
            disabled={job.isSystem}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              job.isSystem
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            <Trash2 size={12} className="mr-1 inline-block" />
            Delete
          </button>
        </div>

        {/* History toggle */}
        {job.history.length > 0 && (
          <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="flex w-full items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <span>History ({job.history.length})</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${historyExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {historyExpanded && (
              <div className="mt-2 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/40">
                      <th className="px-2 py-1.5 text-left font-medium text-zinc-400 dark:text-zinc-500">Time</th>
                      <th className="px-2 py-1.5 text-left font-medium text-zinc-400 dark:text-zinc-500">Duration</th>
                      <th className="px-2 py-1.5 text-right font-medium text-zinc-400 dark:text-zinc-500">Found</th>
                      <th className="px-2 py-1.5 text-right font-medium text-zinc-400 dark:text-zinc-500">Published</th>
                      <th className="px-2 py-1.5 text-center font-medium text-zinc-400 dark:text-zinc-500">Status</th>
                      <th className="px-2 py-1.5 text-center font-medium text-zinc-400 dark:text-zinc-500">Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.history.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() => onViewRunResults?.(run.id)}
                        className="border-b border-zinc-50 dark:border-zinc-800/40 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-2 py-1.5 font-mono text-zinc-600 dark:text-zinc-300">
                          {formatTimestamp(run.timestamp)}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-zinc-500 dark:text-zinc-400">{run.duration}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-zinc-600 dark:text-zinc-300">{run.opportunitiesFound}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-zinc-600 dark:text-zinc-300">{run.opportunitiesPublished}</td>
                        <td className="px-2 py-1.5 text-center"><RunStatusBadge status={run.status} /></td>
                        <td className="px-2 py-1.5 text-center"><TriggerBadge trigger={run.triggerType} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Modal wrapper
// =============================================================================

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// Job Form (create / edit)
// =============================================================================

function JobFormModal({
  open,
  onClose,
  mode,
  editJob,
  onSubmitCreate,
  onSubmitEdit,
}: {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  editJob?: ResearchJob | null
  onSubmitCreate?: (job: {
    name: string; scheduleType: ScheduleType; scheduleTime?: string
    scheduleTimezone: string; scheduleInterval?: number; universe: JobUniverse
    customInstruments?: string[]; confidenceThreshold: number; maxResults: number
  }) => void
  onSubmitEdit?: (jobId: string, updates: Partial<{
    name: string; scheduleType: ScheduleType; scheduleTime: string
    scheduleTimezone: string; scheduleInterval: number; universe: JobUniverse
    customInstruments: string[]; confidenceThreshold: number; maxResults: number; enabled: boolean
  }>) => void
}) {
  const [form, setForm] = useState<JobFormState>(defaultFormState)
  const [instrumentInput, setInstrumentInput] = useState('')

  useEffect(() => {
    if (mode === 'edit' && editJob) {
      setForm({
        name: editJob.name,
        scheduleType: editJob.scheduleType,
        scheduleTime: editJob.scheduleTime ?? '06:00',
        scheduleTimezone: editJob.scheduleTimezone,
        scheduleInterval: editJob.scheduleInterval ?? 12,
        universe: editJob.universe,
        customInstruments: [...editJob.customInstruments],
        confidenceThreshold: editJob.confidenceThreshold,
        maxResults: editJob.maxResults,
      })
    } else {
      setForm(defaultFormState)
    }
    setInstrumentInput('')
  }, [mode, editJob, open])

  const updateField = <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addInstrument = () => {
    const symbol = instrumentInput.trim().toUpperCase()
    if (symbol && !form.customInstruments.includes(symbol)) {
      updateField('customInstruments', [...form.customInstruments, symbol])
    }
    setInstrumentInput('')
  }

  const removeInstrument = (symbol: string) => {
    updateField('customInstruments', form.customInstruments.filter((s) => s !== symbol))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (mode === 'create') {
      onSubmitCreate?.({
        name: form.name.trim(),
        scheduleType: form.scheduleType,
        ...(form.scheduleType === 'daily' ? { scheduleTime: form.scheduleTime } : {}),
        scheduleTimezone: form.scheduleTimezone,
        ...(form.scheduleType === 'interval' ? { scheduleInterval: form.scheduleInterval } : {}),
        universe: form.universe,
        ...(form.universe === 'custom' ? { customInstruments: form.customInstruments } : {}),
        confidenceThreshold: form.confidenceThreshold,
        maxResults: form.maxResults,
      })
    } else if (editJob) {
      onSubmitEdit?.(editJob.id, {
        ...(!editJob.isSystem ? { name: form.name.trim() } : {}),
        scheduleType: form.scheduleType,
        ...(form.scheduleType === 'daily' ? { scheduleTime: form.scheduleTime } : {}),
        scheduleTimezone: form.scheduleTimezone,
        ...(form.scheduleType === 'interval' ? { scheduleInterval: form.scheduleInterval } : {}),
        universe: form.universe,
        ...(form.universe === 'custom' ? { customInstruments: form.customInstruments } : {}),
        confidenceThreshold: form.confidenceThreshold,
        maxResults: form.maxResults,
      })
    }
    onClose()
  }

  const isSystem = mode === 'edit' && editJob?.isSystem

  const inputClass =
    'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100'

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {mode === 'create' ? 'Create Research Job' : 'Edit Research Job'}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {isSystem && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
          <Shield size={14} />
          <span>Changes apply from next run</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Job name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
            Job Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            readOnly={!!isSystem}
            placeholder="e.g. Daily Stock Research"
            className={`${inputClass} ${isSystem ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Schedule type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-2">
            Schedule Type
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scheduleType"
                checked={form.scheduleType === 'daily'}
                onChange={() => updateField('scheduleType', 'daily')}
                className="accent-pink-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Daily at specific time</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scheduleType"
                checked={form.scheduleType === 'interval'}
                onChange={() => updateField('scheduleType', 'interval')}
                className="accent-pink-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Interval</span>
            </label>
          </div>
        </div>

        {/* Daily fields */}
        {form.scheduleType === 'daily' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
                Time (HH:MM)
              </label>
              <input
                type="text"
                value={form.scheduleTime}
                onChange={(e) => updateField('scheduleTime', e.target.value)}
                placeholder="06:00"
                pattern="[0-2][0-9]:[0-5][0-9]"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
                Timezone
              </label>
              <select
                value={form.scheduleTimezone}
                onChange={(e) => updateField('scheduleTimezone', e.target.value)}
                className={inputClass}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {TIMEZONE_LABELS[tz] ?? tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Interval fields */}
        {form.scheduleType === 'interval' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
              Interval (hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={form.scheduleInterval}
              onChange={(e) => updateField('scheduleInterval', Math.max(1, Math.min(168, parseInt(e.target.value) || 1)))}
              className={`${inputClass} max-w-[120px]`}
            />
          </div>
        )}

        {/* Universe */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-2">
            Universe
          </label>
          <div className="flex gap-3">
            {(['full', 'watchlist', 'custom'] as JobUniverse[]).map((u) => (
              <label key={u} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="universe"
                  checked={form.universe === u}
                  onChange={() => updateField('universe', u)}
                  className="accent-pink-600"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{universeLabel(u)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom instruments */}
        {form.universe === 'custom' && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-2">
              Custom Instruments
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={instrumentInput}
                  onChange={(e) => setInstrumentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addInstrument()
                    }
                  }}
                  placeholder="Search instrument..."
                  className={`${inputClass} pl-8`}
                />
              </div>
              <button
                type="button"
                onClick={addInstrument}
                className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Add
              </button>
            </div>
            {form.customInstruments.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.customInstruments.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {sym}
                    <button
                      type="button"
                      onClick={() => removeInstrument(sym)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {form.customInstruments.length === 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No instruments added yet.</p>
            )}
          </div>
        )}

        {/* Confidence threshold */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
            Confidence Threshold
          </label>
          <input
            type="number"
            min={1.0}
            max={10.0}
            step={0.5}
            value={form.confidenceThreshold}
            onChange={(e) => updateField('confidenceThreshold', Math.max(1, Math.min(10, parseFloat(e.target.value) || 7)))}
            className={`${inputClass} max-w-[120px]`}
          />
        </div>

        {/* Max results */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
            Max Results
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={form.maxResults}
            onChange={(e) => updateField('maxResults', Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
            className={`${inputClass} max-w-[120px]`}
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === 'create' ? 'Create Job' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}

// =============================================================================
// Delete confirmation modal
// =============================================================================

function DeleteConfirmModal({
  open,
  onClose,
  job,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  job: ResearchJob | null
  onConfirm?: (jobId: string) => void
}) {
  if (!job) return null
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Delete {job.name}?
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        This will permanently remove the job and all its run history. This action cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm?.(job.id)
            onClose()
          }}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

// =============================================================================
// Run Now modal
// =============================================================================

function RunNowModal({
  open,
  onClose,
  job,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  job: ResearchJob | null
  onConfirm?: (jobId: string, options: { universe: JobUniverse; confidenceThreshold: number }) => void
}) {
  const [universe, setUniverse] = useState<JobUniverse>('full')
  const [threshold, setThreshold] = useState(7.0)

  useEffect(() => {
    if (job) {
      setUniverse(job.universe)
      setThreshold(job.confidenceThreshold)
    }
  }, [job, open])

  if (!job) return null

  const inputClass =
    'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100'

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Run Now: {job.name}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        {/* Universe */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-2">
            Universe
          </label>
          <div className="flex gap-3">
            {(['full', 'watchlist', 'custom'] as JobUniverse[]).map((u) => (
              <label key={u} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="runUniverse"
                  checked={universe === u}
                  onChange={() => setUniverse(u)}
                  className="accent-pink-600"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{universeLabel(u)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Confidence threshold */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
            Confidence Threshold
          </label>
          <input
            type="number"
            min={1.0}
            max={10.0}
            step={0.5}
            value={threshold}
            onChange={(e) => setThreshold(Math.max(1, Math.min(10, parseFloat(e.target.value) || 7)))}
            className={`${inputClass} max-w-[120px]`}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm?.(job.id, { universe, confidenceThreshold: threshold })
            onClose()
          }}
          className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500 active:scale-[0.98] transition-all"
        >
          <Play size={14} className="mr-1 inline-block" />
          Start Research
        </button>
      </div>
    </Modal>
  )
}

// =============================================================================
// Main component
// =============================================================================

export function ResearchScheduleTab({
  researchJobs,
  onRunResearchNow,
  onCancelResearch,
  onCreateResearchJob,
  onEditResearchJob,
  onDeleteResearchJob,
  onToggleResearchJob,
  onViewJobRunResults,
}: ResearchScheduleTabProps) {
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingJob, setEditingJob] = useState<ResearchJob | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingJob, setDeletingJob] = useState<ResearchJob | null>(null)
  const [runNowModalOpen, setRunNowModalOpen] = useState(false)
  const [runNowJob, setRunNowJob] = useState<ResearchJob | null>(null)

  const openCreateModal = () => {
    setFormMode('create')
    setEditingJob(null)
    setFormModalOpen(true)
  }

  const openEditModal = (job: ResearchJob) => {
    setFormMode('edit')
    setEditingJob(job)
    setFormModalOpen(true)
  }

  const openDeleteModal = (job: ResearchJob) => {
    setDeletingJob(job)
    setDeleteModalOpen(true)
  }

  const openRunNowModal = (jobId: string) => {
    const job = researchJobs.find((j) => j.id === jobId) ?? null
    setRunNowJob(job)
    setRunNowModalOpen(true)
  }

  // =========================================================================
  // Empty state
  // =========================================================================
  if (researchJobs.length === 0) {
    return (
      <>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-pink-600/5 blur-2xl dark:bg-pink-600/10" />
            <div className="relative rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 px-8 py-16 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-200 dark:ring-zinc-700/50">
                <Clock size={28} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                No research jobs configured yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Create your first job to automate instrument analysis and receive trade recommendations on a schedule.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98]"
              >
                <Plus size={15} />
                Create Research Job
              </button>
            </div>
          </div>
        </div>

        <JobFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          mode="create"
          onSubmitCreate={onCreateResearchJob}
        />
      </>
    )
  }

  // =========================================================================
  // Main view
  // =========================================================================
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Automation
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Research Schedule
            </h1>
          </div>

          <button
            onClick={openCreateModal}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition-all hover:bg-pink-500 hover:shadow-pink-600/30 active:scale-[0.98] sm:w-auto"
          >
            <Plus size={15} className="transition-transform group-hover:rotate-90" />
            Create Job
          </button>
        </div>

        {/* Job cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {researchJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onRunNow={(jobId) => openRunNowModal(jobId)}
              onCancel={onCancelResearch}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onToggle={onToggleResearchJob}
              onViewRunResults={onViewJobRunResults}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <JobFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        editJob={editingJob}
        onSubmitCreate={onCreateResearchJob}
        onSubmitEdit={onEditResearchJob}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        job={deletingJob}
        onConfirm={onDeleteResearchJob}
      />

      <RunNowModal
        open={runNowModalOpen}
        onClose={() => setRunNowModalOpen(false)}
        job={runNowJob}
        onConfirm={onRunResearchNow}
      />
    </>
  )
}
