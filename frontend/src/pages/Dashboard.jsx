import { useState } from 'react'
import {
  Camera, ShieldAlert, Bell, Activity,
  MapPin, Clock, AlertTriangle, CheckCircle,
  Play, Pause, Maximize2, Eye, EyeOff, X, ShieldCheck
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import StatCard from '../components/StatCard'
import './Dashboard.css'

/* ── Mock data (replace with API calls later) ── */
const STATS = [
  {
    label: 'Cameras Online',
    value: '12',
    sub: '2 offline · 1 maintenance',
    icon: <Camera size={20} strokeWidth={1.8} />,
    accent: 'cyan',
    trend: '12/15',
  },
  {
    label: 'Incidents Today',
    value: '7',
    sub: 'Last: 14 mins ago',
    icon: <ShieldAlert size={20} strokeWidth={1.8} />,
    accent: 'danger',
    trend: '+3 vs yesterday',
  },
  {
    label: 'Active Alerts',
    value: '3',
    sub: '2 high · 1 medium',
    icon: <Bell size={20} strokeWidth={1.8} />,
    accent: 'amber',
    trend: '↑ URGENT',
  },
  {
    label: 'System Health',
    value: '98%',
    sub: 'All services running',
    icon: <Activity size={20} strokeWidth={1.8} />,
    accent: 'success',
    trend: 'Nominal',
  },
]

const INITIAL_INCIDENTS = [
  { id: 'INC-017', type: 'Restricted Area Intrusion', camera: 'Main Gate', time: '14 mins ago', severity: 'high', status: 'open' },
  { id: 'INC-016', type: 'Unattended Object',         camera: 'Parking Lot B', time: '1h 02m ago', severity: 'medium', status: 'reviewing' },
  { id: 'INC-015', type: 'Perimeter Breach',           camera: 'North Fence', time: '2h 18m ago', severity: 'high', status: 'open' },
  { id: 'INC-014', type: 'Crowd Gathering',            camera: 'Canteen',      time: '3h 45m ago', severity: 'low',    status: 'resolved' },
  { id: 'INC-013', type: 'Vehicle — Wrong Zone',       camera: 'East Parking', time: '5h 10m ago', severity: 'medium', status: 'resolved' },
]

const CAMERA_FEEDS = [
  { id: 1, name: 'Main Gate',     zone: 'Entry',       status: 'live', ip: '192.168.1.11', fps: 30 },
  { id: 2, name: 'North Fence',   zone: 'Perimeter',   status: 'live', ip: '192.168.1.12', fps: 25 },
  { id: 3, name: 'Parking Lot A', zone: 'Parking',     status: 'live', ip: '192.168.1.13', fps: 15 },
  { id: 4, name: 'Canteen',       zone: 'Interior',    status: 'offline', ip: '192.168.1.14', fps: 0 },
  { id: 5, name: 'Library',       zone: 'Interior',    status: 'live', ip: '192.168.1.15', fps: 30 },
  { id: 6, name: 'Admin Block',   zone: 'Restricted',  status: 'live', ip: '192.168.1.16', fps: 30 },
]

const CHART_DATA = [
  { time: '00:00', total: 2, high: 0 },
  { time: '04:00', total: 1, high: 0 },
  { time: '08:00', total: 4, high: 1 },
  { time: '12:00', total: 6, high: 2 },
  { time: '16:00', total: 5, high: 1 },
  { time: '20:00', total: 8, high: 3 },
  { time: '24:00', total: 7, high: 2 },
]

// Simulated AI Bounding Box Positions
const AI_BOXES = {
  1: [{ top: '30%', left: '45%', width: '12%', height: '35%', label: 'Person 94%' }],
  2: [{ top: '25%', left: '20%', width: '15%', height: '40%', label: 'Intruder 91%' }],
  3: [{ top: '40%', left: '60%', width: '20%', height: '30%', label: 'Vehicle 88%' }],
  5: [{ top: '35%', left: '30%', width: '10%', height: '28%', label: 'Person 95%' }],
  6: [{ top: '15%', left: '70%', width: '12%', height: '32%', label: 'Intruder 98%' }]
}

const SEVERITY_CLASS = { high: 'danger', medium: 'warning', low: 'info' }

export default function Dashboard() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS)
  const [feeds, setFeeds] = useState(
    CAMERA_FEEDS.map((cam) => ({
      ...cam,
      isPlaying: cam.status === 'live',
      showDetections: cam.status === 'live',
    }))
  )
  const [selectedCamera, setSelectedCamera] = useState(null)
  
  // Custom Modal configuration states
  const [modalSensitivity, setModalSensitivity] = useState(75)
  const [modalDetections, setModalDetections] = useState({
    person: true,
    vehicle: true,
    object: false,
    crowd: true
  })

  const handleTogglePlay = (id, e) => {
    e.stopPropagation()
    setFeeds(prev => prev.map(cam => cam.id === id ? { ...cam, isPlaying: !cam.isPlaying } : cam))
  }

  const handleToggleDetections = (id, e) => {
    e.stopPropagation()
    setFeeds(prev => prev.map(cam => cam.id === id ? { ...cam, showDetections: !cam.showDetections } : cam))
  }

  const handleResolveIncident = (id, e) => {
    e.stopPropagation()
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: inc.status === 'resolved' ? 'open' : 'resolved' } : inc))
  }

  const handleOpenModal = (cam) => {
    if (cam.status === 'offline') return
    setSelectedCamera(cam)
  }

  const handleCloseModal = () => {
    setSelectedCamera(null)
  }

  return (
    <div className="dashboard animate-fade-in">

      {/* Stat Cards */}
      <section className="dashboard-stats" aria-label="System metrics">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      {/* Main grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Cameras & Analytics */}
        <div className="dashboard-main-col">
          
          {/* Camera Overview */}
          <section className="card dashboard-cameras" aria-label="Camera feeds">
            <div className="section-header">
              <div>
                <h2 className="section-title">Camera Feeds</h2>
                <p className="section-sub">Live monitoring overview (Click feed to inspect)</p>
              </div>
              <button className="btn btn-ghost" id="view-all-cameras">View All</button>
            </div>

            <div className="camera-grid">
              {feeds.map((cam) => {
                const boxes = AI_BOXES[cam.id] || []
                return (
                  <div 
                    key={cam.id} 
                    className={`camera-tile ${cam.status === 'offline' ? 'camera-tile--offline' : ''}`}
                    onClick={() => handleOpenModal(cam)}
                  >
                    <div className="camera-tile-preview">
                      {cam.status === 'live' ? (
                        <>
                          {cam.isPlaying ? (
                            <>
                              <div className="camera-scanline" aria-hidden="true" />
                              <div className="camera-corner camera-corner--tl" />
                              <div className="camera-corner camera-corner--tr" />
                              <div className="camera-corner camera-corner--bl" />
                              <div className="camera-corner camera-corner--br" />
                              
                              {/* Simulated AI Detections */}
                              {cam.showDetections && boxes.map((box, idx) => (
                                <div 
                                  key={idx} 
                                  className="camera-ai-box animate-pulse-ring" 
                                  style={{
                                    top: box.top,
                                    left: box.left,
                                    width: box.width,
                                    height: box.height
                                  }}
                                >
                                  <span className="camera-ai-label">{box.label}</span>
                                </div>
                              ))}
                              
                              <Camera size={24} className="camera-tile-icon" />
                            </>
                          ) : (
                            <div className="camera-paused-screen">
                              <div className="camera-static-overlay" />
                              <span className="camera-paused-text">STREAM PAUSED</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="camera-offline-screen">
                          <AlertTriangle size={24} className="camera-tile-offline-icon" />
                          <span className="camera-offline-text">SIGNAL LOST</span>
                        </div>
                      )}
                      
                      <span className={`camera-tile-badge ${cam.status === 'live' && cam.isPlaying ? 'live-dot' : 'camera-offline-dot'}`}>
                        {cam.status === 'live' && !cam.isPlaying ? 'PAUSED' : cam.status.toUpperCase()}
                      </span>

                      {/* Control Overlays (shown on hover) */}
                      {cam.status === 'live' && (
                        <div className="camera-tile-controls">
                          <button 
                            className="camera-control-btn" 
                            onClick={(e) => handleTogglePlay(cam.id, e)}
                            title={cam.isPlaying ? "Pause Feed" : "Play Feed"}
                          >
                            {cam.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <button 
                            className="camera-control-btn" 
                            onClick={(e) => handleToggleDetections(cam.id, e)}
                            title={cam.showDetections ? "Hide AI Detections" : "Show AI Detections"}
                          >
                            {cam.showDetections ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button 
                            className="camera-control-btn" 
                            onClick={() => handleOpenModal(cam)}
                            title="Expand Live Feed"
                          >
                            <Maximize2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="camera-tile-info">
                      <p className="camera-tile-name">{cam.name}</p>
                      <p className="camera-tile-zone">{cam.zone}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Analytics Chart Section */}
          <section className="card dashboard-analytics" aria-label="Incident Analytics">
            <div className="section-header">
              <div>
                <h2 className="section-title">Security Incident Trends</h2>
                <p className="section-sub">Real-time alert rate and threat severity tracking</p>
              </div>
              <div className="analytics-legend">
                <span className="legend-item"><span className="legend-dot legend-dot--total" /> Total Triggers</span>
                <span className="legend-item"><span className="legend-dot legend-dot--high" /> High Severity</span>
              </div>
            </div>

            <div className="chart-container" style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--clr-cyan)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--clr-cyan)" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--clr-danger)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--clr-danger)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--clr-text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--clr-text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--clr-bg-card)', 
                      borderColor: 'var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--clr-text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--clr-cyan)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="high" 
                    stroke="var(--clr-danger)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHigh)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

        </div>

        {/* Right Side: Recent Incidents Column */}
        <section className="card dashboard-incidents" aria-label="Recent incidents">
          <div className="section-header">
            <div>
              <h2 className="section-title">Recent Incidents</h2>
              <p className="section-sub">Last 24 hours log</p>
            </div>
            <button className="btn btn-ghost" id="view-all-incidents">View All</button>
          </div>

          <div className="incidents-list">
            {incidents.map((inc) => (
              <div key={inc.id} className="incident-row">
                <div className={`incident-severity-bar incident-severity-bar--${SEVERITY_CLASS[inc.severity]}`} />
                <div className="incident-body">
                  <div className="incident-top">
                    <span className="font-mono text-muted" style={{ fontSize: 'var(--text-xs)' }}>{inc.id}</span>
                    <span className={`badge badge-${SEVERITY_CLASS[inc.severity]}`}>{inc.severity}</span>
                  </div>
                  <p className="incident-type">{inc.type}</p>
                  
                  <div className="incident-meta">
                    <span className="incident-meta-item">
                      <MapPin size={11} /> {inc.camera}
                    </span>
                    <span className="incident-meta-item">
                      <Clock size={11} /> {inc.time}
                    </span>
                  </div>
                  
                  <div className="incident-row-footer">
                    <span className={`incident-status ${inc.status === 'resolved' ? 'incident-status--resolved' : ''}`}>
                      {inc.status === 'resolved'
                        ? <><CheckCircle size={11} /> Resolved</>
                        : <><AlertTriangle size={11} /> {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}</>
                      }
                    </span>
                    
                    {/* Triage Actions */}
                    <div className="incident-triage-actions">
                      <button 
                        className="btn btn-ghost triage-btn triage-btn--view"
                        onClick={(e) => {
                          e.stopPropagation()
                          const targetCam = feeds.find(c => c.name === inc.camera)
                          if (targetCam) handleOpenModal(targetCam)
                        }}
                        title="View Incident Camera Stream"
                      >
                        Inspect
                      </button>
                      <button 
                        className={`btn ${inc.status === 'resolved' ? 'btn-ghost' : 'btn-danger'} triage-btn`}
                        onClick={(e) => handleResolveIncident(inc.id, e)}
                        title={inc.status === 'resolved' ? "Reopen incident" : "Mark as resolved"}
                      >
                        {inc.status === 'resolved' ? "Reopen" : "Resolve"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Camera Live Stream Zoom Modal */}
      {selectedCamera && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedCamera.name} Feed</h3>
                <p className="modal-subtitle">Zone: {selectedCamera.zone} · IP: {selectedCamera.ip}</p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-grid">
              
              {/* Left Column: Live Feed Preview */}
              <div className="modal-feed-pane">
                <div className="modal-video-container">
                  <div className="camera-scanline" aria-hidden="true" />
                  <div className="camera-corner camera-corner--tl" />
                  <div className="camera-corner camera-corner--tr" />
                  <div className="camera-corner camera-corner--bl" />
                  <div className="camera-corner camera-corner--br" />
                  
                  {/* Bounding box rendering from configuration */}
                  {selectedCamera.showDetections && (AI_BOXES[selectedCamera.id] || []).map((box, idx) => (
                    <div 
                      key={idx} 
                      className="camera-ai-box animate-pulse-ring" 
                      style={{
                        top: box.top,
                        left: box.left,
                        width: box.width,
                        height: box.height
                      }}
                    >
                      <span className="camera-ai-label">{box.label}</span>
                    </div>
                  ))}

                  <Camera size={48} className="modal-video-placeholder-icon" />
                  <div className="modal-live-banner">
                    <span className="live-dot">LIVE STREAMING</span>
                  </div>
                  <div className="modal-fps-counter font-mono">
                    {selectedCamera.fps} FPS · LATENCY: 24ms
                  </div>
                </div>

                {/* Local Actions */}
                <div className="modal-feed-actions">
                  <button 
                    className="btn btn-ghost"
                    onClick={(e) => handleToggleDetections(selectedCamera.id, e)}
                  >
                    {selectedCamera.showDetections ? <EyeOff size={16} /> : <Eye size={16} />}
                    {selectedCamera.showDetections ? "Hide AI Boxes" : "Show AI Boxes"}
                  </button>
                  <button className="btn btn-ghost">
                    Capture Image
                  </button>
                  <button className="btn btn-danger">
                    Trigger Manual Siren
                  </button>
                </div>
              </div>

              {/* Right Column: AI Config Settings */}
              <div className="modal-config-pane">
                <h4 className="config-pane-title">AI Processing Pipeline</h4>
                <div className="modal-divider" />
                
                {/* Confidence Level Slider */}
                <div className="config-group">
                  <div className="config-label-row">
                    <span className="config-label">Detection Sensitivity</span>
                    <span className="config-val font-mono">{modalSensitivity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="95" 
                    value={modalSensitivity} 
                    onChange={(e) => setModalSensitivity(e.target.value)} 
                    className="modal-slider"
                  />
                  <p className="config-help">Minimum model threshold limit to trigger threats.</p>
                </div>

                {/* Detection Classes Toggles */}
                <div className="config-group">
                  <span className="config-label">Active Detection Models</span>
                  <div className="config-checkbox-grid">
                    {Object.keys(modalDetections).map((key) => (
                      <label key={key} className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={modalDetections[key]}
                          onChange={() => setModalDetections(prev => ({ ...prev, [key]: !prev[key] }))}
                        />
                        <span className="checkbox-label capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Model selection */}
                <div className="config-group">
                  <label htmlFor="model-select" className="config-label">Deployment Model</label>
                  <select id="model-select" className="input modal-select font-mono" defaultValue="yolov8x_surveillance">
                    <option value="yolov8n_surveillance">YOLOv8n (Surveillance - Light)</option>
                    <option value="yolov8x_surveillance">YOLOv8x (Surveillance - Full)</option>
                    <option value="custom_perimeter_v2">Custom Perimeter Security v2</option>
                  </select>
                </div>

                <div className="modal-config-footer">
                  <div className="model-deployment-status">
                    <ShieldCheck size={16} className="text-success" />
                    <span>AI Model Active</span>
                  </div>
                  <button className="btn btn-primary" onClick={handleCloseModal}>
                    Apply Settings
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
