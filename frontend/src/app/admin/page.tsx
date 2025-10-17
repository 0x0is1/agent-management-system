"use client"

import React, { useEffect, useState } from 'react'
import AdminDashboard from '../../components/AdminDashboard'
import { fetchCurrentUser } from '../../lib/api'
import Spinner from '../../components/Spinner'

export default function AdminPage(){
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    const u = fetchCurrentUser()
    setUser(u)
  },[])

  // If not admin, show message
  if (!user) return <div style={{padding:24,display:'flex',alignItems:'center',justifyContent:'center'}}><Spinner size={28} /></div>
  if (user.role !== 'admin') return <div style={{padding:24}}>Access denied — admin only</div>

  return (
    <main>
      <AdminDashboard agents={user.agents || []} />
    </main>
  )
}
