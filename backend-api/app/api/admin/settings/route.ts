import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateSettingsSchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import { applyAdminRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { logSettingsUpdated } from '@/lib/logger'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany()
    const config = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    )
    return successResponse(config)
  } catch (error) {
    return serverError(error, 'GET /api/admin/settings')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rateLimitResponse = await applyAdminRateLimit(request, 'admin-settings', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    for (const [key, value] of Object.entries(data)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }

    logSettingsUpdated(admin.username, Object.keys(data))

    return successResponse({ message: 'Settings updated' })
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'PUT /api/admin/settings')
  }
}
