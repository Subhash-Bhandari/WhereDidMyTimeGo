<script setup lang="ts">
const { browserOnline, apiReachable, isOnlineForSync } = useOnlineStatus()
const queue = useOfflineQueue()

const showOffline = computed(() => !browserOnline.value || !apiReachable.value)
const syncing = computed(() => queue.syncing.value > 0)
</script>

<template>
  <div
    v-if="showOffline || syncing || queue.failedCount > 0"
    class="border-b px-4 py-2 text-center text-sm"
    :class="
      showOffline
        ? 'border-amber-200 bg-amber-50 text-amber-950'
        : 'border-sky-200 bg-sky-50 text-sky-950'
    "
  >
    <p v-if="showOffline">
      Offline — changes will sync when connected.
      <NuxtLink to="/add" class="ml-1 font-medium underline">Log time</NuxtLink>
    </p>
    <p v-else-if="syncing">Syncing {{ queue.syncing }} {{ queue.syncing === 1 ? 'entry' : 'entries' }}…</p>
    <p v-if="queue.failedCount > 0 && !showOffline">
      <NuxtLink to="/settings/sync" class="font-medium underline">
        Sync issues ({{ queue.failedCount }})
      </NuxtLink>
    </p>
  </div>
</template>
