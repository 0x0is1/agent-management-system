"use client"

import React from 'react'
import styles from './EmptyState.module.css'

export default function EmptyState({ title, message }: { title: string; message?: string }){
  return (
    <div className={styles.empty}>
      <div className={styles.icon} aria-hidden>📭</div>
      <div className={styles.title}>{title}</div>
      {message && <div className={styles.msg}>{message}</div>}
    </div>
  )
}
