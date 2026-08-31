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
  comment: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  // Keyed by authenticated admin id (not IP), so these only guard against a
  // single runaway session, not abuse from strangers. Set high enough that
  // no human clicking through the UI could ever hit them — this is a
  // backstop against a client-side bug hammering the shared DB connection
  // pool, not a throttle on real bulk catalog work (editing/uploading
  // photos across ~2000 products). A short 1-minute window means even a
  // false trip clears almost immediately instead of locking out for 15min.
  upload: { maxAttempts: 1000, windowMs: 60 * 1000 },
  adminApi: { maxAttempts: 5000, windowMs: 60 * 1000 },
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
