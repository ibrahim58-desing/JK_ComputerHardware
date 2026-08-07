import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, comparePassword, hashPassword } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validation'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'change-password', RATE_LIMITS.login)
    if (rateLimitResponse) return rateLimitResponse

    const session = await verifyAuth()
    if (!session) return unauthorizedError()

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    const admin = await prisma.admin.findUnique({ where: { id: session.adminId } })
    if (!admin) return unauthorizedError()

    const isValid = await comparePassword(currentPassword, admin.passwordHash)
    if (!isValid) return errorResponse('Current password is incorrect', 400)

    const passwordHash = await hashPassword(newPassword)
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } })

    return successResponse({ message: 'Password updated successfully' })
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'POST /api/admin/auth/change-password')
  }
}
