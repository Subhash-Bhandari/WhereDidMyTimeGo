<script setup lang="ts">
defineProps<{ open: boolean }>()

const emit = defineEmits<{
  dismiss: []
  goReflect: []
}>()
</script>

<template>
  <div
    v-if="open"
    class="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg rounded-lg border border-violet-200 bg-violet-50 p-4 shadow-lg md:bottom-6"
    role="status"
  >
    <p class="text-sm font-medium text-violet-900">Reflect on your day?</p>
    <p class="mt-1 text-xs text-violet-800">You have not saved today&apos;s reflection yet.</p>
    <div class="mt-3 flex gap-2">
      <UiButton size="sm" variant="outline" @click="emit('dismiss')">Later</UiButton>
      <UiButton size="sm" @click="emit('goReflect')">Reflect now</UiButton>
    </div>
  </div>
</template>
