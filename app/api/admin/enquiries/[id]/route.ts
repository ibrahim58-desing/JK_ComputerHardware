import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, notFoundError, serverError, unauthorizedError } from '@/lib/errors'
import { logEnquiryDeleted } from '@/lib/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'admin-enquiries', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const enquiryId = parseInt(id, 10)
    if (isNaN(enquiryId)) return notFoundError('Invalid enquiry ID')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
    })
    if (!enquiry) return notFoundError('Enquiry not found')

    await prisma.enquiry.delete({ where: { id: enquiryId } })

    logEnquiryDeleted(admin.username, enquiryId)

    return successResponse({ message: 'Enquiry deleted' })
  } catch (error) {
    return serverError(error, 'DELETE /api/admin/enquiries/[id]')
  }
}
