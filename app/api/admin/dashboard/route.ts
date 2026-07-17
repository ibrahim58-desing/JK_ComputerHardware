import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

export async function GET() {
  try {
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      totalEnquiries,
      totalCategories,
      latestEnquiries,
      recentProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.enquiry.count(),
      prisma.category.count(),
      prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          subject: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    return successResponse({
      totalProducts,
      activeProducts,
      featuredProducts,
      totalEnquiries,
      totalCategories,
      latestEnquiries,
      recentProducts,
    })
  } catch (error) {
    return serverError(error)
  }
}
