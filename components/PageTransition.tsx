'use client'

import { usePathname } from 'next/navigation'

/**
 * Wraps page content with a fade-in animation that re-fires on every
 * client-side navigation. Using usePathname() as the React key forces
 * this component to fully unmount and remount whenever the route changes,
 * which re-triggers the CSS animation identically on every navigation.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-fadeIn">
      {children}
    </div>
  )
}
