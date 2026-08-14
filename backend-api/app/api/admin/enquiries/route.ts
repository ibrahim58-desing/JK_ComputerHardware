import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

export async function GET() {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    })

    return successResponse(enquiries)
  } catch (error) {
    return serverError(error)
  }
}
