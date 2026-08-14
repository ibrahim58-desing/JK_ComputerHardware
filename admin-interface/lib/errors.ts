import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ─── Standard API Response Types ──────────────────────────────────────────────

interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } as ApiSuccessResponse<T>, {
    status,
  })
}

export function errorResponse(message: string, status = 400) {
  const body: ApiErrorResponse = { success: false, error: message }
  return NextResponse.json(body, { status })
}

export function validationError(error: ZodError) {
  const formatted = error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: formatted,
    } as ApiErrorResponse,
    { status: 422 }
  )
}

export function unauthorizedError(message = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function notFoundError(message = 'Resource not found') {
  return errorResponse(message, 404)
}

export function serverError(error: unknown, context?: string) {
  console.error('[Server Error]', context || '', error)
  return errorResponse('Internal server error', 500)
}
