import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/auth'
import { verifyAuth } from '@/lib/auth'
import { successResponse, serverError, errorResponse } from '@/lib/errors'
import { logLogout } from '@/lib/logger'
import { clearCsrfCookie } from '@/lib/csrf'

export async function POST() {
  try {
    const admin = await verifyAuth()
    await clearAuthCookies()

    const response = successResponse({ message: 'Logged out successfully' })
    clearCsrfCookie(response as NextResponse)

    if (admin) {
      logLogout(admin.username)
    }

    return response
  } catch (error) {
    return serverError(error, 'logout')
  }
}

export async function GET() {
  return errorResponse('Method not allowed', 405)
}
