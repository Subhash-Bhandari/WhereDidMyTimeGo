const STORAGE_KEY = 'onboarding_done'

export function useOnboarding() {
  const done = ref(true)

  onMounted(() => {
    if (import.meta.client) {
      done.value = localStorage.getItem(STORAGE_KEY) === 'true'
    }
  })

  function complete() {
    done.value = true
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  function shouldShow(isAuthenticated: boolean, path: string) {
    if (!import.meta.client || !isAuthenticated) return false
    if (path === '/login' || path === '/register') return false
    return !done.value
  }

  return { done, complete, shouldShow }
}
