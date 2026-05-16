<script setup lang="ts">
import type { Category } from '@/stores/categories'

const props = defineProps<{
  categories: Category[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: {
    title: string
    categoryId: number | null
    durationMinutes: number
  }]
}>()

const title = ref('')
const categoryId = ref<number | null>(null)
const durationMinutes = ref(60)

const chips = [15, 30, 60, 120]

function selectChip(minutes: number) {
  durationMinutes.value = minutes
}

function onSubmit() {
  if (!title.value.trim()) return
  emit('submit', {
    title: title.value.trim(),
    categoryId: categoryId.value,
    durationMinutes: durationMinutes.value
  })
}

defineExpose({
  setTitle: (v: string) => {
    title.value = v
  },
  setDuration: (m: number) => {
    durationMinutes.value = m
  }
})
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1">
      <UiLabel>What did you do?</UiLabel>
      <UiInput v-model="title" placeholder="e.g. DSA practice" />
    </div>
    <div class="space-y-1">
      <UiLabel>Category</UiLabel>
      <select
        v-model="categoryId"
        class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
      >
        <option :value="null">None</option>
        <option v-for="c in props.categories" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
    </div>
    <div class="space-y-2">
      <UiLabel>Duration</UiLabel>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="m in chips"
          :key="m"
          type="button"
          class="min-h-[44px] rounded-full border px-4 text-sm transition-colors"
          :class="
            durationMinutes === m
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          "
          @click="selectChip(m)"
        >
          {{ m < 60 ? `${m}m` : `${m / 60}h` }}
        </button>
      </div>
    </div>
    <UiButton type="submit" size="lg" class="w-full" :disabled="loading || !title.trim()">
      Log time
    </UiButton>
  </form>
</template>
