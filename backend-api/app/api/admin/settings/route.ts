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

// user-interface caches settings for 5 minutes (unstable_cache) to avoid a
// DB hit on every page view. It's a separate process with no shared memory,
// so the only way to make an edit here show up immediately there is to
// explicitly tell it to drop its cached copy.
async function revalidateStorefront(tag: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!siteUrl || !secret) return

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tag }),
    })
  } catch (error) {
    console.error('[Settings] Failed to revalidate storefront cache:', error)
  }
}

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
    await revalidateStorefront('settings')

    return successResponse({ message: 'Settings updated' })
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'PUT /api/admin/settings')
  }
}
