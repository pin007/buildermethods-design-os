import { OrderPanel } from 'trading-squad-ds'

function OrderFormBody() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {['Market', 'Limit', 'Stop', 'Advanced'].map((t, i) => (
          <span
            key={t}
            className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium ${
              i === 0 ? 'bg-card text-foreground shadow-sm' : 'text-hint'
            }`}
          >
            {t}
          </span>
        ))}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">Symbol</label>
        <div className="rounded-lg border border-input bg-card px-3 py-2 font-mono text-sm text-foreground">AAPL</div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">Quantity</label>
        <div className="rounded-lg border border-input bg-card px-3 py-2 font-mono text-sm text-foreground">100</div>
      </div>
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">Order Summary</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Estimated Total</span>
          <span className="font-mono text-sm font-medium text-foreground">$19,520.00</span>
        </div>
      </div>
      <button className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wider text-white">
        Place Buy Order
      </button>
    </div>
  )
}

export const Open = () => (
  <div style={{ position: 'relative', height: 720, overflow: 'hidden' }}>
    <OrderPanel state="open" tradingMode="live" onClose={() => {}} onMinimize={() => {}} onRestore={() => {}}>
      <OrderFormBody />
    </OrderPanel>
  </div>
)
