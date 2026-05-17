<script setup lang="ts">
import type { CorrelationInsight } from '@wheredidmytimego/shared'

defineProps<{
  insight: CorrelationInsight
}>()
</script>

<template>
  <AnalyticsInsightCard>
    <p class="font-medium">Productivity pattern</p>
    <p class="mt-1 text-sm text-slate-600">
      Days with <strong>&gt;{{ Math.round(insight.highMinutesThreshold / 60) }}h
      {{ insight.categoryName }}</strong>
      had higher productivity scores (+{{ insight.delta }} avg vs lighter days).
    </p>
  </AnalyticsInsightCard>
</template>
