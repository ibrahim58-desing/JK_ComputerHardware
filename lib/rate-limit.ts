/**
 * In-memory rate limiter.
 * For multi-instance production deployments, use Redis instead.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
}

const store = new Map<string, RateLimitEntry>()

export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  enquiry: { maxAttempts: 10, windowMs: 15 * 60 * 1000 },
  upload: { maxAttempts: 20, windowMs: 15 * 60 * 1000 },
  adminApi: { maxAttempts: 100, windowMs: 15 * 60 * 1000 },
} as const

export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): {
  allowed: boolean
  remaining: number
  resetIn: number
} {
  const { maxAttempts, windowMs } = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  const entry = store.get(key)

  if (entry && now > entry.resetAt) {
    store.delete(key)
  }

  const current = store.get(key)

  if (!current) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs }
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: current.resetAt - now,
    }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxAttempts - current.count,
    resetIn: current.resetAt - now,
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
