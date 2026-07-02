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
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

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
    <div className="space-y-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
      {/* ---- Header: name + enabled toggle ---- */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Cable size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {broker.name}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {broker.shortName}
            </span>
          </div>
        </div>
        <ToggleSwitch
          enabled={broker.enabled}
          onChange={(enabled) => {
            onToggleEnabled?.(broker.id, enabled)
            onMarkChanged()
          }}
        />
      </div>

      <div className="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800">
        {/* ---- Live Status ---- */}
        <div className="px-5 py-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Live Status
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Connection */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${connectionDotClass[status.connection]}`}
              />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">
                {connectionLabel[status.connection]}
              </span>
            </div>

            {/* Latency */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Latency:{' '}
              <span className="font-mono text-zinc-900 dark:text-zinc-50">
                {status.latencyMs}ms
              </span>
            </div>

            {/* Last heartbeat */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Heartbeat:{' '}
              <span className="font-mono text-zinc-900 dark:text-zinc-50">
                {new Date(status.lastHeartbeat).toLocaleTimeString()}
              </span>
            </div>

            {/* Uptime */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Uptime:{' '}
              <span className="font-mono text-zinc-900 dark:text-zinc-50">
                {status.uptime}
              </span>
            </div>
          </div>

          {/* Circuit breaker */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2">
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${circuitBreakerDotClass[status.circuitBreaker.state]}`}
            />
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
              Circuit Breaker:{' '}
              {circuitBreakerLabel[status.circuitBreaker.state]}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Fails: {status.circuitBreaker.failCount}/
              {status.circuitBreaker.failMax}
            </span>
          </div>

          {/* Test Connection button */}
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="
              mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800
              px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50
              transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {testing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
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
                  enabled={config.paperTrading}
                  onChange={() => onMarkChanged()}
                />
              </FormRow>
            )}

            {config.testnet !== undefined && (
              <FormRow label="Testnet" horizontal>
                <ToggleSwitch
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
