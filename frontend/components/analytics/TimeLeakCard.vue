<script setup lang="ts">
import type { AnalyticsSummary } from '@wheredidmytimego/shared'

defineProps<{
  leak: AnalyticsSummary['timeLeaks'][number]
}>()
</script>

<template>
  <AnalyticsInsightCard>
    <p class="font-medium">Time leak: {{ leak.categoryName }}</p>
    <p class="mt-1 text-sm text-slate-600">
      You spent <strong>{{ Math.round(leak.growthPercent) }}%</strong> more on
      <strong>{{ leak.categoryName }}</strong> this week ({{ leak.currentWeekMinutes }} min vs
      {{ leak.previousWeekMinutes }} min last week).
    </p>
    <p class="mt-2 text-xs text-slate-500">Compared: this calendar week vs last week</p>
  </AnalyticsInsightCard>
</template>
