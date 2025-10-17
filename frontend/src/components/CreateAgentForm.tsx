"use client"

import React, { useState } from 'react'
import { createAgent } from '../lib/api'
import { notify } from '../lib/uiService'
import styles from './CreateAgentForm.module.css'

export default function CreateAgentForm({ onCreated, onClose }: { onCreated?: (a:any)=>void; onClose?: ()=>void }){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [mobile,setMobile]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await createAgent({ name, email, mobile, password })
      if (res?.success){
          onCreated && onCreated(res.agent)
        } else {
          const msg = res?.message || 'Failed'; notify('error', msg); setError(msg)
        }
  }catch(err:any){ const msg = err?.message || 'Failed'; notify('error', msg); setError(msg) }
    finally{ setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>Name
        <input className={styles.input} value={name} onChange={e=>setName(e.target.value)} required/>
      </label>

      <label className={styles.label}>Email
        <input className={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      </label>

      <label className={styles.label}>Mobile
        <input className={styles.input} value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+1234567890" required/>
      </label>

      <label className={styles.label}>Password
        <input className={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
      </label>

  {/* errors are shown via toast notifications */}

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
        <button type="submit" className={styles.primary} disabled={loading}>{loading ? <span style={{display:'inline-flex',alignItems:'center',gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Creating…</span> : 'Create Agent'}</button>
      </div>
    </form>
  )
}
