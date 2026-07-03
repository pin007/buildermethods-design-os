import { useState, useRef, useEffect } from 'react'
import AppShell from './components/AppShell'
import { navigationGroups } from './components/MainNav'
import type { BrokerStatus } from './components/AppShell'
import type { CommandItem } from './components/CommandPalette'
import type { Toast } from './components/ToastContainer'
import type { Banner } from './components/SystemBanner'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Database,
  Brain,
  FlaskConical,
  BookOpen,
  Settings,
  Bell,
  Calendar,
} from 'lucide-react'

// Section components
import { TradingDashboard } from '@/sections/trading-core/components/TradingDashboard'
import { OrdersScreen } from '@/sections/trading-core/components/OrdersScreen'
import { PortfolioOverview } from '@/sections/portfolio-and-positions/components/PortfolioOverview'
import { MarketDataOverview } from '@/sections/market-data/components/MarketDataOverview'
import { DataQuality } from '@/sections/market-data/components/DataQuality'
import { CorporateActions } from '@/sections/market-data/components/CorporateActions'
import { MarketIntelligence } from '@/sections/market-intelligence/components/MarketIntelligence'
import { StrategyList } from '@/sections/strategy-engine/components/StrategyList'
import { StrategyComparison } from '@/sections/strategy-engine/components/StrategyComparison'
import { JournalDashboard } from '@/sections/trade-journal/components/JournalDashboard'
import { JournalEntries } from '@/sections/trade-journal/components/JournalEntries'
import { Analytics } from '@/sections/trade-journal/components/Analytics'
import { BehavioralPatterns } from '@/sections/trade-journal/components/BehavioralPatterns'
import { WeeklyReview as WeeklyReviewComponent } from '@/sections/trade-journal/components/WeeklyReview'
import { SettingsOverview } from '@/sections/settings-and-operations/components/SettingsOverview'
import { AlertsDashboard } from '@/sections/alerts/components/AlertsDashboard'
import { CalendarDashboard } from '@/sections/trading-calendar/components/CalendarDashboard'

// Section data
import tradingCoreData from '@/../product/sections/trading-core/data.json'
import portfolioData from '@/../product/sections/portfolio-and-positions/data.json'
import marketDataData from '@/../product/sections/market-data/data.json'
import marketIntelligenceData from '@/../product/sections/market-intelligence/data.json'
import strategyData from '@/../product/sections/strategy-engine/data.json'
import journalData from '@/../product/sections/trade-journal/data.json'
import settingsData from '@/../product/sections/settings-and-operations/data.json'
import alertsData from '@/../product/sections/alerts/data.json'
import calendarData from '@/../product/sections/trading-calendar/data.json'

// Route metadata
const routeConfig: Record<string, { title: string }> = {
  '/': { title: 'Dashboard' },
  '/alerts': { title: 'Alerts' },
  '/orders': { title: 'Orders' },
  '/calendar': { title: 'Calendar' },
  '/portfolios': { title: 'Portfolios' },
  '/market-data': { title: 'Market Data' },
  '/market-data/quality': { title: 'Data Quality' },
  '/market-data/corporate-actions': { title: 'Corporate Actions' },
  '/market-analysis': { title: 'Market Analysis' },
  '/strategies': { title: 'Strategies' },
  '/strategies/comparison': { title: 'Comparison' },
  '/trade-journal': { title: 'Trade Journal' },
  '/trade-journal/entries': { title: 'Entries' },
  '/trade-journal/analytics': { title: 'Analytics' },
  '/trade-journal/behavioral': { title: 'Behavioral' },
  '/trade-journal/review': { title: 'Weekly Review' },
  '/settings': { title: 'Settings' },
}

function getGroups(currentRoute: string) {
  return navigationGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: item.href === currentRoute || (item.href !== '/' && currentRoute.startsWith(item.href + '/')),
      children: item.children?.map((child) => ({
        ...child,
        isActive: child.href === currentRoute,
      })),
      badge:
        item.href === '/alerts'
          ? 3
          : item.href === '/orders'
            ? 2
            : item.href === '/market-analysis'
              ? 5
              : undefined,
    })),
  }))
}

const user = {
  name: 'Alex Morgan',
  email: 'alex@tradingsquad.io',
  avatarUrl: undefined,
}

const brokers: BrokerStatus[] = [
  { name: 'IB', status: 'connected' },
  { name: 'Binance', status: 'degraded' },
]

// Demo banners
const demoBanners: Banner[] = [
  {
    id: 'pending-approvals',
    variant: 'approval',
    message: 'You have 2 orders pending approval',
    actionLabel: 'Review',
    actionHref: '/orders',
  },
]

function openOrderPanel() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
  )
}

type OrderType = 'Market' | 'Limit' | 'Stop' | 'Advanced'
type OrderSide = 'buy' | 'sell'

function MockOrderForm() {
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [side, setSide] = useState<OrderSide>('buy')

  const isBuy = side === 'buy'
  const showPrice = orderType === 'Limit' || orderType === 'Stop'
  const showTif = orderType !== 'Market'

  return (
    <div className="space-y-4 p-4">
      {/* Order type tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['Market', 'Limit', 'Stop', 'Advanced'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              orderType === type
                ? 'bg-card text-foreground shadow-sm'
                : 'text-hint hover:text-muted-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* BUY / SELL toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isBuy
              ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-600/40'
              : 'bg-muted text-hint hover:text-muted-foreground'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            !isBuy
              ? 'bg-red-600/20 text-red-600 dark:text-red-400 ring-1 ring-red-600/40'
              : 'bg-muted text-hint hover:text-muted-foreground'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">
            Symbol
          </label>
          <input
            type="text"
            defaultValue="AAPL"
            className="w-full rounded-lg border border-input bg-card px-3 py-2
              font-mono text-sm text-foreground outline-none transition-colors
              focus:border-primary focus:ring-1 focus:ring-ring/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">
            Quantity
          </label>
          <input
            type="number"
            defaultValue={100}
            className="w-full rounded-lg border border-input bg-card px-3 py-2
              font-mono text-sm text-foreground outline-none transition-colors
              focus:border-primary focus:ring-1 focus:ring-ring/30"
          />
        </div>

        {showPrice && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">
              {orderType === 'Stop' ? 'Stop Price' : 'Limit Price'}
            </label>
            <input
              type="number"
              defaultValue={195.20}
              step={0.01}
              className="w-full rounded-lg border border-input bg-card px-3 py-2
                font-mono text-sm text-foreground outline-none transition-colors
                focus:border-primary focus:ring-1 focus:ring-ring/30"
            />
          </div>
        )}

        {showTif && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hint">
              Time in Force
            </label>
            <select
              defaultValue="DAY"
              className="w-full rounded-lg border border-input bg-card px-3 py-2
                text-sm text-foreground outline-none transition-colors
                focus:border-primary focus:ring-1 focus:ring-ring/30"
            >
              <option value="DAY">Day</option>
              <option value="GTC">Good Till Cancelled</option>
              <option value="IOC">Immediate or Cancel</option>
              <option value="FOK">Fill or Kill</option>
            </select>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estimated Total</span>
            <span className="font-mono text-sm font-medium text-foreground">$19,520.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Commission</span>
            <span className="font-mono text-sm text-muted-foreground">$1.00</span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Total Cost</span>
              <span className="font-mono text-sm font-semibold text-foreground">$19,521.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicator */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">
          Risk Indicator
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Portfolio Impact</span>
          <span className="font-mono text-sm font-medium text-amber-500 dark:text-amber-400">15.3%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
            style={{ width: '15.3%' }}
          />
        </div>
      </div>

      {/* Available Balance */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hint">
          Available Balance
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current</span>
            <span className="font-mono text-sm text-foreground">$127,845.32</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">After Order</span>
            <span className="font-mono text-sm text-foreground">$108,324.32</span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        className={`w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors ${
          isBuy
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : 'bg-red-600 hover:bg-red-500'
        }`}
      >
        {isBuy ? 'Place Buy Order' : 'Place Sell Order'}
      </button>
    </div>
  )
}

export default function ShellPreview() {
  const [currentRoute, setCurrentRoute] = useState('/')
  const [banners, setBanners] = useState(demoBanners)
  const toastRef = useRef<((toast: Omit<Toast, 'id'>) => void) | null>(null)

  function navigate(href: string) {
    setCurrentRoute(href)
  }

  const groups = getGroups(currentRoute)
  const config = routeConfig[currentRoute] || routeConfig['/']

  const commandItems: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'nav-alerts', label: 'Alerts', category: 'Navigation', icon: Bell, action: () => navigate('/alerts') },
    { id: 'nav-orders', label: 'Orders', category: 'Navigation', icon: ShoppingCart, action: () => navigate('/orders') },
    { id: 'nav-calendar', label: 'Calendar', category: 'Navigation', icon: Calendar, action: () => navigate('/calendar') },
    { id: 'nav-portfolios', label: 'Portfolios', category: 'Navigation', icon: Wallet, action: () => navigate('/portfolios') },
    { id: 'nav-market-data', label: 'Market Data', category: 'Navigation', icon: Database, action: () => navigate('/market-data') },
    { id: 'nav-analysis', label: 'Market Analysis', category: 'Navigation', icon: Brain, action: () => navigate('/market-analysis') },
    { id: 'nav-strategies', label: 'Strategies', category: 'Navigation', icon: FlaskConical, action: () => navigate('/strategies') },
    { id: 'nav-journal', label: 'Trade Journal', category: 'Navigation', icon: BookOpen, action: () => navigate('/trade-journal') },
    { id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: Settings, action: () => navigate('/settings') },
    { id: 'inst-aapl', label: 'AAPL', description: 'Apple Inc.', category: 'Instruments', action: () => console.log('AAPL') },
    { id: 'inst-msft', label: 'MSFT', description: 'Microsoft Corp.', category: 'Instruments', action: () => console.log('MSFT') },
    { id: 'inst-btc', label: 'BTC-USD', description: 'Bitcoin', category: 'Instruments', action: () => console.log('BTC') },
    { id: 'inst-nvda', label: 'NVDA', description: 'NVIDIA Corp.', category: 'Instruments', action: () => console.log('NVDA') },
    { id: 'act-new-order', label: 'New Order', description: 'Create a new order', category: 'Actions', icon: ShoppingCart, action: openOrderPanel },
  ]

  function renderContent() {
    switch (currentRoute) {
      case '/':
        return (
          <TradingDashboard
            portfolios={tradingCoreData.portfolios as any}
            recentActivity={tradingCoreData.recentActivity as any}
            onReviewApproval={() => navigate('/orders')}
            onCreateOrder={openOrderPanel}
            onViewOrders={() => navigate('/orders')}
            onConnectBroker={() => console.log('Connect broker')}
          />
        )

      case '/alerts':
        return (
          <AlertsDashboard
            alertStats={alertsData.alertStats as any}
            alerts={alertsData.alerts as any}
            recentlyResolved={alertsData.recentlyResolved as any}
            silences={alertsData.silences as any}
            routes={alertsData.routes as any}
            inhibitionRules={alertsData.inhibitionRules as any}
            onAcknowledgeAlert={(id) => console.log('Acknowledge alert:', id)}
            onSilenceAlert={(id) => console.log('Silence alert:', id)}
            onViewAlertDetail={(id) => console.log('View alert detail:', id)}
            onCreateSilence={() => console.log('Create new silence')}
            onExpireSilence={(id) => console.log('Expire silence:', id)}
            onEditSilence={(id) => console.log('Edit silence:', id)}
            onToggleRoute={(id, enabled) => console.log('Toggle route:', id, enabled)}
            onEditRoute={(id) => console.log('Edit route:', id)}
            onCreateRoute={() => console.log('Create new route')}
            onToggleInhibition={(id, enabled) => console.log('Toggle inhibition:', id, enabled)}
            onEditInhibition={(id) => console.log('Edit inhibition:', id)}
            onCreateInhibition={() => console.log('Create new inhibition rule')}
          />
        )

      case '/calendar':
        return (
          <CalendarDashboard
            stats={calendarData.stats as any}
            events={calendarData.events as any}
            onCreateAlert={(id) => console.log('Create alert:', id)}
            onViewInstrument={(symbol) => console.log('View instrument:', symbol)}
            onViewPortfolio={() => navigate('/portfolios')}
          />
        )

      case '/orders':
        return (
          <OrdersScreen
            orders={tradingCoreData.orders as any}
            orderEvents={tradingCoreData.orderEvents as any}
            onViewOrder={(id) => console.log('View order:', id)}
            onAmendOrder={openOrderPanel}
            onCancelOrder={(id) => console.log('Cancel order:', id)}
            onCancelBracket={(groupId) => console.log('Cancel bracket:', groupId)}
            onReviewApproval={() => console.log('Review approval')}
            onCreateOrder={openOrderPanel}
          />
        )

      case '/portfolios':
        return (
          <PortfolioOverview
            aggregatedOverview={portfolioData.aggregatedOverview as any}
            portfolios={portfolioData.portfolios as any}
            onViewPortfolio={(id) => console.log('View portfolio:', id)}
            onConnectBroker={() => console.log('Connect broker')}
          />
        )

      case '/market-data':
        return (
          <MarketDataOverview
            pipelineStats={marketDataData.pipelineStats as any}
            dataSources={marketDataData.dataSources as any}
            recentCorporateActions={marketDataData.corporateActions as any}
            recentQualityAlerts={marketDataData.qualityAlerts as any}
            onViewSource={(sourceId) => console.log('View source:', sourceId)}
            onViewAllCorporateActions={() => navigate('/market-data/corporate-actions')}
            onViewAllQualityAlerts={() => navigate('/market-data/quality')}
            onConfigureSources={() => navigate('/settings')}
          />
        )

      case '/market-data/quality':
        return (
          <DataQuality
            pipelineStats={marketDataData.pipelineStats as any}
            qualityAlerts={marketDataData.qualityAlerts as any}
            onAcknowledge={(id) => console.log('Acknowledge:', id)}
            onBulkAcknowledge={(ids) => console.log('Bulk acknowledge:', ids)}
            onViewSourceData={(sourceId) => console.log('View source data:', sourceId)}
          />
        )

      case '/market-data/corporate-actions':
        return (
          <CorporateActions
            corporateActions={marketDataData.corporateActions as any}
            onReadjust={(id) => console.log('Re-adjust:', id)}
            onViewDetails={(id) => console.log('View details:', id)}
          />
        )

      case '/market-analysis':
        return (
          <MarketIntelligence
            dashboardStats={marketIntelligenceData.dashboardStats as any}
            recommendations={marketIntelligenceData.recommendations as any}
            sentimentOverview={marketIntelligenceData.sentimentOverview as any}
            sectorSentiment={marketIntelligenceData.sectorSentiment as any}
            topMovers={marketIntelligenceData.topMovers as any}
            newsArticles={marketIntelligenceData.newsArticles as any}
            newsSources={marketIntelligenceData.newsSources as any}
            sentimentWatchlist={marketIntelligenceData.sentimentWatchlist as any}
            sentimentAlerts={marketIntelligenceData.sentimentAlerts as any}
            guruTrades={marketIntelligenceData.guruTrades as any}
            trackedGurus={marketIntelligenceData.trackedGurus as any}
            guruAlerts={marketIntelligenceData.guruAlerts as any}
            researchJobs={marketIntelligenceData.researchJobs as any}
            sectors={marketIntelligenceData.sectors as any}
            onCreateOrder={(id) => console.log('Create order from recommendation:', id)}
            onDismissRecommendation={(id) => console.log('Dismiss recommendation:', id)}
            onSnoozeRecommendation={(id) => console.log('Snooze recommendation:', id)}
            onAnalyzeInstrument={(symbol, type) => console.log('Analyze instrument:', symbol, type)}
            onAddToWatchlist={(id) => console.log('Add to watchlist:', id)}
            onRemoveFromWatchlist={(id) => console.log('Remove from watchlist:', id)}
            onSaveSentimentAlert={(alert) => console.log('Save sentiment alert:', alert)}
            onDeleteSentimentAlert={(id) => console.log('Delete sentiment alert:', id)}
            onToggleSentimentAlert={(id, enabled) => console.log('Toggle sentiment alert:', id, enabled)}
            onChangeFinBERTSensitivity={(s) => console.log('FinBERT sensitivity:', s)}
            onToggleNewsSource={(id, enabled) => console.log('Toggle news source:', id, enabled)}
            onAddNewsSource={(source) => console.log('Add news source:', source)}
            onRemoveNewsSource={(id) => console.log('Remove news source:', id)}
            onSaveSectorGrouping={(id, instruments) => console.log('Save sector:', id, instruments)}
            onCreateSector={(name, instruments) => console.log('Create sector:', name, instruments)}
            onDeleteSector={(id) => console.log('Delete sector:', id)}
            onReorderSectors={(ids) => console.log('Reorder sectors:', ids)}
            onTimeRangeChange={(range) => console.log('Time range:', range)}
            onFollowTrade={(id) => console.log('Follow trade:', id)}
            onAddGuru={(guru) => console.log('Add guru:', guru)}
            onRemoveGuru={(id) => console.log('Remove guru:', id)}
            onToggleGuru={(id, enabled) => console.log('Toggle guru:', id, enabled)}
            onEditGuru={(id, updates) => console.log('Edit guru:', id, updates)}
            onSaveGuruAlert={(id, triggers) => console.log('Save guru alert:', id, triggers)}
            onDeleteGuruAlert={(id) => console.log('Delete guru alert:', id)}
            onToggleGuruAlert={(id, enabled) => console.log('Toggle guru alert:', id, enabled)}
            onRunResearchNow={(id, opts) => console.log('Run research:', id, opts)}
            onCancelResearch={(id) => console.log('Cancel research:', id)}
            onCreateResearchJob={(job) => console.log('Create research job:', job)}
            onEditResearchJob={(id, updates) => console.log('Edit research job:', id, updates)}
            onDeleteResearchJob={(id) => console.log('Delete research job:', id)}
            onToggleResearchJob={(id, enabled) => console.log('Toggle research job:', id, enabled)}
            onViewJobRunResults={(runId) => console.log('View job run:', runId)}
            onTabChange={(tab) => console.log('Tab change:', tab)}
          />
        )

      case '/strategies':
        return (
          <StrategyList
            strategies={strategyData.strategies as any}
            backtests={strategyData.backtests as any}
            onViewStrategy={(id) => console.log('View strategy:', id)}
            onToggleActive={(id, active) => console.log('Toggle active:', id, active)}
            onCreateStrategy={() => console.log('Create new strategy')}
            onCompareStrategies={() => navigate('/strategies/comparison')}
            onDeleteStrategy={(id) => console.log('Delete strategy:', id)}
          />
        )

      case '/strategies/comparison':
        return (
          <StrategyComparison
            comparison={strategyData.comparisonData as any}
            onBack={() => navigate('/strategies')}
            onViewBacktest={(id) => console.log('View backtest:', id)}
          />
        )

      case '/trade-journal':
        return (
          <JournalDashboard
            stats={journalData.dashboardStats as any}
            recentEntries={journalData.journalEntries as any}
            behavioralAlerts={journalData.behavioralPatterns as any}
            habitScores={journalData.habitScores as any}
            portfolios={journalData.portfolios as any}
            onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
            onViewEntry={(id) => console.log('View entry:', id)}
            onCreateEntry={() => console.log('Create entry')}
            onViewBehavioralPatterns={() => navigate('/trade-journal/behavioral')}
          />
        )

      case '/trade-journal/entries':
        return (
          <JournalEntries
            entries={journalData.journalEntries as any}
            unjournaledTrades={journalData.unjournaledTrades as any}
            portfolios={journalData.portfolios as any}
            onViewEntry={(id) => console.log('View entry:', id)}
            onEditEntry={(id) => console.log('Edit entry:', id)}
            onDeleteEntry={(id) => console.log('Delete entry:', id)}
            onToggleStar={(id) => console.log('Toggle star:', id)}
            onJournalTrade={(tradeId) => console.log('Journal trade:', tradeId)}
            onPortfolioFilter={(ids) => console.log('Portfolio filter:', ids)}
          />
        )

      case '/trade-journal/analytics':
        return (
          <Analytics
            performanceMetrics={journalData.performanceMetrics as any}
            processScoreAnalytics={journalData.processScoreAnalytics as any}
            attributionData={journalData.attributionData as any}
            portfolios={journalData.portfolios as any}
            onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
            onPeriodChange={(period) => console.log('Period change:', period)}
          />
        )

      case '/trade-journal/behavioral':
        return (
          <BehavioralPatterns
            patterns={journalData.behavioralPatterns as any}
            habitScores={journalData.habitScores as any}
            improvementAreas={journalData.improvementAreas as any}
            onAcknowledgePattern={(id) => console.log('Acknowledge pattern:', id)}
            onPeriodChange={(period) => console.log('Period change:', period)}
          />
        )

      case '/trade-journal/review':
        return (
          <WeeklyReviewComponent
            review={journalData.weeklyReview as any}
            portfolios={journalData.portfolios as any}
            onWeekChange={(week) => console.log('Week change:', week)}
            onViewEntry={(tradeId) => console.log('View entry:', tradeId)}
            onSaveFocus={(items) => console.log('Save focus:', items)}
            onPortfolioFilter={(id) => console.log('Portfolio filter:', id)}
            onViewBehavioralPatterns={() => navigate('/trade-journal/behavioral')}
          />
        )

      case '/settings':
        return (
          <SettingsOverview
            categories={settingsData.settingsCategories as any}
            onNavigateToCategory={(categoryId) => console.log('Navigate to settings:', categoryId)}
          />
        )

      default:
        return (
          <TradingDashboard
            portfolios={tradingCoreData.portfolios as any}
            recentActivity={tradingCoreData.recentActivity as any}
            onReviewApproval={() => navigate('/orders')}
            onCreateOrder={openOrderPanel}
            onViewOrders={() => navigate('/orders')}
            onConnectBroker={() => console.log('Connect broker')}
          />
        )
    }
  }

  // Demo: fire a toast on mount after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      toastRef.current?.({ variant: 'success', message: 'Portfolio sync complete — 12 positions updated' })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AppShell
      navigationGroups={groups}
      user={user}
      brokers={brokers}
      commandItems={commandItems}
      orderPanelContent={<MockOrderForm />}
      banners={banners}
      pageTitle={config.title}
      toastRef={toastRef}
      onNavigate={navigate}
      onLogout={() => console.log('Logout')}
      onEmergencyClose={(filter) => {
        console.log('Emergency close:', filter)
        toastRef.current?.({ variant: 'error', message: `All ${filter} positions closed` })
      }}
      onDismissBanner={(id) => setBanners((prev) => prev.filter((b) => b.id !== id))}
      onSessionExtend={() => {
        console.log('Extend session')
        toastRef.current?.({ variant: 'info', message: 'Session extended for 8 hours' })
      }}
    >
      {renderContent()}
    </AppShell>
  )
}
