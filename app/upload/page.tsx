import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import UploadForm from '@/components/UploadForm'

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-12 max-w-3xl">
      <UploadForm />
    </div>
  )
}
