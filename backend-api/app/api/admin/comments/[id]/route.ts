import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { applyAdminRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, notFoundError, serverError, unauthorizedError } from '@/lib/errors'
import { logCommentModerated, logCommentDeleted } from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await applyAdminRateLimit(request, 'admin-comments', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const commentId = parseInt(id, 10)
    if (isNaN(commentId)) return notFoundError('Invalid comment ID')

    const existing = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!existing) return notFoundError('Comment not found')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const body = await request.json()
    const status = body.status === 'hidden' ? 'hidden' : 'active'

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    })

    logCommentModerated(admin.username, commentId, status)

    return successResponse(comment)
  } catch (error) {
    return serverError(error, 'PUT /api/admin/comments/[id]')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await applyAdminRateLimit(request, 'admin-comments', RATE_LIMITS.adminApi)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const commentId = parseInt(id, 10)
    if (isNaN(commentId)) return notFoundError('Invalid comment ID')

    const existing = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!existing) return notFoundError('Comment not found')

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    await prisma.comment.delete({ where: { id: commentId } })

    logCommentDeleted(admin.username, commentId)

    return successResponse({ message: 'Comment deleted' })
  } catch (error) {
    return serverError(error, 'DELETE /api/admin/comments/[id]')
  }
}
