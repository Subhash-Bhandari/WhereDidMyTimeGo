<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="cn('animate-pulse rounded-md bg-slate-200', $props.class)"
    role="status"
    aria-label="Loading"
  />
</template>
