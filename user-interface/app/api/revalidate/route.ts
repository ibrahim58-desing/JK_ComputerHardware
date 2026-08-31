import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

// Called by backend-api right after it saves something cached here via
// unstable_cache (site settings, product facets, ...) — this app has no
// other way to know the database changed, since the two run as separate
// processes with no shared memory.
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tag = body?.tag
  if (!tag || typeof tag !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing tag' }, { status: 400 })
  }

  // 'max' is just this Next.js version's required cache-life profile
  // argument for the new caching APIs — it has no effect on purging a
  // legacy unstable_cache()-created entry by tag, which is all this does.
  revalidateTag(tag, 'max')
  return NextResponse.json({ success: true })
}
