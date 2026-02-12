'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useRef, useCallback } from 'react'

/*
  LogoSpin
  --------
  Two-element design:
    wrapper  — the hover target; never transforms, so its hitbox is always stable
    inner    — the element that physically rotates via the `spinning` CSS class

  The `isAnimating` ref is the lock: once a spin starts it cannot be
  retriggered until `animationend` fires and clears it.  This means
  rapid mouse-edge jitter is completely ignored mid-rotation.
*/
function LogoSpin() {
  const innerRef = useRef<HTMLSpanElement>(null)
  const isAnimating = useRef(false)

  const handleMouseEnter = useCallback(() => {
    // Ignore if already spinning — prevents edge-flicker retriggering
    if (isAnimating.current) return

    const el = innerRef.current
    if (!el) return

    isAnimating.current = true

    // Remove then re-add the class so repeated hovers always restart cleanly
    el.classList.remove('spinning')
    // Force a reflow between remove and add so the browser treats it as a
    // brand-new animation rather than a no-op on an already-spinning element
    void el.offsetWidth
    el.classList.add('spinning')
  }, [])

  const handleAnimationEnd = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    el.classList.remove('spinning')
    isAnimating.current = false
  }, [])

  return (
    <span
      className="logo-spin-wrapper"
      onMouseEnter={handleMouseEnter}
    >
      <span
        ref={innerRef}
        className="logo-spin-inner"
        onAnimationEnd={handleAnimationEnd}
      >
        shaballshoots
      </span>
    </span>
  )
}

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-stone-50/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="text-xl sm:text-3xl tracking-wide">
            <LogoSpin />
          </Link>

          <div className="flex space-x-5 sm:space-x-10 items-center">
            <Link
              href="/"
              className={`text-sm lowercase tracking-wide ${
                isActive('/') ? 'text-stone-900' : 'text-stone-600'
              } hover:text-stone-900 transition-all relative group`}
            >
              gallery
              <span className={`absolute -bottom-1 left-0 w-0 h-px bg-stone-900 transition-all group-hover:w-full ${
                isActive('/') ? 'w-full' : ''
              }`}></span>
            </Link>

            <Link
              href="/about"
              className={`text-sm lowercase tracking-wide ${
                isActive('/about') ? 'text-stone-900' : 'text-stone-600'
              } hover:text-stone-900 transition-all relative group`}
            >
              about
              <span className={`absolute -bottom-1 left-0 w-0 h-px bg-stone-900 transition-all group-hover:w-full ${
                isActive('/about') ? 'w-full' : ''
              }`}></span>
            </Link>

            {session ? (
              <>
                <Link
                  href="/upload"
                  className={`text-sm lowercase tracking-wide ${
                    isActive('/upload') ? 'text-stone-900' : 'text-stone-600'
                  } hover:text-stone-900 transition-all relative group`}
                >
                  upload
                  <span className={`absolute -bottom-1 left-0 w-0 h-px bg-stone-900 transition-all group-hover:w-full ${
                    isActive('/upload') ? 'w-full' : ''
                  }`}></span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm lowercase tracking-wide text-stone-600 hover:text-stone-900 transition-all"
                >
                  logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm lowercase tracking-wide text-stone-600 hover:text-stone-900 transition-all"
              >
                login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
