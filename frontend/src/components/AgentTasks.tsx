"use client"

import React, { useEffect, useState } from 'react'
import { getTasks } from '../lib/api'
import { notify } from '../lib/uiService'
import Spinner from './Spinner'
import TaskCard from './TaskCard'
import EmptyState from './EmptyState'
import AgentProfile from './AgentProfile'
import styles from './AgentTasks.module.css'

export default function AgentTasks({ user }: { user?: any }){
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    setLoading(true)
    getTasks().then((res:any)=>{
      if (res?.tasks){
        if (Array.isArray(res.tasks)) setTasks(res.tasks)
        else {
          const flattened: any[] = []
          Object.values(res.tasks).forEach((entry:any)=>{
            const groupTasks = entry.tasks || []
            flattened.push(...groupTasks)
          })
          setTasks(flattened)
        }
      } else setTasks([])
    }).catch(err=>{ const msg = err?.message||'Failed to load tasks'; notify('error', msg) }).finally(()=>setLoading(false))
  },[])

  if (loading) return <div className={styles.loading}><Spinner size={18} /> Loading tasks…</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <AgentProfile user={user} />
      </div>
      <div className={styles.right}>
        <AgentPanel tasks={tasks} />
      </div>
    </div>
  )
}

function AgentPanel({ tasks }: { tasks: any[] }){
  if (!tasks || tasks.length === 0) return <EmptyState title="No tasks assigned" message="Once tasks are distributed to you, they will appear here." />
  return (
    <div className={styles.list}>
      {tasks.map(t=> <div key={t._id || t.id} className={styles.item}><TaskCard task={t} /></div>)}
    </div>
  )
}
