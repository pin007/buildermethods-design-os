import { AlertsDashboard } from 'trading-squad-ds'
import data from '../../product/sections/alerts/data.json'

export const Dashboard = () => (
  <div style={{ padding: 16 }}>
    <AlertsDashboard
      alertStats={data.alertStats as any}
      alerts={data.alerts as any}
      recentlyResolved={data.recentlyResolved as any}
      silences={data.silences as any}
      routes={data.routes as any}
      inhibitionRules={data.inhibitionRules as any}
      onAcknowledgeAlert={() => {}}
      onSilenceAlert={() => {}}
      onViewAlertDetail={() => {}}
      onCreateSilence={() => {}}
      onExpireSilence={() => {}}
      onEditSilence={() => {}}
      onToggleRoute={() => {}}
      onEditRoute={() => {}}
      onCreateRoute={() => {}}
      onToggleInhibition={() => {}}
      onEditInhibition={() => {}}
      onCreateInhibition={() => {}}
    />
  </div>
)
