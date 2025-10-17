"use client"

import React from 'react'
import styles from './StatsCard.module.css'

export default function StatsCard({ stats }: { stats: { total:number; completed:number; pending:number } }){
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div>
          <div className={styles.num}>{stats.total}</div>
          <div className={styles.label}>Total tasks</div>
        </div>
        <div>
          <div className={styles.num}>{stats.completed}</div>
          <div className={styles.label}>Completed</div>
        </div>
        <div>
          <div className={styles.num}>{stats.pending}</div>
          <div className={styles.label}>Pending</div>
        </div>
      </div>
    </div>
  )
}
