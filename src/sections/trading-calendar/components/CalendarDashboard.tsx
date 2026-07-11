import { useState, useMemo, useRef, type ReactNode } from 'react'
import {
  BarChart3,
  Globe,
  Banknote,
  Rocket,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Calendar,
  Bell,
  Check,
  Building2,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import type {
  CalendarDashboardProps,
  CalendarEvent,
  CalendarEventType,
  EarningsDetails,
  EconomicDetails,
  DividendDetails,
  OptionsDetails,
  IpoDetails,
} from '@/../product/sections/trading-calendar/types'

// =============================================================================
// Constants & Config
// =============================================================================

const WEEKDAY_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  {
    label: string
    color: string
    dot: string
    bg: string
    text: string
    chipActive: string
    chipInactive: string
    icon: typeof BarChart3
  }
> = {
  earnings: {
    label: 'Earnings',
    color: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    chipActive:
      'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    chipInactive:
      'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
    icon: BarChart3,
  },
  economic: {
    label: 'Economic',
    color: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    chipActive:
      'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    chipInactive:
      'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
    icon: Globe,
  },
  dividend: {
    label: 'Dividends',
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    chipActive:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
    chipInactive:
      'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
    icon: Banknote,
  },
  options: {
    label: 'Options',
    color: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    chipActive:
      'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    chipInactive:
      'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
    icon: Clock,
  },
  ipo: {
    label: 'IPOs',
    color: 'text-primary',
    dot: 'bg-primary',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    chipActive:
      'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700',
    chipInactive:
      'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
    icon: Rocket,
  },
}

// =============================================================================
// Helper Functions
// =============================================================================

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function todayStr(): string {
  return toDateStr(new Date())
}

function getMonthGrid(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: string[] = []
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(toDateStr(new Date(year, month, -i)))
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(toDateStr(new Date(year, month, d)))
  }
  let extra = 1
  while (days.length % 7 !== 0) {
    days.push(toDateStr(new Date(year, month + 1, extra++)))
  }
  return days
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const t = todayStr()
  if (dateStr === t) return 'Today'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`
  return `$${amount.toLocaleString()}`
}

function getEventTimingLabel(event: CalendarEvent): string | null {
  if (event.type === 'economic') {
    const d = event.details as EconomicDetails
    return d.eventTime ? d.eventTime.slice(0, 5) + ' ET' : null
  }
  if (event.type === 'earnings') {
    const d = event.details as EarningsDetails
    if (d.timing === 'before_market') return 'Pre-market'
    if (d.timing === 'after_market') return 'After hours'
    return 'During market'
  }
  return null
}

function cn(...cls: (string | false | undefined | null)[]): string {
  return cls.filter(Boolean).join(' ')
}

// =============================================================================
// Agenda Grouping
// =============================================================================

interface AgendaDay {
  dateStr: string
  events: CalendarEvent[]
}

interface AgendaMonth {
  monthKey: string // "2026-03"
  monthLabel: string
  days: AgendaDay[]
}

function buildAgendaGroups(events: CalendarEvent[]): AgendaMonth[] {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const dayMap: Record<string, CalendarEvent[]> = {}
  sorted.forEach(evt => {
    if (!dayMap[evt.date]) dayMap[evt.date] = []
    dayMap[evt.date].push(evt)
  })
  const monthMap: Record<string, AgendaDay[]> = {}
  Object.entries(dayMap).forEach(([dateStr, evts]) => {
    const key = dateStr.slice(0, 7)
    if (!monthMap[key]) monthMap[key] = []
    monthMap[key].push({
      dateStr,
      events: evts.sort((a, b) => {
        const ta = getEventTimingLabel(a) ?? 'zz'
        const tb = getEventTimingLabel(b) ?? 'zz'
        return ta.localeCompare(tb) || a.title.localeCompare(b.title)
      }),
    })
  })
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, days]) => ({
      monthKey: key,
      monthLabel: formatMonthLabel(key),
      days: days.sort((a, b) => a.dateStr.localeCompare(b.dateStr)),
    }))
}

// =============================================================================
// Stat Card
// =============================================================================

function StatCard({
  icon: Icon,
  iconCls,
  label,
  value,
  sub,
}: {
  icon: typeof Calendar
  iconCls: string
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0',
            iconCls,
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-2xl font-mono font-semibold text-foreground tracking-tight">
        {value}
      </span>
      {sub && <span className="text-xs text-hint">{sub}</span>}
    </div>
  )
}

// =============================================================================
// Type Chip
// =============================================================================

function TypeChip({
  type,
  count,
  active,
  onToggle,
}: {
  type: CalendarEventType
  count: number
  active: boolean
  onToggle: () => void
}) {
  const cfg = EVENT_TYPE_CONFIG[type]
  const Icon = cfg.icon
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        active ? cfg.chipActive : cfg.chipInactive,
      )}
    >
      <div
        className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', active ? cfg.dot : 'bg-zinc-300 dark:bg-zinc-600')}
      />
      <Icon className="w-3 h-3" aria-hidden="true" />
      {cfg.label}
      <span
        className={cn(
          'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium',
          active ? 'bg-white/60 dark:bg-black/20' : 'bg-muted text-hint',
        )}
      >
        {count}
      </span>
    </button>
  )
}

// =============================================================================
// Mini Calendar
// =============================================================================

function MiniCalendar({
  year,
  month,
  today,
  selectedDate,
  eventsByDate,
  onPrev,
  onNext,
  onDayClick,
}: {
  year: number
  month: number
  today: string
  selectedDate: string
  eventsByDate: Record<string, CalendarEvent[]>
  onPrev: () => void
  onNext: () => void
  onDayClick: (dateStr: string) => void
}) {
  const days = useMemo(() => getMonthGrid(year, month), [year, month])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <button
          onClick={onPrev}
          aria-label="Previous month"
          className="p-1 rounded-md hover:bg-accent text-hint transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <span className="text-xs font-semibold text-foreground">
          {formatMonthYear(year, month)}
        </span>
        <button
          onClick={onNext}
          aria-label="Next month"
          className="p-1 rounded-md hover:bg-accent text-hint transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-1 pt-2 pb-1">
        {WEEKDAY_SHORT.map((l, i) => (
          <div key={i} className="text-center text-xs font-semibold text-hint uppercase">
            {l}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-muted mx-1 mb-1 rounded-lg overflow-hidden">
        {days.map(dateStr => {
          const dayEvents = eventsByDate[dateStr] ?? []
          const inMonth = new Date(dateStr + 'T00:00:00').getMonth() === month
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const dayNum = new Date(dateStr + 'T00:00:00').getDate()
          const uniqueTypes = [...new Set(dayEvents.map(e => e.type))]

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'flex flex-col items-center justify-start pt-1 pb-1 gap-0.5 min-h-[40px] bg-card transition-colors',
                !inMonth && 'opacity-25',
                isSelected && !isToday && 'bg-pink-50 dark:bg-pink-950/20',
                'hover:bg-accent',
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full leading-none',
                  isToday
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isSelected
                      ? 'text-primary font-semibold'
                      : 'text-foreground',
                )}
              >
                {dayNum}
              </span>
              {uniqueTypes.length > 0 && inMonth && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {uniqueTypes.slice(0, 3).map(t => (
                    <div key={t} className={cn('w-1 h-1 rounded-full', EVENT_TYPE_CONFIG[t].dot)} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// Event Detail Sub-Components
// =============================================================================

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-hint w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-foreground flex-1">{value}</span>
    </div>
  )
}

function MetricBox({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-2.5">
      <div className="text-xs text-hint mb-1">{label}</div>
      <div
        className={cn(
          'font-mono text-sm font-semibold',
          highlight ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-hint mt-0.5">{sub}</div>}
    </div>
  )
}

function EarningsDetail({ event, d }: { event: CalendarEvent; d: EarningsDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {event.inPortfolio && (
          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
            In Portfolio
          </span>
        )}
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1',
            d.confirmed
              ? 'bg-muted text-muted-foreground border-border'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          )}
        >
          {d.confirmed && <Check className="w-2.5 h-2.5" />}
          {d.confirmed ? 'Confirmed' : 'Unconfirmed'}
        </span>
      </div>
      <DetailRow label="Company" value={d.companyName} />
      <DetailRow label="Quarter" value={d.fiscalQuarter} />
      <DetailRow
        label="Timing"
        value={<span className="capitalize">{d.timing.replace('_', ' ')}</span>}
      />
      {(d.epsEstimate !== null || d.revenueEstimate !== null) && (
        <div className="grid grid-cols-2 gap-2">
          {d.epsEstimate !== null && (
            <MetricBox
              label="EPS Estimate"
              value={`$${d.epsEstimate?.toFixed(2)}`}
              sub={d.epsPrior !== null ? `Prior: $${d.epsPrior?.toFixed(2)}` : undefined}
              highlight
            />
          )}
          {d.revenueEstimate !== null && (
            <MetricBox
              label="Revenue Est."
              value={formatRevenue(d.revenueEstimate!)}
              sub={d.revenuePrior !== null ? `Prior: ${formatRevenue(d.revenuePrior!)}` : undefined}
              highlight
            />
          )}
        </div>
      )}
    </div>
  )
}

function EconomicDetail({ event, d }: { event: CalendarEvent; d: EconomicDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full border',
            event.impact === 'high'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
              : event.impact === 'medium'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-muted text-muted-foreground border-border',
          )}
        >
          {event.impact === 'high' ? 'High Impact' : event.impact === 'medium' ? 'Medium' : 'Low'}
        </span>
      </div>
      <DetailRow label="Indicator" value={<span className="font-mono font-semibold">{d.indicator}</span>} />
      <DetailRow label="Country" value={d.country} />
      <DetailRow label="Release Time" value={<span className="font-mono">{d.eventTime.slice(0, 5)} ET</span>} />
      {(d.consensus !== null || d.prior !== null) && (
        <div className="grid grid-cols-2 gap-2">
          {d.consensus !== null && (
            <MetricBox
              label="Consensus"
              value={`${d.consensus}${d.unit === 'percent' ? '%' : d.unit === 'jobs' ? 'K' : ''}`}
              highlight
            />
          )}
          {d.prior !== null && (
            <MetricBox
              label="Prior"
              value={`${d.prior}${d.unit === 'percent' ? '%' : d.unit === 'jobs' ? 'K' : ''}`}
            />
          )}
        </div>
      )}
      {d.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>
      )}
    </div>
  )
}

function DividendDetail({ event, d }: { event: CalendarEvent; d: DividendDetails }) {
  return (
    <div className="space-y-3">
      {event.inPortfolio && d.expectedPayment !== null && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-700 dark:text-emerald-300">
            Expected:{' '}
            <span className="font-mono font-semibold">
              {formatCurrency(d.expectedPayment!, d.currency)}
            </span>
            {d.portfolioShares && (
              <span className="text-emerald-600/70 dark:text-emerald-400/70"> ({d.portfolioShares} shares)</span>
            )}
          </span>
        </div>
      )}
      <DetailRow label="Company" value={d.companyName} />
      <DetailRow label="Ex-Date" value={<span className="font-mono">{d.exDate}</span>} />
      <DetailRow label="Record Date" value={<span className="font-mono">{d.recordDate}</span>} />
      <DetailRow label="Payment" value={<span className="font-mono">{d.paymentDate}</span>} />
      <div className="grid grid-cols-3 gap-2">
        <MetricBox label="Amount" value={formatCurrency(d.amount, d.currency)} highlight />
        <MetricBox label="Yield" value={`${d.yield.toFixed(2)}%`} highlight />
        <MetricBox label="Frequency" value={d.frequency.replace('_', '-')} />
      </div>
    </div>
  )
}

function OptionsDetail({ d }: { d: OptionsDetails }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Type" value={<span className="capitalize">{d.expirationType}</span>} />
      <DetailRow
        label="Exchange"
        value={
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span className="font-mono font-semibold">{d.exchange}</span>
          </span>
        }
      />
      <DetailRow label="Third Friday" value={d.isThirdFriday ? 'Yes' : 'No'} />
      {d.affectedPositions.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-hint mb-2">
            Affected Positions
          </div>
          <div className="space-y-1.5">
            {d.affectedPositions.map((pos, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
              >
                <div>
                  <div className="text-xs font-mono font-medium text-foreground">{pos.option}</div>
                  <div className="text-xs text-hint mt-0.5">Qty: {pos.quantity}</div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-mono text-xs text-foreground">
                    {formatCurrency(pos.currentValue)}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded-full',
                      pos.itm
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {pos.itm ? 'ITM' : 'OTM'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.affectedPositions.length === 0 && (
        <p className="text-xs text-hint">No affected positions in portfolio</p>
      )}
    </div>
  )
}

function IpoDetail({ d }: { d: IpoDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full border',
            d.status === 'upcoming'
              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : d.status === 'pricing'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          )}
        >
          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
        </span>
      </div>
      <DetailRow label="Company" value={d.companyName} />
      {d.ticker && (
        <DetailRow label="Ticker" value={<span className="font-mono font-semibold">{d.ticker}</span>} />
      )}
      <DetailRow label="Exchange" value={<span className="font-mono">{d.exchange}</span>} />
      <DetailRow label="Industry" value={d.industry} />
      {d.priceLow !== null && d.priceHigh !== null && (
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Price Range" value={`$${d.priceLow}–$${d.priceHigh}`} highlight />
          {d.valuation !== null && (
            <MetricBox label="Valuation" value={formatRevenue(d.valuation!)} highlight />
          )}
        </div>
      )}
      {d.sharesOffered !== null && (
        <DetailRow
          label="Shares Offered"
          value={<span className="font-mono">{d.sharesOffered!.toLocaleString()}</span>}
        />
      )}
      {d.leadUnderwriters.length > 0 && (
        <DetailRow
          label="Underwriters"
          value={
            <div className="flex flex-wrap gap-1">
              {d.leadUnderwriters.map(u => (
                <span
                  key={u}
                  className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded border border-border"
                >
                  {u}
                </span>
              ))}
            </div>
          }
        />
      )}
    </div>
  )
}

// =============================================================================
// Agenda Event Card
// =============================================================================

function AgendaEventCard({
  event,
  isDismissed,
  isExpanded,
  onToggle,
  onCreateAlert,
  onDismiss,
  onRestore,
  onViewInstrument,
}: {
  event: CalendarEvent
  isDismissed: boolean
  isExpanded: boolean
  onToggle: () => void
  onCreateAlert?: (id: string) => void
  onDismiss?: () => void
  onRestore?: () => void
  onViewInstrument?: (symbol: string) => void
}) {
  const cfg = EVENT_TYPE_CONFIG[event.type]
  const Icon = cfg.icon
  const timing = getEventTimingLabel(event)

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-150',
        isDismissed && 'opacity-60',
        isExpanded
          ? 'border-border shadow-sm'
          : 'border-border hover:border-zinc-300 dark:hover:border-zinc-700',
        'bg-card overflow-hidden',
      )}
    >
      {/* Summary row */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Left type stripe */}
        <div className={cn('w-0.5 h-9 rounded-full flex-shrink-0', cfg.dot)} />

        {/* Type icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
            cfg.bg,
            'border-zinc-200/50 dark:border-zinc-700/50',
          )}
        >
          <Icon className={cn('w-4 h-4', cfg.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-sm font-medium truncate',
              isDismissed
                ? 'line-through text-hint'
                : 'text-foreground',
            )}>
              {event.title}
            </span>
            {isDismissed && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border flex-shrink-0">
                <EyeOff className="w-2 h-2" />
                Dismissed
              </span>
            )}
            {!isDismissed && event.inPortfolio && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex-shrink-0">
                <Briefcase className="w-2 h-2" />
                Portfolio
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {event.instrument && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onViewInstrument?.(event.instrument!)
                }}
                className="text-xs font-mono font-semibold text-primary hover:underline"
              >
                {event.instrument}
              </button>
            )}
            {timing && (
              <span className="text-xs text-hint">{timing}</span>
            )}
            {event.impact === 'high' && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                High Impact
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'w-4 h-4 text-hint flex-shrink-0 transition-transform duration-150',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 bg-zinc-50/60 dark:bg-zinc-800/20">
          {event.type === 'earnings' && (
            <EarningsDetail event={event} d={event.details as EarningsDetails} />
          )}
          {event.type === 'economic' && (
            <EconomicDetail event={event} d={event.details as EconomicDetails} />
          )}
          {event.type === 'dividend' && (
            <DividendDetail event={event} d={event.details as DividendDetails} />
          )}
          {event.type === 'options' && <OptionsDetail d={event.details as OptionsDetails} />}
          {event.type === 'ipo' && <IpoDetail d={event.details as IpoDetails} />}
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            {!isDismissed && (
              <button
                onClick={() => onCreateAlert?.(event.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                <Bell className="w-3 h-3" aria-hidden="true" />
                Set Alert
              </button>
            )}
            {isDismissed ? (
              <button
                onClick={onRestore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Restore
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors"
              >
                <EyeOff className="w-3 h-3" aria-hidden="true" />
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function CalendarDashboard({
  stats,
  events,
  onCreateAlert,
  onViewInstrument,
  onViewPortfolio,
}: CalendarDashboardProps) {
  const today = todayStr()
  const todayDate = new Date(today + 'T00:00:00')

  const [calYear, setCalYear] = useState(todayDate.getFullYear())
  const [calMonth, setCalMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(
    new Set(['earnings', 'economic', 'dividend', 'options', 'ipo']),
  )
  const [portfolioOnly, setPortfolioOnly] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [showDismissed, setShowDismissed] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Ref map for day groups in the agenda (for scroll-to behavior)
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (!activeTypes.has(e.type)) return false
      if (portfolioOnly && !e.inPortfolio) return false
      if (showDismissed) return dismissedIds.has(e.id)
      return !dismissedIds.has(e.id)
    })
  }, [events, activeTypes, portfolioOnly, dismissedIds, showDismissed])

  // Events by date (for mini calendar)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    filteredEvents.forEach(evt => {
      if (!map[evt.date]) map[evt.date] = []
      map[evt.date].push(evt)
    })
    return map
  }, [filteredEvents])

  // Agenda groups
  const agendaGroups = useMemo(() => buildAgendaGroups(filteredEvents), [filteredEvents])

  // Type counts (ignoring portfolio filter for accurate chip counts)
  const typeCounts = useMemo(() => {
    const c: Record<CalendarEventType, number> = {
      earnings: 0, economic: 0, dividend: 0, options: 0, ipo: 0,
    }
    events.forEach(e => { if (!portfolioOnly || e.inPortfolio) c[e.type]++ })
    return c
  }, [events, portfolioOnly])

  const portfolioCount = useMemo(() => events.filter(e => e.inPortfolio).length, [events])

  function toggleType(type: CalendarEventType) {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function handleCalDayClick(dateStr: string) {
    setSelectedDate(dateStr)
    // Scroll to that day in the agenda
    const el = dayRefs.current[dateStr]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function prevCalMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextCalMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-hint">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Trading Calendar
          </h1>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Calendar}
          iconCls="text-muted-foreground"
          label="This Week"
          value={stats.thisWeekTotal}
          sub={`${stats.thisWeekByType.earnings} earnings · ${stats.thisWeekByType.economic} economic`}
        />
        <StatCard
          icon={Briefcase}
          iconCls="text-emerald-600 dark:text-emerald-400"
          label="Portfolio Events"
          value={stats.portfolioEvents}
          sub="Events for held positions"
        />
        <StatCard
          icon={AlertTriangle}
          iconCls="text-red-600 dark:text-red-400"
          label="High Impact (7d)"
          value={stats.highImpactNext7Days}
          sub="High-impact economic releases"
        />
        <StatCard
          icon={DollarSign}
          iconCls="text-emerald-600 dark:text-emerald-400"
          label="Upcoming Dividends"
          value={formatCurrency(stats.upcomingDividendIncome, stats.upcomingDividendCurrency)}
          sub="Expected in next 30 days"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map(type => (
          <TypeChip
            key={type}
            type={type}
            count={typeCounts[type]}
            active={activeTypes.has(type)}
            onToggle={() => toggleType(type)}
          />
        ))}
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
        <button
          onClick={() => setPortfolioOnly(p => !p)}
          aria-pressed={portfolioOnly}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            portfolioOnly
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
              : 'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
          )}
        >
          <Briefcase className="w-3 h-3" aria-hidden="true" />
          Portfolio Only
          <span
            className={cn(
              'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium',
              portfolioOnly
                ? 'bg-white/60 dark:bg-black/20'
                : 'bg-muted text-hint',
            )}
          >
            {portfolioCount}
          </span>
        </button>
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
        <button
          onClick={() => { setShowDismissed(d => !d); setExpandedId(null) }}
          aria-pressed={showDismissed}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            showDismissed
              ? 'bg-zinc-200 dark:bg-zinc-700 text-foreground border-zinc-300 dark:border-zinc-600'
              : 'text-muted-foreground border-border hover:border-zinc-300 dark:hover:border-zinc-600',
          )}
        >
          <EyeOff className="w-3 h-3" aria-hidden="true" />
          Dismissed
          <span
            className={cn(
              'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium',
              showDismissed
                ? 'bg-white/60 dark:bg-black/20'
                : 'bg-muted text-hint',
              dismissedIds.size > 0 && !showDismissed && 'bg-zinc-300 dark:bg-zinc-600 text-foreground',
            )}
          >
            {dismissedIds.size}
          </span>
        </button>
      </div>

      {/* Main content: Agenda + Mini Calendar */}
      {filteredEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <EyeOff className={cn(
            'w-10 h-10 mx-auto mb-3',
            showDismissed ? 'text-faint' : 'text-zinc-200 dark:text-zinc-700',
          )} />
          <p className="text-sm font-medium text-muted-foreground">
            {showDismissed ? 'No dismissed events' : 'No events match the selected filters'}
          </p>
          <p className="text-xs text-hint mt-1">
            {showDismissed
              ? 'Dismissed events will appear here'
              : 'Try enabling more event types or removing filters'}
          </p>
          {!showDismissed && (
            <button
              onClick={() => {
                setActiveTypes(new Set(['earnings', 'economic', 'dividend', 'options', 'ipo']))
                setPortfolioOnly(false)
              }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Agenda list */}
          <div className="flex-1 min-w-0 space-y-8">
            {agendaGroups.map(group => (
              <div key={group.monthKey}>
                {/* Month separator */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  <span className="text-xs font-bold uppercase tracking-widest text-hint whitespace-nowrap">
                    {group.monthLabel}
                  </span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                </div>

                {/* Days */}
                <div className="space-y-6">
                  {group.days.map(day => {
                    const isToday = day.dateStr === today
                    const dayNum = new Date(day.dateStr + 'T00:00:00').getDate()
                    const hasPortfolio = day.events.some(e => e.inPortfolio)

                    return (
                      <div
                        key={day.dateStr}
                        ref={el => { dayRefs.current[day.dateStr] = el }}
                        className="scroll-mt-4"
                      >
                        {/* Day header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border',
                              isToday
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border',
                            )}
                          >
                            {dayNum}
                          </div>
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              isToday
                                ? 'text-primary'
                                : 'text-foreground',
                            )}
                          >
                            {formatDayHeader(day.dateStr)}
                          </span>
                          {hasPortfolio && (
                            <button
                              onClick={onViewPortfolio}
                              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Briefcase className="w-2.5 h-2.5" />
                              Portfolio
                            </button>
                          )}
                          <div className="h-px flex-1 bg-muted" />
                          <span className="text-xs text-hint flex-shrink-0">
                            {day.events.length} event{day.events.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Events for this day */}
                        <div className="space-y-2 pl-11">
                          {day.events.map(event => (
                            <AgendaEventCard
                              key={event.id}
                              event={event}
                              isDismissed={dismissedIds.has(event.id)}
                              isExpanded={expandedId === event.id}
                              onToggle={() => setExpandedId(prev => prev === event.id ? null : event.id)}
                              onCreateAlert={onCreateAlert}
                              onViewInstrument={onViewInstrument}
                              onDismiss={() => {
                                setDismissedIds(prev => new Set([...prev, event.id]))
                                setExpandedId(null)
                              }}
                              onRestore={() => {
                                setDismissedIds(prev => {
                                  const next = new Set(prev)
                                  next.delete(event.id)
                                  return next
                                })
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Mini Calendar sidebar */}
          <div className="hidden lg:flex flex-col gap-3 w-60 xl:w-64 flex-shrink-0 sticky top-4">
            <MiniCalendar
              year={calYear}
              month={calMonth}
              today={today}
              selectedDate={selectedDate}
              eventsByDate={eventsByDate}
              onPrev={prevCalMonth}
              onNext={nextCalMonth}
              onDayClick={handleCalDayClick}
            />

            {/* Event type legend */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-hint mb-2.5">
                Event Types
              </div>
              <div className="space-y-1.5">
                {(Object.entries(EVENT_TYPE_CONFIG) as [CalendarEventType, typeof EVENT_TYPE_CONFIG[CalendarEventType]][]).map(([type, cfg]) => {
                  const Icon = cfg.icon
                  const count = typeCounts[type]
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                      <Icon className={cn('w-3 h-3', cfg.color)} />
                      <span className="text-xs text-muted-foreground flex-1">{cfg.label}</span>
                      <span className="text-xs font-mono text-hint">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
