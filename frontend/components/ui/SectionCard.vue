<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="rounded-lg border bg-white p-4 shadow-sm">
    <h2 class="mb-2 font-medium">{{ title }}</h2>
    <slot />
  </section>
</template>
