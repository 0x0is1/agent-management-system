"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { validateToken } from '../lib/api'

export default function Home(){
  const router = useRouter()
  useEffect(()=>{
    let mounted = true
    async function check(){
      const user = await validateToken()
      if (!mounted) return
      if (user && user.role === 'admin') router.replace('/admin')
      else if (user && user.role === 'agent') router.replace('/agent')
      else router.replace('/login')
    }
    check()
    return ()=>{ mounted = false }
  }, [router])

  return null
}
