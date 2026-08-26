import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCommentSchema } from '@/lib/validation'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, validationError, serverError } from '@/lib/errors'
import { ZodError } from 'zod'

// The active comment wall changes with every submission but isn't
// latency-sensitive to the second — nothing currently calls this GET (the
// homepage passes comments down as props from a direct Prisma query), but
// any future caller shouldn't hit the database fresh every time either.
export const revalidate = 60

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return successResponse(comments)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'comment', RATE_LIMITS.comment)
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const data = createCommentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        name: data.name,
        message: data.message,
      },
    })

    return successResponse(comment, 201)
  } catch (error) {
    if (error instanceof ZodError) return validationError(error)
    return serverError(error, 'POST /api/comments')
  }
}
