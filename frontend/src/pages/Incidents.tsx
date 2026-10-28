import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { getIncidents, updateIncidentStatus } from '../services/incidents';
import { isMockEnabled } from '../services/config';
import type { Incident } from '../types/domain';
import './Incidents.css';

const SEV_CLASS: Record<string, string> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load security incidents log.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleToggleStatus = async (id: string) => {
    const current = incidents.find((i) => i.id === id);
    if (!current) return;

    let newStatus: Incident['status'] = 'open';
    if (current.status === 'open') newStatus = 'reviewing';
    else if (current.status === 'reviewing') newStatus = 'resolved';
    else newStatus = 'open';

    // Optimistic UI update
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );

    try {
      await updateIncidentStatus(id, newStatus);
    } catch (err: any) {
      // Revert if request fails
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: current.status } : inc))
      );
      setErrorMessage(err?.message || 'Failed to update incident status.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSeverityFilter('all');
    setStatusFilter('all');
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.type.toLowerCase().includes(search.toLowerCase()) ||
      inc.camera.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="incidents-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <ShieldAlert size={22} className="text-danger animate-pulse-ring" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="page-title">Incidents</h1>
              {isMockEnabled() && (
                <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  MOCK DATA
                </span>
              )}
            </div>
            <p className="page-sub">
              {isLoading
                ? 'Retrieving incident logs...'
                : `${incidents.length} events logged · ${filteredIncidents.length} filtered`}
            </p>
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

      {errorMessage && (
        <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-danger" />
            <span style={{ fontSize: '13px', color: 'var(--clr-text-secondary)' }}>{errorMessage}</span>
          </div>
          <button className="btn btn-ghost" onClick={loadIncidents} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Table grid card */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {isLoading ? (
          <div className="incidents-empty-state">
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(239, 68, 68, 0.2)',
                borderTopColor: 'var(--clr-danger, #ef4444)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ marginTop: '8px', color: 'var(--clr-text-muted)' }}>Loading security incident records...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
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
                  <td>
                    <span className={`badge badge-${SEV_CLASS[inc.severity] || 'info'}`}>{inc.severity}</span>
                  </td>
                  <td>
                    <span className={`incidents-status ${inc.status === 'resolved' ? 'incidents-status--ok' : ''}`}>
                      {inc.status === 'resolved' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
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
  );
}
