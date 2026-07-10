import { SentimentTab } from 'trading-squad-ds'
import data from '../../product/sections/market-intelligence/data.json'

const noop = () => {}

export const Default = () => (
  <div style={{ padding: 16 }}>
    <SentimentTab
      sentimentOverview={data.sentimentOverview as any}
      sectorSentiment={data.sectorSentiment as any}
      topMovers={data.topMovers as any}
      newsArticles={data.newsArticles as any}
      newsSources={data.newsSources as any}
      sentimentWatchlist={data.sentimentWatchlist as any}
      sentimentAlerts={data.sentimentAlerts as any}
      sectors={data.sectors as any}
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
      onAnalyzeInstrument={noop}
    />
  </div>
)
