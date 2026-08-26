import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

// Categories change rarely — nothing currently calls this route (the
// storefront queries Prisma directly), but any future caller shouldn't hit
// the database fresh every time either.
export const revalidate = 300

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
