<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'default', size: 'default', type: 'button' }
)

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
    props.size === 'sm' && 'h-9 px-3 text-sm',
    props.size === 'lg' && 'h-12 px-6 text-base min-h-[48px]',
    props.size === 'default' && 'h-10 px-4 text-sm min-h-[44px]',
    props.variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-800',
    props.variant === 'outline' && 'border border-slate-200 bg-white hover:bg-slate-50',
    props.variant === 'ghost' && 'hover:bg-slate-100'
  )
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
