import data from '@/../product/sections/alerts/data.json'
import { AlertsDashboard } from './components/AlertsDashboard'

export default function AlertsDashboardPreview() {
  return (
    <AlertsDashboard
      alertStats={data.alertStats}
      alerts={data.alerts}
      recentlyResolved={data.recentlyResolved}
      silences={data.silences}
      routes={data.routes}
      inhibitionRules={data.inhibitionRules}
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
}
