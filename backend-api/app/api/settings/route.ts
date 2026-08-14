import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany()
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    )
    return successResponse(settingsMap)
  } catch (error) {
    return serverError(error)
  }
}
