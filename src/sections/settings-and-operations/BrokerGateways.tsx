import data from '@/../product/sections/settings-and-operations/data.json'
import { BrokerGateways } from './components/BrokerGateways'

const OVERVIEW = '/sections/settings-and-operations/screen-designs/SettingsOverview/fullscreen'

export default function BrokerGatewaysPreview() {
  return (
    <BrokerGateways
      brokers={data.brokerGateways as any}
      onSave={(id, config) => console.log('Save broker:', id, config)}
      onTestConnection={(id) => console.log('Test connection:', id)}
      onToggleEnabled={(id, enabled) => console.log('Toggle broker:', id, enabled)}
      onRevealCredential={(id, field) => console.log('Reveal:', id, field)}
      onRotateCredential={(id, field) => console.log('Rotate:', id, field)}
      onBack={() => { window.location.href = OVERVIEW }}
    />
  )
}
