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

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-products', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const ids = searchParams.get('ids')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || '', 10) || DEFAULT_PAGE_SIZE)
    )

    const where: Record<string, unknown> = {}

    // Fetching a known, small set of specific products (e.g. hydrating a
    // picker's already-selected chips) — bounded by the id list itself, so
    // pagination doesn't apply.
    if (ids) {
      const idList = ids
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => Number.isInteger(id))
        .slice(0, MAX_PAGE_SIZE)
      where.id = { in: idList }
    }

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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        // The admin list table only ever renders name/brand/category/price/
        // status/thumbnail — the gallery images relation is only needed on
        // the edit page, and pulling it in here joined every image row for
        // every product on every list load (and every keystroke of search).
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          image: true,
          status: true,
          featured: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
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
