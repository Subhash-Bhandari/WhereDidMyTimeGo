<script setup lang="ts">
import type { AnalyticsSummary } from '@wheredidmytimego/shared'

const props = defineProps<{
  summary: AnalyticsSummary | null
  entryCount: number
  productivityScore?: number | null
}>()

function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  if (min === 0) return `${h}h`
  return `${h}h ${min}m`
}

const deltaYesterday = computed(() => {
  if (!props.summary) return 0
  return props.summary.todayMinutes - props.summary.yesterdayMinutes
})
</script>

<template>
  <UiCard class="p-5">
    <p class="text-sm text-slate-500">Today</p>
    <p class="text-3xl font-bold tracking-tight">
      {{ summary ? formatMinutes(summary.todayMinutes) : '—' }}
    </p>
    <p class="mt-1 text-sm text-slate-600">{{ entryCount }} entries</p>
    <p v-if="summary" class="mt-2 text-sm" :class="deltaYesterday >= 0 ? 'text-green-600' : 'text-amber-600'">
      {{ deltaYesterday >= 0 ? '+' : '' }}{{ formatMinutes(Math.abs(deltaYesterday)) }} vs yesterday
    </p>
    <p v-if="productivityScore != null" class="mt-2 text-sm text-slate-600">
      Productivity: {{ productivityScore }}/10
    </p>
    <p v-else class="mt-2 text-sm text-slate-500">
      Reflection not logged yet.
      <NuxtLink to="/reflection" class="font-medium text-slate-700 underline">Add reflection</NuxtLink>
    </p>
  </UiCard>
</template>
