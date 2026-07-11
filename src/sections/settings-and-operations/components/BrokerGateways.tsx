import { Cable, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type {
  BrokerGatewaysProps,
  BrokerGateway,
  ConnectionStatus,
  CircuitBreakerState,
} from '@/../product/sections/settings-and-operations/types'
import {
  SettingsDetailLayout,
  FormSection,
  FormRow,
  ToggleSwitch,
  MaskedField,
} from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const connectionDotClass: Record<ConnectionStatus, string> = {
  connected: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  disconnected: 'bg-red-500',
}

const connectionLabel: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
}

const circuitBreakerDotClass: Record<CircuitBreakerState, string> = {
  closed: 'bg-emerald-500',
  'half-open': 'bg-amber-500',
  open: 'bg-red-500',
}

const circuitBreakerLabel: Record<CircuitBreakerState, string> = {
  closed: 'Closed',
  'half-open': 'Half-Open',
  open: 'Open',
}

const inputClasses =
  'w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring/30'

// ---------------------------------------------------------------------------
// Broker Card
// ---------------------------------------------------------------------------

interface BrokerCardProps {
  broker: BrokerGateway
  onToggleEnabled?: (brokerId: string, enabled: boolean) => void
  onTestConnection?: (brokerId: string) => void
  onRevealCredential?: (brokerId: string, field: 'apiKey' | 'secret') => void
  onRotateCredential?: (brokerId: string, field: 'apiKey' | 'secret') => void
  onMarkChanged: () => void
}

function BrokerCard({
  broker,
  onToggleEnabled,
  onTestConnection,
  onRevealCredential,
  onRotateCredential,
  onMarkChanged,
}: BrokerCardProps) {
  const [testing, setTesting] = useState(false)

  const handleTestConnection = () => {
    setTesting(true)
    onTestConnection?.(broker.id)
    // Simulate async test — in real app the parent would control this
    setTimeout(() => setTesting(false), 2000)
  }

  const { status, config, credentials, retryConfig } = broker

  return (
    <div className="space-y-0 rounded-xl border border-border bg-card">
      {/* ---- Header: name + enabled toggle ---- */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cable size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {broker.name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {broker.shortName}
            </span>
          </div>
        </div>
        <ToggleSwitch
          label={`Enable ${broker.name}`}
          enabled={broker.enabled}
          onChange={(enabled) => {
            onToggleEnabled?.(broker.id, enabled)
            onMarkChanged()
          }}
        />
      </div>

      <div className="space-y-0 divide-y divide-border">
        {/* ---- Live Status ---- */}
        <div className="px-5 py-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">
            Live Status
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Connection */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${connectionDotClass[status.connection]}`}
              />
              <span className="text-sm text-foreground">
                {connectionLabel[status.connection]}
              </span>
            </div>

            {/* Latency */}
            <div className="text-sm text-muted-foreground">
              Latency:{' '}
              <span className="font-mono text-foreground">
                {status.latencyMs}ms
              </span>
            </div>

            {/* Last heartbeat */}
            <div className="text-sm text-muted-foreground">
              Heartbeat:{' '}
              <span className="font-mono text-foreground">
                {new Date(status.lastHeartbeat).toLocaleTimeString()}
              </span>
            </div>

            {/* Uptime */}
            <div className="text-sm text-muted-foreground">
              Uptime:{' '}
              <span className="font-mono text-foreground">
                {status.uptime}
              </span>
            </div>
          </div>

          {/* Circuit breaker */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2">
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${circuitBreakerDotClass[status.circuitBreaker.state]}`}
            />
            <span className="text-xs font-medium text-foreground">
              Circuit Breaker:{' '}
              {circuitBreakerLabel[status.circuitBreaker.state]}
            </span>
            <span className="text-xs text-muted-foreground">
              Fails: {status.circuitBreaker.failCount}/
              {status.circuitBreaker.failMax}
            </span>
          </div>

          {/* Test Connection button */}
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="
              mt-3 flex items-center gap-2 rounded-lg border border-border
              px-3 py-2 text-xs font-medium text-foreground
              transition-colors hover:bg-accent
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {testing ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
        </div>

        {/* ---- Connection Config ---- */}
        <div className="px-5 py-4">
          <FormSection title="Connection Configuration">
            {config.host !== null && (
              <FormRow label="Host">
                <input
                  type="text"
                  defaultValue={config.host}
                  onChange={onMarkChanged}
                  className={inputClasses}
                />
              </FormRow>
            )}

            {config.port !== null && (
              <FormRow label="Port">
                <input
                  type="number"
                  defaultValue={config.port}
                  onChange={onMarkChanged}
                  className={inputClasses}
                />
              </FormRow>
            )}

            {config.clientId !== null && (
              <FormRow label="Client ID">
                <input
                  type="number"
                  defaultValue={config.clientId}
                  onChange={onMarkChanged}
                  className={inputClasses}
                />
              </FormRow>
            )}

            {config.accountId !== null && (
              <FormRow label="Account ID">
                <input
                  type="text"
                  defaultValue={config.accountId}
                  onChange={onMarkChanged}
                  className={inputClasses}
                />
              </FormRow>
            )}

            {config.paperTrading !== undefined && (
              <FormRow label="Paper Trading" horizontal>
                <ToggleSwitch
                  label={`Enable paper trading for ${broker.name}`}
                  enabled={config.paperTrading}
                  onChange={() => onMarkChanged()}
                />
              </FormRow>
            )}

            {config.testnet !== undefined && (
              <FormRow label="Testnet" horizontal>
                <ToggleSwitch
                  label={`Enable testnet for ${broker.name}`}
                  enabled={config.testnet}
                  onChange={() => onMarkChanged()}
                />
              </FormRow>
            )}
          </FormSection>
        </div>

        {/* ---- API Credentials ---- */}
        {(credentials.hasApiKey || credentials.hasSecret) && (
          <div className="px-5 py-4">
            <FormSection title="API Credentials" description="Masked for security. Reveal to inspect, rotate to regenerate.">
              {credentials.hasApiKey && credentials.maskedApiKey && (
                <FormRow label="API Key">
                  <MaskedField
                    value={credentials.maskedApiKey}
                    onReveal={() =>
                      onRevealCredential?.(broker.id, 'apiKey')
                    }
                    onRotate={() =>
                      onRotateCredential?.(broker.id, 'apiKey')
                    }
                  />
                </FormRow>
              )}

              {credentials.hasSecret && credentials.maskedSecret && (
                <FormRow label="Secret">
                  <MaskedField
                    value={credentials.maskedSecret}
                    onReveal={() =>
                      onRevealCredential?.(broker.id, 'secret')
                    }
                    onRotate={() =>
                      onRotateCredential?.(broker.id, 'secret')
                    }
                  />
                </FormRow>
              )}
            </FormSection>
          </div>
        )}

        {/* ---- Retry Config ---- */}
        <div className="px-5 py-4">
          <FormSection title="Retry Configuration">
            <FormRow label="Max Attempts">
              <input
                type="number"
                defaultValue={retryConfig.maxAttempts}
                min={1}
                max={10}
                onChange={onMarkChanged}
                className={inputClasses}
              />
            </FormRow>
            <FormRow label="Backoff (seconds)">
              <input
                type="number"
                defaultValue={retryConfig.backoffSeconds}
                min={1}
                max={120}
                onChange={onMarkChanged}
                className={inputClasses}
              />
            </FormRow>
          </FormSection>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BrokerGateways({
  brokers,
  onSave,
  onTestConnection,
  onToggleEnabled,
  onRevealCredential,
  onRotateCredential,
  onBack,
}: BrokerGatewaysProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const markChanged = () => setHasChanges(true)

  return (
    <SettingsDetailLayout
      title="Broker Gateways"
      icon={Cable}
      description={`${brokers.length} broker${brokers.length !== 1 ? 's' : ''} configured`}
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      <div className="space-y-6">
        {brokers.map((broker) => (
          <BrokerCard
            key={broker.id}
            broker={broker}
            onToggleEnabled={onToggleEnabled}
            onTestConnection={onTestConnection}
            onRevealCredential={onRevealCredential}
            onRotateCredential={onRotateCredential}
            onMarkChanged={markChanged}
          />
        ))}
      </div>
    </SettingsDetailLayout>
  )
}
