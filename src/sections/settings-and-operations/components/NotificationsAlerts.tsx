import { useState } from 'react'
import {
  Bell,
  Mail,
  MessageSquare,
  Gamepad2,
  Smartphone,
  BellRing,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  NotificationsAlertsProps,
  NotificationChannel,
  ChannelType,
  SeverityLevel,
} from '@/../product/sections/settings-and-operations/types'
import {
  SettingsDetailLayout,
  FormSection,
  FormRow,
  ToggleSwitch,
  MaskedField,
} from './SettingsDetailLayout'

// ---------------------------------------------------------------------------
// Channel icon mapping
// ---------------------------------------------------------------------------

const channelIconMap: Record<ChannelType, LucideIcon> = {
  email: Mail,
  slack: MessageSquare,
  discord: Gamepad2,
  sms: Smartphone,
  pwa_push: BellRing,
}

// Column keys for the subscription matrix table
const matrixChannelKeys = ['email', 'slack', 'discord', 'sms', 'push'] as const
const matrixChannelLabels: Record<(typeof matrixChannelKeys)[number], string> = {
  email: 'Email',
  slack: 'Slack',
  discord: 'Discord',
  sms: 'SMS',
  push: 'Push',
}

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------

const inputClass =
  'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 outline-none transition-colors focus:border-pink-600 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-600/30 dark:focus:ring-pink-400/30'

const selectClass = inputClass

// ---------------------------------------------------------------------------
// Severity badge colors
// ---------------------------------------------------------------------------

function severityColor(level: SeverityLevel): string {
  switch (level) {
    case 'low':
      return 'bg-zinc-500/15 text-zinc-400'
    case 'medium':
      return 'bg-amber-500/15 text-amber-400'
    case 'high':
      return 'bg-orange-500/15 text-orange-400'
    case 'critical':
      return 'bg-red-500/15 text-red-400'
  }
}

// ---------------------------------------------------------------------------
// Helper: extract masked credential fields from a channel config
// ---------------------------------------------------------------------------

function extractMaskedFields(config: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const fields: { key: string; label: string; value: string }[] = []
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && (key.startsWith('masked') || key.toLowerCase().includes('apikey'))) {
      const label = key
        .replace(/^masked/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
      fields.push({ key, label: label || key, value })
    }
  }
  return fields
}

// ---------------------------------------------------------------------------
// Helper: extract non-masked config fields for display
// ---------------------------------------------------------------------------

function extractConfigFields(config: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const fields: { key: string; label: string; value: string }[] = []
  for (const [key, value] of Object.entries(config)) {
    if (
      typeof value === 'string' &&
      !key.startsWith('masked') &&
      !key.startsWith('has') &&
      !key.toLowerCase().includes('apikey')
    ) {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim()
      fields.push({ key, label, value })
    } else if (typeof value === 'number') {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim()
      fields.push({ key, label, value: String(value) })
    }
  }
  return fields
}

// ---------------------------------------------------------------------------
// Channel Card sub-component
// ---------------------------------------------------------------------------

interface ChannelCardProps {
  channel: NotificationChannel
  onToggle?: (channelId: string, enabled: boolean) => void
  onRevealCredential?: (channelId: string, field: string) => void
  onRotateCredential?: (channelId: string, field: string) => void
  onMarkChanged: () => void
}

function ChannelCard({
  channel,
  onToggle,
  onRevealCredential,
  onRotateCredential,
  onMarkChanged,
}: ChannelCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = channelIconMap[channel.type] ?? Bell
  const maskedFields = extractMaskedFields(channel.config)
  const configFields = extractConfigFields(channel.config)

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors">
      {/* Channel header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            channel.enabled ? 'bg-pink-600/10 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Icon size={16} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{channel.label}</span>
          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
            {expanded ? '(collapse)' : '(expand)'}
          </span>
        </button>

        <ToggleSwitch
          enabled={channel.enabled}
          onChange={(enabled) => {
            onToggle?.(channel.id, enabled)
            onMarkChanged()
          }}
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
          {/* Masked credential fields */}
          {maskedFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {field.label}
              </label>
              <MaskedField
                value={field.value}
                onReveal={() => onRevealCredential?.(channel.id, field.key)}
                onRotate={() => {
                  onRotateCredential?.(channel.id, field.key)
                  onMarkChanged()
                }}
              />
            </div>
          ))}

          {/* Non-masked config fields */}
          {configFields.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {configFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {field.label}
                  </label>
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NotificationsAlerts({
  channels,
  preferences,
  onToggleChannel,
  onUpdateChannel,
  onRevealCredential,
  onRotateCredential,
  onUpdateQuietHours,
  onToggleSubscription,
  onUpdateSeverityThreshold,
  onSave,
  onBack,
}: NotificationsAlertsProps) {
  const [hasChanges, setHasChanges] = useState(false)
  const markChanged = () => setHasChanges(true)

  const {
    defaultSeverityThreshold,
    severityLevels,
    quietHours,
    rateLimits,
    subscriptionMatrix,
  } = preferences

  return (
    <SettingsDetailLayout
      title="Notifications & Alerts"
      icon={Bell}
      description="Configure delivery channels, preferences, and alert subscriptions"
      hasChanges={hasChanges}
      onSave={onSave}
      onBack={onBack}
    >
      {/* ================================================================== */}
      {/* Notification Channels                                              */}
      {/* ================================================================== */}
      <FormSection
        title="Notification Channels"
        description="Delivery channels for alerts and notifications. Each channel can be individually configured and toggled."
      >
        <div className="space-y-3">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onToggle={onToggleChannel}
              onRevealCredential={onRevealCredential}
              onRotateCredential={onRotateCredential}
              onMarkChanged={markChanged}
            />
          ))}
        </div>
      </FormSection>

      {/* ================================================================== */}
      {/* Preferences                                                        */}
      {/* ================================================================== */}
      <FormSection
        title="Preferences"
        description="Global notification behavior including severity filtering, quiet hours, and rate limits."
      >
        {/* Severity threshold */}
        <FormRow label="Default Severity Threshold" hint="Notifications below this level will be suppressed.">
          <div className="flex items-center gap-3">
            <select
              value={defaultSeverityThreshold}
              onChange={(e) => {
                onUpdateSeverityThreshold?.(e.target.value as SeverityLevel)
                markChanged()
              }}
              className={selectClass}
            >
              {severityLevels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColor(
                defaultSeverityThreshold
              )}`}
            >
              {defaultSeverityThreshold}
            </span>
          </div>
        </FormRow>

        {/* Quiet hours */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Quiet Hours</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Suppress non-critical notifications during specified hours.
              </p>
            </div>
            <ToggleSwitch
              enabled={quietHours.enabled}
              onChange={(enabled) => {
                onUpdateQuietHours?.({ enabled })
                markChanged()
              }}
            />
          </div>

          {quietHours.enabled && (
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Start
                </label>
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => {
                    onUpdateQuietHours?.({ start: e.target.value })
                    markChanged()
                  }}
                  className={inputClass + ' w-full'}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  End
                </label>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => {
                    onUpdateQuietHours?.({ end: e.target.value })
                    markChanged()
                  }}
                  className={inputClass + ' w-full'}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Timezone
                </label>
                <input
                  type="text"
                  value={quietHours.timezone}
                  readOnly
                  className={inputClass + ' w-full bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400'}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    enabled={quietHours.allowCritical}
                    onChange={(enabled) => {
                      onUpdateQuietHours?.({ allowCritical: enabled })
                      markChanged()
                    }}
                  />
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Allow Critical
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rate limits */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Rate Limit (per hour)" hint="Maximum notifications per user per hour.">
            <input
              type="number"
              value={rateLimits.perUserPerHour}
              min={1}
              onChange={(e) => {
                onUpdateChannel?.('_prefs', { perUserPerHour: Number(e.target.value) } as Record<string, unknown>)
                markChanged()
              }}
              className={inputClass + ' w-full'}
            />
          </FormRow>
          <FormRow label="Rate Limit (per day)" hint="Maximum notifications per user per day.">
            <input
              type="number"
              value={rateLimits.perUserPerDay}
              min={1}
              onChange={(e) => {
                onUpdateChannel?.('_prefs', { perUserPerDay: Number(e.target.value) } as Record<string, unknown>)
                markChanged()
              }}
              className={inputClass + ' w-full'}
            />
          </FormRow>
        </div>
      </FormSection>

      {/* ================================================================== */}
      {/* Subscription Matrix                                                */}
      {/* ================================================================== */}
      <FormSection
        title="Subscription Matrix"
        description="Choose which alert types are delivered to each channel."
      >
        {/* Desktop: table layout */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/60">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Alert Type
                  </th>
                  {matrixChannelKeys.map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2.5 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                    >
                      {matrixChannelLabels[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {subscriptionMatrix.map((row) => (
                  <tr
                    key={row.alertType}
                    className="transition-colors hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.alertType}
                    </td>
                    {matrixChannelKeys.map((key) => (
                      <td key={key} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={row[key]}
                          onChange={(e) => {
                            onToggleSubscription?.(row.alertType, key, e.target.checked)
                            markChanged()
                          }}
                          className="h-4 w-4 rounded border-zinc-200 dark:border-zinc-800 accent-pink-600 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: card layout */}
        <div className="space-y-3 sm:hidden">
          {subscriptionMatrix.map((row) => (
            <div
              key={row.alertType}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-3"
            >
              <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">{row.alertType}</p>
              <div className="grid grid-cols-3 gap-2">
                {matrixChannelKeys.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    <input
                      type="checkbox"
                      checked={row[key]}
                      onChange={(e) => {
                        onToggleSubscription?.(row.alertType, key, e.target.checked)
                        markChanged()
                      }}
                      className="h-4 w-4 rounded border-zinc-200 dark:border-zinc-800 accent-pink-600 cursor-pointer"
                    />
                    {matrixChannelLabels[key]}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormSection>
    </SettingsDetailLayout>
  )
}
