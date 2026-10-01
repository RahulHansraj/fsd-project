import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Recycle,
  Eye,
  EyeOff,
  ArrowRight,
  Truck,
  BarChart3,
  Leaf,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  Zap
} from 'lucide-react'
import { authService, DEMO_ACCOUNTS } from '../services/authService'
import '../styles/login.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@civiccycle.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Truck,
      title: 'Fleet Intelligence & Routing',
      desc: 'Real-time telemetry, route optimization, and fuel saving for 38 municipal vehicles.',
    },
    {
      icon: BarChart3,
      title: 'Material Recovery Analytics',
      desc: 'Automated optical sorting metrics and diversion tracking across 3 MRF facilities.',
    },
    {
      icon: Leaf,
      title: 'Landfill Gas & ESG Telemetry',
      desc: 'Continuous methane/leachate monitoring with automated compliance reporting.',
    },
    {
      icon: Shield,
      title: 'Google Gemini 3.8 Copilot',
      desc: 'Proactive incident resolution and route reassignments powered by AI.',
    },
  ]

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (authService.isAuthenticated()) {
      // User can remain or re-login
    }

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [features.length])

  const handleSelectDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setIsLoading(true)

    try {
      await authService.login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-shell">
      {/* ── Ambient Background Glows ── */}
      <div className="login-particles">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`particle p-${i}`} />
        ))}
      </div>

      {/* ── Left Hero Panel ── */}
      <aside className="login-hero">
        <div className="hero-content">
          <div className="hero-brand">
            <span className="hero-brand-mark">
              <Recycle size={22} />
            </span>
            <strong>CivicCycle</strong>
            <span className="hero-version-tag">Cloud v2.4</span>
          </div>

          <h1 className="hero-headline">
            Municipal waste operations,{' '}
            <span className="hero-accent">reimagined.</span>
          </h1>

          <p className="hero-sub">
            San Francisco's unified zero-waste intelligence platform. Monitor smart bin fills, dispatch reserve fleets, and track MRF diversion in real time.
          </p>

          <div className="hero-features">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`hero-feature ${i === activeFeature ? 'active' : ''}`}
                  onClick={() => setActiveFeature(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="feature-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hero-stats">
            <div>
              <strong>38</strong>
              <span>Active vehicles</span>
            </div>
            <div className="hero-stat-divider" />
            <div>
              <strong>94.2%</strong>
              <span>Diversion rate</span>
            </div>
            <div className="hero-stat-divider" />
            <div>
              <strong>418.2 t</strong>
              <span>Daily intake</span>
            </div>
          </div>
        </div>

        <div className="hero-mesh" />
      </aside>

      {/* ── Right Login Form ── */}
      <section className="login-form-panel">
        <div className="form-wrapper">
          {/* Mobile brand (visible on smaller screens) */}
          <div className="mobile-brand">
            <span className="hero-brand-mark">
              <Recycle size={18} />
            </span>
            <strong>CivicCycle</strong>
          </div>

          <div className="form-head">
            <span className="form-badge">
              <Sparkles size={12} />
              Operations Command Portal
            </span>
            <h2>Sign in to CivicCycle</h2>
            <p>Access citywide waste streams, fleet dispatch & AI assistant</p>
          </div>

          {/* Quick Demo Accounts Selector */}
          <div className="demo-accounts-box">
            <div className="demo-header">
              <Zap size={14} className="demo-icon" />
              <span>Quick Demo Role Select:</span>
            </div>
            <div className="demo-chips">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className={`demo-chip ${email === acc.email ? 'active' : ''}`}
                  onClick={() => handleSelectDemo(acc)}
                  title={`Click to fill ${acc.name} (${acc.role})`}
                >
                  <span className="demo-chip-avatar">{acc.avatar}</span>
                  <div className="demo-chip-text">
                    <strong>{acc.name}</strong>
                    <small>{acc.role.split(' ')[0]}</small>
                  </div>
                  {email === acc.email && <CheckCircle2 size={13} className="chip-check" />}
                </button>
              ))}
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="login-email">Municipal Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-leading-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@civiccycle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="login-password">Password</label>
                <button 
                  type="button" 
                  className="forgot-link"
                  onClick={() => setError('Contact SF Department of Environment for credential reset.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon password-wrap">
                <Lock size={16} className="input-leading-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkmark" />
                Keep session authenticated (MongoDB Cloud Sync)
              </label>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="form-divider">
            <span>secure access</span>
          </div>

          <div className="security-guarantee">
            <Shield size={14} />
            <span>256-Bit TLS Encryption • Azure & MongoDB Atlas Protected</span>
          </div>
        </div>
      </section>
    </div>
  )
}
