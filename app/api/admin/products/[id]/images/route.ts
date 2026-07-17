import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveUploadedImage } from '@/lib/upload'
import { reorderImagesSchema } from '@/lib/validation'
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
  serverError,
} from '@/lib/errors'
import { ZodError } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) return notFoundError('Product not found')

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return errorResponse('No images provided', 400)
    }

    // Get current max display order
    const maxOrder = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    })
    let currentOrder = (maxOrder?.displayOrder ?? -1) + 1

    const savedImages = []
    for (const file of files) {
      try {
        const imageUrl = await saveUploadedImage(file)
        const image = await prisma.productImage.create({
          data: {
            productId,
            imageUrl,
            displayOrder: currentOrder++,
          },
        })
        savedImages.push(image)
      } catch (err) {
        // Log but continue with other files
        console.error('[Upload] Failed to save image:', err)
      }
    }

    if (savedImages.length === 0) {
      return errorResponse('Failed to upload any images', 400)
    }

    return successResponse(savedImages, 201)
  } catch (error) {
    return serverError(error)
  }
}

// Reorder images
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const body = await request.json()
    const { imageIds } = reorderImagesSchema.parse(body)

    // Update display order for each image
    const updates = imageIds.map((imageId, index) =>
      prisma.productImage.updateMany({
        where: { id: imageId, productId },
        data: { displayOrder: index },
      })
    )

    await prisma.$transaction(updates)

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    })

    return successResponse(images)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error)
  }
}
