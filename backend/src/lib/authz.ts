import type { Context } from 'hono'
import { forbidden } from './errors'

export function assertOwner(
  c: Context,
  resourceUserId: number,
  sessionUserId: number
): Response | void {
  if (resourceUserId !== sessionUserId) {
    return forbidden(c, 'Access denied')
  }
}
