import { defineStore } from 'pinia'
import type { AnalyticsSummary } from '@wheredidmytimego/shared'
import { categoryRangeForPeriod } from '@/utils/dateRanges'

export type TimeEntryRow = {
  id: number
  userId: number
  categoryId: number | null
  title: string
  startedAt: string
  endedAt: string
  durationMinutes: number
}

export type CategoryBreakdownItem = {
  categoryId: number | null
  categoryName: string
  color: string
  totalMinutes: number
  percent: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<AnalyticsSummary | null>(null)
  const weekly = ref<{ date: string; totalMinutes: number }[]>([])
  const categoryBreakdown = ref<CategoryBreakdownItem[]>([])
  const categoryPeriod = ref<'today' | 'week'>('week')
  const productivityScore = ref<number | null>(null)
  const todayEntries = ref<TimeEntryRow[]>([])
  const loading = ref(false)

  const { api } = useApi()
  const { timezone } = useTimezone()

  async function fetchCategoryBreakdown(tz: string) {
    const { from, to } = categoryRangeForPeriod(tz, categoryPeriod.value)
    const c = await api<{ items: CategoryBreakdownItem[] }>('/api/analytics/categories', {
      query: { timezone: tz, from, to }
    })
    categoryBreakdown.value = c.items
  }

  async function setCategoryPeriod(period: 'today' | 'week') {
    categoryPeriod.value = period
    loading.value = true
    try {
      await fetchCategoryBreakdown(timezone.value)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    loading.value = true
    const tz = timezone.value
    const { from, to } = categoryRangeForPeriod(tz, categoryPeriod.value)
    try {
      const [s, w, c, entries, reflection] = await Promise.all([
        api<AnalyticsSummary>('/api/analytics/summary', {
          query: { timezone: tz, includeInsights: false }
        }),
        api<{ days: { date: string; totalMinutes: number }[] }>('/api/analytics/weekly', {
          query: { timezone: tz }
        }),
        api<{ items: CategoryBreakdownItem[] }>('/api/analytics/categories', {
          query: { timezone: tz, from, to }
        }),
        api<TimeEntryRow[]>('/api/time-entries/today', { query: { timezone: tz } }),
        api<{ productivityScore: number } | null>('/api/reflections/today', {
          query: { timezone: tz }
        })
      ])
      summary.value = s
      weekly.value = w.days
      categoryBreakdown.value = c.items
      todayEntries.value = entries
      productivityScore.value = reflection?.productivityScore ?? null
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    weekly,
    categoryBreakdown,
    categoryPeriod,
    productivityScore,
    todayEntries,
    loading,
    refresh,
    setCategoryPeriod
  }
})
