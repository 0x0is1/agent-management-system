"use client"

import React, { createContext, useContext, useRef, useState, useEffect } from 'react'
import Spinner from './Spinner'
import styles from './UIProvider.module.css'
import { registerUI } from '../lib/uiService'

type Toast = { id: number; type?: 'info'|'success'|'error'; message: string }

const LoadingContext = createContext({ show: ()=>{}, hide: ()=>{} })
const ToastContext = createContext({ push: (t: Omit<Toast,'id'>)=>{} })

export function useLoading(){ return useContext(LoadingContext) }
export function useToast(){ return useContext(ToastContext) }

export default function UIProvider({ children }: { children: React.ReactNode }){
  const [loadingCount, setLoadingCount] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(1)

  useEffect(()=>{
    // register ui service handlers so non-react modules can call notify/loading
    registerUI({ 
      notify: (type, message)=> {
        const id = idRef.current++
        setToasts(t=>[...t, { id, type, message }])
        // auto-dismiss after 1 second
        setTimeout(()=>{ setToasts(t=>t.filter(x=>x.id!==id)) }, 1000)
      },
      loading: { show: ()=> setLoadingCount(c=>c+1), hide: ()=> setLoadingCount(c=>Math.max(0,c-1)) }
    })
  }, [])

  function show(){ setLoadingCount(c=>c+1) }
  function hide(){ setLoadingCount(c=>Math.max(0,c-1)) }

  function push(toast: Omit<Toast,'id'>){ const id = idRef.current++; setToasts(t=>[...t, { id, ...toast }]); setTimeout(()=>{ setToasts(t=>t.filter(x=>x.id!==id)) }, 1000) }

  function removeToast(id:number){ setToasts(t=>t.filter(x=>x.id!==id)) }

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      <ToastContext.Provider value={{ push }}>
        {children}

        {/* Loading overlay */}
        {loadingCount > 0 && (
          <div className={styles.overlay} aria-live="polite">
            <div className={styles.spinnerWrap}><Spinner size={48} /></div>
          </div>
        )}

        {/* Toasts */}
        <div className={styles.toasts} aria-live="polite">
          {toasts.map(t=> (
            <div key={t.id} className={`${styles.toast} ${t.type === 'error' ? styles.error : t.type === 'success' ? styles.success : styles.info}`}>
              <div className={styles.toastRow}>
                <div className={styles.toastIcon} aria-hidden>
                  {t.type === 'success' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : t.type === 'error' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 9v4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 17h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 9h.01" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5a7 7 0 100 14 7 7 0 000-14z" stroke="#0ea5e9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className={styles.toastBody}>
                  <div className={styles.toastTitle}>{t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}</div>
                  <div className={styles.toastMessage}>{t.message}</div>
                </div>
                <button className={styles.toastClose} onClick={()=>removeToast(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </LoadingContext.Provider>
  )
}
