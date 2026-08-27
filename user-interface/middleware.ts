import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
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

function buildCsp(): string {
  // Static and ISR pages serve pre-rendered HTML with hydration scripts.
  // Dynamic per-request CSP nonces cause a mismatch on cached pages,
  // causing browsers to block script execution. Using 'self' 'unsafe-inline'
  // allows Next.js static pages to hydrate cleanly.
  // 'unsafe-eval' stays dev-only (Turbopack/webpack HMR needs it) — it isn't
  // needed to fix hydration and would only widen the attack surface in prod.
  const isDev = process.env.NODE_ENV !== 'production'
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"
  // backend-api is a separate origin (subdomain in prod, separate port in
  // dev) — CSP treats that the same as full cross-origin, so it needs to be
  // allow-listed explicitly alongside 'self'.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${apiUrl}`,
    "font-src 'self' data:",
    `connect-src 'self' ${apiUrl}`,
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
  pathname: string
): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  response.headers.set('Content-Security-Policy', buildCsp())
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
  const withHeaders = (response: NextResponse) =>
    addSecurityHeaders(response, pathname)

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
      response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, path: '/' })
      response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return withHeaders(response)
    }

    const response = NextResponse.redirect(
      new URL('/admin/login', request.url)
    )
    response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return withHeaders(response)
  }
}

export const config = {
  // Static assets (uploaded product photos, brand logos, icons, fonts) never
  // need CSRF/JWT/CSP handling — excluding them by extension keeps this from
  // running per-image on every catalog browse, and matters most in local dev
  // where there's no nginx in front to already short-circuit /uploads/.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?|ttf|otf|map|txt|xml|json)$).*)',
  ],
}
