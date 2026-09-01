import { useState, useEffect, useRef } from 'react'
import { Bell, Search, X, Settings, LayoutDashboard, Camera, ShieldAlert } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import './TopBar.css'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of live security status' },
  '/cameras':   { title: 'Cameras',   sub: 'Manage and monitor camera feeds' },
  '/incidents': { title: 'Incidents', sub: 'Detected security events log' },
  '/alerts':    { title: 'Alerts',    sub: 'Active and recent system alerts' },
  '/settings':  { title: 'Settings',  sub: 'System configuration and preferences' },
}

const QUICK_LINKS = [
  { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Cameras',    path: '/cameras',     icon: Camera },
  { label: 'Incidents',  path: '/incidents',   icon: ShieldAlert },
  { label: 'Alerts',     path: '/alerts',      icon: Bell },
  { label: 'Settings',   path: '/settings',    icon: Settings },
]

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const page = PAGE_TITLES[pathname] ?? { title: 'WatchTowerAI', sub: '' }

  const [now, setNow] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    const formatTime = () => {
      setNow(new Date().toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }))
    }
    formatTime()
    const interval = setInterval(formatTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close search on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const filteredLinks = QUICK_LINKS.filter(l =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNavigate = (path) => {
    navigate(path)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">{page.title}</h1>
          {page.sub && <p className="topbar-sub">{page.sub}</p>}
        </div>

        <div className="topbar-right">
          <div className="topbar-time font-mono">{now}</div>

          <button
            className={`topbar-btn ${searchOpen ? 'topbar-btn--active' : ''}`}
            id="topbar-search"
            aria-label="Search"
            onClick={() => setSearchOpen(v => !v)}
          >
            <Search size={17} strokeWidth={2} />
          </button>

          <button className="topbar-btn topbar-bell" id="topbar-alerts" aria-label="Alerts" onClick={() => navigate('/alerts')}>
            <Bell size={17} strokeWidth={2} />
            <span className="topbar-notif">3</span>
          </button>

          <div className="topbar-divider" />

          <div className="topbar-system">
            <span className="badge badge-success">
              <span className="topbar-dot" />
              Online
            </span>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="topbar-search-overlay animate-fade-in" onClick={() => setSearchOpen(false)}>
          <div className="topbar-search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="topbar-search-input-row">
              <Search size={16} className="topbar-search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search pages, cameras, incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="topbar-search-input"
                id="global-search-input"
              />
              <button className="topbar-search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={16} />
              </button>
            </div>
            <div className="topbar-search-results">
              <p className="topbar-search-category">Quick Navigation</p>
              {filteredLinks.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  className="topbar-search-result-row"
                  onClick={() => handleNavigate(path)}
                  id={`search-result-${path.slice(1)}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{label}</span>
                  <span className="topbar-search-result-path font-mono">{path}</span>
                </button>
              ))}
              {filteredLinks.length === 0 && (
                <p className="topbar-search-empty">No results found for "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
