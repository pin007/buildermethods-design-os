import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Link2,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowDownUp,
  CircleDot,
} from 'lucide-react'
import type { NewOrderFormProps, Instrument, OrderSide, OrderType, TimeInForce } from '@/../product/sections/trading-core/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type OrderTab = 'market' | 'limit' | 'stop' | 'advanced'

const ORDER_TABS: { id: OrderTab; label: string }[] = [
  { id: 'market', label: 'Market' },
  { id: 'limit', label: 'Limit' },
  { id: 'stop', label: 'Stop' },
  { id: 'advanced', label: 'Advanced' },
]

const TIF_OPTIONS: { value: TimeInForce; label: string; desc: string }[] = [
  { value: 'DAY', label: 'DAY', desc: 'Cancel at close' },
  { value: 'GTC', label: 'GTC', desc: 'Good til cancel' },
  { value: 'GTD', label: 'GTD', desc: 'Good til date' },
  { value: 'IOC', label: 'IOC', desc: 'Immediate or cancel' },
  { value: 'FOK', label: 'FOK', desc: 'Fill or kill' },
]

const ESTIMATED_COMMISSION_RATE = 0.001

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InstrumentDropdownItem({ instrument, onSelect }: { instrument: Instrument; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-pink-500/5 dark:hover:bg-pink-500/10"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{instrument.symbol}</span>
          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{instrument.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{instrument.exchange}</span>
          <span className="text-zinc-300 dark:text-zinc-600">&middot;</span>
          <span className="text-xs capitalize text-zinc-400 dark:text-zinc-500">{instrument.assetType}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-xs font-medium text-foreground">{formatCurrency(instrument.currentPrice, instrument.currency)}</p>
        <p className={`font-mono text-xs font-medium ${instrument.dayChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {formatPercent(instrument.dayChangePercent)}
        </p>
      </div>
    </button>
  )
}

function SelectedInstrumentCard({ instrument }: { instrument: Instrument }) {
  const isPositive = instrument.dayChange >= 0
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-gradient-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-800/60 dark:via-zinc-800/40 dark:to-zinc-900/60">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-pink-500/5 blur-2xl dark:bg-pink-500/10" />

      <div className="relative flex items-center justify-between px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{instrument.symbol}</span>
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{instrument.name}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{instrument.exchange}</span>
            <span className="text-zinc-300 dark:text-zinc-600">&middot;</span>
            <span className="text-xs capitalize text-zinc-400 dark:text-zinc-500">{instrument.assetType}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-bold text-foreground">
            {formatCurrency(instrument.currentPrice, instrument.currency)}
          </p>
          <div className={`flex items-center justify-end gap-1 ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span className="font-mono text-xs font-semibold">
              {formatPercent(instrument.dayChangePercent)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
      {label}
      {required && <span className="ml-0.5 text-pink-500">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">{message}</p>
}

function SummaryRow({ label, value, mono, highlight, dim }: {
  label: string
  value: string
  mono?: boolean
  highlight?: 'danger' | 'warning' | 'success'
  dim?: boolean
}) {
  const color = highlight === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : highlight === 'warning'
    ? 'text-amber-600 dark:text-amber-400'
    : highlight === 'success'
    ? 'text-emerald-600 dark:text-emerald-400'
    : dim
    ? 'text-zinc-400 dark:text-zinc-500'
    : 'text-foreground'

  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`text-xs font-medium ${color} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function NewOrderForm({
  instruments,
  portfolios,
  brokers,
  prefillSymbol,
  prefillSide,
  amendOrder,
  onSubmit,
  onClose,
  onDirtyChange,
}: NewOrderFormProps) {
  // Form state
  const [side, setSide] = useState<OrderSide>(amendOrder?.side ?? prefillSide ?? 'BUY')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(() => {
    if (amendOrder) return instruments.find((i) => i.id === amendOrder.instrumentId) ?? null
    if (prefillSymbol) return instruments.find((i) => i.symbol === prefillSymbol) ?? null
    return null
  })
  const [showDropdown, setShowDropdown] = useState(false)

  // Tab + order type
  const [activeTab, setActiveTab] = useState<OrderTab>(() => {
    if (amendOrder) {
      if (amendOrder.orderType === 'market') return 'market'
      if (amendOrder.orderType === 'limit') return 'limit'
      if (amendOrder.orderType === 'stop_loss') return 'stop'
    }
    return 'market'
  })
  const [orderType, setOrderType] = useState<OrderType>(amendOrder?.orderType ?? 'market')
  const [quantity, setQuantity] = useState(amendOrder ? String(amendOrder.quantity) : '')
  const [limitPrice, setLimitPrice] = useState(amendOrder?.limitPrice ? String(amendOrder.limitPrice) : '')
  const [stopPrice, setStopPrice] = useState(amendOrder?.stopPrice ? String(amendOrder.stopPrice) : '')
  const [timeInForce, setTimeInForce] = useState<TimeInForce>(amendOrder?.timeInForce ?? 'DAY')
  const [bracketEnabled, setBracketEnabled] = useState(false)
  const [bracketStopLoss, setBracketStopLoss] = useState('')
  const [bracketTakeProfit, setBracketTakeProfit] = useState('')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(amendOrder?.portfolioId ?? portfolios[0]?.id ?? '')
  const [summaryExpanded, setSummaryExpanded] = useState(true)

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAmend = !!amendOrder

  // Track unsaved changes
  const hasUnsavedChanges = !!(selectedInstrument || quantity || limitPrice || stopPrice || bracketStopLoss || bracketTakeProfit)

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounce instrument search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Pre-fill limit price when instrument selected and order type is limit
  useEffect(() => {
    if (selectedInstrument && orderType === 'limit' && !limitPrice && !isAmend) {
      setLimitPrice(String(selectedInstrument.currentPrice))
    }
  }, [selectedInstrument, orderType])

  // Tab change handler
  function handleTabChange(tab: OrderTab) {
    setActiveTab(tab)
    if (tab === 'market') {
      setOrderType('market')
      setLimitPrice('')
      setStopPrice('')
    } else if (tab === 'limit') {
      setOrderType('limit')
      setStopPrice('')
    } else if (tab === 'stop') {
      setOrderType('stop_loss')
      setLimitPrice('')
      setBracketEnabled(false)
    }
    // 'advanced' keeps current orderType
  }

  // Filtered instruments for search (uses debounced query)
  const filteredInstruments = useMemo(() => {
    if (!debouncedQuery.trim()) return instruments
    const q = debouncedQuery.toLowerCase()
    return instruments.filter(
      (i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
    )
  }, [instruments, debouncedQuery])

  // Portfolio and broker
  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId)
  const currency = selectedInstrument?.currency ?? selectedPortfolio?.currency ?? 'USD'

  // Computed values
  const qty = parseFloat(quantity) || 0
  const price = orderType === 'market'
    ? (selectedInstrument?.currentPrice ?? 0)
    : orderType === 'limit'
    ? (parseFloat(limitPrice) || 0)
    : (parseFloat(stopPrice) || 0)

  const estimatedTotal = qty * price
  const estimatedCommission = estimatedTotal * ESTIMATED_COMMISSION_RATE
  const portfolioValue = selectedPortfolio?.dashboardStats.portfolioValue ?? 0
  const portfolioImpact = portfolioValue > 0 ? (estimatedTotal / portfolioValue) * 100 : 0
  const cashAvailable = selectedPortfolio?.dashboardStats.cashAvailable ?? 0
  const balanceAfter = cashAvailable - estimatedTotal - estimatedCommission

  const riskLevel = portfolioImpact > 5 ? 'high' : portfolioImpact > 1 ? 'medium' : 'low'
  const impactHighlight = portfolioImpact > 5 ? 'danger' as const : portfolioImpact > 1 ? 'warning' as const : 'success' as const

  // Show price fields based on tab
  const showLimitPrice = activeTab === 'limit' || (activeTab === 'advanced' && orderType !== 'stop_loss')
  const showStopPrice = activeTab === 'stop' || (activeTab === 'advanced' && orderType !== 'limit')
  const bracketAvailable = (activeTab === 'advanced') && (orderType === 'market' || orderType === 'limit')

  // Validation
  const validate = useCallback((field?: string) => {
    const newErrors: Record<string, string> = {}

    if (!field || field === 'instrument') {
      if (!selectedInstrument) newErrors.instrument = 'Select an instrument'
    }
    if (!field || field === 'quantity') {
      if (!quantity) newErrors.quantity = 'Required'
      else if (parseFloat(quantity) <= 0) newErrors.quantity = 'Must be greater than 0'
    }
    if (!field || field === 'limitPrice') {
      if ((activeTab === 'limit' || (activeTab === 'advanced' && orderType === 'limit')) && !limitPrice)
        newErrors.limitPrice = 'Required for limit orders'
      else if (orderType === 'limit' && limitPrice && parseFloat(limitPrice) <= 0)
        newErrors.limitPrice = 'Must be greater than 0'
    }
    if (!field || field === 'stopPrice') {
      if ((activeTab === 'stop' || (activeTab === 'advanced' && orderType === 'stop_loss')) && !stopPrice)
        newErrors.stopPrice = 'Required for stop orders'
      else if (orderType === 'stop_loss' && stopPrice && parseFloat(stopPrice) <= 0)
        newErrors.stopPrice = 'Must be greater than 0'
    }

    if (field) {
      setErrors((prev) => {
        const updated = { ...prev }
        if (newErrors[field]) updated[field] = newErrors[field]
        else delete updated[field]
        return updated
      })
    } else {
      setErrors(newErrors)
    }

    return Object.keys(newErrors).length === 0
  }, [selectedInstrument, quantity, limitPrice, stopPrice, orderType, activeTab])

  function handleBlur(field: string) {
    setTouched((prev) => new Set(prev).add(field))
    validate(field)
  }

  function handleSubmit() {
    setTouched(new Set(['instrument', 'quantity', 'limitPrice', 'stopPrice']))
    if (!validate()) return
    onSubmit?.({
      portfolioId: selectedPortfolioId,
      instrumentId: selectedInstrument!.id,
      symbol: selectedInstrument!.symbol,
      instrumentName: selectedInstrument!.name,
      side,
      orderType,
      quantity: parseFloat(quantity),
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : null,
      stopPrice: orderType === 'stop_loss' ? parseFloat(stopPrice) : null,
      brokerId: brokers[0]?.id ?? '',
      brokerShortName: brokers[0]?.shortName ?? '',
      timeInForce,
      bracketGroupId: null,
      bracketRole: null,
      recommendationId: null,
      ocoLinkedOrderId: undefined,
    } as any)
  }

  function selectInstrument(inst: Instrument) {
    setSelectedInstrument(inst)
    setSearchQuery('')
    setShowDropdown(false)
    setErrors((prev) => { const n = { ...prev }; delete n.instrument; return n })
  }

  // Input class helper
  const inputClass = (field: string) =>
    `w-full rounded-lg border bg-white dark:bg-zinc-900/60 py-2.5 px-3 font-mono text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] focus-visible:bg-white dark:focus-visible:bg-zinc-900 ${
      touched.has(field) && errors[field]
        ? 'border-red-400 dark:border-red-500/60'
        : 'border-zinc-200 dark:border-zinc-700/60'
    }`

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4">

          {/* ============================================================= */}
          {/* BUY / SELL toggle                                              */}
          {/* ============================================================= */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide('BUY')}
                disabled={isAmend}
                className={`relative flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold tracking-wide transition-all ${
                  side === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'border border-zinc-200 dark:border-zinc-700/60 text-zinc-400 dark:text-zinc-500 hover:border-emerald-400/40 hover:text-emerald-600 dark:hover:border-emerald-600/30 dark:hover:text-emerald-400'
                } ${isAmend ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {side === 'BUY' && <TrendingUp size={14} />}
                BUY
              </button>
              <button
                onClick={() => setSide('SELL')}
                disabled={isAmend}
                className={`relative flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold tracking-wide transition-all ${
                  side === 'SELL'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                    : 'border border-zinc-200 dark:border-zinc-700/60 text-zinc-400 dark:text-zinc-500 hover:border-red-400/40 hover:text-red-600 dark:hover:border-red-600/30 dark:hover:text-red-400'
                } ${isAmend ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {side === 'SELL' && <TrendingDown size={14} />}
                SELL
              </button>
            </div>
          </div>

          {/* ============================================================= */}
          {/* Instrument search                                              */}
          {/* ============================================================= */}
          <div ref={dropdownRef} className="relative">
            <FieldLabel label="Instrument" required />
            {selectedInstrument && !isAmend ? (
              <div>
                <SelectedInstrumentCard instrument={selectedInstrument} />
                <button
                  onClick={() => { setSelectedInstrument(null); setTimeout(() => searchRef.current?.focus(), 50) }}
                  className="mt-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 transition-colors"
                >
                  Change instrument
                </button>
              </div>
            ) : isAmend && selectedInstrument ? (
              <SelectedInstrumentCard instrument={selectedInstrument} />
            ) : (
              <div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => handleBlur('instrument')}
                    placeholder="Search ticker or company..."
                    className={`w-full rounded-lg border bg-white dark:bg-zinc-900/60 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] ${
                      touched.has('instrument') && errors.instrument
                        ? 'border-red-400 dark:border-red-500/60'
                        : 'border-zinc-200 dark:border-zinc-700/60'
                    }`}
                  />
                </div>
                {showDropdown && filteredInstruments.length > 0 && (
                  <div className="absolute z-10 mt-1.5 w-full rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-2xl dark:shadow-black/40 overflow-hidden max-h-56 overflow-y-auto">
                    {filteredInstruments.map((inst, idx) => (
                      <div key={inst.id}>
                        {idx > 0 && <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />}
                        <InstrumentDropdownItem
                          instrument={inst}
                          onSelect={() => selectInstrument(inst)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <FieldError message={touched.has('instrument') ? errors.instrument : undefined} />
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* Order type tabs                                                */}
          {/* ============================================================= */}
          <div>
            <FieldLabel label="Order Type" required />
            <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800/60 p-0.5 border border-zinc-200/60 dark:border-zinc-700/40">
              {ORDER_TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex-1 rounded-md px-3 py-2 text-xs font-bold tracking-wide transition-all ${
                      isActive
                        ? 'bg-white dark:bg-zinc-900 text-foreground shadow-sm'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-pink-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* Advanced tab: order subtype selector                           */}
          {/* ============================================================= */}
          {activeTab === 'advanced' && (
            <div>
              <FieldLabel label="Order Subtype" />
              <div className="flex gap-1.5">
                {([
                  { id: 'market' as OrderType, label: 'Market' },
                  { id: 'limit' as OrderType, label: 'Limit' },
                  { id: 'stop_loss' as OrderType, label: 'Stop' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOrderType(opt.id)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-bold tracking-wide transition-all ${
                      orderType === opt.id
                        ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/20'
                        : 'border border-zinc-200 dark:border-zinc-700/60 text-zinc-400 dark:text-zinc-500 hover:border-pink-400/40 dark:hover:border-pink-600/30 hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* Quantity                                                        */}
          {/* ============================================================= */}
          <div>
            <FieldLabel label="Quantity" required />
            <input
              type="number"
              min="1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => handleBlur('quantity')}
              placeholder="0"
              className={inputClass('quantity')}
            />
            <FieldError message={touched.has('quantity') ? errors.quantity : undefined} />
          </div>

          {/* ============================================================= */}
          {/* Limit price (conditional)                                      */}
          {/* ============================================================= */}
          {showLimitPrice && (
            <div>
              <FieldLabel label="Limit Price" required />
              <input
                type="number"
                min="0"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                onBlur={() => handleBlur('limitPrice')}
                placeholder={selectedInstrument ? String(selectedInstrument.currentPrice) : '0.00'}
                className={inputClass('limitPrice')}
              />
              <FieldError message={touched.has('limitPrice') ? errors.limitPrice : undefined} />
            </div>
          )}

          {/* ============================================================= */}
          {/* Stop price (conditional)                                       */}
          {/* ============================================================= */}
          {showStopPrice && (
            <div>
              <FieldLabel label="Stop Price" required />
              <input
                type="number"
                min="0"
                step="0.01"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                onBlur={() => handleBlur('stopPrice')}
                placeholder="0.00"
                className={inputClass('stopPrice')}
              />
              <FieldError message={touched.has('stopPrice') ? errors.stopPrice : undefined} />
            </div>
          )}

          {/* ============================================================= */}
          {/* Portfolio selector                                              */}
          {/* ============================================================= */}
          {portfolios.length > 1 && (
            <div>
              <FieldLabel label="Portfolio" />
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/60 py-2.5 px-3 text-sm text-foreground transition-all focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px]"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.currency})</option>
                ))}
              </select>
            </div>
          )}

          {/* ============================================================= */}
          {/* Advanced tab extras: TIF + Bracket                             */}
          {/* ============================================================= */}
          {activeTab === 'advanced' && (
            <div className="space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-700/40 bg-zinc-50/50 dark:bg-zinc-800/20 p-3">
              {/* Time in Force */}
              <div>
                <FieldLabel label="Time in Force" />
                <div className="grid grid-cols-5 gap-1">
                  {TIF_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTimeInForce(opt.value)}
                      title={opt.desc}
                      className={`rounded-md py-2 text-xs font-bold tracking-wide transition-all ${
                        timeInForce === opt.value
                          ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/20'
                          : 'bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-400 dark:text-zinc-500 hover:border-pink-400/40 dark:hover:border-pink-600/30 hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {TIF_OPTIONS.find((o) => o.value === timeInForce)?.desc}
                </p>
              </div>

              {/* Bracket order */}
              {bracketAvailable && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 size={13} className="text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Bracket Order</span>
                    </div>
                    <button
                      onClick={() => setBracketEnabled(!bracketEnabled)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        bracketEnabled ? 'bg-pink-600' : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        bracketEnabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {bracketEnabled && (
                    <div className="mt-3 space-y-3">
                      {/* Visual bracket connector */}
                      <div className="relative pl-4">
                        {/* Vertical line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-red-400/60 via-zinc-300 dark:via-zinc-600 to-emerald-400/60" />

                        <div className="space-y-3">
                          {/* Stop-Loss */}
                          <div className="relative">
                            <div className="absolute -left-4 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                            <FieldLabel label="Stop-Loss Price" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={bracketStopLoss}
                              onChange={(e) => setBracketStopLoss(e.target.value)}
                              placeholder="0.00"
                              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/60 py-2 px-3 font-mono text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] transition-all"
                            />
                          </div>
                          {/* Take-Profit */}
                          <div className="relative">
                            <div className="absolute -left-4 top-3 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                            <FieldLabel label="Take-Profit Price" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={bracketTakeProfit}
                              onChange={(e) => setBracketTakeProfit(e.target.value)}
                              placeholder="0.00"
                              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/60 py-2 px-3 font-mono text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20 focus-visible:ring-[3px] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {bracketStopLoss && bracketTakeProfit && (
                        <div className="flex items-center gap-2 rounded-md bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-500/10 px-3 py-2">
                          <ArrowDownUp size={12} className="shrink-0 text-blue-500" />
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            OCO: when one leg fills, the other is auto-cancelled.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* Order Summary                                                  */}
          {/* ============================================================= */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700/40 bg-gradient-to-b from-zinc-50/80 to-zinc-100/40 dark:from-zinc-800/30 dark:to-zinc-900/20">
            {/* Subtle corner glow for risk */}
            {estimatedTotal > 0 && riskLevel === 'high' && (
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-red-500/10 blur-2xl" />
            )}

            <button
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-pink-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Order Summary
                </span>
              </div>
              {summaryExpanded
                ? <ChevronUp size={14} className="text-zinc-400 dark:text-zinc-500" />
                : <ChevronDown size={14} className="text-zinc-400 dark:text-zinc-500" />
              }
            </button>

            {summaryExpanded && (
              <div className="border-t border-zinc-200/60 dark:border-zinc-700/40 px-3 pb-3 pt-1">
                {!selectedInstrument ? (
                  <div className="py-6 text-center">
                    <CircleDot size={20} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Select an instrument to see the order summary
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header: instrument + side */}
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{selectedInstrument.symbol}</span>
                        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                          {orderType === 'stop_loss' ? 'Stop Loss' : orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                        </span>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wider ${
                        side === 'BUY'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {side}
                      </span>
                    </div>

                    {/* Order details */}
                    <div className="border-t border-zinc-200/60 dark:border-zinc-700/30 pt-1">
                      <SummaryRow label="Quantity" value={qty > 0 ? String(qty) : '\u2014'} mono dim={qty <= 0} />
                      <SummaryRow
                        label="Price"
                        value={orderType === 'market' ? 'Market' : price > 0 ? formatCurrency(price, currency) : '\u2014'}
                        mono
                        dim={price <= 0 && orderType !== 'market'}
                      />
                      <SummaryRow label="Time in Force" value={timeInForce} dim />
                    </div>

                    {/* Costs */}
                    <div className="border-t border-zinc-200/60 dark:border-zinc-700/30 pt-1">
                      <SummaryRow
                        label="Estimated Total"
                        value={estimatedTotal > 0 ? formatCurrency(estimatedTotal, currency) : '\u2014'}
                        mono
                      />
                      <SummaryRow
                        label="Est. Commission"
                        value={estimatedCommission > 0 ? formatCurrency(estimatedCommission, currency) : '\u2014'}
                        mono
                        dim={estimatedCommission <= 0}
                      />
                    </div>

                    {/* Risk indicator */}
                    <div className="border-t border-zinc-200/60 dark:border-zinc-700/30 pt-1">
                      <SummaryRow
                        label="Portfolio Impact"
                        value={portfolioImpact > 0 ? `${portfolioImpact.toFixed(1)}%` : '\u2014'}
                        highlight={estimatedTotal > 0 ? impactHighlight : undefined}
                      />
                      <div className="flex items-baseline justify-between gap-3 py-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Risk Level</span>
                        {estimatedTotal > 0 ? (
                          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${
                            riskLevel === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                              : riskLevel === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}>
                            {riskLevel === 'high'
                              ? <ShieldAlert size={10} />
                              : <ShieldCheck size={10} />
                            }
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">&mdash;</span>
                        )}
                      </div>
                      <SummaryRow
                        label="Available Balance"
                        value={estimatedTotal > 0 ? formatCurrency(balanceAfter, currency) : formatCurrency(cashAvailable, currency)}
                        mono
                        highlight={balanceAfter < 0 && estimatedTotal > 0 ? 'danger' : undefined}
                      />
                    </div>

                    {/* Warnings */}
                    {estimatedTotal > 0 && balanceAfter < 0 && (
                      <div className="flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-500/10 px-3 py-2">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" />
                        <p className="text-xs font-medium text-red-700 dark:text-red-300">
                          Exceeds available cash — margin may be required.
                        </p>
                      </div>
                    )}

                    {/* Pre-trade tax / wash sale warnings */}
                    {estimatedTotal > 0 && side === 'SELL' && (
                      <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/10 px-3 py-2">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Selling within the 3-year holding period may incur Czech income tax.
                        </p>
                      </div>
                    )}
                    {estimatedTotal > 0 && side === 'BUY' && (
                      <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/10 px-3 py-2">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Potential wash sale — buying back within 30 days of selling at a loss.
                        </p>
                      </div>
                    )}

                    {/* Bracket summary */}
                    {bracketEnabled && (bracketStopLoss || bracketTakeProfit) && (
                      <div className="rounded-md border border-zinc-200 dark:border-zinc-700/40 bg-white/50 dark:bg-zinc-800/20 p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Link2 size={10} className="text-pink-500" />
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Bracket</p>
                        </div>
                        {bracketStopLoss && (
                          <SummaryRow label="Stop-Loss" value={formatCurrency(parseFloat(bracketStopLoss), currency)} mono highlight="danger" />
                        )}
                        {bracketTakeProfit && (
                          <SummaryRow label="Take-Profit" value={formatCurrency(parseFloat(bracketTakeProfit), currency)} mono highlight="success" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Sticky submit footer                                              */}
      {/* ================================================================ */}
      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-700/40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedInstrument}
          className={`group relative w-full overflow-hidden rounded-lg py-3 text-sm font-bold tracking-wide text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
            side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30'
              : 'bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-lg shadow-red-600/20 hover:shadow-red-500/30'
          }`}
        >
          {/* Subtle shine effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative">
            {isAmend
              ? 'Submit Amendment'
              : selectedInstrument
              ? `${side === 'BUY' ? 'Buy' : 'Sell'} ${selectedInstrument.symbol}`
              : 'Select Instrument'}
          </span>
        </button>
      </div>
    </div>
  )
}
