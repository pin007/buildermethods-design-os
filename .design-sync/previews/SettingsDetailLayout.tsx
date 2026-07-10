import { SettingsDetailLayout, FormSection, FormRow, ToggleSwitch } from 'trading-squad-ds'
import { ShieldAlert } from 'lucide-react'

const inputClasses =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none'

export const WithChanges = () => (
  <div style={{ padding: 16 }}>
    <SettingsDetailLayout
      title="Risk Management"
      icon={ShieldAlert}
      description="Exposure limits and circuit breaker configuration"
      hasChanges={true}
      onSave={() => {}}
      onBack={() => {}}
    >
      <FormSection
        title="Exposure Limits"
        description="Maximum allowed exposure across positions and portfolios."
      >
        <FormRow label="Max Position Size" hint="Percentage of portfolio value in a single position">
          <input className={inputClasses} defaultValue="10" />
        </FormRow>
        <FormRow label="Daily Loss Limit" hint="Loss before circuit breaker triggers">
          <input className={inputClasses} defaultValue="5" />
        </FormRow>
        <FormRow label="Circuit Breaker" hint="Halt trading when limits are breached" horizontal>
          <ToggleSwitch enabled={true} onChange={() => {}} />
        </FormRow>
      </FormSection>
    </SettingsDetailLayout>
  </div>
)

export const Pristine = () => (
  <div style={{ padding: 16 }}>
    <SettingsDetailLayout
      title="Trade Journal"
      icon={ShieldAlert}
      description="Journaling and review requirements"
      hasChanges={false}
      onSave={() => {}}
      onBack={() => {}}
    >
      <FormSection title="Requirements" description="Controls when notes are mandatory.">
        <FormRow label="Require Pre-Trade Notes" horizontal>
          <ToggleSwitch enabled={true} onChange={() => {}} />
        </FormRow>
        <FormRow label="Require Post-Trade Notes" horizontal>
          <ToggleSwitch enabled={false} onChange={() => {}} />
        </FormRow>
      </FormSection>
    </SettingsDetailLayout>
  </div>
)
