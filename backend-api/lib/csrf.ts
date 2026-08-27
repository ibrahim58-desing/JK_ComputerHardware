import { NextRequest, NextResponse } from 'next/server'
import { cookieDomain } from '@/lib/auth'

export const CSRF_COOKIE_NAME = 'jk_csrf_token'
export const CSRF_HEADER_NAME = 'x-csrf-token'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** Routes exempt from CSRF (login issues a new token). */
const CSRF_EXEMPT_PREFIXES = ['/api/admin/auth/login']

export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: cookieDomain(),
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearCsrfCookie(response: NextResponse): void {
  response.cookies.set(CSRF_COOKIE_NAME, '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: cookieDomain(),
    path: '/',
    maxAge: 0,
  })
}

export function requiresCsrfValidation(pathname: string, method: string): boolean {
  if (!MUTATING_METHODS.has(method)) return false
  if (!pathname.startsWith('/api/admin')) return false
  return !CSRF_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function validateCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) return false
  if (cookieToken.length !== headerToken.length) return false

  // Constant-time comparison
  let mismatch = 0
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i)
  }
  return mismatch === 0
}
