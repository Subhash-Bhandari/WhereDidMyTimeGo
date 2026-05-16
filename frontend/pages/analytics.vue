<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { AnalyticsSummary } from '@wheredidmytimego/shared'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)
dayjs.extend(isoWeek)

definePageMeta({ middleware: 'auth' })

const { api } = useApi()
const { timezone } = useTimezone()
const period = ref<'this' | 'last'>('this')
const summary = ref<AnalyticsSummary | null>(null)
const weekly = ref<{ date: string; totalMinutes: number }[]>([])
const categories = ref<
  { categoryName: string; totalMinutes: number; percent: number }[]
>([])
const loading = ref(false)

async function load() {
  loading.value = true
  const tz = timezone.value
  const weekOffset = period.value === 'last' ? -1 : 0
  const monday = dayjs().tz(tz).startOf('isoWeek').add(weekOffset, 'week')
  const weekStart = monday.format('YYYY-MM-DD')
  const from = weekStart
  const to = monday.endOf('isoWeek').format('YYYY-MM-DD')

  try {
    const [s, w, c] = await Promise.all([
      api<AnalyticsSummary>('/api/analytics/summary', {
        query: { timezone: tz, includeInsights: true }
      }),
      api<{ days: { date: string; totalMinutes: number }[] }>('/api/analytics/weekly', {
        query: { timezone: tz, weekStart }
      }),
      api<{
        items: { categoryName: string; totalMinutes: number; percent: number }[]
      }>('/api/analytics/categories', { query: { timezone: tz, from, to } })
    ])
    summary.value = s
    weekly.value = w.days
    categories.value = c.items
  } finally {
    loading.value = false
  }
}

watch(period, load)
onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Analytics</h1>
    <div class="flex gap-2">
      <UiButton :variant="period === 'this' ? 'default' : 'outline'" @click="period = 'this'">
        This week
      </UiButton>
      <UiButton :variant="period === 'last' ? 'default' : 'outline'" @click="period = 'last'">
        Last week
      </UiButton>
    </div>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <template v-else-if="summary">
      <DashboardWeeklyChart v-if="weekly.length" :days="weekly" />
      <UiCard v-for="leak in summary.timeLeaks" :key="leak.categoryId" class="p-4">
        <p class="font-medium">Time leak: {{ leak.categoryName }}</p>
        <p class="text-sm text-slate-600">
          +{{ Math.round(leak.growthPercent) }}% vs last week ({{ leak.currentWeekMinutes }} min)
        </p>
      </UiCard>
      <UiCard v-if="summary.bestHours.length" class="p-4">
        <p class="font-medium">Best hours</p>
        <p class="text-sm text-slate-600">
          <span v-for="(h, i) in summary.bestHours" :key="h.hour">
            {{ h.hour }}:00 ({{ h.totalMinutes }}m){{ i < summary.bestHours.length - 1 ? ', ' : '' }}
          </span>
        </p>
      </UiCard>
      <UiCard class="p-4">
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
    </template>
  </section>
</template>
