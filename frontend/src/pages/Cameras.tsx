import React, { useState, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, Wifi, WifiOff, Plus, X, ShieldAlert, MonitorPlay, AlertTriangle, RefreshCw } from 'lucide-react';
import { getCameras, createCamera } from '../services/cameras';
import { isMockEnabled } from '../services/config';
import { useToast } from '../components/Toast';
import type { Camera } from '../types/domain';
import './Cameras.css';

export default function Cameras() {
  const { showToast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'offline' | 'maintenance'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Camera Form State
  const [form, setForm] = useState({
    name: '',
    zone: 'Entry',
    ip: '192.168.1.',
    fps: '30',
    status: 'live' as 'live' | 'maintenance',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCameras = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getCameras();
      setCameras(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load camera feeds. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleAddCameraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ip || !form.fps) {
      setFormError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const newCam = await createCamera({
        name: form.name,
        zone: form.zone,
        ip: form.ip,
        fps: parseInt(form.fps, 10) || 30,
        status: form.status,
      });

      setCameras((prev) => [...prev, newCam]);
      setShowAddModal(false);
      showToast('Camera added successfully', 'success');
      setForm({
        name: '',
        zone: 'Entry',
        ip: '192.168.1.',
        fps: '30',
        status: 'live',
      });
    } catch (err: any) {
      setFormError(err?.message || 'Failed to register camera. Please try again.');
      showToast(err?.message || 'Failed to add camera', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCameras = cameras.filter((cam) => {
    if (filter === 'all') return true;
    return cam.status === filter;
  });

  const liveCount = cameras.filter((c) => c.status === 'live').length;

  return (
    <div className="cameras-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <CameraIcon size={22} className="text-cyan animate-pulse-ring" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="page-title">Cameras</h1>
              {isMockEnabled() && (
                <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  MOCK DATA
                </span>
              )}
            </div>
            <p className="page-sub">
              {isLoading ? 'Scanning network feeds...' : `${liveCount} of ${cameras.length} online feeds`}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" id="add-camera" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add Camera
        </button>
      </div>

      <div className="cameras-filters">
        {(['all', 'live', 'offline', 'maintenance'] as const).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div role="alert" className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-danger" />
            <span style={{ fontSize: '13px', color: 'var(--clr-text-secondary)' }}>{errorMessage}</span>
          </div>
          <button className="btn btn-ghost" onClick={loadCameras} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card cameras-empty-state">
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(6, 182, 212, 0.2)',
              borderTopColor: 'var(--clr-cyan, #06b6d4)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '8px', color: 'var(--clr-text-muted)' }}>Connecting to camera infrastructure...</p>
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="card cameras-empty-state">
          <ShieldAlert size={36} className="text-muted" style={{ opacity: 0.5 }} />
          <p>No camera feeds found matching the selected status filter.</p>
        </div>
      ) : (
        <div className="cameras-grid">
          {filteredCameras.map((cam) => (
            <div key={cam.id} className={`camera-card ${cam.status !== 'live' ? 'camera-card--dim' : ''}`}>
              <div className="camera-card-preview">
                <CameraIcon size={28} className="camera-card-icon" />
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
                  <span
                    className={`badge ${
                      cam.status === 'live'
                        ? 'badge-success'
                        : cam.status === 'offline'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {cam.status === 'live' ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {cam.status}
                  </span>
                </div>
                <p className="camera-card-zone">{cam.zone}</p>
                <div className="camera-card-meta">
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>
                    {cam.ip}
                  </span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>
                    {cam.fps} fps
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Connecting...' : 'Connect Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
