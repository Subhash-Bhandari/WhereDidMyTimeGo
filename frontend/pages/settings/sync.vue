<script setup lang="ts">
import type { TimeEntryCreateInput } from '@wheredidmytimego/shared'

definePageMeta({ middleware: 'auth' })

const queue = useOfflineQueue()
const router = useRouter()
const toast = useToast()
const categories = useCategoriesStore()

const editingId = ref<string | null>(null)
const form = ref<TimeEntryCreateInput | null>(null)

onMounted(async () => {
  await categories.fetchCategories()
  await queue.refresh()
})

function startEdit(localId: string) {
  const entry = queue.listFailed().find((e) => e.localId === localId)
  if (!entry) return
  editingId.value = localId
  form.value = { ...entry.payload }
}

async function saveAndRetry() {
  if (!editingId.value || !form.value) return
  const entry = queue.listFailed().find((e) => e.localId === editingId.value)
  if (!entry) return
  const { putPendingEntry } = await import('~/lib/offline-db')
  await putPendingEntry({
    ...entry,
    payload: form.value,
    status: 'pending',
    retryCount: 0,
    lastError: undefined
  })
  await queue.refresh()
  editingId.value = null
  form.value = null
  await queue.retryLocalEntry(entry.localId)
  toast.success('Retrying sync')
}

async function remove(localId: string) {
  if (!confirm('Delete this local copy?')) return
  await queue.removeEntry(localId)
  toast.success('Removed')
}

function goQuickAdd() {
  router.push('/add')
}
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6">
    <div>
      <NuxtLink to="/settings" class="text-sm text-slate-600 hover:underline">← Settings</NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold">Sync issues</h1>
      <p class="mt-1 text-sm text-slate-600">Entries that could not sync to the server.</p>
    </div>

    <UiCard v-if="!queue.listFailed().length" class="p-4 text-sm text-slate-600">
      No failed entries. You are all caught up.
    </UiCard>

    <ul v-else class="space-y-3">
      <li
        v-for="entry in queue.listFailed()"
        :key="entry.localId"
        class="rounded-lg border border-red-200 bg-red-50/50 p-4"
      >
        <p class="font-medium">{{ entry.payload.title }}</p>
        <p class="text-sm text-slate-600">{{ entry.payload.durationMinutes }} min</p>
        <p v-if="entry.lastError" class="mt-2 text-sm text-red-800">{{ entry.lastError }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UiButton size="sm" variant="outline" @click="startEdit(entry.localId)">Edit & retry</UiButton>
          <UiButton size="sm" variant="ghost" @click="remove(entry.localId)">Delete</UiButton>
        </div>
      </li>
    </ul>

    <UiCard v-if="editingId && form" class="space-y-3 p-4">
      <h2 class="font-medium">Edit entry</h2>
      <label class="block text-sm">
        Title
        <input v-model="form.title" class="mt-1 w-full rounded border px-2 py-1" />
      </label>
      <label class="block text-sm">
        Duration (minutes)
        <input v-model.number="form.durationMinutes" type="number" class="mt-1 w-full rounded border px-2 py-1" />
      </label>
      <div class="flex gap-2">
        <UiButton size="sm" @click="saveAndRetry">Save & retry</UiButton>
        <UiButton size="sm" variant="ghost" @click="editingId = null">Cancel</UiButton>
      </div>
    </UiCard>

    <UiButton variant="outline" @click="goQuickAdd">Open Quick Add</UiButton>
  </section>
</template>
