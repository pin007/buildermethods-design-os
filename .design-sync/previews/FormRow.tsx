import { FormRow, ToggleSwitch, MaskedField } from 'trading-squad-ds'

const inputClasses =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none'

export const Stacked = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <FormRow label="Evaluation Interval" hint="How often the strategy engine runs its loop">
      <input className={inputClasses} defaultValue="60" />
    </FormRow>
  </div>
)

export const Horizontal = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <FormRow label="Auto-Resume Trading" hint="Resume automatically after cooldown" horizontal>
      <ToggleSwitch enabled={false} onChange={() => {}} />
    </FormRow>
  </div>
)

export const WithSecret = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <FormRow label="API Key" hint="Encrypted credential for the broker gateway">
      <MaskedField value="aBc1••••••••••••dEf9" onReveal={() => {}} onRotate={() => {}} />
    </FormRow>
  </div>
)
