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

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
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
      return addSecurityHeaders(response)
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
    return addSecurityHeaders(response)
  }

  if (!isProtectedPage && !isProtectedApi) {
    return addSecurityHeaders(
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
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      )
    }
    return addSecurityHeaders(
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

    return addSecurityHeaders(response)
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
        return addSecurityHeaders(response)
      }
    }

    if (isProtectedApi) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      )
      response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, path: '/' })
      response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return addSecurityHeaders(response)
    }

    const response = NextResponse.redirect(
      new URL('/admin/login', request.url)
    )
    response.cookies.set(ACCESS_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    response.cookies.set(REFRESH_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
