"use client"

import React, { useState, useEffect } from 'react'
import UploadDistributor from './UploadDistributor'
import Spinner from './Spinner'
import CreateAgentForm from './CreateAgentForm'
import { fetchAgents, getTasks } from '../lib/api'
import { notify } from '../lib/uiService'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard({ agents: initialAgents, onCreate }: { agents?: any[]; onCreate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [agents, setAgents] = useState<any[]>(initialAgents || [])
  const [tab, setTab] = useState<'create'|'distribute'>('create')
  const [tasks, setTasks] = useState<any|null>(null)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{ loadAgents() },[])

  async function loadAgents(){
    setLoadingAgents(true); setError(null)
  try{ const list = await fetchAgents(); setAgents(list) }catch(err:any){ const msg = err?.message || 'Failed to load agents'; notify('error', msg); setError(msg) }
    finally{ setLoadingAgents(false) }
  }

  function onCreated(agent:any){
    setAgents(prev=>[agent, ...prev])
    onCreate && onCreate()
    setOpen(false)
  }

  async function openDistribute(){
    setTab('distribute')
    setLoadingTasks(true); setError(null)
  try{ const res = await getTasks(); setTasks(res.tasks || null) }catch(err:any){ const msg = err?.message || 'Failed to preload tasks'; notify('error', msg); setError(msg) }
    finally{ setLoadingTasks(false) }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabsRow}>
        <button className={tab==='create' ? `${styles.tab} ${styles.active}` : styles.tab} onClick={()=>setTab('create')}>Create agents</button>
        <button className={tab==='distribute' ? `${styles.tab} ${styles.active}` : styles.tab} onClick={openDistribute}>Distribute tasks</button>
      </div>

      {tab === 'create' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Agents</h3>
            <button className={styles.createBtn} onClick={()=>setOpen(true)}>+ Create agent</button>
          </div>

          {loadingAgents ? <div className={styles.loading}><Spinner size={18} /> Loading agents…</div> : (
            <div>
              {agents && agents.length ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map(a => (
                        <tr key={a._id || a.email}>
                          <td className={styles.tdName}>{a.name}</td>
                          <td>{a.email}</td>
                          <td>{a.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className={styles.empty}>No agents yet</div>}
            </div>
          )}
        </div>
      )}

      {tab === 'distribute' && (
        <div>
          {loadingTasks ? <div className={styles.loading}><Spinner size={18} /> Loading distributed tasks…</div> : <UploadDistributor preloadedTasks={tasks} />}
        </div>
      )}

      {open && (
        <div className={styles.modalBackdrop} onClick={()=>setOpen(false)}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Create Agent</div>
                <div className={styles.modalSub}>Add a new agent account</div>
              </div>
              <button aria-label="Close" className={styles.modalClose} onClick={()=>setOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <CreateAgentForm onCreated={onCreated} onClose={()=>setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
