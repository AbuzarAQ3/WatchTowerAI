import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  ShieldCheck,
  Search,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  getAlerts,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  dismissAlert,
} from '../services/alerts';
import { isMockEnabled } from '../services/config';
import type { Alert } from '../types/domain';
import './Alerts.css';

const ICON: Record<string, typeof AlertTriangle> = {
  high: AlertTriangle,
  medium: Info,
  low: Info,
};

const ACCENT: Record<string, string> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraQuery, setCameraQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to retrieve active security alerts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleAcknowledge = async (id: string) => {
    // Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    try {
      await acknowledgeAlert(id);
    } catch (err: any) {
      // Revert if error
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: false } : a))
      );
      setErrorMessage(err?.message || 'Failed to acknowledge alert.');
    }
  };

  const handleDismiss = async (id: string) => {
    const backup = [...alerts];
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await dismissAlert(id);
    } catch (err: any) {
      setAlerts(backup);
      setErrorMessage(err?.message || 'Failed to dismiss alert.');
    }
  };

  const handleAcknowledgeAll = async () => {
    const backup = [...alerts];
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    try {
      await acknowledgeAllAlerts();
    } catch (err: any) {
      setAlerts(backup);
      setErrorMessage(err?.message || 'Failed to acknowledge all alerts.');
    }
  };

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const cameras = [...new Set(alerts.map((a) => a.camera))].sort();
  const query = cameraQuery.trim().toLowerCase();
  const filteredAlerts = query
    ? alerts.filter((a) => a.camera.toLowerCase().includes(query))
    : alerts;

  return (
    <div className="alerts-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Bell size={22} className="text-amber animate-pulse-ring" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="page-title">Alerts</h1>
              {isMockEnabled() && (
                <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  MOCK DATA
                </span>
              )}
            </div>
            <p className="page-sub">
              {isLoading
                ? 'Scanning active priority notifications...'
                : `${activeAlertsCount} active · ${alerts.length} total notifications`}
            </p>
          </div>
        </div>
        {activeAlertsCount > 0 && !isLoading && (
          <button className="btn btn-ghost" onClick={handleAcknowledgeAll} id="ack-all-alerts">
            Acknowledge All
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-danger" />
            <span style={{ fontSize: '13px', color: 'var(--clr-text-secondary)' }}>{errorMessage}</span>
          </div>
          <button className="btn btn-ghost" onClick={loadAlerts} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

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
              <button
                className="alerts-search-clear"
                onClick={() => setCameraQuery('')}
                aria-label="Clear camera filter"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="alerts-camera-chips">
            {cameras.map((cam) => (
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

      {isLoading ? (
        <div className="card alerts-empty-state">
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(245, 158, 11, 0.2)',
              borderTopColor: 'var(--clr-amber, #f59e0b)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '8px', color: 'var(--clr-text-muted)' }}>Synchronizing security alert feed...</p>
        </div>
      ) : alerts.length === 0 ? (
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
            const Icon = ICON[alert.level] || Info;
            const accentClass = ACCENT[alert.level] || 'info';
            return (
              <div
                key={alert.id}
                className={`alert-card ${alert.acknowledged ? 'alert-card--acked' : ''} alert-card--${accentClass}`}
              >
                <div className={`alert-icon alert-icon--${accentClass}`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
