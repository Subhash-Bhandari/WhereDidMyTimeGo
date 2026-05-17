const DISMISS_KEY = 'reflection_nudge_dismissed_date'

export function useEveningReflectionNudge() {
  const { api } = useApi()
  const { timezone } = useTimezone()
  const visible = ref(false)

  async function evaluate() {
    if (!import.meta.client) return

    const tz = timezone.value
    const now = new Date()
    const localHour = Number(
      now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz })
    )
    if (localHour < 20) {
      visible.value = false
      return
    }

    const today = now.toLocaleDateString('en-CA', { timeZone: tz })
    if (localStorage.getItem(DISMISS_KEY) === today) {
      visible.value = false
      return
    }

    try {
      const reflection = await api<{ mood: string } | null>('/api/reflections/today', {
        query: { timezone: tz }
      })
      visible.value = !reflection
    } catch {
      visible.value = false
    }
  }

  function dismiss() {
    if (!import.meta.client) return
    const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone.value })
    localStorage.setItem(DISMISS_KEY, today)
    visible.value = false
  }

  return { visible, evaluate, dismiss }
}
