<script setup lang="ts">
import type { Category } from '@/stores/categories'
import type { TimeEntryRow } from '@/stores/dashboard'

const props = defineProps<{
  open: boolean
  entry: TimeEntryRow | null
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: {
    title: string
    categoryId: number | null
    startedAt: string
    endedAt: string
    durationMinutes: number
  }]
}>()

const title = ref('')
const categoryId = ref<number | null>(null)
const durationMinutes = ref(30)

watch(
  () => props.entry,
  (e) => {
    if (!e) return
    title.value = e.title
    categoryId.value = e.categoryId
    durationMinutes.value = e.durationMinutes
  },
  { immediate: true }
)

function close() {
  emit('update:open', false)
}

function save() {
  if (!props.entry) return
  const end = new Date(props.entry.endedAt)
  const start = new Date(end.getTime() - durationMinutes.value * 60_000)
  emit('save', {
    title: title.value,
    categoryId: categoryId.value,
    startedAt: start.toISOString(),
    endedAt: end.toISOString(),
    durationMinutes: durationMinutes.value
  })
  close()
}
</script>

<template>
  <div
    v-if="open && entry"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    @click.self="close"
  >
    <UiCard class="w-full max-w-md space-y-4 p-4">
      <h2 class="font-semibold">Edit entry</h2>
      <UiInput v-model="title" />
      <select v-model="categoryId" class="flex h-10 w-full rounded-md border px-3 text-sm">
        <option :value="null">None</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <UiInput v-model.number="durationMinutes" type="number" min="1" />
      <div class="flex gap-2">
        <UiButton variant="outline" class="flex-1" @click="close">Cancel</UiButton>
        <UiButton class="flex-1" @click="save">Save</UiButton>
      </div>
    </UiCard>
  </div>
</template>
