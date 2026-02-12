import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import PhotoDetail from '@/components/PhotoDetail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Server-side Supabase client using service role (to query user_favourites)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function PhotoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const isAdmin = !!session?.user
  const isAuthenticated = !!session?.user

  // Derive stable user id (same logic as the API route)
  const userId =
    (session?.user as { id?: string } | undefined)?.id ??
    session?.user?.name ??
    null

  // Fetch photo + favourite status in parallel
  const photoPromise = supabase
    .from('photos')
    .select('*')
    .eq('id', params.id)
    .single()

  const favPromise =
    userId
      ? getAdminSupabase()
          .from('user_favourites')
          .select('id')
          .eq('user_id', userId)
          .eq('photo_id', params.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })

  const [{ data: photo, error }, { data: favRow }] = await Promise.all([
    photoPromise,
    favPromise,
  ])

  if (error || !photo) notFound()

  const initialIsFavourited = !!favRow

  return (
    <PhotoDetail
      photo={photo}
      isAdmin={isAdmin}
      isAuthenticated={isAuthenticated}
      initialIsFavourited={initialIsFavourited}
    />
  )
}
