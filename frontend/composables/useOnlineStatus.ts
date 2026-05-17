const REACHABILITY_TIMEOUT_MS = 4000

export function useOnlineStatus() {
  const browserOnline = ref(
    import.meta.client ? navigator.onLine : true
  )
  const apiReachable = ref(false)
  const checking = ref(false)
  const hasProbed = ref(false)

  const isOnlineForSync = computed(
    () => browserOnline.value && apiReachable.value
  )

  /** Use for read/fetch (dashboard, analytics): don't block on probe race at first paint */
  const canLoadFromServer = computed(() => {
    if (!browserOnline.value) return false
    if (!hasProbed.value) return true
    return apiReachable.value
  })

  async function probeReachability() {
    if (!import.meta.client || !browserOnline.value) {
      apiReachable.value = false
      return false
    }
    checking.value = true
    const config = useRuntimeConfig()
    const base = (config.public.apiBaseUrl as string) || ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REACHABILITY_TIMEOUT_MS)
    try {
      const res = await fetch(`${base}/api/health`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      })
      apiReachable.value = res.ok
      return res.ok
    } catch {
      apiReachable.value = false
      return false
    } finally {
      clearTimeout(timer)
      checking.value = false
      hasProbed.value = true
    }
  }

  function onBrowserOnline() {
    browserOnline.value = true
    void probeReachability()
  }

  function onBrowserOffline() {
    browserOnline.value = false
    apiReachable.value = false
  }

  if (import.meta.client) {
    onMounted(() => {
      browserOnline.value = navigator.onLine
      void probeReachability()
      window.addEventListener('online', onBrowserOnline)
      window.addEventListener('offline', onBrowserOffline)
    })
    onUnmounted(() => {
      window.removeEventListener('online', onBrowserOnline)
      window.removeEventListener('offline', onBrowserOffline)
    })
  }

  return {
    browserOnline,
    apiReachable,
    checking,
    hasProbed,
    isOnlineForSync,
    canLoadFromServer,
    probeReachability
  }
}
