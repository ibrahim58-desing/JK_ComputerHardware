import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, notFoundError, serverError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return notFoundError('Invalid product ID')
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
    })

    if (!product) {
      return notFoundError('Product not found')
    }

    // updatedAt is an internal admin timestamp — nothing on the public
    // storefront reads it, so it shouldn't leave the server.
    const { updatedAt, ...publicProduct } = product

    return successResponse(publicProduct)
  } catch (error) {
    return serverError(error)
  }
}
