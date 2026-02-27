import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import PhotoDetail from '@/components/PhotoDetail'

// Pre-render all photo pages at build time to eliminate cold starts on direct URL visits
export async function generateStaticParams() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase.from('photos').select('id')
    return (data ?? []).map((row: { id: string }) => ({ id: row.id }))
  } catch {
    return []
  }
}

// Allow new photos (not in static params) to be rendered on demand
export const dynamicParams = true

function getAnonSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await Promise.resolve(params)

  const session = await getServerSession(authOptions)
  const isAdmin = !!session?.user
  const isAuthenticated = !!session?.user
  const userId =
    (session?.user as { id?: string } | undefined)?.id ??
    session?.user?.name ??
    null

  const photoPromise = getAnonSupabase()
    .from('photos')
    .select('*')
    .eq('id', id)
    .single()

  const favPromise = userId
    ? getAdminSupabase()
        .from('user_favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('photo_id', id)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null })

  const [{ data: photo, error }, { data: favRow }] = await Promise.all([
    photoPromise,
    favPromise,
  ])

  if (error || !photo) notFound()

  return (
    <PhotoDetail
      photo={photo}
      isAdmin={isAdmin}
      isAuthenticated={isAuthenticated}
      initialIsFavourited={!!favRow}
    />
  )
}
