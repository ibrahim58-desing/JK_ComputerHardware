import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

// Backs the navbar's search-suggestions dropdown. Only ever needs a handful
// of matches, so this filters and limits in the database instead of the
// caller downloading the whole catalog to filter client-side.
const SUGGESTION_LIMIT = 5

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()

    if (!q) {
      return successResponse([])
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: SUGGESTION_LIMIT,
    })

    return successResponse(products)
  } catch (error) {
    return serverError(error)
  }
}
