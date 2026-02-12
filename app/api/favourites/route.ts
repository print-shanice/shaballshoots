import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// The fixed user_id assigned to the admin in the JWT callback (auth.ts returns id: '1')
const ADMIN_USER_ID = '1'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { session: null, userId: null }
  const userId = (session.user as { id?: string }).id ?? session.user.name ?? ADMIN_USER_ID
  return { session, userId }
}

// ── GET /api/favourites ───────────────────────────────────────────────────────
// Public — returns the admin's curated favourites list.
// Everyone (authenticated or not) sees the same set.

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('user_favourites')
      .select('photo_id')
      .eq('user_id', ADMIN_USER_ID)

    if (error) throw error

    const photoIds = (data ?? []).map((row: { photo_id: string }) => row.photo_id)
    return NextResponse.json({ photoIds })
  } catch (err) {
    console.error('[GET /api/favourites]', err)
    return NextResponse.json({ error: 'Failed to fetch favourites' }, { status: 500 })
  }
}

// ── POST /api/favourites ──────────────────────────────────────────────────────
// Protected — only the authenticated admin can add favourites.

export async function POST(req: NextRequest) {
  const { session, userId } = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let photoId: string
  try {
    const body = await req.json()
    photoId = body?.photoId
    if (!photoId) throw new Error('missing photoId')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('user_favourites')
      .upsert({ user_id: userId, photo_id: photoId }, { onConflict: 'user_id,photo_id' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/favourites]', err)
    return NextResponse.json({ error: 'Failed to add favourite' }, { status: 500 })
  }
}

// ── DELETE /api/favourites ────────────────────────────────────────────────────
// Protected — only the authenticated admin can remove favourites.

export async function DELETE(req: NextRequest) {
  const { session, userId } = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let photoId: string
  try {
    const body = await req.json()
    photoId = body?.photoId
    if (!photoId) throw new Error('missing photoId')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('user_favourites')
      .delete()
      .eq('user_id', userId)
      .eq('photo_id', photoId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/favourites]', err)
    return NextResponse.json({ error: 'Failed to remove favourite' }, { status: 500 })
  }
}
