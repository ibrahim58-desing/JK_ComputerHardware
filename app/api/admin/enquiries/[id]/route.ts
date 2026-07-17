import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, notFoundError, serverError } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const enquiryId = parseInt(id, 10)
    if (isNaN(enquiryId)) return notFoundError('Invalid enquiry ID')

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
    })
    if (!enquiry) return notFoundError('Enquiry not found')

    await prisma.enquiry.delete({ where: { id: enquiryId } })

    return successResponse({ message: 'Enquiry deleted' })
  } catch (error) {
    return serverError(error)
  }
}
