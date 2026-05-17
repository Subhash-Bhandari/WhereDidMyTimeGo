import type { TimeEntryCreateInput } from '@wheredidmytimego/shared'
import {
  clearAllPendingEntries,
  deletePendingEntry,
  getAllPendingEntries,
  putPendingEntry,
  type PendingEntry,
  type PendingStatus
} from '~/lib/offline-db'
import { processQueue, retryLocalEntry, syncingCount } from '~/lib/sync-processor'

function newLocalId() {
  return crypto.randomUUID()
}

export function useOfflineQueue() {
  const entries = useState<PendingEntry[]>('offline-queue-entries', () => [])

  async function refresh() {
    if (import.meta.client) {
      entries.value = await getAllPendingEntries()
    }
  }

  const pendingCount = computed(
    () => entries.value.filter((e) => e.status === 'pending' || e.status === 'syncing').length
  )
  const failedCount = computed(() => entries.value.filter((e) => e.status === 'failed').length)
  const syncing = syncingCount

  async function enqueueEntry(payload: TimeEntryCreateInput) {
    const localId = newLocalId()
    const entry: PendingEntry = {
      localId,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    }
    await putPendingEntry(entry)
    await refresh()
    const dashboard = useDashboardStore()
    dashboard.mergePendingFromQueue()
    return localId
  }

  async function syncAll() {
    const result = await processQueue()
    await refresh()
    const dashboard = useDashboardStore()
    dashboard.mergePendingFromQueue()
    return result
  }

  async function clearQueue() {
    await clearAllPendingEntries()
    await refresh()
    const dashboard = useDashboardStore()
    dashboard.mergePendingFromQueue()
  }

  async function removeEntry(localId: string) {
    await deletePendingEntry(localId)
    await refresh()
    const dashboard = useDashboardStore()
    dashboard.mergePendingFromQueue()
  }

  async function updateEntryStatus(localId: string, status: PendingStatus, lastError?: string) {
    const list = await getAllPendingEntries()
    const entry = list.find((e) => e.localId === localId)
    if (!entry) return
    await putPendingEntry({ ...entry, status, lastError })
    await refresh()
    const dashboard = useDashboardStore()
    dashboard.mergePendingFromQueue()
  }

  function listPending() {
    return entries.value.filter((e) => e.status === 'pending' || e.status === 'syncing')
  }

  function listFailed() {
    return entries.value.filter((e) => e.status === 'failed')
  }

  if (import.meta.client) {
    onMounted(() => {
      void refresh()
    })
  }

  return {
    entries,
    pendingCount,
    failedCount,
    syncing,
    refresh,
    enqueueEntry,
    syncAll,
    clearQueue,
    removeEntry,
    updateEntryStatus,
    listPending,
    listFailed,
    retryLocalEntry
  }
}
