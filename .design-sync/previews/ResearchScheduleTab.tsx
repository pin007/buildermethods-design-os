import { ResearchScheduleTab } from 'trading-squad-ds'
import data from '../../product/sections/market-intelligence/data.json'

const noop = () => {}

export const Default = () => (
  <div style={{ padding: 16 }}>
    <ResearchScheduleTab
      researchJobs={data.researchJobs as any}
      onRunResearchNow={noop}
      onCancelResearch={noop}
      onCreateResearchJob={noop}
      onEditResearchJob={noop}
      onDeleteResearchJob={noop}
      onToggleResearchJob={noop}
      onViewJobRunResults={noop}
    />
  </div>
)
