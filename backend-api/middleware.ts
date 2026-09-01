import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  cookieDomain,
} from '@/lib/auth'
import {
  getJwtSecret,
  getJwtIssuer,
  getJwtAudience,
  ACCESS_TOKEN_EXPIRY,
} from '@/lib/env'
import {
  requiresCsrfValidation,
  validateCsrf,
  generateCsrfToken,
  setCsrfCookie,
  CSRF_COOKIE_NAME,
} from '@/lib/csrf'

const PROTECTED_PAGE_ROUTES = ['/admin']
const PROTECTED_API_ROUTES = ['/api/admin']
const PUBLIC_ADMIN_ROUTES = ['/admin/login']

// backend-api lives on its own subdomain (api.jkinfosystem.com) — the
// storefront and admin panel call it cross-origin, so every /api/ response
// needs these headers. credentials:true is safe here because the origin is
// checked against this fixed allowlist rather than reflected/wildcarded.
const ALLOWED_ORIGINS = [
  'https://jkinfosystem.com',
  'https://www.jkinfosystem.com',
  'https://admin.jkinfosystem.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Vary', 'Origin')
  }
  return response
}

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  // 'unsafe-eval' is only needed for Turbopack/webpack HMR in dev — never
  // shipped in production. Script execution otherwise requires the
  // per-request nonce (Next.js applies it automatically to its own
  // framework-injected scripts once it's present in this header).
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Inline style ATTRIBUTES (React's style={{...}} / framer-motion) have
    // no nonce mechanism in the CSP spec — only <style> elements do — so
    // this can't be tightened without migrating those to CSS classes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self' https://www.openstreetmap.org",
    "object-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function addSecurityHeaders(
  response: NextResponse,
  nonce: string,
  pathname: string
): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  response.headers.set('Content-Security-Policy', buildCsp(nonce))
  // HSTS is a no-op over plain HTTP (browsers ignore it outside TLS), so
  // it's safe to always send rather than gate on NODE_ENV.
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  // Admin API responses can carry account/enquiry/comment data — never let
  // an intermediary or the browser cache them.
  if (pathname.startsWith('/api/admin')) {
    response.headers.set('Cache-Control', 'no-store')
  }
  return response
}

async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(refreshToken, secret, {
      issuer: getJwtIssuer(),
      audience: getJwtAudience(),
    })

    if (payload.type !== 'refresh') return null

    return new SignJWT({
      adminId: payload.adminId,
      username: payload.username,
      role: payload.role,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(getJwtIssuer())
      .setAudience(getJwtAudience())
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(secret)
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  const origin = request.headers.get('origin')
  const nonce = generateNonce()
  const withHeaders = (response: NextResponse) => {
    addSecurityHeaders(response, nonce, pathname)
    if (pathname.startsWith('/api/')) addCorsHeaders(response, origin)
    return response
  }

  // Preflight requests carry no cookies/CSRF token and must never reach the
  // auth/CSRF checks below — they just need the CORS headers back.
  if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const response = new NextResponse(null, { status: 204 })
    addCorsHeaders(response, origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token')
    response.headers.set('Access-Control-Max-Age', '86400')
    return response
  }

  const isProtectedPage = PROTECTED_PAGE_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isPublicAdmin = PUBLIC_ADMIN_ROUTES.some((route) => pathname === route)
  const isAuthApi = pathname.startsWith('/api/admin/auth')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('x-nonce', nonce)

  // CSRF validation for mutating admin API requests
  if (requiresCsrfValidation(pathname, method)) {
    if (!validateCsrf(request)) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
      return withHeaders(response)
    }
  }

  // Public admin routes and auth APIs skip JWT check
  if (isPublicAdmin || isAuthApi) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    // Ensure CSRF cookie exists for login page
    if (isPublicAdmin && !request.cookies.get(CSRF_COOKIE_NAME)?.value) {
      setCsrfCookie(response, generateCsrfToken())
    }
    return withHeaders(response)
  }

  if (!isProtectedPage && !isProtectedApi) {
    return withHeaders(
      NextResponse.next({ request: { headers: requestHeaders } })
    )
  }

  let token = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value
  let newAccessToken: string | null = null

  // Attempt silent refresh if access token missing/expired
  if (!token && refreshToken) {
    newAccessToken = await refreshAccessToken(refreshToken)
    if (newAccessToken) token = newAccessToken
  }

  if (!token) {
    if (isProtectedApi) {
      return withHeaders(
        NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      )
    }
    return withHeaders(
      NextResponse.redirect(new URL('/admin/login', request.url))
    )
  }

  try {
    const secret = getJwtSecret()
    await jwtVerify(token, secret, {
      issuer: getJwtIssuer(),
      audience: getJwtAudience(),
    })

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })

    if (newAccessToken) {
      response.cookies.set(ACCESS_COOKIE_NAME, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: cookieDomain(),
        path: '/',
        maxAge: 20 * 60,
      })
    }

    return withHeaders(response)
  } catch {
    // Try refresh on expired access token
    if (refreshToken) {
      newAccessToken = await refreshAccessToken(refreshToken)
      if (newAccessToken) {
        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })
        response.cookies.set(ACCESS_COOKIE_NAME, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          domain: cookieDomain(),
          path: '/',
          maxAge: 20 * 60,
        })
        return withHeaders(response)
      }
    }

    if (isProtectedApi) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      )
      response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, domain: cookieDomain(), path: '/' })
      response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, domain: cookieDomain(), path: '/' })
      return withHeaders(response)
    }

    const response = NextResponse.redirect(
      new URL('/admin/login', request.url)
    )
    response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, domain: cookieDomain(), path: '/' })
    response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, domain: cookieDomain(), path: '/' })
    return withHeaders(response)
  }
}

export const config = {
  // Static assets never need CSRF/JWT/CSP handling — excluding them by
  // extension keeps this from running per-image on every catalog browse.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?|ttf|otf|map|txt|xml|json)$).*)',
  ],
}
