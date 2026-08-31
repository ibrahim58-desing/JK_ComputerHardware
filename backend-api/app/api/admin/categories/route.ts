import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCategorySchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import { applyAdminRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, validationError, serverError, unauthorizedError } from '@/lib/errors'
import { logCategoryCreated } from '@/lib/logger'
import { ZodError } from 'zod'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    })
    return successResponse(categories)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyAdminRateLimit(request, 'admin-categories', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = createCategorySchema.parse(body)

    const slug = generateSlug(data.name)

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
      },
      include: {
        _count: { select: { products: true } },
      },
    })

    logCategoryCreated(admin.username, category.id, category.name)

    return successResponse(category, 201)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'POST /api/admin/categories')
  }
}
