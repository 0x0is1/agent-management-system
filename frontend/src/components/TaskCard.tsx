"use client"

import React from 'react'
import styles from './TaskCard.module.css'

export default function TaskCard({ task }: { task: any }){
  const name = task.firstName || task.first_name || task.FirstName || ''
  const phone = task.phone || task.Phone || ''
  const notes = task.notes || task.Notes || ''
  const date = task.createdAt ? new Date(task.createdAt).toLocaleString() : ''

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{name}</div>
        <div className={styles.date}>{date}</div>
      </div>
      <div className={styles.body}>{notes}</div>
      <div className={styles.footer}>{phone}</div>
    </div>
  )
}
