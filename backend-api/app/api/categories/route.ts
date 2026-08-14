import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

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
