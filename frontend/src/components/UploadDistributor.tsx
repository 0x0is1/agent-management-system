"use client"

import React, { useState } from 'react'
import { uploadList } from '../lib/api'
import { notify } from '../lib/uiService'
import styles from './UploadDistributor.module.css'
import Spinner from './Spinner'
import Dialog from './Dialog'

type Props = { preloadedTasks?: any }

function normalizeDistributed(input: any){
  if (!input) return {}
  if (Array.isArray(input)) return { results: input }
  if (typeof input !== 'object') return { results: {} }

  if (Object.keys(input).length && Object.values(input).every(v => Array.isArray(v) || typeof v === 'object')) {
    return input
  }

  return input
}

export default function UploadDistributor({ preloadedTasks }: Props){
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState<string|undefined>()
  const [dialogMessage, setDialogMessage] = useState<string|undefined>()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return notify('error','Select a file first')
    setLoading(true)
    try{
      const res = await uploadList(file)
      setResult(res.tasks || res)
      if (res?.success) {
        setDialogTitle('Upload complete')
        setDialogMessage(res?.message || 'File uploaded and tasks distributed')
        setDialogOpen(true)
      } else {
        setDialogTitle('Upload failed')
        setDialogMessage(res?.message || 'Distribution may have failed')
        setDialogOpen(true)
      }
    }catch(err:any){ const msg = err?.message || 'Upload failed'; notify('error', msg) }
    finally{ setLoading(false) }
  }

  const data = normalizeDistributed(result || preloadedTasks)

  return (
    <div className={styles.wrap}>
    <div className={styles.panel}>
      {/* Upload area */}
      <form onSubmit={handleUpload} className={styles.uploadForm}>
        <label className={styles.fileLabel}>
          <input className={styles.fileInput} type="file" accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <span className={styles.chooseBtn}>Choose file</span>
          <span className={styles.fileName}>{file ? file.name : 'No file selected'}</span>
        </label>
        <button className={styles.uploadBtn} disabled={loading}>{loading ? <Spinner size={16} /> : 'Upload & Distribute'}</button>
      </form>
    </div>
    <div className={styles.panel}>
      {/* Distributed tasks list (separated) */}
      {data && Object.keys(data).length > 0 && (
        <section className={styles.result}>
          <h4>Distributed Tasks</h4>
          <div className={styles.agentsList}>
            {Object.entries(data).map(([agentKey, tasksRaw]: any) => {
              let label = String(agentKey)
              let tasksArray: any[] = []

              if (Array.isArray(tasksRaw)) tasksArray = tasksRaw
              else if (tasksRaw && Array.isArray(tasksRaw.tasks)) { tasksArray = tasksRaw.tasks; if (tasksRaw.name) label = tasksRaw.name }
              else if (tasksRaw && typeof tasksRaw === 'object') {
                const vals = Object.values(tasksRaw || {})
                if (vals.length && Array.isArray(vals[0])) tasksArray = (vals as any[]).flat()
                else if (vals.length && typeof vals[0] === 'object') {
                  const first = vals[0] as any
                  if (Array.isArray(first.tasks)) tasksArray = (vals as any[]).flatMap(v => v.tasks || [])
                  else if (first && (first.FirstName || first.firstName || first.Phone || first.phone)) tasksArray = vals as any[]
                }
              }

              const key = String(agentKey)
              const isOpen = !!openKeys[key]

              return (
                <div key={key} className={`${styles.agentBlock} ${isOpen ? styles.open : ''}`}>
                  <div className={styles.agentTitle} onClick={()=>setOpenKeys(prev=>({ ...prev, [key]: !prev[key] }))}>
                    <span>{label}</span>
                    <span>{isOpen ? '▾' : '▸'}</span>
                  </div>
                  {isOpen && (
                    <div className={styles.taskList}>
                      {(!tasksArray || tasksArray.length===0) ? (
                        <div className={styles.empty}>No tasks for this agent</div>
                      ) : (
                        <div>
                          {tasksArray.map((t:any, i:number)=> (
                            <div key={i} className={styles.taskItem}>
                              <div className={styles.taskName}>{t.firstName || t.first_name || t.FirstName}</div>
                              <div className={styles.taskPhone}>{t.phone || t.Phone}</div>
                              {t.notes ? <div className={styles.taskNotes}>Notes: {t.notes}</div> : null}
                              <div className={styles.taskDate}>Created: {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Dialog open={dialogOpen} title={dialogTitle} message={dialogMessage} onClose={()=>setDialogOpen(false)} />
    </div>
    </div>
  )
}
