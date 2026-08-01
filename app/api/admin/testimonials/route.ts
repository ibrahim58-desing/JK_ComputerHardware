import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTestimonialSchema } from '@/lib/validation'
import { verifyAuth } from '@/lib/auth'
import { successResponse, validationError, serverError, unauthorizedError } from '@/lib/errors'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return successResponse(testimonials)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const data = createTestimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.create({ data })

    return successResponse(testimonial, 201)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'POST /api/admin/testimonials')
  }
}
