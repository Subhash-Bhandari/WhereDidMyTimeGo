import type { TimeEntryCreateInput } from '@wheredidmytimego/shared'
import { useDashboardStore } from '~/stores/dashboard'
import { useOnlineStatus } from '~/composables/useOnlineStatus'
import {
  deletePendingEntry,
  getAllPendingEntries,
  getPendingEntry,
  putPendingEntry,
  setMeta,
  type PendingEntry
} from '~/lib/offline-db'

const MAX_RETRIES = 5

export const syncingCount = ref(0)

function backoffMs(retryCount: number) {
  return Math.min(60_000, 1000 * 2 ** retryCount)
}

async function postTimeEntry(localId: string, payload: TimeEntryCreateInput) {
  const config = useRuntimeConfig()
  const base = (config.public.apiBaseUrl as string) || ''
  const res = await fetch(`${base}/api/time-entries`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': localId
    },
    body: JSON.stringify(payload)
  })
  let body: unknown = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { message: text }
    }
  }
  return { status: res.status, body }
}

async function processOne(entry: PendingEntry): Promise<'synced' | 'failed' | 'retry'> {
  await putPendingEntry({ ...entry, status: 'syncing', lastError: undefined })
  syncingCount.value += 1
  try {
    const { status, body } = await postTimeEntry(entry.localId, entry.payload)
    if (status === 201) {
      await deletePendingEntry(entry.localId)
      return 'synced'
    }
    if (status === 401) {
      if (import.meta.client) {
        await navigateTo({ path: '/login', query: { expired: '1' } })
      }
      await putPendingEntry({ ...entry, status: 'pending' })
      return 'retry'
    }
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: string }).message)
        : `Sync failed (${status})`
    if (status >= 400 && status < 500) {
      await putPendingEntry({
        ...entry,
        status: 'failed',
        lastError: message
      })
      return 'failed'
    }
    const nextRetry = entry.retryCount + 1
    if (nextRetry >= MAX_RETRIES) {
      await putPendingEntry({
        ...entry,
        status: 'failed',
        retryCount: nextRetry,
        lastError: message
      })
      return 'failed'
    }
    await putPendingEntry({
      ...entry,
      status: 'pending',
      retryCount: nextRetry,
      lastError: message
    })
    await new Promise((r) => setTimeout(r, backoffMs(nextRetry)))
    return 'retry'
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    const nextRetry = entry.retryCount + 1
    if (nextRetry >= MAX_RETRIES) {
      await putPendingEntry({
        ...entry,
        status: 'failed',
        retryCount: nextRetry,
        lastError: message
      })
      return 'failed'
    }
    await putPendingEntry({
      ...entry,
      status: 'pending',
      retryCount: nextRetry,
      lastError: message
    })
    await new Promise((r) => setTimeout(r, backoffMs(nextRetry)))
    return 'retry'
  } finally {
    syncingCount.value = Math.max(0, syncingCount.value - 1)
  }
}

export async function processQueue(): Promise<{ synced: number; failed: number }> {
  const { isOnlineForSync, probeReachability } = useOnlineStatus()
  if (!isOnlineForSync.value) {
    const ok = await probeReachability()
    if (!ok) return { synced: 0, failed: 0 }
  }

  let synced = 0
  let failed = 0
  const entries = (await getAllPendingEntries()).filter(
    (e) => e.status === 'pending' || e.status === 'syncing'
  )

  for (const entry of entries) {
    const current = (await getPendingEntry(entry.localId)) ?? entry
    if (current.status === 'failed') continue
    const result = await processOne(current)
    if (result === 'synced') synced += 1
    if (result === 'failed') failed += 1
  }

  if (synced > 0) {
    await setMeta('lastSyncAt', new Date().toISOString())
    const dashboard = useDashboardStore()
    await dashboard.refresh()
  }

  return { synced, failed }
}

export async function retryLocalEntry(localId: string) {
  const entry = await getPendingEntry(localId)
  if (!entry) return
  await putPendingEntry({
    ...entry,
    status: 'pending',
    retryCount: 0,
    lastError: undefined
  })
  await processQueue()
}
