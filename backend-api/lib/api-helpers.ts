import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/errors'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

export function getClientIp(request: NextRequest): string {
  console.log('[rate-limit debug]', {
    xff: request.headers.get('x-forwarded-for'),
    xri: request.headers.get('x-real-ip'),
  })
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

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

export function methodNotAllowed(allowed: string[]) {
  return errorResponse(`Method not allowed. Allowed: ${allowed.join(', ')}`, 405)
}
