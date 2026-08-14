import { NextRequest } from 'next/server'
import { saveUploadedImage } from '@/lib/upload'
import { verifyAuth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/api-helpers'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, serverError, unauthorizedError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = applyRateLimit(request, 'upload', RATE_LIMITS.upload)
    if (rateLimitResponse) return rateLimitResponse

    const admin = await verifyAuth()
    if (!admin) return unauthorizedError()

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return errorResponse('No image provided', 400)
    }

    const imageUrl = await saveUploadedImage(file)

    return successResponse({ imageUrl }, 201)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      return errorResponse(error.message, 400)
    }
    return serverError(error, 'POST /api/admin/upload')
  }
}

export async function GET() {
  return errorResponse('Method not allowed', 405)
}
