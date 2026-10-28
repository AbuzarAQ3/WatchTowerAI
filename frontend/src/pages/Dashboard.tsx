import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera as CameraIcon,
  ShieldAlert,
  Bell,
  Activity,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Maximize2,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/stats';
import { getCameras } from '../services/cameras';
import { getRecentIncidents, updateIncidentStatus } from '../services/incidents';
import { AI_BOXES } from '../services/mock/cameras.mock';
import { isMockEnabled } from '../services/config';
import type { Camera, Incident, StatMetric, IncidentTrendPoint } from '../types/domain';
import './Dashboard.css';

interface DashboardCameraFeed extends Camera {
  isPlaying: boolean;
  showDetections: boolean;
}

const SEVERITY_CLASS: Record<string, string> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

const METRIC_ICONS: Record<string, React.ReactNode> = {
  'Cameras Online': <CameraIcon size={20} strokeWidth={1.8} />,
  'Incidents Today': <ShieldAlert size={20} strokeWidth={1.8} />,
  'Active Alerts': <Bell size={20} strokeWidth={1.8} />,
  'System Health': <Activity size={20} strokeWidth={1.8} />,
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<StatMetric[]>([]);
  const [chartData, setChartData] = useState<IncidentTrendPoint[]>([]);
  const [feeds, setFeeds] = useState<DashboardCameraFeed[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCamera, setSelectedCamera] = useState<DashboardCameraFeed | null>(null);
  const [modalSensitivity, setModalSensitivity] = useState(75);
  const [modalDetections, setModalDetections] = useState({
    person: true,
    vehicle: true,
    object: false,
    crowd: true,
  });

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [statsRes, camsRes, incsRes] = await Promise.all([
        getDashboardStats(),
        getCameras(),
        getRecentIncidents(5),
      ]);

      setMetrics(statsRes.metrics);
      setChartData(statsRes.chartData);
      setFeeds(
        camsRes.map((cam) => ({
          ...cam,
          isPlaying: cam.status === 'live',
          showDetections: cam.status === 'live',
        }))
      );
      setIncidents(incsRes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to synchronize live dashboard feeds.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Local component state toggle for feed stream (Requirement 3)
  const handleTogglePlay = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeeds((prev) =>
      prev.map((cam) => (cam.id === id ? { ...cam, isPlaying: !cam.isPlaying } : cam))
    );
  };

  // Local component state toggle for bounding boxes
  const handleToggleDetections = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeeds((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, showDetections: !cam.showDetections } : cam
      )
    );
  };

  const handleResolveIncident = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = incidents.find((i) => i.id === id);
    if (!current) return;

    const newStatus: Incident['status'] =
      current.status === 'resolved' ? 'open' : 'resolved';

    // Optimistic update
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
      setErrorMessage(err?.message || 'Failed to update incident state.');
    }
  };

  const handleOpenModal = (cam: DashboardCameraFeed) => {
    if (cam.status === 'offline') return;
    setSelectedCamera(cam);
  };

  const handleCloseModal = () => {
    setSelectedCamera(null);
  };

  return (
    <div className="dashboard animate-fade-in">
      {errorMessage && (
        <div
          className="card"
          style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-danger" />
            <span style={{ fontSize: '13px', color: 'var(--clr-text-secondary)' }}>
              {errorMessage}
            </span>
          </div>
          <button
            className="btn btn-ghost"
            onClick={loadDashboardData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <section className="dashboard-stats" aria-label="System metrics">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card" style={{ minHeight: '92px', opacity: 0.6 }}>
                <div
                  style={{
                    height: '14px',
                    width: '40%',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    marginBottom: '12px',
                  }}
                />
                <div
                  style={{
                    height: '24px',
                    width: '30%',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))
          : metrics.map((s) => (
              <StatCard
                key={s.label}
                {...s}
                icon={METRIC_ICONS[s.label] || <Activity size={20} strokeWidth={1.8} />}
              />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className="section-title">Camera Feeds</h2>
                  {isMockEnabled() && (
                    <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      MOCK DATA
                    </span>
                  )}
                </div>
                <p className="section-sub">Live monitoring overview (Click feed to inspect)</p>
              </div>
              <button className="btn btn-ghost" id="view-all-cameras">View All</button>
            </div>

            {isLoading ? (
              <div className="camera-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="camera-tile" style={{ minHeight: '140px', opacity: 0.5 }}>
                    <div className="camera-tile-preview" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <CameraIcon size={24} className="camera-tile-icon" style={{ opacity: 0.3 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : feeds.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                No active camera streams detected.
              </div>
            ) : (
              <div className="camera-grid">
                {feeds.slice(0, 6).map((cam) => {
                  const boxes = AI_BOXES[cam.id] || [];
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
                                {cam.showDetections &&
                                  boxes.map((box, idx) => (
                                    <div
                                      key={idx}
                                      className="camera-ai-box animate-pulse-ring"
                                      style={{
                                        top: box.top,
                                        left: box.left,
                                        width: box.width,
                                        height: box.height,
                                      }}
                                    >
                                      <span className="camera-ai-label">{box.label}</span>
                                    </div>
                                  ))}

                                <CameraIcon size={24} className="camera-tile-icon" />
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

                        <span
                          className={`camera-tile-badge ${
                            cam.status === 'live' && cam.isPlaying
                              ? 'live-dot'
                              : 'camera-offline-dot'
                          }`}
                        >
                          {cam.status === 'live' && !cam.isPlaying
                            ? 'PAUSED'
                            : cam.status.toUpperCase()}
                        </span>

                        {/* Control Overlays (shown on hover) */}
                        {cam.status === 'live' && (
                          <div className="camera-tile-controls">
                            <button
                              className="camera-control-btn"
                              onClick={(e) => handleTogglePlay(cam.id, e)}
                              title={cam.isPlaying ? 'Pause Feed' : 'Play Feed'}
                            >
                              {cam.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <button
                              className="camera-control-btn"
                              onClick={(e) => handleToggleDetections(cam.id, e)}
                              title={
                                cam.showDetections
                                  ? 'Hide AI Detections'
                                  : 'Show AI Detections'
                              }
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
                  );
                })}
              </div>
            )}
          </section>

          {/* Analytics Chart Section */}
          <section className="card dashboard-analytics" aria-label="Incident Analytics">
            <div className="section-header">
              <div>
                <h2 className="section-title">Security Incident Trends</h2>
                <p className="section-sub">Real-time alert rate and threat severity tracking</p>
              </div>
              <div className="analytics-legend">
                <span className="legend-item">
                  <span className="legend-dot legend-dot--total" /> Total Triggers
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-dot--high" /> High Severity
                </span>
              </div>
            </div>

            <div className="chart-container" style={{ width: '100%', height: 220 }}>
              {isLoading ? (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-text-muted)',
                  }}
                >
                  Calculating incident trend telemetry...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--clr-cyan)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--clr-cyan)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--clr-danger)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--clr-danger)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.03)"
                      vertical={false}
                    />
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
                        fontSize: '12px',
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
              )}
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
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                Fetching recent security activity...
              </div>
            ) : incidents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                No recorded incidents in the last 24 hours.
              </div>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="incident-row">
                  <div
                    className={`incident-severity-bar incident-severity-bar--${
                      SEVERITY_CLASS[inc.severity] || 'info'
                    }`}
                  />
                  <div className="incident-body">
                    <div className="incident-top">
                      <span
                        className="font-mono text-muted"
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        {inc.id}
                      </span>
                      <span
                        className={`badge badge-${
                          SEVERITY_CLASS[inc.severity] || 'info'
                        }`}
                      >
                        {inc.severity}
                      </span>
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
                      <span
                        className={`incident-status ${
                          inc.status === 'resolved' ? 'incident-status--resolved' : ''
                        }`}
                      >
                        {inc.status === 'resolved' ? (
                          <>
                            <CheckCircle size={11} /> Resolved
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={11} />{' '}
                            {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                          </>
                        )}
                      </span>

                      {/* Triage Actions */}
                      <div className="incident-triage-actions">
                        <button
                          className="btn btn-ghost triage-btn triage-btn--view"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetCam = feeds.find((c) => c.name === inc.camera);
                            if (targetCam) handleOpenModal(targetCam);
                          }}
                          title="View Incident Camera Stream"
                        >
                          Inspect
                        </button>
                        <button
                          className={`btn ${
                            inc.status === 'resolved' ? 'btn-ghost' : 'btn-danger'
                          } triage-btn`}
                          onClick={(e) => handleResolveIncident(inc.id, e)}
                          title={
                            inc.status === 'resolved'
                              ? 'Reopen incident'
                              : 'Mark as resolved'
                          }
                        >
                          {inc.status === 'resolved' ? 'Reopen' : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                <p className="modal-sub">
                  Zone: {selectedCamera.zone} · IP: {selectedCamera.ip}
                </p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Stream Player */}
            <div className="modal-stream-container">
              <div className="camera-scanline" />
              <div className="camera-corner camera-corner--tl" />
              <div className="camera-corner camera-corner--tr" />
              <div className="camera-corner camera-corner--bl" />
              <div className="camera-corner camera-corner--br" />

              {/* Render Detections inside modal */}
              {selectedCamera.showDetections &&
                (AI_BOXES[selectedCamera.id] || []).map((box, idx) => (
                  <div
                    key={idx}
                    className="camera-ai-box animate-pulse-ring"
                    style={{
                      top: box.top,
                      left: box.left,
                      width: box.width,
                      height: box.height,
                    }}
                  >
                    <span className="camera-ai-label">{box.label}</span>
                  </div>
                ))}

              <div className="modal-stream-placeholder">
                <CameraIcon size={48} className="text-muted" style={{ opacity: 0.3 }} />
                <span className="modal-stream-text">LIVE RTSP STREAM ACTIVE</span>
                <span className="font-mono text-muted" style={{ fontSize: '11px' }}>
                  FPS: {selectedCamera.fps} · Enc: H.264
                </span>
              </div>

              <div className="modal-stream-overlay-info">
                <span className="badge badge-success live-dot">LIVE 1080P</span>
                <span className="font-mono" style={{ fontSize: '11px' }}>
                  SEC-REC ON
                </span>
              </div>
            </div>

            {/* Modal Controls / Diagnostics */}
            <div className="modal-controls">
              <div className="modal-controls-group">
                <span className="modal-controls-label">
                  <ShieldCheck size={14} className="text-cyan" /> Detection Toggles:
                </span>
                {Object.keys(modalDetections).map((type) => (
                  <label key={type} className="toggle-label font-mono">
                    <input
                      type="checkbox"
                      checked={
                        modalDetections[type as keyof typeof modalDetections]
                      }
                      onChange={(e) =>
                        setModalDetections((prev) => ({
                          ...prev,
                          [type]: e.target.checked,
                        }))
                      }
                    />
                    {type.toUpperCase()}
                  </label>
                ))}
              </div>

              <div className="modal-controls-group">
                <span className="modal-controls-label">AI Sensitivity:</span>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={modalSensitivity}
                  onChange={(e) => setModalSensitivity(Number(e.target.value))}
                  className="modal-slider"
                />
                <span className="font-mono text-cyan" style={{ fontSize: '12px' }}>
                  {modalSensitivity}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
