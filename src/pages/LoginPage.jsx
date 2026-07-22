import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, User, AlertCircle, LogIn, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // If the user was redirected here from a protected route, remember where to send them
  const from = location.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Tiny artificial delay so the button state is visible — purely UX polish
    setTimeout(() => {
      const ok = login(username.trim(), password)
      if (ok) {
        navigate(from, { replace: true })
      } else {
        setError('Invalid username or password. Please check your credentials.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col justify-center lg:py-0">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* ── Left Hero Image Section ───────────────────────────────────── */}
        <div className="relative lg:col-span-7 bg-navy-800 flex flex-col justify-between p-8 lg:p-12 overflow-hidden min-h-[380px] lg:min-h-screen">
          {/* Main Visual Image */}
          <img
            src="/viksit_india_2047.png"
            alt="Viksit Bharat @ 2047 Vision"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          {/* Gradient Overlay for aesthetic contrast and text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/50 via-transparent to-transparent" />

          {/* Top Brand Tag */}
          <div className="relative z-100 flex items-center justify-between pl-150">
            {/* <div className="flex items-center gap-3 bg-surface-1/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-md">
              <img src="/indiamap.png" alt="Gujarat Map" className="h-7 w-auto" />
              <div className="h-4 w-px bg-surface-border" />
              <img src="/vikistrajyalogo.png" alt="VRIT Logo" className="h-7 w-auto" />
              <span className="text-xs font-bold text-navy-800 tracking-wider hidden sm:inline">
                VRIT 2047
              </span>
            </div> */}

            <div className="flex items-center gap-1.5 text-xs text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 font-medium">
              <ShieldCheck className="w-4 h-4 text-saffron-400" />
              <span>Official Dashboard Portal</span>
            </div>
          </div>

          {/* Bottom Overlay Info Banner */}
          <div className="relative z-10 mt-auto pt-12">
            <div className="bg-navy-950/75 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15 max-w-2xl shadow-2xl">
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-navy-700 tracking-tight leading-tight">
                VIKSIT RAJYA @ 2047
              </h2>
             
            </div>
          </div>
        </div>

        {/* ── Right Form Section ────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-surface-1 flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-12 relative">
          {/* Top Decorative Motif Spine */}
          <div className="brand-spine absolute top-0 left-0 right-0 h-1.5" />

          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/10 text-navy-800 text-xs font-bold tracking-wide uppercase mb-3">
                Dashboard Portal
              </div>
              <h1 className="font-display text-3xl font-bold text-navy-800 tracking-tight">
                Sign In
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Username Field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-username" className="text-xs font-bold text-navy-800 tracking-wide uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. admin)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-border bg-surface-0 text-sm text-ink-body placeholder:text-ink-faint focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-xs font-bold text-navy-800 tracking-wide uppercase">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-surface-border bg-surface-0 text-sm text-ink-body placeholder:text-ink-faint focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-navy-800 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-status-critical-soft border border-status-critical text-status-critical text-xs font-medium animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-navy-800 hover:bg-navy-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            {/* Footer info note */}
            <div className="mt-8 text-center text-xs text-ink-faint border-t border-surface-border pt-4">
              <p>State Transformation & Strategic Planning Unit</p>
              <p className="mt-0.5 text-[11px] font-mono">VIKSIT RAJYA @2047</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
