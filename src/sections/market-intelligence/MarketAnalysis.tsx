import data from '@/../product/sections/market-intelligence/data.json'
import type {
  Recommendation,
  SentimentOverview,
  SectorSentiment,
  TopMovers,
  NewsArticle,
  NewsSource,
  SentimentWatchlistItem,
  SentimentAlert,
  GuruTrade,
  TrackedGuru,
  GuruAlert,
  ResearchJob,
  Sector,
  DashboardStats,
} from '@/../product/sections/market-intelligence/types'
import { MarketIntelligence } from './components/MarketIntelligence'

export default function MarketAnalysisPreview() {
  return (
    <MarketIntelligence
      dashboardStats={data.dashboardStats as DashboardStats}
      recommendations={data.recommendations as Recommendation[]}
      sentimentOverview={data.sentimentOverview as SentimentOverview}
      sectorSentiment={data.sectorSentiment as SectorSentiment[]}
      topMovers={data.topMovers as TopMovers}
      newsArticles={data.newsArticles as NewsArticle[]}
      newsSources={data.newsSources as NewsSource[]}
      sentimentWatchlist={data.sentimentWatchlist as SentimentWatchlistItem[]}
      sentimentAlerts={data.sentimentAlerts as SentimentAlert[]}
      guruTrades={data.guruTrades as GuruTrade[]}
      trackedGurus={data.trackedGurus as TrackedGuru[]}
      guruAlerts={data.guruAlerts as GuruAlert[]}
      researchJobs={data.researchJobs as ResearchJob[]}
      sectors={data.sectors as Sector[]}
      // Recommendation callbacks
      onCreateOrder={(id) => console.log('Create order from recommendation:', id)}
      onDismissRecommendation={(id) => console.log('Dismiss recommendation:', id)}
      onSnoozeRecommendation={(id) => console.log('Snooze recommendation:', id)}
      onAnalyzeInstrument={(symbol, type) => console.log('Analyze instrument:', symbol, type)}
      // Sentiment callbacks
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
      // Guru callbacks
      onFollowTrade={(id) => console.log('Follow trade:', id)}
      onAddGuru={(guru) => console.log('Add guru:', guru)}
      onRemoveGuru={(id) => console.log('Remove guru:', id)}
      onToggleGuru={(id, enabled) => console.log('Toggle guru:', id, enabled)}
      onEditGuru={(id, updates) => console.log('Edit guru:', id, updates)}
      onSaveGuruAlert={(id, triggers) => console.log('Save guru alert:', id, triggers)}
      onDeleteGuruAlert={(id) => console.log('Delete guru alert:', id)}
      onToggleGuruAlert={(id, enabled) => console.log('Toggle guru alert:', id, enabled)}
      // Research callbacks
      onRunResearchNow={(id, opts) => console.log('Run research:', id, opts)}
      onCancelResearch={(id) => console.log('Cancel research:', id)}
      onCreateResearchJob={(job) => console.log('Create research job:', job)}
      onEditResearchJob={(id, updates) => console.log('Edit research job:', id, updates)}
      onDeleteResearchJob={(id) => console.log('Delete research job:', id)}
      onToggleResearchJob={(id, enabled) => console.log('Toggle research job:', id, enabled)}
      onViewJobRunResults={(runId) => console.log('View job run:', runId)}
      // Navigation
      onTabChange={(tab) => console.log('Tab change:', tab)}
    />
  )
}
