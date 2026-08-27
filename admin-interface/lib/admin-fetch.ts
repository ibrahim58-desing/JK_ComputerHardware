'use client'

/**
 * Admin API fetch wrapper with CSRF protection.
 * Reads the CSRF cookie set at login and attaches it to mutating requests.
 */

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)jk_csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

// This app has no API routes of its own — every call is really destined for
// backend-api. A relative '/api/...' path gets resolved against
// NEXT_PUBLIC_API_URL so callers can keep writing the path they always did.
function resolveApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== 'string' || !input.startsWith('/api/')) return input
  const base = process.env.NEXT_PUBLIC_API_URL
  return base ? `${base}${input}` : input
}

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken)
    }
  }

  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // backend-api is on its own subdomain now, so this is a cross-origin
  // request — 'include' is required for the auth/CSRF cookies to go along
  // (backend-api's CORS middleware only allows this for known origins).
  return fetch(resolveApiUrl(input), { ...init, headers, credentials: 'include' })
}
