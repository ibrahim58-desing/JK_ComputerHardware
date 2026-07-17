import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

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
