<script setup lang="ts">
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])

export type CategoryBreakdownItem = {
  categoryId: number | null
  categoryName: string
  color: string
  totalMinutes: number
  percent: number
}

const props = defineProps<{
  items: CategoryBreakdownItem[]
  loading?: boolean
  period: 'today' | 'week'
}>()

const emit = defineEmits<{
  'update:period': [value: 'today' | 'week']
}>()

const chartItems = computed(() =>
  props.items.filter((i) => i.totalMinutes > 0)
)

const hasData = computed(() => chartItems.value.length > 0)

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} min ({d}%)'
  },
  legend: { bottom: 0, type: 'scroll' },
  series: [
    {
      type: 'pie',
      radius: ['42%', '68%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: chartItems.value.map((i) => ({
        name: i.categoryName,
        value: i.totalMinutes,
        itemStyle: { color: i.color }
      }))
    }
  ]
}))
</script>

<template>
  <UiCard class="p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="font-medium">By category</h2>
      <div class="flex shrink-0 gap-1">
        <UiButton
          size="sm"
          :variant="period === 'today' ? 'default' : 'outline'"
          @click="emit('update:period', 'today')"
        >
          Today
        </UiButton>
        <UiButton
          size="sm"
          :variant="period === 'week' ? 'default' : 'outline'"
          @click="emit('update:period', 'week')"
        >
          This week
        </UiButton>
      </div>
    </div>
    <UiSkeleton v-if="loading" class="mx-auto h-56 w-full max-w-xs" />
    <p v-else-if="!hasData" class="text-sm text-slate-600">
      No time in this period yet.
      <NuxtLink to="/add" class="font-medium underline">Log time</NuxtLink>
    </p>
    <VChart v-else class="h-56 w-full" :option="option" autoresize />
  </UiCard>
</template>
