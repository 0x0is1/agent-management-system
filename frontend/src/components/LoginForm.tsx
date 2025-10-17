"use client"

import React, { useState } from 'react'
import { login } from '../lib/api'
import { notify } from '../lib/uiService'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login({ email, password })
      // login returns { success, user, token }
      if (res?.success) window.location.href = res.user?.role === 'admin' ? '/admin' : '/agent'
      else { const msg = res?.message || 'Login failed'; notify('error', msg) }
    } catch (err: any) {
      const msg = err?.message || 'Login failed'; notify('error', msg)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Sign In</h2>
      <label>
        <div className="label">Email</div>
        <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@company.com"/>
      </label>
      <label>
        <div className="label">Password</div>
        <input value={password} onChange={e => setPassword(e.target.value)} required type="password" placeholder="••••••"/>
      </label>
  {/* errors are shown via toast notifications */}
  <button className="btn-primary" disabled={loading} type="submit">{loading ? <span style={{display:'inline-flex',alignItems:'center',gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Signing in…</span> : 'Sign in'}</button>
      <style jsx>{`
        .card{max-width:420px;margin:36px auto;padding:22px;border-radius:12px;box-shadow:0 8px 30px rgba(15,23,42,0.06);background:var(--card-bg,#fff)}
        h2{margin:0 0 16px;font-size:20px}
        label{display:block;margin:12px 0}
        .label{font-size:12px;color:#6b7280;margin-bottom:6px}
        input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px}
        .btn-primary{margin-top:14px;width:100%;padding:10px;border-radius:8px;background:#0f172a;color:#fff;border:0}
        .error{margin-top:8px;color:#b91c1c}
      `}</style>
    </form>
  )
}
