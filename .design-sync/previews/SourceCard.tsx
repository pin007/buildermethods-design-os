import { SourceCard } from 'trading-squad-ds'
import data from '../../product/sections/market-data/data.json'

const sources = data.dataSources as any[]
const connected = sources.find((s) => s.status === 'connected') ?? sources[0]
const degraded = sources.find((s) => s.status === 'degraded') ?? sources[1]

export const Connected = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <SourceCard source={connected as any} onClick={() => {}} />
  </div>
)

export const Degraded = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <SourceCard source={degraded as any} onClick={() => {}} />
  </div>
)

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20, maxWidth: 860 }}>
    {sources.map((s) => (
      <SourceCard key={s.id} source={s as any} onClick={() => {}} />
    ))}
  </div>
)
