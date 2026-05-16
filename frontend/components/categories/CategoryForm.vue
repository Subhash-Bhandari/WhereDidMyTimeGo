<script setup lang="ts">
import type { Category } from '@/stores/categories'
import { COLOR_PRESETS, ICON_PRESETS } from '@/constants/categoryPresets'

const props = defineProps<{
  category?: Category | null
}>()

const emit = defineEmits<{
  submit: [payload: { name: string; color: string; icon: string }]
  cancel: []
}>()

const name = ref('')
const color = ref<string>(COLOR_PRESETS[0])
const icon = ref<string>(ICON_PRESETS[0])
const error = ref('')

watch(
  () => props.category,
  (c) => {
    if (c) {
      name.value = c.name
      color.value = c.color
      icon.value = c.icon
    } else {
      name.value = ''
      color.value = COLOR_PRESETS[0]
      icon.value = ICON_PRESETS[0]
    }
    error.value = ''
  },
  { immediate: true }
)

function validate(): boolean {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Name is required'
    return false
  }
  if (trimmed.length > 80) {
    error.value = 'Name must be 80 characters or less'
    return false
  }
  error.value = ''
  return true
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    name: name.value.trim(),
    color: color.value,
    icon: icon.value
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1">
      <UiLabel>Name</UiLabel>
      <UiInput v-model="name" placeholder="Category name" maxlength="80" />
    </div>
    <div class="space-y-2">
      <UiLabel>Color</UiLabel>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in COLOR_PRESETS"
          :key="c"
          type="button"
          class="h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          :class="color === c ? 'border-slate-900' : 'border-transparent'"
          :style="{ backgroundColor: c }"
          :aria-label="`Color ${c}`"
          @click="color = c"
        />
      </div>
    </div>
    <div class="space-y-2">
      <UiLabel>Icon</UiLabel>
      <select
        v-model="icon"
        class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <option v-for="i in ICON_PRESETS" :key="i" :value="i">{{ i }}</option>
      </select>
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="flex gap-2">
      <UiButton type="button" variant="outline" class="flex-1" @click="emit('cancel')">
        Cancel
      </UiButton>
      <UiButton type="submit" class="flex-1">
        {{ category ? 'Save' : 'Create' }}
      </UiButton>
    </div>
  </form>
</template>
