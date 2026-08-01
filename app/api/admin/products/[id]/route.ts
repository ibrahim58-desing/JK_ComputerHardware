import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProductSchema } from '@/lib/validation'
import { parsePriceToNumber } from '@/lib/utils'
import { verifyAuth } from '@/lib/auth'
import {
  successResponse,
  notFoundError,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { logProductUpdated, logProductDeleted } from '@/lib/logger'
import { ZodError } from 'zod'
import { deleteUploadedImage } from '@/lib/upload'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
    })

    if (!product) return notFoundError('Product not found')
    return successResponse(product)
  } catch (error) {
    return serverError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!existing) return notFoundError('Product not found')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = updateProductSchema.parse(body)

    // Build update data, only include fields that were provided
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription
    if (data.price !== undefined) {
      updateData.price = data.price
      updateData.numericPrice = parsePriceToNumber(data.price)
    }
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.specs !== undefined) updateData.specs = data.specs
    if (data.badge !== undefined) updateData.badge = data.badge || null
    if (data.image !== undefined) updateData.image = data.image
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.status !== undefined) updateData.status = data.status
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
    })

    logProductUpdated(admin.username, productId)

    return successResponse(product)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) return notFoundError('Invalid product ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    })
    if (!product) return notFoundError('Product not found')

    // Delete uploaded images from disk
    for (const img of product.images) {
      await deleteUploadedImage(img.imageUrl)
    }
    if (product.image) {
      await deleteUploadedImage(product.image)
    }

    // Delete product (cascade deletes images in DB)
    await prisma.product.delete({ where: { id: productId } })

    logProductDeleted(admin.username, productId)

    return successResponse({ message: 'Product deleted' })
  } catch (error) {
    return serverError(error)
  }
}
