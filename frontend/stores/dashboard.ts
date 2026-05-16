import { defineStore } from 'pinia'
import type { AnalyticsSummary } from '@wheredidmytimego/shared'

export type TimeEntryRow = {
  id: number
  userId: number
  categoryId: number | null
  title: string
  startedAt: string
  endedAt: string
  durationMinutes: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<AnalyticsSummary | null>(null)
  const weekly = ref<{ date: string; totalMinutes: number }[]>([])
  const categoryBreakdown = ref<
    { categoryId: number | null; categoryName: string; color: string; totalMinutes: number; percent: number }[]
  >([])
  const todayEntries = ref<TimeEntryRow[]>([])
  const loading = ref(false)

  const { api } = useApi()
  const { timezone } = useTimezone()

  async function refresh() {
    loading.value = true
    const tz = timezone.value
    try {
      const [s, w, c, entries] = await Promise.all([
        api<AnalyticsSummary>('/api/analytics/summary', {
          query: { timezone: tz, includeInsights: false }
        }),
        api<{ days: { date: string; totalMinutes: number }[] }>('/api/analytics/weekly', {
          query: { timezone: tz }
        }),
        api<{
          items: {
            categoryId: number | null
            categoryName: string
            color: string
            totalMinutes: number
            percent: number
          }[]
        }>('/api/analytics/categories', { query: { timezone: tz } }),
        api<TimeEntryRow[]>('/api/time-entries/today', { query: { timezone: tz } })
      ])
      summary.value = s
      weekly.value = w.days
      categoryBreakdown.value = c.items
      todayEntries.value = entries
    } finally {
      loading.value = false
    }
  }

  return { summary, weekly, categoryBreakdown, todayEntries, loading, refresh }
})
