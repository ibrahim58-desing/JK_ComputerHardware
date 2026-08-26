import { prisma } from '@/lib/prisma'
import { successResponse, serverError } from '@/lib/errors'

// Site settings change rarely — nothing currently calls this route (the
// storefront uses getSiteSettings() directly), but any future caller
// shouldn't hit the database fresh every time either.
export const revalidate = 300

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
