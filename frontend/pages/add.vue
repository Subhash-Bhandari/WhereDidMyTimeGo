<script setup lang="ts">
import { parseQuickEntry } from '@/utils/parseQuickEntry'

definePageMeta({ middleware: 'auth' })

const { api } = useApi()
const toast = useToast()
const categories = useCategoriesStore()
const formRef = ref<{ setTitle: (v: string) => void; setDuration: (m: number) => void } | null>(null)

const shorthand = ref('')
const parsed = ref<{ title: string; durationMinutes: number } | null>(null)
const loading = ref(false)

onMounted(() => categories.fetchCategories())

function onParseInput() {
  parsed.value = parseQuickEntry(shorthand.value)
}

function confirmParsed() {
  if (!parsed.value || !formRef.value) return
  formRef.value.setTitle(parsed.value.title)
  formRef.value.setDuration(parsed.value.durationMinutes)
  shorthand.value = ''
  parsed.value = null
}

async function onSubmit(payload: {
  title: string
  categoryId: number | null
  durationMinutes: number
}) {
  loading.value = true
  const end = new Date()
  const start = new Date(end.getTime() - payload.durationMinutes * 60_000)
  try {
    await api('/api/time-entries', {
      method: 'POST',
      body: {
        title: payload.title,
        categoryId: payload.categoryId,
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        durationMinutes: payload.durationMinutes
      }
    })
    await navigateTo('/')
  } catch {
    toast.error('Could not save entry')
  } finally {
    loading.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    const form = document.querySelector('form')
    form?.requestSubmit()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6">
    <h1 class="text-2xl font-semibold">Quick Add</h1>

    <UiCard class="p-4">
      <p class="mb-2 text-sm text-slate-600">Shorthand (e.g. DSA 2h)</p>
      <UiInput v-model="shorthand" placeholder="DSA 2h" @input="onParseInput" />
      <div
        v-if="parsed"
        class="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
      >
        <span>{{ parsed.title }} · {{ parsed.durationMinutes }} min</span>
        <UiButton size="sm" variant="outline" @click="confirmParsed">Use</UiButton>
      </div>
    </UiCard>

    <UiCard class="p-4">
      <EntriesQuickAddForm
        ref="formRef"
        :categories="categories.categories"
        :loading="loading"
        @submit="onSubmit"
      />
      <p class="mt-2 text-xs text-slate-500">⌘/Ctrl + Enter to submit</p>
    </UiCard>
  </section>
</template>
