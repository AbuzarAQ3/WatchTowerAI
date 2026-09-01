import { useState } from 'react'
import { Camera, Wifi, WifiOff, Plus, X, ShieldAlert, MonitorPlay } from 'lucide-react'
import './Cameras.css'

const INITIAL_CAMERAS = [
  { id: 1,  name: 'Main Gate',     zone: 'Entry',       ip: '192.168.1.11', fps: 30, status: 'live' },
  { id: 2,  name: 'North Fence',   zone: 'Perimeter',   ip: '192.168.1.12', fps: 25, status: 'live' },
  { id: 3,  name: 'Parking Lot A', zone: 'Parking',     ip: '192.168.1.13', fps: 15, status: 'live' },
  { id: 4,  name: 'Canteen',       zone: 'Interior',    ip: '192.168.1.14', fps: 0,  status: 'offline' },
  { id: 5,  name: 'Library',       zone: 'Interior',    ip: '192.168.1.15', fps: 30, status: 'live' },
  { id: 6,  name: 'Admin Block',   zone: 'Restricted',  ip: '192.168.1.16', fps: 30, status: 'live' },
  { id: 7,  name: 'East Parking',  zone: 'Parking',     ip: '192.168.1.17', fps: 15, status: 'live' },
  { id: 8,  name: 'Parking Lot B', zone: 'Parking',     ip: '192.168.1.18', fps: 15, status: 'maintenance' },
]

export default function Cameras() {
  const [cameras, setCameras] = useState(INITIAL_CAMERAS)
  const [filter, setFilter] = useState('all') // 'all', 'live', 'offline', 'maintenance'
  const [showAddModal, setShowAddModal] = useState(false)
  
  // New Camera Form State
  const [form, setForm] = useState({
    name: '',
    zone: 'Entry',
    ip: '192.168.1.',
    fps: '30',
    status: 'live'
  })
  const [formError, setFormError] = useState('')

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  const handleAddCameraSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.ip || !form.fps) {
      setFormError('Please fill in all fields.')
      return
    }
    
    const newCam = {
      id: Date.now(),
      name: form.name,
      zone: form.zone,
      ip: form.ip,
      fps: parseInt(form.fps) || 0,
      status: form.status
    }

    setCameras(prev => [...prev, newCam])
    setShowAddModal(false)
    
    // Reset Form
    setForm({
      name: '',
      zone: 'Entry',
      ip: '192.168.1.',
      fps: '30',
      status: 'live'
    })
  }

  // Filter list
  const filteredCameras = cameras.filter((cam) => {
    if (filter === 'all') return true
    return cam.status === filter
  })

  const liveCount = cameras.filter((c) => c.status === 'live').length

  return (
    <div className="cameras-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Camera size={22} className="text-cyan animate-pulse-ring" />
          <div>
            <h1 className="page-title">Cameras</h1>
            <p className="page-sub">{liveCount} of {cameras.length} online feeds</p>
          </div>
        </div>
        <button className="btn btn-primary" id="add-camera" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add Camera
        </button>
      </div>

      {/* Filter Deck */}
      <div className="cameras-filters">
        {['all', 'live', 'offline', 'maintenance'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredCameras.length === 0 ? (
        <div className="card cameras-empty-state">
          <ShieldAlert size={36} className="text-muted" style={{ opacity: 0.5 }} />
          <p>No camera feeds found matching the selected status filter.</p>
        </div>
      ) : (
        <div className="cameras-grid">
          {filteredCameras.map((cam) => (
            <div key={cam.id} className={`camera-card ${cam.status !== 'live' ? 'camera-card--dim' : ''}`}>
              <div className="camera-card-preview">
                <Camera size={28} className="camera-card-icon" />
                {cam.status === 'live' && (
                  <>
                    <div className="camera-scanline" />
                    <div className="camera-live-pulse-badge" />
                  </>
                )}
              </div>
              <div className="camera-card-body">
                <div className="camera-card-top">
                  <p className="camera-card-name">{cam.name}</p>
                  <span className={`badge ${
                    cam.status === 'live' 
                      ? 'badge-success' 
                      : cam.status === 'offline' 
                        ? 'badge-danger' 
                        : 'badge-warning'
                  }`}>
                    {cam.status === 'live' ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {cam.status}
                  </span>
                </div>
                <p className="camera-card-zone">{cam.zone}</p>
                <div className="camera-card-meta">
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>{cam.ip}</span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>{cam.fps} fps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Camera Modal Dialog */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card modal-card--sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MonitorPlay size={18} className="text-cyan" />
                <h3 className="modal-title">Register Camera</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCameraSubmit} className="camera-form">
              <div className="form-grid">
                
                <div className="config-group">
                  <label htmlFor="cam-name" className="config-label">Camera Identifier</label>
                  <input
                    id="cam-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Main Lobby B"
                    value={form.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="cam-zone" className="config-label">Surveillance Zone</label>
                  <select
                    id="cam-zone"
                    name="zone"
                    value={form.zone}
                    onChange={handleInputChange}
                    className="input modal-select"
                  >
                    <option value="Entry">Entry (Gates/Doors)</option>
                    <option value="Perimeter">Perimeter (Fences/Outer)</option>
                    <option value="Parking">Parking Zones</option>
                    <option value="Interior">Interior Spaces</option>
                    <option value="Restricted">Restricted Zones</option>
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="cam-ip" className="config-label">IP Address Connection</label>
                  <input
                    id="cam-ip"
                    name="ip"
                    type="text"
                    placeholder="192.168.1.x"
                    value={form.ip}
                    onChange={handleInputChange}
                    className="input font-mono"
                    required
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="cam-fps" className="config-label">Maximum Frame Rate (FPS)</label>
                  <input
                    id="cam-fps"
                    name="fps"
                    type="number"
                    min="1"
                    max="60"
                    placeholder="30"
                    value={form.fps}
                    onChange={handleInputChange}
                    className="input font-mono"
                    required
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="cam-status" className="config-label">Initial Status State</label>
                  <select
                    id="cam-status"
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="input modal-select"
                  >
                    <option value="live">Live (Active Feed)</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

              </div>

              {formError && (
                <div className="form-error-banner font-semibold text-danger">
                  {formError}
                </div>
              )}

              <div className="modal-form-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Connect Camera
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
