import { useState } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle, X, ShieldCheck, Search, MapPin } from 'lucide-react'
import './Alerts.css'

const INITIAL_ALERTS = [
  { id: 'ALT-005', title: 'Restricted Area Intrusion',   desc: 'Person detected in Admin Block restricted zone. Immediate action required.', camera: 'Admin Block',   time: '14 mins ago', level: 'high',   acknowledged: false },
  { id: 'ALT-004', title: 'Loitering Detected',          desc: 'Individual stationary near Main Gate entry for over 15 minutes.',              camera: 'Main Gate',     time: '42 mins ago', level: 'medium', acknowledged: false },
  { id: 'ALT-003', title: 'Unattended Object — Parking', desc: 'Stationary object detected in Parking Lot B for >10 minutes.',                 camera: 'Parking Lot B', time: '1h 02m ago',  level: 'medium', acknowledged: false },
  { id: 'ALT-002', title: 'Perimeter Breach Detected',   desc: 'Motion detected along North Fence boundary at 19:50.',                         camera: 'North Fence',   time: '2h 18m ago',  level: 'high',   acknowledged: false },
  { id: 'ALT-001', title: 'Camera Offline — Canteen',    desc: 'Camera feed lost. Possible power or network issue.',                           camera: 'Canteen',       time: '3h ago',      level: 'low',    acknowledged: true },
  { id: 'ALT-000', title: 'Vehicle in Pedestrian Zone',  desc: 'Two-wheeler detected on the walkway outside East Parking.',                    camera: 'East Parking',  time: '4h 30m ago',  level: 'low',    acknowledged: true },
]

const ICON = { high: AlertTriangle, medium: Info, low: Info }
const ACCENT = { high: 'danger', medium: 'warning', low: 'info' }

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [cameraQuery, setCameraQuery] = useState('')

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
  const cameras = [...new Set(alerts.map(a => a.camera))].sort()
  const query = cameraQuery.trim().toLowerCase()
  const filteredAlerts = query
    ? alerts.filter(a => a.camera.toLowerCase().includes(query))
    : alerts

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

      {alerts.length > 0 && (
        <div className="card alerts-filter-panel">
          <div className="alerts-search">
            <Search size={15} className="alerts-search-icon" />
            <input
              type="text"
              placeholder="Filter by camera name..."
              value={cameraQuery}
              onChange={(e) => setCameraQuery(e.target.value)}
              className="input alerts-search-input"
              id="alerts-camera-search"
              aria-label="Filter alerts by camera name"
            />
            {cameraQuery && (
              <button className="alerts-search-clear" onClick={() => setCameraQuery('')} aria-label="Clear camera filter">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="alerts-camera-chips">
            {cameras.map(cam => (
              <button
                key={cam}
                className={`alerts-chip ${cameraQuery === cam ? 'alerts-chip--active' : ''}`}
                onClick={() => setCameraQuery(cameraQuery === cam ? '' : cam)}
              >
                {cam}
              </button>
            ))}
          </div>

          {query && (
            <p className="alerts-filter-count font-mono">
              Showing {filteredAlerts.length} of {alerts.length}
            </p>
          )}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="card alerts-empty-state">
          <ShieldCheck size={48} className="text-success empty-state-icon" />
          <h3>System Secured</h3>
          <p>All active alert notifications have been processed and cleared.</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card alerts-empty-state alerts-empty-state--filter">
          <Search size={36} className="text-muted" />
          <p>No alerts from a camera matching "{cameraQuery}".</p>
          <button className="btn btn-ghost" onClick={() => setCameraQuery('')}>Clear filter</button>
        </div>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map((alert) => {
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
                    <div className="alert-meta">
                      <span className="alert-camera">
                        <MapPin size={12} /> {alert.camera}
                      </span>
                      <span className="alert-time">{alert.time}</span>
                    </div>
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
