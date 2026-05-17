<script setup lang="ts">
const DISMISS_KEY = 'pwa_install_dismissed'
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const visible = ref(false)
const { getVisitCount } = usePwaVisit()

function isStandalone() {
  if (!import.meta.client) return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const ts = Date.parse(raw)
  return Number.isFinite(ts) && Date.now() - ts < COOLDOWN_MS
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, new Date().toISOString())
  visible.value = false
}

async function install() {
  if (!deferredPrompt.value) return
  await deferredPrompt.value.prompt()
  deferredPrompt.value = null
  visible.value = false
}

onMounted(() => {
  if (isStandalone() || isDismissed()) return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    if (getVisitCount() >= 2) {
      visible.value = true
    }
  })
})

watch(
  () => getVisitCount(),
  (count) => {
    if (deferredPrompt.value && count >= 2 && !isDismissed() && !isStandalone()) {
      visible.value = true
    }
  }
)
</script>

<template>
  <div
    v-if="visible"
    class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
  >
    <p class="text-sm text-slate-700">Install TimeGo for quick access from your home screen.</p>
    <motion class="flex gap-2">
      <UiButton size="sm" @click="install">Install</UiButton>
      <UiButton size="sm" variant="ghost" @click="dismiss">Not now</UiButton>
    </motion>
  </div>
</template>
