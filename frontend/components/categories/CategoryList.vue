<script setup lang="ts">
import type { Category } from '@/stores/categories'

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  edit: [category: Category]
  delete: [id: number]
}>()

function onDelete(id: number, name: string) {
  if (confirm(`Delete category "${name}"? Entries will become uncategorized.`)) {
    emit('delete', id)
  }
}
</script>

<template>
  <ul v-if="categories.length" class="divide-y rounded-lg border border-slate-200 bg-white">
    <li
      v-for="c in categories"
      :key="c.id"
      class="flex items-center justify-between gap-3 px-4 py-3"
    >
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="h-4 w-4 shrink-0 rounded-full"
          :style="{ backgroundColor: c.color }"
          aria-hidden="true"
        />
        <div class="min-w-0">
          <p class="truncate font-medium">{{ c.name }}</p>
          <p class="text-xs text-slate-500">{{ c.icon }}</p>
        </div>
      </div>
      <div class="flex shrink-0 gap-2">
        <UiButton size="sm" variant="ghost" @click="emit('edit', c)">Edit</UiButton>
        <UiButton size="sm" variant="ghost" @click="onDelete(c.id, c.name)">Delete</UiButton>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-slate-600">No categories yet. Create one below.</p>
</template>
