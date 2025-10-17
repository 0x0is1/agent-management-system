"use client"

import React from 'react'
import styles from './Dialog.module.css'

export default function Dialog({ open, title, message, onClose }: { open: boolean; title?: string; message?: string; onClose?: ()=>void }){
  if (!open) return null
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.content} onClick={e=>e.stopPropagation()}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}><button onClick={onClose} className={styles.btn}>Close</button></div>
      </div>
    </div>
  )
}
