import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveUploadedImage } from '@/lib/upload'
import { reorderImagesSchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { logProductImageUploaded } from '@/lib/logger'
import { ZodError } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'upload', RATE_LIMITS.upload)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

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
    const startOrder = (maxOrder?.displayOrder ?? -1) + 1

    // Resize/re-encode each file concurrently instead of one at a time —
    // sharp's own worker threads (bounded by libuv's thread pool) keep this
    // from overwhelming the CPU even for a large gallery upload. Order is
    // assigned by each file's position in the request, not completion order,
    // so results stay deterministic despite running in parallel.
    const results = await Promise.all(
      files.map(async (file, index) => {
        try {
          const imageUrl = await saveUploadedImage(file)
          return await prisma.productImage.create({
            data: {
              productId,
              imageUrl,
              displayOrder: startOrder + index,
            },
          })
        } catch (err) {
          // Log but continue with other files
          console.error('[Upload] Failed to save image:', err)
          return null
        }
      })
    )
    const savedImages = results.filter((image): image is NonNullable<typeof image> => image !== null)

    if (savedImages.length === 0) {
      return errorResponse('Failed to upload any images', 400)
    }

    logProductImageUploaded(admin.username, productId, savedImages.length)

    return successResponse(savedImages, 201)
  } catch (error) {
    return serverError(error, 'POST /api/admin/products/[id]/images')
  }
}

// Reorder images
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-products', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

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
