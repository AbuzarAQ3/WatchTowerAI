import { useState } from 'react'
import {
  Settings as SettingsIcon, Shield, Bell, Camera,
  Brain, User, Save, RotateCcw, Check, ChevronRight,
  Monitor, Wifi, AlertTriangle, Database, Key, Sliders
} from 'lucide-react'
import './Settings.css'

const SECTION_NAV = [
  { id: 'ai',       label: 'AI & Detection',   icon: Brain },
  { id: 'cameras',  label: 'Camera Defaults',  icon: Camera },
  { id: 'alerts',   label: 'Alerts & Notifs',  icon: Bell },
  { id: 'security', label: 'Security & Auth',  icon: Shield },
  { id: 'system',   label: 'System Info',      icon: Monitor },
  { id: 'profile',  label: 'Profile',          icon: User },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('ai')
  const [saved, setSaved] = useState(false)

  // AI Detection settings
  const [aiSettings, setAiSettings] = useState({
    globalSensitivity: 78,
    model: 'yolov8x_surveillance',
    detectPerson: true,
    detectVehicle: true,
    detectObject: false,
    detectCrowd: true,
    detectWeapon: true,
    minConfidence: 0.65,
    processingFps: 15,
    gpuAcceleration: true,
  })

  // Camera defaults
  const [camSettings, setCamSettings] = useState({
    defaultFps: 30,
    resolution: '1080p',
    nightVision: true,
    motionDetection: true,
    retentionDays: 30,
    compressionLevel: 'balanced',
    autoReconnect: true,
  })

  // Alerts settings
  const [alertSettings, setAlertSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    soundAlerts: true,
    desktopNotifs: true,
    cooldownMinutes: 5,
    escalationEnabled: true,
    escalationDelay: 15,
  })

  // Security settings
  const [secSettings, setSecSettings] = useState({
    sessionTimeout: 60,
    twoFactor: false,
    ipWhitelist: '192.168.1.0/24',
    auditLog: true,
    apiKeyVisible: false,
    apiKey: 'wtai-xK92m-89Pq4-••••••••',
  })

  // Profile
  const [profile, setProfile] = useState({
    name: 'Anuj',
    role: 'Frontend Lead',
    email: 'anuj@watchtowerai.local',
    department: 'Computer Science',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggleAI = (key) => setAiSettings(p => ({ ...p, [key]: !p[key] }))
  const toggleCam = (key) => setCamSettings(p => ({ ...p, [key]: !p[key] }))
  const toggleAlert = (key) => setAlertSettings(p => ({ ...p, [key]: !p[key] }))
  const toggleSec = (key) => setSecSettings(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="settings-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <SettingsIcon size={22} className="text-amber animate-pulse-ring" />
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-sub">System configuration and preferences</p>
          </div>
        </div>
        <button
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
          id="save-settings"
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      <div className="settings-layout">
        {/* Side Navigation */}
        <nav className="settings-nav card" aria-label="Settings navigation">
          {SECTION_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-nav-item ${activeSection === id ? 'settings-nav-item--active' : ''}`}
              onClick={() => setActiveSection(id)}
              id={`settings-nav-${id}`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
              <ChevronRight size={14} className="settings-nav-chevron" />
            </button>
          ))}
        </nav>

        {/* Main Panel */}
        <div className="settings-main card animate-fade-in" key={activeSection}>

          {/* ── AI & Detection ── */}
          {activeSection === 'ai' && (
            <section>
              <div className="settings-section-header">
                <Brain size={20} className="text-cyan" />
                <div>
                  <h2 className="settings-section-title">AI & Detection</h2>
                  <p className="settings-section-sub">Configure the AI threat detection pipeline</p>
                </div>
              </div>

              <div className="settings-groups">
                <div className="settings-group">
                  <label className="settings-label">
                    <Sliders size={14} />
                    Global Detection Sensitivity
                  </label>
                  <div className="settings-slider-row">
                    <input
                      type="range" min="10" max="95"
                      value={aiSettings.globalSensitivity}
                      onChange={(e) => setAiSettings(p => ({ ...p, globalSensitivity: +e.target.value }))}
                      className="modal-slider"
                      id="global-sensitivity"
                    />
                    <span className="settings-slider-val font-mono">{aiSettings.globalSensitivity}%</span>
                  </div>
                  <p className="config-help">Higher values = more alerts but possible false positives.</p>
                </div>

                <div className="settings-group">
                  <label htmlFor="ai-model-select" className="settings-label">
                    <Database size={14} />
                    Deployed AI Model
                  </label>
                  <select
                    id="ai-model-select"
                    className="input modal-select font-mono"
                    value={aiSettings.model}
                    onChange={(e) => setAiSettings(p => ({ ...p, model: e.target.value }))}
                  >
                    <option value="yolov8n_surveillance">YOLOv8n — Surveillance Light (Fast)</option>
                    <option value="yolov8x_surveillance">YOLOv8x — Surveillance Full (Recommended)</option>
                    <option value="custom_perimeter_v2">Custom Perimeter Security v2</option>
                    <option value="crowd_analyst_v1">Crowd Analyst v1 (Beta)</option>
                  </select>
                </div>

                <div className="settings-group">
                  <span className="settings-label">Active Detection Classes</span>
                  <div className="settings-toggle-grid">
                    {[
                      ['detectPerson', 'Person Detection'],
                      ['detectVehicle', 'Vehicle Detection'],
                      ['detectObject', 'Unattended Object'],
                      ['detectCrowd', 'Crowd Gathering'],
                      ['detectWeapon', 'Weapon Detection'],
                    ].map(([key, label]) => (
                      <label key={key} className="settings-toggle-row">
                        <div className="toggle-info">
                          <span className="toggle-label">{label}</span>
                        </div>
                        <div
                          className={`toggle-switch ${aiSettings[key] ? 'toggle-switch--on' : ''}`}
                          onClick={() => toggleAI(key)}
                          id={`toggle-${key}`}
                          role="switch"
                          aria-checked={aiSettings[key]}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Processing Frame Rate</label>
                  <div className="settings-slider-row">
                    <input
                      type="range" min="5" max="30"
                      value={aiSettings.processingFps}
                      onChange={(e) => setAiSettings(p => ({ ...p, processingFps: +e.target.value }))}
                      className="modal-slider"
                      id="processing-fps"
                    />
                    <span className="settings-slider-val font-mono">{aiSettings.processingFps} fps</span>
                  </div>
                  <p className="config-help">Frames sent to the AI model per second. Higher = better detection but more CPU/GPU load.</p>
                </div>

                <label className="settings-toggle-row settings-toggle-row--card">
                  <div className="toggle-info">
                    <span className="toggle-label">GPU Acceleration</span>
                    <span className="toggle-sub">Use CUDA/MPS for faster inference</span>
                  </div>
                  <div
                    className={`toggle-switch ${aiSettings.gpuAcceleration ? 'toggle-switch--on' : ''}`}
                    onClick={() => toggleAI('gpuAcceleration')}
                    id="toggle-gpu"
                    role="switch"
                    aria-checked={aiSettings.gpuAcceleration}
                  />
                </label>
              </div>
            </section>
          )}

          {/* ── Camera Defaults ── */}
          {activeSection === 'cameras' && (
            <section>
              <div className="settings-section-header">
                <Camera size={20} className="text-cyan" />
                <div>
                  <h2 className="settings-section-title">Camera Defaults</h2>
                  <p className="settings-section-sub">Default settings applied to newly connected cameras</p>
                </div>
              </div>

              <div className="settings-groups">
                <div className="settings-row-two">
                  <div className="settings-group">
                    <label htmlFor="default-fps" className="settings-label">Default FPS</label>
                    <input
                      id="default-fps"
                      type="number" min="1" max="60"
                      value={camSettings.defaultFps}
                      onChange={(e) => setCamSettings(p => ({ ...p, defaultFps: +e.target.value }))}
                      className="input font-mono"
                    />
                  </div>
                  <div className="settings-group">
                    <label htmlFor="resolution-select" className="settings-label">Resolution</label>
                    <select
                      id="resolution-select"
                      value={camSettings.resolution}
                      onChange={(e) => setCamSettings(p => ({ ...p, resolution: e.target.value }))}
                      className="input modal-select font-mono"
                    >
                      <option value="480p">480p</option>
                      <option value="720p">720p HD</option>
                      <option value="1080p">1080p Full HD</option>
                      <option value="4k">4K Ultra HD</option>
                    </select>
                  </div>
                </div>

                <div className="settings-row-two">
                  <div className="settings-group">
                    <label htmlFor="retention-days" className="settings-label">Footage Retention (days)</label>
                    <input
                      id="retention-days"
                      type="number" min="1" max="365"
                      value={camSettings.retentionDays}
                      onChange={(e) => setCamSettings(p => ({ ...p, retentionDays: +e.target.value }))}
                      className="input font-mono"
                    />
                  </div>
                  <div className="settings-group">
                    <label htmlFor="compression-select" className="settings-label">Compression</label>
                    <select
                      id="compression-select"
                      value={camSettings.compressionLevel}
                      onChange={(e) => setCamSettings(p => ({ ...p, compressionLevel: e.target.value }))}
                      className="input modal-select"
                    >
                      <option value="low">Low (Best Quality)</option>
                      <option value="balanced">Balanced</option>
                      <option value="high">High (Saves Space)</option>
                    </select>
                  </div>
                </div>

                {[
                  ['nightVision', 'Enable Night Vision (IR mode)', 'Auto-enables IR mode when ambient light is low'],
                  ['motionDetection', 'Motion-Triggered Recording', 'Only record when motion is detected (saves storage)'],
                  ['autoReconnect', 'Auto-Reconnect on Disconnect', 'Automatically attempt to reconnect a dropped camera feed'],
                ].map(([key, label, sub]) => (
                  <label key={key} className="settings-toggle-row settings-toggle-row--card">
                    <div className="toggle-info">
                      <span className="toggle-label">{label}</span>
                      <span className="toggle-sub">{sub}</span>
                    </div>
                    <div
                      className={`toggle-switch ${camSettings[key] ? 'toggle-switch--on' : ''}`}
                      onClick={() => toggleCam(key)}
                      id={`toggle-cam-${key}`}
                      role="switch"
                      aria-checked={camSettings[key]}
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* ── Alerts & Notifications ── */}
          {activeSection === 'alerts' && (
            <section>
              <div className="settings-section-header">
                <Bell size={20} className="text-amber" />
                <div>
                  <h2 className="settings-section-title">Alerts & Notifications</h2>
                  <p className="settings-section-sub">Control how and when you receive security alerts</p>
                </div>
              </div>

              <div className="settings-groups">
                {[
                  ['emailAlerts',   'Email Alerts',         'Send incident alerts to registered email address'],
                  ['smsAlerts',     'SMS Alerts',           'Send critical alerts via SMS (requires gateway config)'],
                  ['soundAlerts',   'Sound Alerts',         'Play audio alarm when high-severity incident is detected'],
                  ['desktopNotifs', 'Desktop Notifications','Browser push notifications for new incidents'],
                  ['escalationEnabled', 'Auto Escalation',  'Escalate unacknowledged alerts to supervisor after a delay'],
                ].map(([key, label, sub]) => (
                  <label key={key} className="settings-toggle-row settings-toggle-row--card">
                    <div className="toggle-info">
                      <span className="toggle-label">{label}</span>
                      <span className="toggle-sub">{sub}</span>
                    </div>
                    <div
                      className={`toggle-switch ${alertSettings[key] ? 'toggle-switch--on' : ''}`}
                      onClick={() => toggleAlert(key)}
                      id={`toggle-alert-${key}`}
                      role="switch"
                      aria-checked={alertSettings[key]}
                    />
                  </label>
                ))}

                <div className="settings-row-two">
                  <div className="settings-group">
                    <label htmlFor="cooldown-minutes" className="settings-label">Alert Cooldown (minutes)</label>
                    <input
                      id="cooldown-minutes"
                      type="number" min="1" max="60"
                      value={alertSettings.cooldownMinutes}
                      onChange={(e) => setAlertSettings(p => ({ ...p, cooldownMinutes: +e.target.value }))}
                      className="input font-mono"
                    />
                    <p className="config-help">Minimum time between repeated alerts for the same camera/type.</p>
                  </div>
                  <div className="settings-group">
                    <label htmlFor="escalation-delay" className="settings-label">Escalation Delay (minutes)</label>
                    <input
                      id="escalation-delay"
                      type="number" min="5" max="120"
                      value={alertSettings.escalationDelay}
                      onChange={(e) => setAlertSettings(p => ({ ...p, escalationDelay: +e.target.value }))}
                      className="input font-mono"
                      disabled={!alertSettings.escalationEnabled}
                    />
                    <p className="config-help">Time before an unacknowledged alert is escalated.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Security & Auth ── */}
          {activeSection === 'security' && (
            <section>
              <div className="settings-section-header">
                <Shield size={20} className="text-danger" />
                <div>
                  <h2 className="settings-section-title">Security & Auth</h2>
                  <p className="settings-section-sub">Access control, API keys, and audit log settings</p>
                </div>
              </div>

              <div className="settings-groups">
                <div className="settings-group">
                  <label htmlFor="session-timeout" className="settings-label">
                    <Key size={14} /> Session Timeout (minutes)
                  </label>
                  <input
                    id="session-timeout"
                    type="number" min="10" max="480"
                    value={secSettings.sessionTimeout}
                    onChange={(e) => setSecSettings(p => ({ ...p, sessionTimeout: +e.target.value }))}
                    className="input font-mono"
                  />
                  <p className="config-help">Auto logout after inactivity period.</p>
                </div>

                <label className="settings-toggle-row settings-toggle-row--card">
                  <div className="toggle-info">
                    <span className="toggle-label">Two-Factor Authentication</span>
                    <span className="toggle-sub">Require OTP for each login session</span>
                  </div>
                  <div
                    className={`toggle-switch ${secSettings.twoFactor ? 'toggle-switch--on' : ''}`}
                    onClick={() => toggleSec('twoFactor')}
                    id="toggle-2fa"
                    role="switch"
                    aria-checked={secSettings.twoFactor}
                  />
                </label>

                <label className="settings-toggle-row settings-toggle-row--card">
                  <div className="toggle-info">
                    <span className="toggle-label">Audit Log</span>
                    <span className="toggle-sub">Record all user actions and system events</span>
                  </div>
                  <div
                    className={`toggle-switch ${secSettings.auditLog ? 'toggle-switch--on' : ''}`}
                    onClick={() => toggleSec('auditLog')}
                    id="toggle-audit"
                    role="switch"
                    aria-checked={secSettings.auditLog}
                  />
                </label>

                <div className="settings-group">
                  <label htmlFor="ip-whitelist" className="settings-label">
                    <Wifi size={14} /> IP Whitelist (CIDR)
                  </label>
                  <input
                    id="ip-whitelist"
                    type="text"
                    value={secSettings.ipWhitelist}
                    onChange={(e) => setSecSettings(p => ({ ...p, ipWhitelist: e.target.value }))}
                    className="input font-mono"
                    placeholder="e.g. 192.168.1.0/24"
                  />
                  <p className="config-help">Only allow access from these IP ranges. Leave blank to allow all.</p>
                </div>

                <div className="settings-group">
                  <span className="settings-label"><Key size={14} /> API Key</span>
                  <div className="api-key-row">
                    <input
                      id="api-key-display"
                      type={secSettings.apiKeyVisible ? 'text' : 'password'}
                      value={secSettings.apiKey}
                      readOnly
                      className="input font-mono"
                    />
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSecSettings(p => ({ ...p, apiKeyVisible: !p.apiKeyVisible }))}
                      id="toggle-api-key"
                    >
                      {secSettings.apiKeyVisible ? 'Hide' : 'Reveal'}
                    </button>
                    <button className="btn btn-danger" id="regenerate-api-key">
                      <RotateCcw size={13} /> Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── System Info ── */}
          {activeSection === 'system' && (
            <section>
              <div className="settings-section-header">
                <Monitor size={20} className="text-cyan" />
                <div>
                  <h2 className="settings-section-title">System Information</h2>
                  <p className="settings-section-sub">Runtime status and build information</p>
                </div>
              </div>

              <div className="settings-groups">
                <div className="sysinfo-grid">
                  {[
                    ['Application',    'WatchTowerAI v0.1.0'],
                    ['Environment',    'Development'],
                    ['Backend',        'Django 5.x (REST Framework)'],
                    ['AI Engine',      'YOLOv8x Surveillance Model'],
                    ['Database',       'SQLite (dev) / PostgreSQL (prod)'],
                    ['RTSP Server',    'OpenCV + GStreamer'],
                    ['GPU',            'CUDA 12.x (if available)'],
                    ['Build Date',     '2026-08-28'],
                    ['Frontend',       'React 19 + Vite 6'],
                    ['CSS Framework',  'Vanilla CSS (WatchTowerAI Design System)'],
                  ].map(([key, val]) => (
                    <div key={key} className="sysinfo-row">
                      <span className="sysinfo-key font-mono">{key}</span>
                      <span className="sysinfo-val">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="sysinfo-health-cards">
                  <div className="health-card health-card--success">
                    <span className="health-label">Backend API</span>
                    <span className="health-status"><span className="live-dot" />Online</span>
                  </div>
                  <div className="health-card health-card--success">
                    <span className="health-label">AI Model</span>
                    <span className="health-status"><span className="live-dot" />Loaded</span>
                  </div>
                  <div className="health-card health-card--warning">
                    <span className="health-label">RTSP Server</span>
                    <span className="health-status"><AlertTriangle size={10} />Simulated</span>
                  </div>
                  <div className="health-card health-card--success">
                    <span className="health-label">Database</span>
                    <span className="health-status"><span className="live-dot" />Connected</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Profile ── */}
          {activeSection === 'profile' && (
            <section>
              <div className="settings-section-header">
                <User size={20} className="text-amber" />
                <div>
                  <h2 className="settings-section-title">Profile</h2>
                  <p className="settings-section-sub">Your account details and preferences</p>
                </div>
              </div>

              <div className="settings-groups">
                <div className="profile-avatar-row">
                  <div className="profile-avatar">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="profile-name">{profile.name}</p>
                    <p className="profile-role">{profile.role}</p>
                  </div>
                </div>

                <div className="settings-row-two">
                  <div className="settings-group">
                    <label htmlFor="profile-name" className="settings-label">Full Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="settings-group">
                    <label htmlFor="profile-role" className="settings-label">Role</label>
                    <input
                      id="profile-role"
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="settings-row-two">
                  <div className="settings-group">
                    <label htmlFor="profile-email" className="settings-label">Email</label>
                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="settings-group">
                    <label htmlFor="profile-dept" className="settings-label">Department</label>
                    <input
                      id="profile-dept"
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile(p => ({ ...p, department: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="settings-group">
                  <label htmlFor="profile-new-password" className="settings-label">New Password</label>
                  <input
                    id="profile-new-password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="input"
                  />
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
