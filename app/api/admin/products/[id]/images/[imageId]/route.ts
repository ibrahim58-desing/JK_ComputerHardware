import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteUploadedImage } from '@/lib/upload'
import { successResponse, notFoundError, serverError } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const productId = parseInt(id, 10)
    const imgId = parseInt(imageId, 10)

    if (isNaN(productId) || isNaN(imgId)) {
      return notFoundError('Invalid ID')
    }

    const image = await prisma.productImage.findFirst({
      where: { id: imgId, productId },
    })

    if (!image) return notFoundError('Image not found')

    // Delete file from disk
    await deleteUploadedImage(image.imageUrl)

    // Delete from database
    await prisma.productImage.delete({ where: { id: imgId } })

    return successResponse({ message: 'Image deleted' })
  } catch (error) {
    return serverError(error)
  }
}
