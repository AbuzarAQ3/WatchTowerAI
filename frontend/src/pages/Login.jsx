import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye as EyeIcon, EyeOff, Lock, User, ShieldCheck } from 'lucide-react'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    // TODO: Replace with real API call → POST /api/auth/login/
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div className="login-page">
      {/* Animated background grid */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg-grid" />
        <div className="login-bg-glow login-bg-glow--amber" />
        <div className="login-bg-glow login-bg-glow--cyan" />
      </div>

      <div className="login-card animate-fade-in">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <ShieldCheck size={28} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="login-title">WatchTower<span className="login-title-ai">AI</span></h1>
            <p className="login-subtitle">Security Operations Centre</p>
          </div>
        </div>

        <div className="login-divider" />

        <p className="login-heading">Sign In</p>
        <p className="login-desc">Authorized personnel only. All access is logged.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" id="login-form" noValidate>
          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username" className="login-label">Username</label>
            <div className="login-input-wrapper">
              <User size={16} className="login-input-icon" />
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                className="input login-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Password</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="input login-input"
              />
              <button
                type="button"
                className="login-toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                id="toggle-password"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-loading">
                <span className="login-spinner" />
                Authenticating...
              </span>
            ) : 'Access Dashboard'}
          </button>
        </form>

        <p className="login-footer">
          WatchTowerAI · 7th Sem Minor Project · College Security System
        </p>
      </div>
    </div>
  )
}
