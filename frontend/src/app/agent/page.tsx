"use client"

import React, { useEffect, useState } from 'react'
import AgentTasks from '../../components/AgentTasks'
import AgentHeader from '../../components/AgentHeader'
import { fetchCurrentUser } from '../../lib/api'
import Spinner from '../../components/Spinner'

export default function AgentPage(){
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{ const u = fetchCurrentUser(); setUser(u) },[])

  if (!user) return <div style={{padding:24,display:'flex',alignItems:'center',justifyContent:'center'}}><Spinner size={28} /></div>
  if (user.role !== 'agent') return <div style={{padding:24}}>Access denied — agent only</div>
  return (
    <main>
      <div style={{maxWidth:980,margin:'28px auto',padding:'0 18px'}}>
        <h3 style={{marginBottom:12}}>Assigned Tasks</h3>
  <AgentTasks user={user} />
      </div>
    </main>
  )
}
