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

  async function logout() {
    await api<void>('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loading, fetchMe, register, login, logout }
})
