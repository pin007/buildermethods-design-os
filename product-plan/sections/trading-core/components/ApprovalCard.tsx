import { useState, useEffect, useMemo } from 'react'
import {
  X,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Target,
  Activity,
} from 'lucide-react'
import type { ApprovalCardProps } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ icon: Icon, label }: { icon: typeof ShieldAlert; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-stone-400 dark:text-zinc-500" />
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        {label}
      </h3>
    </div>
  )
}

function DetailRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: 'danger' | 'warning' | 'success' }) {
  const highlightClass = highlight === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : highlight === 'warning'
    ? 'text-amber-600 dark:text-amber-400'
    : highlight === 'success'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-stone-800 dark:text-zinc-200'

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-stone-500 dark:text-zinc-500">{label}</span>
      <span className={`text-sm font-medium ${highlightClass} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function RiskBar({ percent, label }: { percent: number; label: string }) {
  const clampedPercent = Math.min(100, Math.max(0, percent))
  const barColor = percent > 25
    ? 'bg-red-500'
    : percent > 10
    ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <span className="text-xs text-stone-500 dark:text-zinc-500">{label}</span>
        <span className={`text-xs font-bold font-mono ${
          percent > 25 ? 'text-red-600 dark:text-red-400' : percent > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
        }`}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  )
}

function PriceRange({ label, low, high, current, currency }: { label: string; low: number; high: number; current: number; currency: string }) {
  const range = high - low
  const position = range > 0 ? ((current - low) / range) * 100 : 50

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-4 mb-1.5">
        <span className="text-xs text-stone-500 dark:text-zinc-500">{label}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-stone-100 dark:bg-zinc-800">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-pink-500 shadow-sm"
          style={{ left: `${Math.min(100, Math.max(0, position))}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs font-mono text-stone-400 dark:text-zinc-600">
          {formatCurrency(low, currency)}
        </span>
        <span className="text-xs font-mono text-stone-400 dark:text-zinc-600">
          {formatCurrency(high, currency)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ApprovalCard({
  order,
  instrument,
  recommendation,
  onApprove,
  onReject,
  onClose,
}: ApprovalCardProps) {
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)

  const riskAnalysis = order.approvalContext?.riskAnalysis
  const expiresAt = order.approvalContext?.expiresAt

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return

    function tick() {
      const remaining = new Date(expiresAt!).getTime() - Date.now()
      setCountdown(Math.max(0, remaining))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isExpired = countdown <= 0 && !!expiresAt
  const isUrgent = countdown > 0 && countdown < 5 * 60 * 1000 // < 5 minutes

  const estimatedTotal = useMemo(() => {
    const price = order.limitPrice ?? instrument.currentPrice
    return order.quantity * price
  }, [order, instrument])

  const currency = instrument.currency

  function handleApprove() {
    setIsSubmitting(true)
    onApprove?.(order.id)
  }

  function handleReject() {
    setIsSubmitting(true)
    onReject?.(order.id, rejectReason || undefined)
  }

  return (
    <div className="flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[800px]">
        {/* Card */}
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
                  Order Approval Required
                </h2>
                <p className="text-xs text-stone-400 dark:text-zinc-500">
                  {order.id} &middot; {order.brokerShortName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Countdown */}
              {expiresAt && (
                <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tabular-nums ${
                  isExpired
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                    : isUrgent
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                    : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  <Clock size={13} />
                  {isExpired ? 'Expired' : formatCountdown(countdown)}
                </div>
              )}
              <button
                onClick={() => onClose?.()}
                className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Top section: 2-column on desktop */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              {/* Order Details */}
              <div>
                <SectionHeading icon={Target} label="Order Details" />
                <div className="rounded-xl border border-stone-100 dark:border-zinc-800 p-4">
                  {/* Instrument */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-100 dark:border-zinc-800/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-stone-900 dark:text-zinc-100">
                          {order.symbol}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold tracking-wider ${
                          order.side === 'BUY'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {order.side}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-zinc-500">{order.instrumentName}</p>
                    </div>
                  </div>

                  <DetailRow label="Quantity" value={String(order.quantity)} mono />
                  <DetailRow
                    label="Order Type"
                    value={order.orderType === 'stop_loss' ? 'Stop Loss' : order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                  />
                  {order.limitPrice !== null && (
                    <DetailRow label="Limit Price" value={formatCurrency(order.limitPrice, currency)} mono />
                  )}
                  {order.stopPrice !== null && (
                    <DetailRow label="Stop Price" value={formatCurrency(order.stopPrice, currency)} mono />
                  )}
                  <DetailRow label="Time in Force" value={order.timeInForce} />
                  <div className="mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800/50">
                    <DetailRow label="Estimated Total" value={formatCurrency(estimatedTotal, currency)} mono />
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              {riskAnalysis && (
                <div>
                  <SectionHeading icon={ShieldAlert} label="Risk Analysis" />
                  <div className="rounded-xl border border-stone-100 dark:border-zinc-800 p-4">
                    {/* Risk level badge */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-100 dark:border-zinc-800/50">
                      <span className="text-xs text-stone-500 dark:text-zinc-500">Risk Level</span>
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        riskAnalysis.riskLevel === 'high'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                          : riskAnalysis.riskLevel === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {riskAnalysis.riskLevel}
                      </span>
                    </div>

                    <RiskBar percent={riskAnalysis.portfolioImpactPercent} label="Portfolio Impact" />
                    <RiskBar percent={riskAnalysis.positionSizePercent} label="Position Size" />

                    <DetailRow
                      label="Cash After Order"
                      value={formatCurrency(riskAnalysis.cashBalanceAfter, currency)}
                      mono
                      highlight={riskAnalysis.cashBalanceAfter < 0 ? 'danger' : undefined}
                    />

                    {/* Warnings */}
                    {riskAnalysis.warnings.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {riskAnalysis.warnings.map((warning, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2"
                          >
                            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
                            <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{warning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom section: 2-column on desktop */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              {/* Market Context */}
              <div>
                <SectionHeading icon={BarChart3} label="Market Context" />
                <div className="rounded-xl border border-stone-100 dark:border-zinc-800 p-4">
                  {/* Current price */}
                  <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-stone-100 dark:border-zinc-800/50">
                    <div>
                      <p className="font-mono text-xl font-semibold text-stone-900 dark:text-zinc-100">
                        {formatCurrency(instrument.currentPrice, currency)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      instrument.dayChange >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}>
                      {instrument.dayChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="text-xs font-semibold font-mono">
                        {formatPercent(instrument.dayChangePercent)}
                      </span>
                    </div>
                  </div>

                  <PriceRange
                    label="52-Week Range"
                    low={instrument.week52Low}
                    high={instrument.week52High}
                    current={instrument.currentPrice}
                    currency={currency}
                  />

                  <DetailRow
                    label="Recent Volatility"
                    value={`${(instrument.recentVolatility * 100).toFixed(0)}%`}
                    highlight={instrument.recentVolatility > 0.4 ? 'warning' : undefined}
                  />

                  <DetailRow
                    label="Day Change"
                    value={`${formatCurrency(Math.abs(instrument.dayChange), currency)} (${formatPercent(instrument.dayChangePercent)})`}
                    highlight={instrument.dayChange >= 0 ? 'success' : 'danger'}
                  />
                </div>
              </div>

              {/* AI Recommendation */}
              {recommendation && (
                <div>
                  <SectionHeading icon={Brain} label="AI Recommendation" />
                  <div className="rounded-xl border border-stone-100 dark:border-zinc-800 p-4">
                    {/* Confidence + Strategy */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-100 dark:border-zinc-800/50">
                      <div>
                        <p className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          {recommendation.strategyName}
                        </p>
                      </div>
                      {/* Confidence ring */}
                      <div className="flex items-center gap-2">
                        <div className="relative h-9 w-9">
                          <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-stone-100 dark:text-zinc-800"
                            />
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${recommendation.confidence * 94.2} 94.2`}
                              strokeLinecap="round"
                              className={
                                recommendation.confidence >= 0.8
                                  ? 'text-emerald-500'
                                  : recommendation.confidence >= 0.6
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                              }
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-zinc-300">
                            {Math.round(recommendation.confidence * 100)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <p className="text-xs leading-relaxed text-stone-600 dark:text-zinc-400 mb-3">
                      {recommendation.reasoning.length > 200
                        ? recommendation.reasoning.slice(0, 200) + '...'
                        : recommendation.reasoning}
                    </p>

                    {/* Target prices */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-stone-50 dark:bg-zinc-800/50 px-3 py-2 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-600">Entry</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          {formatCurrency(recommendation.targetPrices.entry, currency)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Target</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(recommendation.targetPrices.target, currency)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400">Stop</p>
                        <p className="mt-0.5 font-mono text-xs font-semibold text-red-700 dark:text-red-300">
                          {formatCurrency(recommendation.targetPrices.stopLoss, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* If no recommendation, show empty state in 2nd column */}
              {!recommendation && (
                <div>
                  <SectionHeading icon={Activity} label="Origin" />
                  <div className="rounded-xl border border-stone-100 dark:border-zinc-800 p-4">
                    <p className="text-xs text-stone-500 dark:text-zinc-500">
                      Manual order — no AI recommendation attached.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reject reason (collapsible) */}
            <div>
              <button
                onClick={() => setRejectReasonOpen(!rejectReasonOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors"
              >
                {rejectReasonOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Add rejection reason (optional)
              </button>
              {rejectReasonOpen && (
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this order should be rejected..."
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-stone-700 dark:text-zinc-300 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                onClick={handleApprove}
                disabled={isSubmitting || isExpired}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Approve &amp; Submit
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || isExpired}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 dark:border-red-900/40 px-6 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300/30 border-t-red-500" />
                ) : (
                  <XCircle size={16} />
                )}
                Reject
              </button>
            </div>

            {/* Expired banner */}
            {isExpired && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-5 py-3 text-center">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">
                  This approval has expired and was automatically rejected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
