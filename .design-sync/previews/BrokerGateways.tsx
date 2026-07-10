import { BrokerGateways } from 'trading-squad-ds'
import data from '../../product/sections/settings-and-operations/data.json'

const brokers = data.brokerGateways as any[]

export const Default = () => (
  <div style={{ padding: 16 }}>
    <BrokerGateways
      brokers={brokers as any}
      onSave={() => {}}
      onTestConnection={() => {}}
      onToggleEnabled={() => {}}
      onRevealCredential={() => {}}
      onRotateCredential={() => {}}
      onBack={() => {}}
    />
  </div>
)
