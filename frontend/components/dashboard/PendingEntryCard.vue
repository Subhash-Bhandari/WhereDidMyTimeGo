<script setup lang="ts">
import { CloudOff } from 'lucide-vue-next'
import type { TodayEntry } from '~/stores/dashboard'

defineProps<{
  entry: TodayEntry
}>()

defineEmits<{
  delete: []
}>()

function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  return min ? `${h}h ${min}m` : `${h}h`
}
</script>

<template>
  <li
    class="flex items-center justify-between rounded-lg border border-dashed border-amber-300 bg-amber-50/80 px-3 py-2 text-sm"
  >
    <motion class="flex items-start gap-2">
      <CloudOff class="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <motion>
        <p class="font-medium">{{ entry.title }}</p>
        <p class="text-amber-800/80">{{ formatMinutes(entry.durationMinutes) }}</p>
        <p class="text-xs text-amber-700">
          {{
            entry.syncStatus === 'syncing'
              ? 'Syncing…'
              : 'Pending sync'
          }}
        </p>
      </motion>
    </motion>
    <UiButton size="sm" variant="ghost" @click="$emit('delete')">Remove</UiButton>
  </li>
</template>
