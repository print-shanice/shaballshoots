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

export async function GET(_request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('upload_timestamp', { ascending: false })

    if (error) throw error

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('[API GET /photos]', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { image_url, story, date_taken, country } = body

    if (!image_url || !story || !date_taken || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const dateTaken = new Date(date_taken)
    const year = dateTaken.getFullYear()
    const month = dateTaken.toLocaleString('default', { month: 'long' })

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('photos')
      .insert([{ image_url, story, date_taken, country, year, month, upload_timestamp: new Date().toISOString() }])
      .select()

    if (error) throw error

    return NextResponse.json({ photo: data[0] }, { status: 201 })
  } catch (error) {
    console.error('[API POST /photos]', error)
    return NextResponse.json({
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
