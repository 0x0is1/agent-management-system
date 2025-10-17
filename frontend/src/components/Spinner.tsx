"use client"

import React from 'react'
import styles from './Spinner.module.css'

export default function Spinner({ size = 20 }: { size?: number }){
  return (
    <div className={styles.spinner} style={{ width: size, height: size }} aria-hidden="true"></div>
  )
}
