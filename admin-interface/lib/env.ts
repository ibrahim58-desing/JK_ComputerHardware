/**
 * Validates required environment variables at runtime.
 * Fails fast in production when secrets are missing.
 */

const REQUIRED_IN_PRODUCTION = ['DATABASE_URL', 'JWT_SECRET'] as const

export function validateEnv(): void {
  if (process.env.NODE_ENV !== 'production') return

  for (const key of REQUIRED_IN_PRODUCTION) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  const secret = process.env.JWT_SECRET!
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production')
  }
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production')
    }
    return new TextEncoder().encode('dev-only-secret-change-before-production')
  }
  return new TextEncoder().encode(secret)
}

export function getJwtIssuer(): string {
  return process.env.JWT_ISSUER || 'jk-computers'
}

export function getJwtAudience(): string {
  return process.env.JWT_AUDIENCE || 'jk-admin'
}

export const ACCESS_TOKEN_EXPIRY = process.env.ADMIN_ACCESS_TOKEN_EXPIRY || '20m'
export const REFRESH_TOKEN_EXPIRY = process.env.ADMIN_REFRESH_TOKEN_EXPIRY || '7d'
