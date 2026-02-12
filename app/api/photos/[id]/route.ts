import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

// ── PATCH /api/photos/[id] ────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing photo id' }, { status: 400 })

  let body: { story?: string; date_taken?: string; country?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { story, date_taken, country } = body

  if (!story && !date_taken && !country) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (story !== undefined) updatePayload.story = story
  if (country !== undefined) updatePayload.country = country
  if (date_taken !== undefined) {
    const d = new Date(date_taken)
    updatePayload.date_taken = date_taken
    updatePayload.year = d.getFullYear()
    updatePayload.month = d.toLocaleString('default', { month: 'long' })
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error: dbError } = await supabase
      .from('photos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (dbError) throw dbError
    if (!data) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    return NextResponse.json({ photo: data })
  } catch (err) {
    console.error('[API PATCH /photos/:id]', err)
    return NextResponse.json(
      { error: 'Failed to update photo', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

// ── DELETE /api/photos/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing photo id' }, { status: 400 })

  try {
    const supabase = getSupabaseClient()

    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const fileName = (photo.image_url as string).split('/').pop()
    if (fileName) {
      const { error: storageError } = await supabase.storage.from('photos').remove([fileName])
      if (storageError) {
        console.warn('[API DELETE /photos/:id] Storage removal warning:', storageError.message)
      }
    }

    const { error: deleteError } = await supabase.from('photos').delete().eq('id', id)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API DELETE /photos/:id]', err)
    return NextResponse.json(
      { error: 'Failed to delete photo', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
