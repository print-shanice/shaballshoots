import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/components/AuthProvider'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'shaballshoots',
  description: 'Personal photography portfolio showcasing stories through images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-stone-50">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
