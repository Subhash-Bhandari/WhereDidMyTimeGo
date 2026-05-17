import { defineStore } from 'pinia'

export type AuthUser = {
  id: number
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const { api } = useApi()

  async function fetchMe() {
    loading.value = true
    try {
      user.value = await api<AuthUser>('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function register(payload: { email: string; password: string; name: string }) {
    user.value = await api<AuthUser>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
  }

  async function login(payload: { email: string; password: string }) {
    user.value = await api<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: payload
    })
  }

  async function logout(options?: { skipQueueCheck?: boolean }) {
    if (import.meta.client && !options?.skipQueueCheck) {
      const queue = useOfflineQueue()
      await queue.refresh()
      const pending = queue.pendingCount + queue.failedCount
      if (pending > 0) {
        const syncNow = confirm(
          `You have ${pending} offline ${pending === 1 ? 'entry' : 'entries'} not synced. Sync now before signing out? OK = try sync first, Cancel = continue sign-out options.`
        )
        if (syncNow) {
          const { isOnlineForSync, probeReachability } = useOnlineStatus()
          if (!isOnlineForSync.value) await probeReachability()
          if (useOnlineStatus().isOnlineForSync.value) {
            await queue.syncAll()
            await queue.refresh()
            if (queue.pendingCount + queue.failedCount === 0) {
              return logout({ skipQueueCheck: true })
            }
          }
        }
        const discard = confirm(
          'Discard unsynced entries and sign out? Your device copy will be cleared.'
        )
        if (!discard) return
        await queue.clearQueue()
      }
    }
    await api<void>('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loading, fetchMe, register, login, logout }
})
