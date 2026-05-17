import { processQueue } from '~/lib/sync-processor'

export default defineNuxtPlugin(() => {
  const { isOnlineForSync, probeReachability } = useOnlineStatus()

  async function trySync() {
    if (!isOnlineForSync.value) {
      const ok = await probeReachability()
      if (!ok) return
    }
    await processQueue()
    const queue = useOfflineQueue()
    await queue.refresh()
  }

  window.addEventListener('online', () => {
    void trySync()
  })

  const interval = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return
    void trySync()
  }, 60_000)

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    void navigator.serviceWorker.ready.then((reg) => {
      return reg.sync.register('sync-entries').catch(() => undefined)
    })
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'sync-entries') void trySync()
    })
  }

  void trySync()

  onUnmounted(() => {
    window.clearInterval(interval)
  })
})
