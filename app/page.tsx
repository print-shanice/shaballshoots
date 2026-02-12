import { Suspense } from 'react'
import Gallery from '@/components/Gallery'

export default function Home() {
  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-[1600px] mx-auto">
      <Suspense fallback={
        <div className="flex justify-center items-center h-96">
          <div className="text-stone-500 text-sm lowercase tracking-wide">loading...</div>
        </div>
      }>
        <Gallery />
      </Suspense>
    </div>
  )
}
