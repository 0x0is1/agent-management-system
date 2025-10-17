"use client"

import React from 'react'
import styles from './AgentHeader.module.css'

export default function AgentHeader({ user }: { user: any }){
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <div className={styles.avatar} aria-hidden>{(user?.name||'A').slice(0,1).toUpperCase()}</div>
        <div>
          <div className={styles.name}>{user?.name || user?.email || 'Agent'}</div>
          <div className={styles.role}>{user?.role || 'agent'}</div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary}>New Task</button>
        <button className={styles.ghost}>Sync</button>
      </div>
    </div>
  )
}
