import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/errors'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'
import { verifyAuth } from '@/lib/auth'

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** For unauthenticated routes (login, public enquiry/comment forms) — keys
 *  by client IP, the only identity available before login. */
export function applyRateLimit(
  request: NextRequest,
  namespace: string,
  config?: Partial<RateLimitConfig>
) {
  const ip = getClientIp(request)
  const result = checkRateLimit(`${namespace}:${ip}`, config)

  if (!result.allowed) {
    return errorResponse(
      `Too many requests. Try again in ${Math.ceil(result.resetIn / 60000)} minutes.`,
      429
    )
  }

  return null
}

/** For /api/admin/* routes — keys by the authenticated admin's id instead
 *  of client IP. IP-based limiting behind a reverse proxy (cPanel/LiteSpeed
 *  here) depends on x-forwarded-for being forwarded correctly, and even
 *  when it is, one admin's normal usage can still collide with any other
 *  visitor sharing that IP. Every caller of this is already behind
 *  middleware's JWT check, so the admin id is always available. */
export async function applyAdminRateLimit(
  request: NextRequest,
  namespace: string,
  config?: Partial<RateLimitConfig>
) {
  const admin = await verifyAuth()
  const key = admin ? `admin-${admin.adminId}` : getClientIp(request)
  const result = checkRateLimit(`${namespace}:${key}`, config)

  if (!result.allowed) {
    return errorResponse(
      `Too many requests. Try again in ${Math.ceil(result.resetIn / 60000)} minutes.`,
      429
    )
  }

  return null
}

export function methodNotAllowed(allowed: string[]) {
  return errorResponse(`Method not allowed. Allowed: ${allowed.join(', ')}`, 405)
}
