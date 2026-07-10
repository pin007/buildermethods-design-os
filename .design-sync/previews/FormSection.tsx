import { FormSection, FormRow, ToggleSwitch } from 'trading-squad-ds'

const inputClasses =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none'

export const Canonical = () => (
  <div style={{ padding: 20, maxWidth: 520 }}>
    <FormSection
      title="Backtesting Defaults"
      description="Default parameters applied to new backtest runs."
    >
      <FormRow label="Starting Capital" hint="Simulated account balance">
        <input className={inputClasses} defaultValue="100000" />
      </FormRow>
      <FormRow label="Commission" hint="Per-trade commission percentage">
        <input className={inputClasses} defaultValue="0.1" />
      </FormRow>
      <FormRow label="Parallel Workers" horizontal>
        <ToggleSwitch enabled={true} onChange={() => {}} />
      </FormRow>
    </FormSection>
  </div>
)

export const WithoutDescription = () => (
  <div style={{ padding: 20, maxWidth: 520 }}>
    <FormSection title="Quality Thresholds">
      <FormRow label="Completeness" hint="Minimum acceptable completeness score">
        <input className={inputClasses} defaultValue="95.0" />
      </FormRow>
      <FormRow label="Timeliness" hint="Minimum acceptable timeliness score">
        <input className={inputClasses} defaultValue="98.0" />
      </FormRow>
    </FormSection>
  </div>
)
