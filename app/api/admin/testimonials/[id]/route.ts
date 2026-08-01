import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTestimonialSchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import {
  successResponse,
  notFoundError,
  validationError,
  serverError,
  unauthorizedError,
} from '@/lib/errors'
import { ZodError } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const testimonialId = parseInt(id, 10)
    if (isNaN(testimonialId)) return notFoundError('Invalid testimonial ID')

    const existing = await prisma.testimonial.findUnique({ where: { id: testimonialId } })
    if (!existing) return notFoundError('Testimonial not found')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = updateTestimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.update({
      where: { id: testimonialId },
      data,
    })

    return successResponse(testimonial)
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
    const testimonialId = parseInt(id, 10)
    if (isNaN(testimonialId)) return notFoundError('Invalid testimonial ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const existing = await prisma.testimonial.findUnique({ where: { id: testimonialId } })
    if (!existing) return notFoundError('Testimonial not found')

    await prisma.testimonial.delete({ where: { id: testimonialId } })
    return successResponse({ message: 'Testimonial deleted' })
  } catch (error) {
    return serverError(error)
  }
}
