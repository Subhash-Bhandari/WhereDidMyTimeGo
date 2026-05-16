<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('rounded-xl border border-slate-200 bg-white shadow-sm')">
    <slot />
  </div>
</template>
