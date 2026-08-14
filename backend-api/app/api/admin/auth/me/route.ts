import {
  verifyAuth,
  verifyRefreshToken,
  signAccessToken,
  getRefreshToken,
  setAccessCookie,
} from '@/lib/auth'
import { successResponse, unauthorizedError, serverError } from '@/lib/errors'

export async function GET() {
  try {
    const admin = await verifyAuth()
    if (!admin) {
      return unauthorizedError()
    }

    return successResponse({
      id: admin.adminId,
      username: admin.username,
      role: admin.role,
    })
  } catch (error) {
    return serverError(error, 'GET /api/admin/auth/me')
  }
}

export async function POST() {
  try {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) {
      return unauthorizedError('Session expired')
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return unauthorizedError('Invalid refresh token')
    }

    const newAccessToken = await signAccessToken(payload)
    await setAccessCookie(newAccessToken)

    return successResponse({
      id: payload.adminId,
      username: payload.username,
      role: payload.role,
    })
  } catch (error) {
    return serverError(error, 'POST /api/admin/auth/me')
  }
}
