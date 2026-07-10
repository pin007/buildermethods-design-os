import { PerformanceTab } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

export const Populated = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <PerformanceTab
      benchmarkComparison={data.benchmarkComparison as any}
      marginInfo={data.marginInfo as any}
      onChangeBenchmark={() => {}}
      onChangeBenchmarkPeriod={() => {}}
    />
  </div>
)
