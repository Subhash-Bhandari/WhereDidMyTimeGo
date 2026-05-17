<script setup lang="ts">
import type { ParseEntryResult, EntryTemplate } from '@wheredidmytimego/shared'

definePageMeta({ middleware: 'auth' })

const { api } = useApi()
const toast = useToast()
const { isOnlineForSync } = useOnlineStatus()
const offlineQueue = useOfflineQueue()
const categories = useCategoriesStore()
const router = useRouter()

const shorthand = ref('')
const parsed = ref<ParseEntryResult | null>(null)
const templates = ref<EntryTemplate[]>([])
const loading = ref(false)
const alwaysConfirm = ref(false)
const clearAfterSubmit = ref(false)

const formRef = ref<{
  setTitle: (v: string) => void
  setDuration: (m: number) => void
  setCategoryId: (id: number | null) => void
  selectCategoryByIndex: (i: number) => void
  clearForm: () => void
  submitForm: () => void
  getValues: () => { title: string; categoryId: number | null; durationMinutes: number }
} | null>(null)

const shorthandInputRef = ref<{ $el?: HTMLElement } | null>(null)

onMounted(async () => {
  await categories.fetchCategories()
  await loadTemplates()
  if (import.meta.client) {
    alwaysConfirm.value = localStorage.getItem('quick_add_confirm_always') === 'true'
  }
})

watch(alwaysConfirm, (v) => {
  if (import.meta.client) {
    localStorage.setItem('quick_add_confirm_always', v ? 'true' : 'false')
  }
})

async function loadTemplates() {
  try {
    const res = await api<{ items: EntryTemplate[] }>('/api/templates')
    templates.value = res.items
  } catch {
    templates.value = []
  }
}

function onParsed(result: ParseEntryResult | null) {
  parsed.value = result
}

function applyParsed() {
  if (!parsed.value || !formRef.value) return
  formRef.value.setTitle(parsed.value.title)
  if (parsed.value.durationMinutes != null) {
    formRef.value.setDuration(parsed.value.durationMinutes)
  }
  if (parsed.value.categoryId != null) {
    formRef.value.setCategoryId(parsed.value.categoryId)
  }
  shorthand.value = ''
  parsed.value = null
}

function applyTemplate(t: EntryTemplate) {
  if (!formRef.value) return
  formRef.value.setTitle(t.title)
  formRef.value.setDuration(t.durationMinutes)
  formRef.value.setCategoryId(t.categoryId)
}

async function saveTemplate() {
  if (!formRef.value) return
  const label = prompt('Template label (chip name)?')
  if (!label?.trim()) return
  const values = formRef.value.getValues()
  if (!values.title) {
    toast.error('Fill in the form first')
    return
  }
  try {
    await api('/api/templates', {
      method: 'POST',
      body: {
        label: label.trim(),
        title: values.title,
        categoryId: values.categoryId,
        durationMinutes: values.durationMinutes
      }
    })
    await loadTemplates()
    toast.success('Template saved')
  } catch {
    toast.error('Could not save template')
  }
}

async function deleteTemplate(id: number) {
  try {
    await api(`/api/templates/${id}`, { method: 'DELETE' })
    templates.value = templates.value.filter((t) => t.id !== id)
  } catch {
    toast.error('Could not delete template')
  }
}

async function onSubmit(payload: {
  title: string
  categoryId: number | null
  durationMinutes: number
}) {
  if (alwaysConfirm.value) {
    const ok = confirm(`Log "${payload.title}" for ${payload.durationMinutes} min?`)
    if (!ok) return
  }
  loading.value = true
  const end = new Date()
  const start = new Date(end.getTime() - payload.durationMinutes * 60_000)
  const body = {
    title: payload.title,
    categoryId: payload.categoryId,
    startedAt: start.toISOString(),
    endedAt: end.toISOString(),
    durationMinutes: payload.durationMinutes
  }
  try {
    if (isOnlineForSync.value) {
      await api('/api/time-entries', {
        method: 'POST',
        body
      })
      toast.success('Time logged')
    } else {
      await offlineQueue.enqueueEntry(body)
      toast.success('Saved offline — will sync when connected')
    }
    if (clearAfterSubmit.value) {
      formRef.value?.clearForm()
      shorthand.value = ''
      parsed.value = null
    } else {
      await router.push('/')
    }
  } catch {
    toast.error('Could not save entry')
  } finally {
    loading.value = false
  }
}

function focusShorthand() {
  const el = shorthandInputRef.value?.$el?.querySelector?.('input') as HTMLInputElement | undefined
  el?.focus()
}

useKeyboardShortcuts([
  { key: '/', handler: () => focusShorthand() },
  { key: 'f', handler: () => focusShorthand() },
  { key: '1', handler: () => formRef.value?.selectCategoryByIndex(0) },
  { key: '2', handler: () => formRef.value?.selectCategoryByIndex(1) },
  { key: '3', handler: () => formRef.value?.selectCategoryByIndex(2) },
  { key: '4', handler: () => formRef.value?.selectCategoryByIndex(3) },
  { key: '5', handler: () => formRef.value?.selectCategoryByIndex(4) },
  {
    key: 'Enter',
    ctrlOrMeta: true,
    shift: true,
    handler: () => {
      clearAfterSubmit.value = true
      formRef.value?.submitForm()
      clearAfterSubmit.value = false
    }
  },
  {
    key: 'Enter',
    ctrlOrMeta: true,
    handler: () => formRef.value?.submitForm()
  },
  {
    key: 'Escape',
    handler: () => {
      formRef.value?.clearForm()
      shorthand.value = ''
      parsed.value = null
    }
  }
])
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6">
    <h1 class="text-2xl font-semibold">Quick Add</h1>

    <UiCard class="p-4">
      <AddQuickParseInput
        ref="shorthandInputRef"
        v-model="shorthand"
        :categories="categories.categories"
        @parsed="onParsed"
      />
      <AddParsePreview
        v-if="parsed"
        :result="parsed"
        :categories="categories.categories"
        @apply="applyParsed"
      />
    </UiCard>

    <UiCard class="p-4 space-y-3">
      <AddTemplateChips
        :templates="templates"
        @apply="applyTemplate"
        @delete="deleteTemplate"
      />
      <EntriesQuickAddForm
        ref="formRef"
        :categories="categories.categories"
        :loading="loading"
        @submit="onSubmit"
      />
      <label class="flex items-center gap-2 text-sm text-slate-600">
        <input v-model="alwaysConfirm" type="checkbox" class="rounded" />
        Always ask before save
      </label>
      <UiButton variant="outline" size="sm" @click="saveTemplate">Save as template</UiButton>
      <p class="text-xs text-slate-500">Press ? for shortcuts · ⌘/Ctrl + Enter to submit</p>
    </UiCard>
  </section>
</template>
