import data from '@/../product/sections/trading-core/data.json'
import { NewOrderForm } from './components/NewOrderForm'

/**
 * Preview wrapper for the New Order form content.
 *
 * In production, this form renders inside the shell's OrderPanel component
 * (via AppShell.orderPanelContent prop). The shell provides the slide-over
 * panel, backdrop, header bar, minimize/close buttons, and animations.
 * The section only supplies the form content shown here.
 */
export default function NewOrderPreview() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-[480px] flex-col rounded-xl border border-border bg-background shadow-sm">
      <NewOrderForm
        instruments={data.instruments as any}
        portfolios={data.portfolios as any}
        brokers={data.brokers as any}
        onSubmit={(order) => console.log('Submit order:', order)}
        onClose={() => console.log('Close panel (handled by shell)')}
        onDirtyChange={(dirty) => console.log('Dirty state:', dirty)}
      />
    </div>
  )
}
