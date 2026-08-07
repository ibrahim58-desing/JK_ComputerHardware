import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCategorySchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { logCategoryUpdated, logCategoryDeleted } from '@/lib/logger'
import { ZodError } from 'zod'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-categories', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const categoryId = parseInt(id, 10)
    if (isNaN(categoryId)) return notFoundError('Invalid category ID')

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    if (!existing) return notFoundError('Category not found')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = updateCategorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: generateSlug(data.name),
      },
      include: {
        _count: { select: { products: true } },
      },
    })

    logCategoryUpdated(admin.username, categoryId)

    return successResponse(category)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'PUT /api/admin/categories/[id]')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-categories', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const categoryId = parseInt(id, 10)
    if (isNaN(categoryId)) return notFoundError('Invalid category ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    // Check for products in this category
    const productCount = await prisma.product.count({
      where: { categoryId },
    })
    if (productCount > 0) {
      return errorResponse(
        `Cannot delete category with ${productCount} product(s). Move or delete them first.`,
        400
      )
    }

    await prisma.category.delete({ where: { id: categoryId } })

    logCategoryDeleted(admin.username, categoryId)

    return successResponse({ message: 'Category deleted' })
  } catch (error) {
    return serverError(error, 'DELETE /api/admin/categories/[id]')
  }
}
