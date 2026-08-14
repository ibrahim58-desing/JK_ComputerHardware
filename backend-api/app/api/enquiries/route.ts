import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEnquirySchema } from '@/lib/validation'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, validationError, serverError } from '@/lib/errors'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'enquiry', RATE_LIMITS.enquiry)
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const data = createEnquirySchema.parse(body)

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
        productId: data.productId || null,
      },
    })

    return successResponse(
      { id: enquiry.id, message: 'Enquiry submitted successfully' },
      201
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }
    return serverError(error, 'POST /api/enquiries')
  }
}

export async function GET() {
  return successResponse({ error: 'Method not allowed' }, 405)
}
