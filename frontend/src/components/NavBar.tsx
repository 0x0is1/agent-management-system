"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './NavBar.module.css'
import { logout, fetchCurrentUser } from '../lib/api'

export default function NavBar(){
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    const u = fetchCurrentUser()
    setUser(u)
  },[])

  function handleLogout(){
    logout()
    setUser(null)
    // navigate to login after clearing local state
    router.replace('/login')
  }

  const hideUser = pathname === '/login' || !user

  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <svg className={styles.logoMark} width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="24" rx="6" fill="url(#g)" />
            <path d="M7 16v-8l5 4 5-4v8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop stopColor="#6366F1" offset="0" />
                <stop stopColor="#06B6D4" offset="1" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.logoText}>Agently</span>
        </div>
      </div>
      <div className={styles.right}>
        {!hideUser && <div className={styles.user}>{user?.email}</div>}
        {!hideUser ? (
          <button className={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link href="/login" className={styles.logout}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}