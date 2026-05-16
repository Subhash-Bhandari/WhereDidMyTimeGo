<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-24 right-4 z-50 flex max-w-sm flex-col gap-2 md:bottom-6"
    aria-live="polite"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg"
      :class="
        t.variant === 'success'
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-red-200 bg-red-50 text-red-900'
      "
    >
      {{ t.message }}
    </div>
  </div>
</template>
