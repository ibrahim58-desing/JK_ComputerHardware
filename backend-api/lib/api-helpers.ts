import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/errors'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('true-client-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
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

/** For /api/admin/* routes. Disabled (always allows) — admin routes are
 *  already behind middleware's JWT check, and counting requests per admin
 *  kept tripping false "Too many requests" lockouts during legitimate bulk
 *  catalog work (editing/uploading photos across ~2000 products). Kept as
 *  a function (rather than removing all ~11 call sites) so it can be
 *  re-enabled in one place if ever needed. */
export async function applyAdminRateLimit(
  _request: NextRequest,
  _namespace: string,
  _config?: Partial<RateLimitConfig>
) {
  return null
}

export function methodNotAllowed(allowed: string[]) {
  return errorResponse(`Method not allowed. Allowed: ${allowed.join(', ')}`, 405)
}
