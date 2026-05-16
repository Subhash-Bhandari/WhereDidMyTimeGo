<script setup lang="ts">
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  days: { date: string; totalMinutes: number }[]
}>()

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 16, top: 24, bottom: 32 },
  xAxis: {
    type: 'category',
    data: props.days.map((d) => d.date.slice(5))
  },
  yAxis: { type: 'value', name: 'min' },
  series: [
    {
      type: 'bar',
      data: props.days.map((d) => d.totalMinutes),
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
    }
  ]
}))
</script>

<template>
  <UiCard class="p-4">
    <h2 class="mb-2 font-medium">This week</h2>
    <VChart class="h-56 w-full" :option="option" autoresize />
  </UiCard>
</template>
