import { and, eq, gt } from 'drizzle-orm'
import { db, idempotencyKeys } from '@wheredidmytimego/db'

const TTL_MS = 24 * 60 * 60 * 1000

export async function findIdempotentResponse(userId: number, key: string) {
  const now = new Date()
  const [row] = await db
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.userId, userId),
        eq(idempotencyKeys.key, key),
        gt(idempotencyKeys.expiresAt, now)
      )
    )
    .limit(1)
  return row?.responseBody ?? null
}

export async function storeIdempotentResponse(
  userId: number,
  key: string,
  responseBody: Record<string, unknown>
) {
  const expiresAt = new Date(Date.now() + TTL_MS)
  await db
    .insert(idempotencyKeys)
    .values({
      userId,
      key,
      responseBody,
      expiresAt
    })
    .onConflictDoUpdate({
      target: [idempotencyKeys.userId, idempotencyKeys.key],
      set: {
        responseBody,
        expiresAt
      }
    })
}
