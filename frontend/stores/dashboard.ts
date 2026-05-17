import { defineStore } from 'pinia'
import type { AnalyticsSummary } from '@wheredidmytimego/shared'
import { categoryRangeForPeriod } from '@/utils/dateRanges'
import type { PendingStatus } from '~/lib/offline-db'

export type TimeEntryRow = {
  id: number
  userId: number
  categoryId: number | null
  title: string
  startedAt: string
  endedAt: string
  durationMinutes: number
}

export type TodayEntry = TimeEntryRow & {
  pending?: boolean
  localId?: string
  syncStatus?: PendingStatus
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
  const serverTodayEntries = ref<TimeEntryRow[]>([])
  const loading = ref(false)
  const loadedWhileOnline = ref(true)

  const { api } = useApi()
  const { timezone } = useTimezone()

  const todayEntries = computed<TodayEntry[]>(() => {
    const queue = useOfflineQueue()
    const pendingRows: TodayEntry[] = queue
      .listPending()
      .map((e) => ({
        id: 0,
        userId: 0,
        categoryId: e.payload.categoryId,
        title: e.payload.title,
        startedAt: e.payload.startedAt,
        endedAt: e.payload.endedAt,
        durationMinutes: e.payload.durationMinutes,
        pending: true,
        localId: e.localId,
        syncStatus: e.status
      }))
    return [...pendingRows, ...serverTodayEntries.value].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  })

  function mergePendingFromQueue() {
    // Computed todayEntries reads queue state; no-op hook for callers after queue mutations
  }

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

    if (import.meta.client) {
      const { canLoadFromServer } = useOnlineStatus()
      if (!canLoadFromServer.value) {
        loadedWhileOnline.value = false
        loading.value = false
        mergePendingFromQueue()
        return
      }
    }

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
      serverTodayEntries.value = entries
      productivityScore.value = reflection?.productivityScore ?? null
      loadedWhileOnline.value = true
    } catch {
      loadedWhileOnline.value = false
    } finally {
      loading.value = false
      mergePendingFromQueue()
    }
  }

  return {
    summary,
    weekly,
    categoryBreakdown,
    categoryPeriod,
    productivityScore,
    todayEntries,
    serverTodayEntries,
    loading,
    loadedWhileOnline,
    refresh,
    setCategoryPeriod,
    mergePendingFromQueue
  }
})
