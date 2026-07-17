import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { getClientIp, applyRateLimit } from '@/lib/api-helpers'
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/lib/errors'
import {
  logFailedLogin,
  logSuccessfulLogin,
  logServerError,
} from '@/lib/logger'
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'login', RATE_LIMITS.login)
    if (rateLimitResponse) return rateLimitResponse

    const ip = getClientIp(request)
    const body = await request.json()
    const { username, password } = loginSchema.parse(body)

    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    const isValid = await comparePassword(password, admin?.passwordHash)

    if (!admin || !isValid) {
      logFailedLogin(ip, username)
      return errorResponse('Invalid username or password', 401)
    }

    const payload = {
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    }

    const accessToken = await signAccessToken(payload)
    const refreshToken = await signRefreshToken(payload)

    await setAuthCookies(accessToken, refreshToken)

    logSuccessfulLogin(ip, admin.username)

    const response = successResponse({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    })

    // Set fresh CSRF token on successful login
    const csrfToken = generateCsrfToken()
    setCsrfCookie(response as NextResponse, csrfToken)

    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }
    logServerError(error, 'POST /api/admin/auth/login')
    return serverError(error, 'login')
  }
}

export async function GET() {
  return errorResponse('Method not allowed', 405)
}
