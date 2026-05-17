<script setup lang="ts">
import type { BestHourInsight } from '@wheredidmytimego/shared'

defineProps<{
  hours: BestHourInsight[]
}>()
</script>

<template>
  <AnalyticsInsightCard v-if="hours.length">
    <p class="font-medium">Best focus hours</p>
    <ul class="mt-2 space-y-1 text-sm text-slate-600">
      <li v-for="(h, i) in hours" :key="i">
        {{ String(h.hour).padStart(2, '0') }}:00–{{ String(h.endHour).padStart(2, '0') }}:00
        ({{ h.totalMinutes }} min)
        <span v-if="h.categoryName" class="text-slate-500"> · {{ h.categoryName }}</span>
      </li>
    </ul>
  </AnalyticsInsightCard>
</template>
