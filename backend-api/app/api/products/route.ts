import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || '', 10) || DEFAULT_PAGE_SIZE)
    )

    // Build filter conditions
    const where: Record<string, unknown> = {
      status: status || 'active',
    }

    if (category && category !== 'All') {
      where.category = { name: category }
    }

    if (brand && brand !== 'All') {
      where.brand = brand
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice) {
      where.numericPrice = { ...(where.numericPrice as object || {}), gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.numericPrice = { ...(where.numericPrice as object || {}), lte: parseFloat(maxPrice) }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        // Card-view fields only — full description/specs text and the
        // gallery images relation aren't needed for a product listing and
        // used to bloat this response once the catalog grew past a couple
        // thousand rows.
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          numericPrice: true,
          stock: true,
          brand: true,
          specs: true,
          badge: true,
          offer: true,
          image: true,
          featured: true,
          status: true,
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
