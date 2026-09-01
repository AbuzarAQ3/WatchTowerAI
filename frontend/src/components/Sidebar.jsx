import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  ShieldAlert,
  Bell,
  Settings,
  Eye,
  LogOut,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cameras',   icon: Camera,          label: 'Cameras' },
  { to: '/incidents', icon: ShieldAlert,     label: 'Incidents' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: clear auth token before redirecting
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Eye size={22} strokeWidth={2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">WatchTower</span>
          <span className="sidebar-brand-tag">AI</span>
        </div>
      </div>

      {/* System Status */}
      <div className="sidebar-status">
        <span className="live-dot">LIVE</span>
        <span className="sidebar-status-text">System Active</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Navigation</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">A</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Anuj</p>
            <p className="sidebar-user-role">Frontend Lead</p>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
            id="sidebar-logout"
            aria-label="Logout"
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  )
}
