import { ArrowLeft, Save } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SettingsDetailLayoutProps {
  title: string
  icon: LucideIcon
  description?: string
  hasChanges?: boolean
  children: React.ReactNode
  onSave?: () => void
  onBack?: () => void
}

export function SettingsDetailLayout({
  title,
  icon: _Icon,
  description,
  hasChanges = false,
  children,
  onSave,
  onBack,
}: SettingsDetailLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 active:scale-95"
            aria-label="Back to settings"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Settings
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={!hasChanges}
          className={`
            flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
            transition-all active:scale-[0.98]
            ${
              hasChanges
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500 hover:shadow-pink-600/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }
          `}
        >
          <Save size={14} />
          Save Changes
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared form building blocks
// ---------------------------------------------------------------------------

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormRowProps {
  label: string
  hint?: string
  children: React.ReactNode
  horizontal?: boolean
}

export function FormRow({ label, hint, children, horizontal = false }: FormRowProps) {
  if (horizontal) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</label>
          {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    )
  }
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {label}
      </label>
      {hint && <p className="-mt-1 mb-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
      {children}
    </div>
  )
}

interface ToggleSwitchProps {
  enabled: boolean
  onChange?: (enabled: boolean) => void
}

export function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange?.(!enabled)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
        transition-colors duration-200
        ${enabled ? 'bg-pink-600' : 'bg-zinc-600 dark:bg-zinc-700'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}
        `}
      />
    </button>
  )
}

interface MaskedFieldProps {
  value: string
  revealed?: boolean
  onReveal?: () => void
  onRotate?: () => void
}

export function MaskedField({ value, revealed = false, onReveal, onRotate }: MaskedFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="
          flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2
          font-mono text-sm text-zinc-500 dark:text-zinc-400
        "
      >
        {revealed ? value : value}
      </div>
      <button
        onClick={onReveal}
        className="
          rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 text-xs font-medium
          text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50
        "
      >
        {revealed ? 'Hide' : 'Reveal'}
      </button>
      {onRotate && (
        <button
          onClick={onRotate}
          className="
            rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 text-xs font-medium
            text-pink-600 dark:text-pink-400 transition-colors hover:bg-pink-600/10 dark:hover:bg-pink-500/10
          "
        >
          Rotate
        </button>
      )}
    </div>
  )
}
