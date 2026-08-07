import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteUploadedImage } from '@/lib/upload'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, notFoundError, serverError, unauthorizedError } from '@/lib/errors'
import { logProductImageDeleted } from '@/lib/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-products', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id, imageId } = await params
    const productId = parseInt(id, 10)
    const imgId = parseInt(imageId, 10)

    if (isNaN(productId) || isNaN(imgId)) {
      return notFoundError('Invalid ID')
    }

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const image = await prisma.productImage.findFirst({
      where: { id: imgId, productId },
    })

    if (!image) return notFoundError('Image not found')

    // Delete file from disk
    await deleteUploadedImage(image.imageUrl)

    // Delete from database
    await prisma.productImage.delete({ where: { id: imgId } })

    logProductImageDeleted(admin.username, productId, imgId)

    return successResponse({ message: 'Image deleted' })
  } catch (error) {
    return serverError(error, 'DELETE /api/admin/products/[id]/images/[imageId]')
  }
}
