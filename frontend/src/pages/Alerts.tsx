import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useToast } from '../components/Toast';
import { usePolling } from '../hooks/usePolling';
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
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraQuery, setCameraQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dismissedIdsRef = useRef<Set<string>>(new Set());
  const mutationVersionRef = useRef(0);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAlerts();
      const filtered = data.filter((a) => !dismissedIdsRef.current.has(a.id));
      setAlerts(filtered);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to retrieve active security alerts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollAlerts = useCallback(async () => {
    const versionAtStart = mutationVersionRef.current;
    const data = await getAlerts();
    // Discard stale in-flight poll response if user performed a mutation while request was in-flight
    if (mutationVersionRef.current !== versionAtStart) return;

    setAlerts((prev) => {
      const activeData = data.filter((a) => !dismissedIdsRef.current.has(a.id));
      const prevAckMap = new Map(prev.map((p) => [p.id, p.acknowledged]));
      return activeData.map((item) => ({
        ...item,
        acknowledged: prevAckMap.has(item.id) ? (prevAckMap.get(item.id) || item.acknowledged) : item.acknowledged,
      }));
    });
  }, []);

  const { isReconnecting } = usePolling({
    intervalMs: 10_000,
    onPoll: pollAlerts,
  });

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleAcknowledge = async (id: string) => {
    mutationVersionRef.current++;
    // Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    try {
      await acknowledgeAlert(id);
      showToast('Alert acknowledged', 'success');
    } catch (err: any) {
      mutationVersionRef.current++;
      // Revert if error
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: false } : a))
      );
      setErrorMessage(err?.message || 'Failed to acknowledge alert.');
      showToast(err?.message || 'Failed to acknowledge alert', 'error');
    }
  };

  const handleDismiss = async (id: string) => {
    mutationVersionRef.current++;
    dismissedIdsRef.current.add(id);
    const backup = [...alerts];
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await dismissAlert(id);
      showToast('Alert dismissed', 'success');
    } catch (err: any) {
      mutationVersionRef.current++;
      dismissedIdsRef.current.delete(id);
      setAlerts(backup);
      setErrorMessage(err?.message || 'Failed to dismiss alert.');
      showToast(err?.message || 'Failed to dismiss alert', 'error');
    }
  };

  const handleAcknowledgeAll = async () => {
    mutationVersionRef.current++;
    const backup = [...alerts];
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    try {
      await acknowledgeAllAlerts();
      showToast('All alerts acknowledged', 'success');
    } catch (err: any) {
      mutationVersionRef.current++;
      setAlerts(backup);
      setErrorMessage(err?.message || 'Failed to acknowledge all alerts.');
      showToast(err?.message || 'Failed to acknowledge all alerts', 'error');
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
              {isReconnecting && (
                <span
                  className="badge badge-warning font-mono"
                  style={{ fontSize: '10px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  role="status"
                >
                  <RefreshCw size={10} className="animate-spin" /> Reconnecting...
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
        <div role="alert" className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
