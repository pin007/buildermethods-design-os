import { useState } from 'react'
import {
  Bell,
  BellOff,
  GitBranch,
  ShieldOff,
  CheckCheck,
  VolumeX,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Zap,
  AlertOctagon,
  AlertTriangle,
  Info,
  Eye,
  Inbox,
} from 'lucide-react'
import type {
  AlertsDashboardProps,
  Alert,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  Silence,
  Route,
  InhibitionRule,
} from '@/../product/sections/alerts/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime()
  const m = Math.floor(delta / 60_000)
  const h = Math.floor(delta / 3_600_000)
  const d = Math.floor(delta / 86_400_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

function timeRemaining(iso: string): string {
  const delta = new Date(iso).getTime() - Date.now()
  if (delta <= 0) return 'expired'
  const m = Math.floor(delta / 60_000)
  const h = Math.floor(delta / 3_600_000)
  const d = Math.floor(delta / 86_400_000)
  if (m < 60) return `${m}m left`
  if (h < 24) return `${h}h left`
  return `${d}d left`
}

function formatDT(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const SEVERITY_LEFT: Record<AlertSeverity, string> = {
  critical: 'border-l-red-500',
  warning: 'border-l-amber-400',
  info: 'border-l-sky-400',
}

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  critical: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  warning: 'bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30',
  info: 'bg-sky-400/15 text-sky-400 ring-1 ring-sky-400/30',
}

const SEVERITY_ICON: Record<AlertSeverity, React.ReactNode> = {
  critical: <AlertOctagon className="w-3 h-3" />,
  warning: <AlertTriangle className="w-3 h-3" />,
  info: <Info className="w-3 h-3" />,
}

const SOURCE_BADGE: Record<AlertSource, string> = {
  broker: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  'market-data': 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
  risk: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  strategy: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  portfolio: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  system: 'bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/30',
}

const SOURCE_BADGE_LIGHT: Record<AlertSource, string> = {
  broker: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  'market-data': 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  risk: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  strategy: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  portfolio: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  system: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200',
}

const SEVERITY_BADGE_LIGHT: Record<AlertSeverity, string> = {
  critical: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  info: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
}

// ---------------------------------------------------------------------------
// Small shared atoms
// ---------------------------------------------------------------------------

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${className}`}>
      {label}
    </span>
  )
}

function LabelPill({ label, value, isRegex }: { label: string; value: string; isRegex?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700">
      <span className="text-zinc-400 dark:text-zinc-500">{label}=</span>
      <span className={isRegex ? 'italic' : ''}>{value}</span>
      {isRegex && <span className="text-[9px] text-zinc-400 dark:text-zinc-600">~</span>}
    </span>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-pink-500' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: number | string
  sub: string
  accent: string
  icon: React.ReactNode
}

function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-start gap-3 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors`}>
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none mt-0.5">{value}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">{sub}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Alert card
// ---------------------------------------------------------------------------

interface AlertCardProps {
  alert: Alert
  dark: boolean
  onAcknowledge?: () => void
  onSilence?: () => void
  onView?: () => void
}

function AlertCard({ alert, dark, onAcknowledge, onSilence, onView }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)

  const severityBadge = dark ? SEVERITY_BADGE[alert.severity] : SEVERITY_BADGE_LIGHT[alert.severity]
  const sourceBadge = dark ? SOURCE_BADGE[alert.source] : SOURCE_BADGE_LIGHT[alert.source]

  return (
    <div className={`border-l-4 ${SEVERITY_LEFT[alert.severity]} bg-white dark:bg-zinc-900 border border-l-0 border-zinc-200 dark:border-zinc-800 rounded-r-xl overflow-hidden`}>
      {/* Header row */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${severityBadge}`}>
              {SEVERITY_ICON[alert.severity]}
              {alert.severity}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${sourceBadge}`}>
              {alert.source}
            </span>
            <button
              onClick={onView}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-pink-600 dark:hover:text-pink-400 transition-colors text-left"
            >
              {alert.summary}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono whitespace-nowrap">
              {relativeTime(alert.startsAt)}
            </span>
            {alert.status !== 'silenced' && !alert.acknowledgedAt && (
              <button
                onClick={onAcknowledge}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Ack
              </button>
            )}
            {alert.status !== 'silenced' && (
              <button
                onClick={onSilence}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <VolumeX className="w-3 h-3" />
                Silence
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          {alert.acknowledgedAt && alert.acknowledgedBy && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <CheckCheck className="w-3 h-3 text-emerald-500" />
              Acknowledged by {alert.acknowledgedBy} at {formatDT(alert.acknowledgedAt)}
            </span>
          )}
          {alert.silenceId && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <VolumeX className="w-3 h-3 text-violet-500" />
              Silenced by {alert.silenceId}
            </span>
          )}
        </div>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {alert.description}
          </p>
          {Object.keys(alert.labels).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(alert.labels).map(([k, v]) => (
                <LabelPill key={k} label={k} value={v} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active Alerts tab
// ---------------------------------------------------------------------------

interface ActiveAlertsTabProps {
  alerts: Alert[]
  recentlyResolved: Alert[]
  dark: boolean
  onAcknowledgeAlert?: (id: string) => void
  onSilenceAlert?: (id: string) => void
  onViewAlertDetail?: (id: string) => void
}

function ActiveAlertsTab({ alerts, recentlyResolved, dark, onAcknowledgeAlert, onSilenceAlert, onViewAlertDetail }: ActiveAlertsTabProps) {
  const [resolvedOpen, setResolvedOpen] = useState(false)

  const sorted = [...alerts].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, warning: 1, info: 2 }
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity]
    return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  })

  if (sorted.length === 0 && recentlyResolved.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-8 h-8" />}
        title="No active alerts"
        message="All systems are operating normally. Active alerts will appear here when they fire."
      />
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          dark={dark}
          onAcknowledge={() => onAcknowledgeAlert?.(alert.id)}
          onSilence={() => onSilenceAlert?.(alert.id)}
          onView={() => onViewAlertDetail?.(alert.id)}
        />
      ))}

      {recentlyResolved.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setResolvedOpen(!resolvedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>Recently Resolved</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500">
                {recentlyResolved.length}
              </span>
            </div>
            {resolvedOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {resolvedOpen && (
            <div className="mt-2 space-y-2">
              {recentlyResolved.map(alert => (
                <div
                  key={alert.id}
                  className="border-l-4 border-l-zinc-300 dark:border-l-zinc-700 bg-white dark:bg-zinc-900 border border-l-0 border-zinc-200 dark:border-zinc-800 rounded-r-xl px-4 py-3 opacity-70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${dark ? SEVERITY_BADGE[alert.severity] : SEVERITY_BADGE_LIGHT[alert.severity]}`}>
                        {SEVERITY_ICON[alert.severity]}
                        {alert.severity}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${dark ? SOURCE_BADGE[alert.source] : SOURCE_BADGE_LIGHT[alert.source]}`}>
                        {alert.source}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{alert.summary}</span>
                    </div>
                    {alert.endsAt && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono whitespace-nowrap flex-shrink-0">
                        resolved {relativeTime(alert.endsAt)}
                      </span>
                    )}
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
// Silences tab
// ---------------------------------------------------------------------------

interface SilencesTabProps {
  silences: Silence[]
  onCreateSilence?: () => void
  onExpireSilence?: (id: string) => void
  onEditSilence?: (id: string) => void
}

function SilencesTab({ silences, onCreateSilence, onExpireSilence, onEditSilence }: SilencesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={onCreateSilence}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Silence
        </button>
      </div>

      {silences.length === 0 ? (
        <EmptyState
          icon={<VolumeX className="w-8 h-8" />}
          title="No active silences"
          message="Silences let you mute alerts matching specific label criteria during maintenance windows."
        />
      ) : (
        <div className="space-y-3">
          {silences.map(silence => (
            <div
              key={silence.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide font-mono ${
                      silence.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 bg-emerald-100 text-emerald-700 ring-emerald-200'
                        : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
                    }`}>
                      {silence.status}
                    </span>
                    {silence.matchedAlertCount > 0 && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {silence.matchedAlertCount} alert{silence.matchedAlertCount !== 1 ? 's' : ''} muted
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {silence.matchers.map((m, i) => (
                      <LabelPill key={i} label={m.label} value={m.value} isRegex={m.isRegex} />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-2">"{silence.comment}"</p>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeRemaining(silence.endsAt)}
                    </span>
                    <span>by {silence.createdBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditSilence?.(silence.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onExpireSilence?.(silence.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Expire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Routes tab
// ---------------------------------------------------------------------------

const RECEIVER_ICON: Record<string, React.ReactNode> = {
  'email': <span className="text-[10px]">✉</span>,
  'email+push': <span className="text-[10px]">✉+📱</span>,
  'slack': <span className="text-[10px]">#</span>,
  'push': <span className="text-[10px]">📱</span>,
  'in-app': <span className="text-[10px]">🔔</span>,
}

interface RoutesTabProps {
  routes: Route[]
  onCreateRoute?: () => void
  onToggleRoute?: (id: string, enabled: boolean) => void
  onEditRoute?: (id: string) => void
}

function RoutesTab({ routes, onCreateRoute, onToggleRoute, onEditRoute }: RoutesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={onCreateRoute}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Route
        </button>
      </div>

      {routes.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-8 h-8" />}
          title="No routes configured"
          message="Routes define how alerts are delivered. Create a route to start receiving notifications."
        />
      ) : (
        <div className="space-y-3">
          {routes.map(route => (
            <div
              key={route.id}
              className={`rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-colors ${
                route.enabled
                  ? 'border-zinc-200 dark:border-zinc-800'
                  : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{route.name}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700">
                      {route.receiver}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {route.matchers.map((m, i) => (
                      <LabelPill key={i} label={m.label} value={m.value} />
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-600 font-mono flex-wrap">
                    <span>group by: {route.groupBy.join(', ')}</span>
                    <span>wait {route.groupWait}</span>
                    <span>interval {route.groupInterval}</span>
                    <span>repeat {route.repeatInterval}</span>
                    {route.lastDeliveredAt && (
                      <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-600">
                        <Zap className="w-3 h-3" />
                        {relativeTime(route.lastDeliveredAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditRoute?.(route.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Toggle
                    enabled={route.enabled}
                    onToggle={() => onToggleRoute?.(route.id, !route.enabled)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inhibitions tab
// ---------------------------------------------------------------------------

interface InhibitionsTabProps {
  rules: InhibitionRule[]
  onCreateInhibition?: () => void
  onToggleInhibition?: (id: string, enabled: boolean) => void
  onEditInhibition?: (id: string) => void
}

function InhibitionsTab({ rules, onCreateInhibition, onToggleInhibition, onEditInhibition }: InhibitionsTabProps) {
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={onCreateInhibition}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon={<ShieldOff className="w-8 h-8" />}
          title="No inhibition rules"
          message="Inhibition rules suppress redundant alerts when a more severe related alert is already firing."
        />
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-colors ${
                rule.enabled
                  ? 'border-zinc-200 dark:border-zinc-800'
                  : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rule.name}</span>
                    {rule.suppressedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        {rule.suppressedCount} suppressed
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{rule.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-semibold mb-1.5">Source fires when</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(rule.sourceMatch).map(([k, v]) => (
                          <LabelPill key={k} label={k} value={v} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-semibold mb-1.5">Suppresses when</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(rule.targetMatch).map(([k, v]) => (
                          <LabelPill key={k} label={k} value={v} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {rule.equal.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                      <span>equal labels:</span>
                      {rule.equal.map(l => (
                        <span key={l} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{l}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditInhibition?.(rule.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Toggle
                    enabled={rule.enabled}
                    onToggle={() => onToggleInhibition?.(rule.id, !rule.enabled)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</h3>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600 max-w-xs">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId = 'alerts' | 'silences' | 'routes' | 'inhibitions'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
  count?: number
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AlertsDashboard({
  alertStats,
  alerts,
  recentlyResolved,
  silences,
  routes,
  inhibitionRules,
  onAcknowledgeAlert,
  onSilenceAlert,
  onViewAlertDetail,
  onCreateSilence,
  onExpireSilence,
  onEditSilence,
  onToggleRoute,
  onEditRoute,
  onCreateRoute,
  onToggleInhibition,
  onEditInhibition,
  onCreateInhibition,
}: AlertsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('alerts')

  // Detect dark mode from document class
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  const tabs: TabDef[] = [
    { id: 'alerts', label: 'Active Alerts', icon: <Bell className="w-3.5 h-3.5" />, count: alertStats.firingCount },
    { id: 'silences', label: 'Silences', icon: <VolumeX className="w-3.5 h-3.5" />, count: alertStats.activeSilenceCount },
    { id: 'routes', label: 'Routes', icon: <GitBranch className="w-3.5 h-3.5" />, count: routes.length },
    { id: 'inhibitions', label: 'Inhibitions', icon: <ShieldOff className="w-3.5 h-3.5" />, count: inhibitionRules.filter(r => r.enabled).length },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Alerts</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Firing Alerts"
            value={alertStats.firingCount}
            sub={`${alertStats.criticalCount} critical`}
            accent="bg-red-500/10 dark:bg-red-500/10 text-red-500"
            icon={<AlertOctagon className="w-4 h-4" />}
          />
          <StatCard
            label="Critical"
            value={alertStats.criticalCount}
            sub="Needs attention"
            accent="bg-amber-500/10 dark:bg-amber-500/10 text-amber-500"
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <StatCard
            label="Silenced"
            value={alertStats.silencedCount}
            sub={`${alertStats.activeSilenceCount} active silences`}
            accent="bg-violet-500/10 dark:bg-violet-500/10 text-violet-500"
            icon={<VolumeX className="w-4 h-4" />}
          />
          <StatCard
            label="Resolved 24h"
            value={alertStats.resolvedLast24h}
            sub="Auto & manual"
            accent="bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500"
            icon={<CheckCheck className="w-4 h-4" />}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'alerts' && (
            <ActiveAlertsTab
              alerts={alerts}
              recentlyResolved={recentlyResolved}
              dark={isDark}
              onAcknowledgeAlert={onAcknowledgeAlert}
              onSilenceAlert={onSilenceAlert}
              onViewAlertDetail={onViewAlertDetail}
            />
          )}
          {activeTab === 'silences' && (
            <SilencesTab
              silences={silences}
              onCreateSilence={onCreateSilence}
              onExpireSilence={onExpireSilence}
              onEditSilence={onEditSilence}
            />
          )}
          {activeTab === 'routes' && (
            <RoutesTab
              routes={routes}
              onCreateRoute={onCreateRoute}
              onToggleRoute={onToggleRoute}
              onEditRoute={onEditRoute}
            />
          )}
          {activeTab === 'inhibitions' && (
            <InhibitionsTab
              rules={inhibitionRules}
              onCreateInhibition={onCreateInhibition}
              onToggleInhibition={onToggleInhibition}
              onEditInhibition={onEditInhibition}
            />
          )}
        </div>
      </div>
    </div>
  )
}
