<script setup lang="ts">
import type { EntryTemplate } from '@wheredidmytimego/shared'

const props = defineProps<{
  templates: EntryTemplate[]
}>()

const emit = defineEmits<{
  apply: [template: EntryTemplate]
  delete: [id: number]
}>()

let pressTimer: ReturnType<typeof setTimeout> | null = null

function onPointerDown(id: number) {
  pressTimer = setTimeout(() => {
    if (confirm('Delete this template?')) emit('delete', id)
  }, 600)
}

function onPointerUp() {
  if (pressTimer) clearTimeout(pressTimer)
  pressTimer = null
}
</script>

<template>
  <div v-if="templates.length" class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
    <button
      v-for="t in templates"
      :key="t.id"
      type="button"
      class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95 active:bg-slate-100"
      @click="emit('apply', t)"
      @pointerdown="onPointerDown(t.id)"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      {{ t.label }}
    </button>
  </div>
</template>
