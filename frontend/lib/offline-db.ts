import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { TimeEntryCreateInput } from '@wheredidmytimego/shared'

export type PendingStatus = 'pending' | 'syncing' | 'failed'

export type PendingEntry = {
  localId: string
  payload: TimeEntryCreateInput
  createdAt: string
  status: PendingStatus
  retryCount: number
  lastError?: string
}

interface OfflineDbSchema extends DBSchema {
  pending_entries: {
    key: string
    value: PendingEntry
    indexes: { status: PendingStatus }
  }
  meta: {
    key: string
    value: string
  }
}

const DB_NAME = 'wheredidmytimego-offline'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OfflineDbSchema>> | null = null

export function getOfflineDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('pending_entries', { keyPath: 'localId' })
        store.createIndex('status', 'status')
        db.createObjectStore('meta')
      }
    })
  }
  return dbPromise
}

export async function putPendingEntry(entry: PendingEntry) {
  const db = await getOfflineDb()
  await db.put('pending_entries', entry)
}

export async function getPendingEntry(localId: string) {
  const db = await getOfflineDb()
  return db.get('pending_entries', localId)
}

export async function getAllPendingEntries() {
  const db = await getOfflineDb()
  return db.getAll('pending_entries')
}

export async function deletePendingEntry(localId: string) {
  const db = await getOfflineDb()
  await db.delete('pending_entries', localId)
}

export async function clearAllPendingEntries() {
  const db = await getOfflineDb()
  await db.clear('pending_entries')
}

export async function getMeta(key: string) {
  const db = await getOfflineDb()
  return db.get('meta', key)
}

export async function setMeta(key: string, value: string) {
  const db = await getOfflineDb()
  await db.put('meta', value, key)
}
