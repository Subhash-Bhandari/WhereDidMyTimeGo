<script setup lang="ts">
import type { RangePreset } from '@/composables/useAnalyticsRange'

const preset = defineModel<RangePreset>('preset', { required: true })
const customFrom = defineModel<string>('customFrom', { default: '' })
const customTo = defineModel<string>('customTo', { default: '' })

const presets: { id: RangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This week' },
  { id: 'last_week', label: 'Last week' },
  { id: 'last_30', label: 'Last 30 days' },
  { id: 'custom', label: 'Custom' }
]

const rangeError = computed(() => {
  if (preset.value !== 'custom' || !customFrom.value || !customTo.value) return null
  return customTo.value < customFrom.value ? 'End date must be on or after start date' : null
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <UiButton
        v-for="p in presets"
        :key="p.id"
        size="sm"
        :variant="preset === p.id ? 'default' : 'outline'"
        @click="preset = p.id"
      >
        {{ p.label }}
      </UiButton>
    </div>
    <div v-if="preset === 'custom'" class="flex flex-wrap gap-2">
      <UiInput v-model="customFrom" type="date" class="w-auto" />
      <UiInput v-model="customTo" type="date" class="w-auto" />
    </div>
    <p v-if="rangeError" class="text-sm text-red-600">{{ rangeError }}</p>
  </div>
</template>
