<script setup lang="ts">
import type { AnalyticsInsights, AnalyticsSummary } from '@wheredidmytimego/shared'

definePageMeta({ middleware: 'auth' })

const { api } = useApi()
const { timezone } = useTimezone()
const { preset, customFrom, customTo, bounds } = useAnalyticsRange()

const summary = ref<AnalyticsSummary | null>(null)
const insights = ref<AnalyticsInsights | null>(null)
const weekly = ref<{ date: string; totalMinutes: number }[]>([])
const categories = ref<
  { categoryName: string; totalMinutes: number; percent: number }[]
>([])
const loading = ref(false)
const insightsError = ref(false)

const rangeError = computed(() => {
  if (preset.value !== 'custom') return false
  const { from, to } = bounds()
  return to < from
})

async function load() {
  if (rangeError.value) return
  loading.value = true
  insightsError.value = false
  const tz = timezone.value
  const { from, to } = bounds()

  try {
    const weekStart =
      preset.value === 'last_week'
        ? from
        : preset.value === 'this_week'
          ? from
          : undefined

    const [s, w, c, ins] = await Promise.all([
      api<AnalyticsSummary>('/api/analytics/summary', {
        query: { timezone: tz, includeInsights: false }
      }),
      api<{ days: { date: string; totalMinutes: number }[] }>('/api/analytics/weekly', {
        query: {
          timezone: tz,
          weekStart: weekStart ?? from
        }
      }),
      api<{
        items: { categoryName: string; totalMinutes: number; percent: number }[]
      }>('/api/analytics/categories', { query: { timezone: tz, from, to } }),
      api<AnalyticsInsights>('/api/analytics/insights', {
        query: { timezone: tz, from, to }
      })
    ])
    summary.value = s
    weekly.value = w.days
    categories.value = c.items
    insights.value = ins
  } catch {
    insightsError.value = true
  } finally {
    loading.value = false
  }
}

watch([preset, customFrom, customTo, timezone], load, { deep: true })
onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Analytics</h1>

    <AnalyticsDateRangePicker
      v-model:preset="preset"
      v-model:custom-from="customFrom"
      v-model:custom-to="customTo"
    />

    <div v-if="loading" class="space-y-6">
      <UiSkeleton class="h-56 w-full" />
      <UiSkeleton class="h-24 w-full" />
      <UiSkeleton class="h-24 w-full" />
      <UiSkeleton class="h-48 w-full" />
    </div>

    <template v-else-if="!rangeError">
      <p v-if="insightsError" class="text-sm text-red-600">
        Could not load insights.
        <button type="button" class="font-medium underline" @click="load">Retry</button>
      </p>

      <DashboardWeeklyChart
        v-if="weekly.length"
        :days="weekly"
        :title="`Activity (${bounds().from} – ${bounds().to})`"
      />

      <template v-if="insights">
        <AnalyticsTimeLeakCard
          v-for="leak in insights.timeLeaks"
          :key="leak.categoryId"
          :leak="leak"
        />
        <AnalyticsBestHoursCard :hours="insights.bestHours" />
        <AnalyticsCorrelationCard
          v-for="(c, i) in insights.correlations"
          :key="i"
          :insight="c"
        />
      </template>

      <UiCard v-if="categories.length" class="p-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500">
              <th>Category</th>
              <th class="text-right">Hours</th>
              <th class="text-right">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in categories" :key="row.categoryName" class="border-t">
              <td class="py-2">{{ row.categoryName }}</td>
              <td class="py-2 text-right">{{ (row.totalMinutes / 60).toFixed(1) }}</td>
              <td class="py-2 text-right">{{ row.percent }}%</td>
            </tr>
          </tbody>
        </table>
      </UiCard>
      <UiCard v-else class="p-6 text-center text-sm text-slate-600">
        No time logged for this period.
        <NuxtLink to="/add" class="font-medium underline">Log time</NuxtLink>
      </UiCard>
    </template>
  </section>
</template>
