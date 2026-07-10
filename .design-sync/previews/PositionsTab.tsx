import { PositionsTab } from 'trading-squad-ds'
import data from '../../product/sections/portfolio-and-positions/data.json'

export const Populated = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <PositionsTab
      positions={data.positions as any}
      onTradePosition={() => {}}
      onClosePosition={() => {}}
      onSetPositionAlert={() => {}}
      onCreateOrder={() => {}}
    />
  </div>
)

export const Empty = () => (
  <div style={{ padding: 20, maxWidth: 800 }}>
    <PositionsTab
      positions={[] as any}
      onTradePosition={() => {}}
      onClosePosition={() => {}}
      onSetPositionAlert={() => {}}
      onCreateOrder={() => {}}
    />
  </div>
)
