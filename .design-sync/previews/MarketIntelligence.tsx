import { MarketIntelligence } from 'trading-squad-ds'
import data from '../../product/sections/market-intelligence/data.json'

const noop = () => {}

export const FullScreen = () => (
  <div style={{ padding: 16 }}>
    <MarketIntelligence
      dashboardStats={data.dashboardStats as any}
      recommendations={data.recommendations as any}
      sentimentOverview={data.sentimentOverview as any}
      sectorSentiment={data.sectorSentiment as any}
      topMovers={data.topMovers as any}
      newsArticles={data.newsArticles as any}
      newsSources={data.newsSources as any}
      sentimentWatchlist={data.sentimentWatchlist as any}
      sentimentAlerts={data.sentimentAlerts as any}
      guruTrades={data.guruTrades as any}
      trackedGurus={data.trackedGurus as any}
      guruAlerts={data.guruAlerts as any}
      researchJobs={data.researchJobs as any}
      sectors={data.sectors as any}
      onCreateOrder={noop}
      onDismissRecommendation={noop}
      onSnoozeRecommendation={noop}
      onAnalyzeInstrument={noop}
      onAddToWatchlist={noop}
      onRemoveFromWatchlist={noop}
      onSaveSentimentAlert={noop}
      onDeleteSentimentAlert={noop}
      onToggleSentimentAlert={noop}
      onChangeFinBERTSensitivity={noop}
      onToggleNewsSource={noop}
      onAddNewsSource={noop}
      onRemoveNewsSource={noop}
      onSaveSectorGrouping={noop}
      onCreateSector={noop}
      onDeleteSector={noop}
      onReorderSectors={noop}
      onTimeRangeChange={noop}
      onFollowTrade={noop}
      onAddGuru={noop}
      onRemoveGuru={noop}
      onToggleGuru={noop}
      onEditGuru={noop}
      onSaveGuruAlert={noop}
      onDeleteGuruAlert={noop}
      onToggleGuruAlert={noop}
      onRunResearchNow={noop}
      onCancelResearch={noop}
      onCreateResearchJob={noop}
      onEditResearchJob={noop}
      onDeleteResearchJob={noop}
      onToggleResearchJob={noop}
      onTabChange={noop}
      onViewJobRunResults={noop}
    />
  </div>
)
