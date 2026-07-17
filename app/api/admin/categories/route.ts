import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCategorySchema } from '@/lib/validation'
import { successResponse, validationError, serverError } from '@/lib/errors'
import { ZodError } from 'zod'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    })
    return successResponse(categories)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createCategorySchema.parse(body)

    const slug = generateSlug(data.name)

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
      },
      include: {
        _count: { select: { products: true } },
      },
    })

    return successResponse(category, 201)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error)
  }
}
