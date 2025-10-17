import { notify, showLoading, hideLoading } from './uiService'

const BASE = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE || '')

function url(path: string){
  return BASE ? `${BASE.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}` : path
}

export async function login({ email, password }: { email: string; password: string }){
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const data = await res.json()
  try{ hideLoading() }catch{}
  if (!res.ok) {
    if (res.status === 401) { try{ logout(); notify('error','Session invalid. Redirecting to login...') }catch{}; window.location.href = '/login'; }
    throw new Error(data?.message || 'Login failed')
  }
  // expected { success, message, user, token }
  if (data.token) localStorage.setItem('token', data.token)
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function createAgent(payload: { name: string; email: string; mobile: string; password: string }){
  const token = localStorage.getItem('token')
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/create-agent'), { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
  const data = await res.json()
  try{ hideLoading() }catch{}
  if (!res.ok) {
    if (res.status === 401) { try{ logout(); notify('error','Session expired. Redirecting to login...') }catch{}; window.location.href = '/login' }
    throw new Error(data?.message || 'Create agent failed')
  }
  return data
}

export async function uploadList(file: File){
  const token = localStorage.getItem('token')
  const fd = new FormData()
  fd.append('file', file)
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/add-tasks'), { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd })
  const data = await res.json()
  try{ hideLoading() }catch{}
  if (!res.ok) {
    if (res.status === 401) { try{ logout(); notify('error','Session expired. Redirecting to login...') }catch{}; window.location.href = '/login' }
    throw new Error(data?.message || 'Upload failed')
  }
  // expected { success, message, tasks }
  try{ notify('success', data?.message || 'Uploaded successfully') }catch{}
  return data
}

export async function getTasks(){
  const token = localStorage.getItem('token')
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/get-tasks'), { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  const data = await res.json()
  try{ hideLoading() }catch{}
  if (!res.ok) {
    if (res.status === 401) { try{ logout(); notify('error','Session expired. Redirecting to login...') }catch{}; window.location.href = '/login' }
    throw new Error(data?.message || 'Failed to fetch tasks')
  }
  return data
}

export async function fetchAgents(){
  const token = localStorage.getItem('token')
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/get-agents'), { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  const data = await res.json()
  try{ hideLoading() }catch{}
  if (!res.ok) {
    if (res.status === 401) { try{ logout(); notify('error','Session expired. Redirecting to login...') }catch{}; window.location.href = '/login' }
    throw new Error(data?.message || 'Failed to fetch agents')
  }
  // expected { success: true, agents: [...] }
  return data.agents || []
}

export function fetchCurrentUser(){
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try{ return JSON.parse(raw) }catch{ return null }
}

export function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user') }

export async function validateToken(){
  const token = localStorage.getItem('token')
  if (!token) return null
  try{ showLoading() }catch{}
  const res = await fetch(url('/api/protected'), { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json().catch(()=>null)
  try{ hideLoading() }catch{}
  if (!res.ok) {
    // unauthorized -> clear stored auth
    if (res.status === 401) { logout(); try{ notify('error','Session expired. Redirecting to login...') }catch{}; return null }
    throw new Error(data?.message || 'Token validation failed')
  }
  if (data?.success && data.user) {
    try{ localStorage.setItem('user', JSON.stringify(data.user)) }catch{}
    return data.user
  }
  return null
}
