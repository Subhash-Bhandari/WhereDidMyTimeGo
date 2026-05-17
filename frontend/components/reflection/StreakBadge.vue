<script setup lang="ts">
import type { ReflectionStreak } from '@wheredidmytimego/shared'

const props = defineProps<{
  streak: ReflectionStreak | null
  loading?: boolean
}>()

const pulse = ref(false)
const prevCount = ref<number | null>(null)

watch(
  () => props.streak?.currentStreak,
  (next, prev) => {
    if (next == null) return
    if (prev != null && next > prev) {
      pulse.value = true
      setTimeout(() => {
        pulse.value = false
      }, 600)
    }
    prevCount.value = next
  }
)
</script>

<template>
  <UiSkeleton v-if="loading" class="h-8 w-28" />
  <div
    v-else-if="streak"
    class="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800 transition-transform"
    :class="pulse ? 'animate-pulse scale-105' : ''"
  >
    <span aria-hidden="true">🔥</span>
    <span>{{ streak.currentStreak }} day streak</span>
    <span v-if="streak.longestStreak > 0" class="text-xs font-normal text-orange-600">
      (best {{ streak.longestStreak }})
    </span>
  </div>
</template>
