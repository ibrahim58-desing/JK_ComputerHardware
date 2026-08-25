import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProductSchema } from '@/lib/validation'
import { parsePriceToNumber } from '@/lib/utils'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, validationError, serverError, errorResponse } from '@/lib/errors'
import { logProductCreated } from '@/lib/logger'
import { ZodError } from 'zod'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200)
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-products', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(products)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-products', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const admin = await verifyAuth()
    if (!admin) return errorResponse('Unauthorized', 401)
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Generate unique slug
    let slug = generateSlug(data.name)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price || '₹0',
        numericPrice: parsePriceToNumber(data.price || '₹0'),
        originalPrice: data.originalPrice || null,
        stock: data.stock,
        brand: data.brand,
        specs: data.specs as any,
        badge: data.badge ?? undefined,
        offer: data.offer || null,
        image: data.image,
        featured: data.featured,
        status: data.status,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
        images: true,
      },
    })

    if (data.galleryImages && data.galleryImages.length > 0) {
      await prisma.productImage.createMany({
        data: data.galleryImages.map((imgUrl, index) => ({
          productId: product.id,
          imageUrl: imgUrl,
          displayOrder: index,
        })),
      })
    }

    logProductCreated(admin.username, product.id, product.name)

    return successResponse(product, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }
    return serverError(error, 'POST /api/admin/products')
  }
}
