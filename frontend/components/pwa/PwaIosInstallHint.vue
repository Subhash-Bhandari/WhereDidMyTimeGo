<script setup lang="ts">
const show = ref(false)

function isIosSafari() {
  if (!import.meta.client) return false
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isSafari
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

onMounted(() => {
  show.value = isIosSafari() && !isStandalone()
})
</script>

<template>
  <motion
    v-if="show"
    class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
  >
    <p class="font-medium">Add to Home Screen</p>
    <ol class="mt-2 list-decimal space-y-1 pl-5">
      <li>Tap the Share button in Safari</li>
      <li>Choose <strong>Add to Home Screen</strong></li>
      <li>Open TimeGo from your home screen</li>
    </ol>
  </motion>
</template>
