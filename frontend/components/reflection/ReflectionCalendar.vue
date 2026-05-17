<script setup lang="ts">
import dayjs from 'dayjs'

const props = defineProps<{
  reflectionDates: string[]
  timezone: string
}>()

const days = computed(() => {
  const tz = props.timezone
  const set = new Set(props.reflectionDates)
  const out: { date: string; label: string; filled: boolean }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = dayjs().tz(tz).subtract(i, 'day')
    const date = d.format('YYYY-MM-DD')
    out.push({
      date,
      label: d.format('D'),
      filled: set.has(date)
    })
  }
  return out
})
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-slate-700">Last 30 days</p>
    <div class="grid grid-cols-10 gap-1 sm:grid-cols-15">
      <div
        v-for="d in days"
        :key="d.date"
        :title="d.date"
        class="flex h-8 w-8 items-center justify-center rounded text-xs"
        :class="d.filled ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'"
      >
        {{ d.label }}
      </div>
    </div>
  </div>
</template>
