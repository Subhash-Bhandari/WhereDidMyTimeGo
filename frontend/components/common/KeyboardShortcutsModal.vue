<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

function close() {
  open.value = false
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="close"
  >
    <UiCard class="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Keyboard shortcuts</h2>
        <UiButton variant="ghost" size="sm" @click="close">Close</UiButton>
      </div>
      <div class="space-y-4 text-sm">
        <div>
          <p class="font-medium text-slate-900">Global</p>
          <ul class="mt-1 space-y-1 text-slate-600">
            <li><kbd class="rounded bg-slate-100 px-1">a</kbd> — Quick Add</li>
            <li><kbd class="rounded bg-slate-100 px-1">d</kbd> — Dashboard</li>
            <li><kbd class="rounded bg-slate-100 px-1">?</kbd> — This help</li>
          </ul>
        </div>
        <div>
          <p class="font-medium text-slate-900">Quick Add</p>
          <ul class="mt-1 space-y-1 text-slate-600">
            <li>
              <kbd class="rounded bg-slate-100 px-1">/</kbd> or
              <kbd class="rounded bg-slate-100 px-1">f</kbd> — Focus shorthand
            </li>
            <li>
              <kbd class="rounded bg-slate-100 px-1">1</kbd>–<kbd class="rounded bg-slate-100 px-1">5</kbd>
              — Select category
            </li>
            <li>
              <kbd class="rounded bg-slate-100 px-1">⌘/Ctrl</kbd> +
              <kbd class="rounded bg-slate-100 px-1">Enter</kbd> — Submit
            </li>
            <li>
              <kbd class="rounded bg-slate-100 px-1">⌘/Ctrl</kbd> +
              <kbd class="rounded bg-slate-100 px-1">⇧</kbd> +
              <kbd class="rounded bg-slate-100 px-1">Enter</kbd> — Submit &amp; new
            </li>
            <li><kbd class="rounded bg-slate-100 px-1">Esc</kbd> — Clear form</li>
          </ul>
        </div>
      </div>
    </UiCard>
  </div>
</template>
