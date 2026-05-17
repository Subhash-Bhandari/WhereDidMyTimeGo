<script setup lang="ts">
import { parseQuickEntry } from '@wheredidmytimego/shared'
import type { ParseEntryResult } from '@wheredidmytimego/shared'
import type { Category } from '@/stores/categories'

const props = defineProps<{
  categories: Category[]
}>()

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  parsed: [result: ParseEntryResult | null]
}>()

const { api } = useApi()
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const localKeywords = computed(() =>
  props.categories.flatMap((c) => {
    const name = c.name.toLowerCase()
    return [{ keyword: name, categoryId: c.id }]
  })
)

function emitLocal() {
  const local = parseQuickEntry(model.value, localKeywords.value)
  if (!local) {
    emit('parsed', null)
    return
  }
  emit('parsed', {
    title: local.title,
    durationMinutes: local.durationMinutes,
    categoryId: local.categoryId,
    confidence: local.confidence
  })
}

async function fetchServer() {
  const text = model.value.trim()
  if (!text) {
    emit('parsed', null)
    return
  }
  try {
    const result = await api<ParseEntryResult>('/api/parse-entry', {
      method: 'POST',
      body: { text }
    })
    emit('parsed', result)
  } catch {
    emitLocal()
  }
}

function onInput() {
  emitLocal()
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchServer, 300)
}

function onBlur() {
  void fetchServer()
}
</script>

<template>
  <div>
    <p class="mb-2 text-sm text-slate-600">Shorthand (e.g. worked on donation app 2h)</p>
    <UiInput v-model="model" placeholder="DSA 2h" @input="onInput" @blur="onBlur" />
  </div>
</template>
