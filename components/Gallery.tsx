'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface Photo {
  id: string
  image_url: string
  story: string
  date_taken: string
  country: string
  year: number
  month: string
  upload_timestamp: string
}

type GroupBy = 'all' | 'country' | 'year' | 'month' | 'favourites'

interface GroupedPhotos {
  [key: string]: Photo[]
}

// ── PhotoGrid: scroll-reveal + fixed 4:3 aspect-ratio photo cards ──────────

function PhotoCard({ photo }: { photo: Photo }) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      ref={ref}
      href={`/photo/${photo.id}`}
      className="group cursor-pointer scroll-reveal"
    >
      {/* Fixed 4:3 aspect-ratio container — images always the same height */}
      <div
        className="relative w-full overflow-hidden bg-stone-100 rounded-sm"
        style={{ paddingBottom: '75%' /* 4:3 = 75% */ }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image_url}
          alt={photo.story}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>
      <div className="mt-3 flex justify-between items-baseline">
        <p className="text-sm text-stone-600 lowercase truncate flex-1 transition-colors duration-300 group-hover:text-stone-900">
          {photo.country}
        </p>
        <p className="text-xs text-stone-500 lowercase tracking-wide ml-4 transition-colors duration-300 group-hover:text-stone-700">
          {photo.year}
        </p>
      </div>
    </Link>
  )
}

function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Gallery() {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const searchParams = useSearchParams()
  const router = useRouter()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [groupBy, setGroupBy] = useState<GroupBy>(() =>
    searchParams.get('view') === 'favourites' ? 'favourites' : 'all',
  )
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set())
  const [loadingFavourites, setLoadingFavourites] = useState(false)

  // ── data fetching ─────────────────────────────────────────────────────

  const fetchPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('upload_timestamp', { ascending: false })
      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFavourites = useCallback(async () => {
    setLoadingFavourites(true)
    try {
      const res = await fetch('/api/favourites')
      if (res.ok) {
        const { photoIds } = await res.json()
        setFavouriteIds(new Set(photoIds))
      }
    } catch (err) {
      console.error('Error fetching favourites:', err)
    } finally {
      setLoadingFavourites(false)
    }
  }, [])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])
  useEffect(() => { fetchFavourites() }, [fetchFavourites])

  useEffect(() => {
    if (searchParams.get('view') === 'favourites') {
      router.replace('/', { scroll: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── grouping helpers ──────────────────────────────────────────────────

  const getCountryFromLocation = (loc: string) => {
    const parts = loc.split(',')
    return parts.length > 1 ? parts[1].trim() : loc
  }

  const getCityFromLocation = (loc: string) => loc.split(',')[0].trim()

  const getGroupedPhotos = (): GroupedPhotos => {
    if (groupBy === 'all' || groupBy === 'favourites') return {}
    return photos.reduce((acc, photo) => {
      let key: string
      if (groupBy === 'country') {
        key = getCountryFromLocation(photo.country)
      } else if (groupBy === 'year') {
        key = photo.year.toString()
      } else {
        const currentYear = new Date().getFullYear()
        if (photo.year !== currentYear) return acc
        key = photo.month
      }
      if (!acc[key]) acc[key] = []
      acc[key].push(photo)
      return acc
    }, {} as GroupedPhotos)
  }

  const getCitiesInCountry = (country: string) =>
    photos
      .filter((p) => getCountryFromLocation(p.country) === country)
      .reduce((acc, photo) => {
        const city = getCityFromLocation(photo.country)
        if (!acc[city]) acc[city] = []
        acc[city].push(photo)
        return acc
      }, {} as { [city: string]: Photo[] })

  const getCoverPhoto = (group: Photo[]) =>
    [...group].sort(
      (a, b) =>
        new Date(b.upload_timestamp).getTime() - new Date(a.upload_timestamp).getTime(),
    )[0]

  const handleCountryClick = (countryName: string) => {
    const cities = getCitiesInCountry(countryName)
    setSelectedGroup(countryName)
    setSelectedCity(Object.keys(cities).length > 1 ? null : Object.keys(cities)[0])
  }

  const switchMode = (mode: GroupBy) => {
    setGroupBy(mode)
    setSelectedGroup(null)
    setSelectedCity(null)
  }

  // ── render helpers ────────────────────────────────────────────────────

  const renderCityFolders = (country: string) => {
    const cities = getCitiesInCountry(country)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(cities).map(([cityName, cityPhotos]) => {
          const cover = getCoverPhoto(cityPhotos)
          return (
            <div
              key={cityName}
              onClick={() => setSelectedCity(cityName)}
              className="cursor-pointer group hover-lift transition-all duration-300"
            >
              <div className="relative w-full overflow-hidden bg-stone-100 rounded-sm" style={{ paddingBottom: '66.66%' }}>
                <Image
                  src={cover.image_url}
                  alt={cityName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-300 flex items-end justify-start p-6">
                  <div className="text-white">
                    <h3 className="text-2xl lowercase mb-1 tracking-wide">{cityName}</h3>
                    <p className="text-xs lowercase tracking-wide opacity-80">{cityPhotos.length} {cityPhotos.length === 1 ? 'photo' : 'photos'}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGroupFolders = () => {
    const grouped = getGroupedPhotos()
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([groupName, groupPhotos]) => {
          const cover = getCoverPhoto(groupPhotos)
          return (
            <div
              key={groupName}
              onClick={() => {
                if (groupBy === 'country') handleCountryClick(groupName)
                else { setSelectedGroup(groupName); setSelectedCity(null) }
              }}
              className="cursor-pointer group hover-lift transition-all duration-300"
            >
              <div className="relative w-full overflow-hidden bg-stone-100 rounded-sm" style={{ paddingBottom: '66.66%' }}>
                <Image
                  src={cover.image_url}
                  alt={groupName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-300 flex items-end justify-start p-6">
                  <div className="text-white">
                    <h3 className="text-2xl lowercase mb-1 tracking-wide">{groupName}</h3>
                    <p className="text-xs lowercase tracking-wide opacity-80">{groupPhotos.length} {groupPhotos.length === 1 ? 'photo' : 'photos'}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Individual photo grid — strict 3 columns on desktop, fixed 4:3 aspect ratio,
  // object-fit: cover for uniform cropping, and IntersectionObserver scroll-reveal.
  const renderPhotos = (photosToRender: Photo[]) => (
    <PhotoGrid photos={photosToRender} />
  )

  // ── loading / empty states ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 animate-fadeIn">
        <div className="text-stone-500 text-sm lowercase tracking-wide">loading...</div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 animate-fadeIn">
        <div className="text-center">
          <p className="text-stone-500 text-lg mb-2 lowercase">no photos yet</p>
          <p className="text-stone-400 text-sm lowercase">upload your first photo to get started</p>
        </div>
      </div>
    )
  }

  // ── what to display ───────────────────────────────────────────────────

  const grouped = getGroupedPhotos()
  const favouritedPhotos = photos.filter((p) => favouriteIds.has(p.id))

  let photosToDisplay: Photo[] = photos
  let showCityFolders = false

  if (groupBy === 'favourites') {
    photosToDisplay = favouritedPhotos
  } else if (selectedGroup && selectedCity) {
    const cities = getCitiesInCountry(selectedGroup)
    photosToDisplay = cities[selectedCity] || []
  } else if (selectedGroup && groupBy === 'country') {
    const cities = getCitiesInCountry(selectedGroup)
    if (Object.keys(cities).length > 1 && !selectedCity) {
      showCityFolders = true
    } else {
      photosToDisplay = grouped[selectedGroup] || []
    }
  } else if (selectedGroup) {
    photosToDisplay = grouped[selectedGroup] || []
  }

  const contentKey = `${groupBy}__${selectedGroup ?? ''}__${selectedCity ?? ''}`

  const btnClass = (active: boolean) =>
    `px-5 py-2 text-xs lowercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
      active
        ? 'bg-stone-900 text-white'
        : 'bg-white border border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900'
    }`

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-12 flex flex-wrap gap-4 items-center justify-between animate-slideDown">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => switchMode('all')} className={btnClass(groupBy === 'all')}>
            all photos
          </button>
          <button onClick={() => switchMode('country')} className={btnClass(groupBy === 'country')}>
            by country
          </button>
          <button onClick={() => switchMode('year')} className={btnClass(groupBy === 'year')}>
            by year
          </button>
          <button onClick={() => switchMode('month')} className={btnClass(groupBy === 'month')}>
            by month
          </button>
          <button onClick={() => switchMode('favourites')} className={btnClass(groupBy === 'favourites')}>
            my favourites
          </button>
        </div>

        {(selectedGroup || selectedCity) && (
          <button
            onClick={() => { if (selectedCity) setSelectedCity(null); else setSelectedGroup(null) }}
            className="text-stone-600 hover:text-stone-900 flex items-center text-sm lowercase tracking-wide transition-all duration-300 hover:translate-x-[-4px]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </button>
        )}
      </div>

      {selectedGroup && (
        <h2 className="text-4xl mb-10 tracking-wide lowercase animate-fadeIn">
          {selectedCity ? `${selectedCity}, ${selectedGroup}` : selectedGroup}
        </h2>
      )}

      <div key={contentKey} className="animate-fadeIn">
        {groupBy === 'favourites' ? (
          loadingFavourites ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-stone-500 text-sm lowercase tracking-wide">loading favourites...</div>
            </div>
          ) : favouritedPhotos.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-stone-500 text-lg mb-2 lowercase">no favourites yet</p>
                {isAuthenticated && (
                  <p className="text-stone-400 text-sm lowercase">open a photo and click the heart to add it here</p>
                )}
              </div>
            </div>
          ) : (
            renderPhotos(favouritedPhotos)
          )
        ) : groupBy !== 'all' && !selectedGroup ? (
          renderGroupFolders()
        ) : showCityFolders ? (
          renderCityFolders(selectedGroup!)
        ) : (
          renderPhotos(photosToDisplay)
        )}
      </div>
    </div>
  )
}
