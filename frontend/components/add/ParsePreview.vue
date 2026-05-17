<script setup lang="ts">
import type { ParseEntryResult } from '@wheredidmytimego/shared'
import type { Category } from '@/stores/categories'

const props = defineProps<{
  result: ParseEntryResult
  categories: Category[]
}>()

const emit = defineEmits<{
  apply: []
}>()

const categoryName = computed(() => {
  if (props.result.categoryId == null) return null
  return props.categories.find((c) => c.id === props.result.categoryId)?.name ?? null
})

const confidenceLabel = computed(() => {
  switch (props.result.confidence) {
    case 'high':
      return 'High confidence'
    case 'medium':
      return 'Duration matched'
    default:
      return 'Needs your input'
  }
})
</script>

<template>
  <div
    class="mt-3 animate-in fade-in rounded-md border border-slate-200 bg-slate-50 p-3 text-sm duration-200"
  >
    <p class="text-slate-600">
      Log
      <strong v-if="result.durationMinutes">{{ result.durationMinutes }} min</strong>
      <span v-else class="italic">(duration?)</span>
      <template v-if="categoryName">
        as <strong>{{ categoryName }}</strong>
      </template>
      —
      <em>{{ result.title }}</em>
    </p>
    <p class="mt-1 text-xs text-slate-500">{{ confidenceLabel }}</p>
    <UiButton size="sm" variant="outline" class="mt-2" @click="emit('apply')">
      Use suggestion
    </UiButton>
  </div>
</template>
