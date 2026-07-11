import { cloneElement, isValidElement, useId } from 'react'
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-label="Back to settings"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
              Settings
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={!hasChanges}
          className={`
            flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
            transition-all active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            ${
              hasChanges
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30'
                : 'bg-muted text-faint cursor-not-allowed'
            }
          `}
        >
          <Save size={14} aria-hidden="true" />
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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
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

// Intrinsic elements htmlFor can legitimately target.
const LABELABLE = new Set(['input', 'select', 'textarea', 'button', 'meter', 'output', 'progress'])

export function FormRow({ label, hint, children, horizontal = false }: FormRowProps) {
  const generatedId = useId()
  // Associate the label with a single intrinsic form control child: reuse the
  // child's own id when it has one, otherwise clone it with a generated id.
  let control = children
  let htmlFor: string | undefined
  if (isValidElement(children) && typeof children.type === 'string' && LABELABLE.has(children.type)) {
    const props = children.props as { id?: string }
    htmlFor = props.id ?? generatedId
    control = props.id ? children : cloneElement(children as React.ReactElement<{ id?: string }>, { id: generatedId })
  }

  if (horizontal) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="shrink-0">{control}</div>
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {hint && <p className="-mt-1 mb-1.5 text-xs text-muted-foreground">{hint}</p>}
      {control}
    </div>
  )
}

interface ToggleSwitchProps {
  enabled: boolean
  onChange?: (enabled: boolean) => void
  /** Accessible name for the switch (announced by screen readers). */
  label: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function ToggleSwitch({ enabled, onChange, label, size = 'sm', disabled = false }: ToggleSwitchProps) {
  const sm = size === 'sm'
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`
        relative inline-flex shrink-0 items-center rounded-full
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${sm ? 'h-5 w-9' : 'h-6 w-11'}
        ${enabled ? 'bg-primary' : 'bg-zinc-600 dark:bg-zinc-700'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${sm ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'}
          ${enabled ? (sm ? 'translate-x-[18px]' : 'translate-x-[22px]') : 'translate-x-[3px]'}
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
          flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2
          font-mono text-sm text-muted-foreground
        "
      >
        {revealed ? value : value}
      </div>
      <button
        onClick={onReveal}
        aria-label={revealed ? 'Hide value' : 'Show value'}
        aria-pressed={revealed}
        className="
          rounded-lg border border-border px-2.5 py-2 text-xs font-medium
          text-muted-foreground transition-colors hover:bg-accent hover:text-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
        "
      >
        {revealed ? 'Hide' : 'Reveal'}
      </button>
      {onRotate && (
        <button
          onClick={onRotate}
          className="
            rounded-lg border border-border px-2.5 py-2 text-xs font-medium
            text-primary transition-colors hover:bg-primary/10
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
          "
        >
          Rotate
        </button>
      )}
    </div>
  )
}
