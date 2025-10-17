type NotifyFn = (type: 'info'|'success'|'error', message: string) => void
type LoadingFn = { show: ()=>void; hide: ()=>void }

let _notify: NotifyFn | null = null
let _loading: LoadingFn | null = null

export function registerUI(handlers: { notify?: NotifyFn; loading?: LoadingFn }){
  if (handlers.notify) _notify = handlers.notify
  if (handlers.loading) _loading = handlers.loading
}

export function notify(type: 'info'|'success'|'error', message: string){
  if (_notify) _notify(type, message)
  else console[type === 'error' ? 'error' : 'log'](message)
}

export function showLoading(){ if (_loading) _loading.show() }
export function hideLoading(){ if (_loading) _loading.hide() }
