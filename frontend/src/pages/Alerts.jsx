import { useState } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle, X, ShieldCheck } from 'lucide-react'
import './Alerts.css'

const INITIAL_ALERTS = [
  { id: 'ALT-003', title: 'Restricted Area Intrusion',   desc: 'Person detected in Admin Block restricted zone. Immediate action required.', time: '14 mins ago', level: 'high',   acknowledged: false },
  { id: 'ALT-002', title: 'Perimeter Breach Detected',   desc: 'Motion detected along North Fence boundary at 19:50.', time: '2h 18m ago', level: 'high',   acknowledged: false },
  { id: 'ALT-001', title: 'Unattended Object — Parking', desc: 'Stationary object detected in Parking Lot B for >10 minutes.', time: '1h 02m ago', level: 'medium', acknowledged: false },
  { id: 'ALT-000', title: 'Camera Offline — Canteen',    desc: 'Camera feed lost. Possible power or network issue.', time: '3h ago',      level: 'low',    acknowledged: true },
]

const ICON = { high: AlertTriangle, medium: Info, low: Info }
const ACCENT = { high: 'danger', medium: 'warning', low: 'info' }

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)

  const handleAcknowledge = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const handleDismiss = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="alerts-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Bell size={22} className="text-amber animate-pulse-ring" />
          <div>
            <h1 className="page-title">Alerts</h1>
            <p className="page-sub">
              {activeAlertsCount} active · {alerts.length} total notifications
            </p>
          </div>
        </div>
        {activeAlertsCount > 0 && (
          <button className="btn btn-ghost" onClick={handleAcknowledgeAll} id="ack-all-alerts">
            Acknowledge All
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="card alerts-empty-state">
          <ShieldCheck size={48} className="text-success empty-state-icon" />
          <h3>System Secured</h3>
          <p>All active alert notifications have been processed and cleared.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => {
            const Icon = ICON[alert.level]
            return (
              <div 
                key={alert.id} 
                className={`alert-card ${alert.acknowledged ? 'alert-card--acked' : ''} alert-card--${ACCENT[alert.level]}`}
              >
                <div className={`alert-icon alert-icon--${ACCENT[alert.level]}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="alert-body">
                  <div className="alert-top">
                    <span className="alert-title">{alert.title}</span>
                    <span className="font-mono text-muted" style={{ fontSize: '11px' }}>{alert.id}</span>
                  </div>
                  <p className="alert-desc">{alert.desc}</p>
                  <div className="alert-footer">
                    <span className="alert-time">{alert.time}</span>
                    {alert.acknowledged ? (
                      <span className="alert-acked">
                        <CheckCircle size={12} /> Acknowledged
                      </span>
                    ) : (
                      <button 
                        className="btn btn-ghost alert-ack-btn" 
                        id={`ack-${alert.id}`}
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Dismiss Action */}
                <button 
                  className="alert-dismiss" 
                  id={`dismiss-${alert.id}`} 
                  onClick={() => handleDismiss(alert.id)}
                  aria-label="Dismiss Alert"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
