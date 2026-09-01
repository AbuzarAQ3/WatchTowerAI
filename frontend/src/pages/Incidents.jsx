import { useState } from 'react'
import { ShieldAlert, MapPin, Clock, AlertTriangle, CheckCircle, Search, RotateCcw } from 'lucide-react'
import './Incidents.css'

const INITIAL_INCIDENTS = [
  { id: 'INC-017', type: 'Restricted Area Intrusion', camera: 'Main Gate',     time: '2026-08-24 22:08', severity: 'high',   status: 'open',      confidence: '0.91' },
  { id: 'INC-016', type: 'Unattended Object',          camera: 'Parking Lot B', time: '2026-08-24 21:06', severity: 'medium', status: 'reviewing', confidence: '0.76' },
  { id: 'INC-015', type: 'Perimeter Breach',            camera: 'North Fence',  time: '2026-08-24 19:50', severity: 'high',   status: 'open',      confidence: '0.88' },
  { id: 'INC-014', type: 'Crowd Gathering',             camera: 'Canteen',       time: '2026-08-24 18:33', severity: 'low',    status: 'resolved',  confidence: '0.64' },
  { id: 'INC-013', type: 'Vehicle — Wrong Zone',        camera: 'East Parking',  time: '2026-08-24 17:08', severity: 'medium', status: 'resolved',  confidence: '0.82' },
  { id: 'INC-012', type: 'Restricted Area Intrusion',  camera: 'Admin Block',   time: '2026-08-24 14:22', severity: 'high',   status: 'resolved',  confidence: '0.95' },
]

const SEV_CLASS = { high: 'danger', medium: 'warning', low: 'info' }

export default function Incidents() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleToggleStatus = (id) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        let newStatus = 'open'
        if (inc.status === 'open') newStatus = 'reviewing'
        else if (inc.status === 'reviewing') newStatus = 'resolved'
        else newStatus = 'open'
        return { ...inc, status: newStatus }
      }
      return inc
    }))
  }

  const handleResetFilters = () => {
    setSearch('')
    setSeverityFilter('all')
    setStatusFilter('all')
  }

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.type.toLowerCase().includes(search.toLowerCase()) ||
                          inc.camera.toLowerCase().includes(search.toLowerCase()) ||
                          inc.id.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesStatus
  })

  return (
    <div className="incidents-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <ShieldAlert size={22} className="text-danger animate-pulse-ring" />
          <div>
            <h1 className="page-title">Incidents</h1>
            <p className="page-sub">{incidents.length} events logged · {filteredIncidents.length} filtered</p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="card incidents-filter-panel">
        <div className="filter-item search-box-wrapper">
          <Search size={15} className="filter-search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, type, or camera..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="input search-input"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="severity-filter" className="sr-only">Severity</label>
          <select 
            id="severity-filter"
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input font-mono select-filter"
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status-filter" className="sr-only">Status</label>
          <select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input font-mono select-filter"
          >
            <option value="all">ALL STATUSES</option>
            <option value="open">OPEN</option>
            <option value="reviewing">REVIEWING</option>
            <option value="resolved">RESOLVED</option>
          </select>
        </div>

        <button className="btn btn-ghost reset-filter-btn" onClick={handleResetFilters}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Table grid card */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {filteredIncidents.length === 0 ? (
          <div className="incidents-empty-state">
            <ShieldAlert size={36} className="text-muted" style={{ opacity: 0.5 }} />
            <p>No incidents match the active search and filter constraints.</p>
          </div>
        ) : (
          <table className="incidents-table" id="incidents-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Camera</th>
                <th>Timestamp</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Status (Click to toggle)</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc) => (
                <tr 
                  key={inc.id} 
                  className="incidents-row"
                  onClick={() => handleToggleStatus(inc.id)}
                  title="Click to cycle status: Open -> Reviewing -> Resolved"
                >
                  <td className="font-mono text-muted">{inc.id}</td>
                  <td className="incidents-type">{inc.type}</td>
                  <td>
                    <span className="incidents-camera">
                      <MapPin size={12} /> {inc.camera}
                    </span>
                  </td>
                  <td>
                    <span className="incidents-time font-mono">
                      <Clock size={12} /> {inc.time}
                    </span>
                  </td>
                  <td className="font-mono text-secondary">{inc.confidence}</td>
                  <td><span className={`badge badge-${SEV_CLASS[inc.severity]}`}>{inc.severity}</span></td>
                  <td>
                    <span className={`incidents-status ${inc.status === 'resolved' ? 'incidents-status--ok' : ''}`}>
                      {inc.status === 'resolved' ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                      {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
