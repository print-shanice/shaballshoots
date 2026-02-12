'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import DatePicker from './DatePicker'
import { locationData, countries } from '@/lib/location-data'

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

interface Props {
  photo: Photo
  isAdmin: boolean
  isAuthenticated: boolean
  initialIsFavourited: boolean
}

function parseLocation(raw: string): { city: string; country: string } {
  const idx = raw.lastIndexOf(', ')
  if (idx === -1) return { city: '', country: raw }
  return { city: raw.slice(0, idx), country: raw.slice(idx + 2) }
}

export default function PhotoDetail({
  photo: initialPhoto,
  isAdmin,
  isAuthenticated,
  initialIsFavourited,
}: Props) {
  const router = useRouter()

  const [photo, setPhoto] = useState<Photo>(initialPhoto)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [isFavourited, setIsFavourited] = useState(initialIsFavourited)
  const [togglingFav, setTogglingFav] = useState(false)

  const parsedLocation = parseLocation(photo.country)
  const [editStory, setEditStory] = useState(photo.story)
  const [editDate, setEditDate] = useState(photo.date_taken)
  const [editCountry, setEditCountry] = useState(parsedLocation.country)
  const [editCity, setEditCity] = useState(parsedLocation.city)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const availableCities = editCountry ? (locationData[editCountry] ?? []) : []

  // ── favourite ──────────────────────────────────────────────────────────

  const handleToggleFavourite = async () => {
    if (togglingFav) return
    setTogglingFav(true)
    setIsFavourited((prev) => !prev)
    try {
      const method = isFavourited ? 'DELETE' : 'POST'
      const res = await fetch('/api/favourites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      })
      if (!res.ok) setIsFavourited((prev) => !prev)
    } catch {
      setIsFavourited((prev) => !prev)
    } finally {
      setTogglingFav(false)
    }
  }

  // ── edit ───────────────────────────────────────────────────────────────

  const handleEditClick = () => {
    const loc = parseLocation(photo.country)
    setEditStory(photo.story)
    setEditDate(photo.date_taken)
    setEditCountry(loc.country)
    setEditCity(loc.city)
    setSaveError('')
    setSaveSuccess(false)
    setIsEditing(true)
  }

  const handleCancelEdit = () => { setIsEditing(false); setSaveError('') }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditCountry(e.target.value)
    setEditCity('')
  }

  const handleSave = async () => {
    if (!editStory.trim()) { setSaveError('story cannot be empty'); return }
    if (!editDate) { setSaveError('date is required'); return }
    if (!editCountry) { setSaveError('country is required'); return }
    if (!editCity) { setSaveError('city is required'); return }

    setSaving(true); setSaveError('')
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: editStory.trim(), date_taken: editDate, country: `${editCity}, ${editCountry}` }),
      })
      if (res.status === 401) { setSaveError('unauthorised — please log in again'); return }
      if (!res.ok) { const b = await res.json().catch(() => ({})); setSaveError(b.error ?? 'failed to save changes'); return }
      const { photo: updated } = await res.json()
      setPhoto(updated); setIsEditing(false); setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch { setSaveError('network error — please try again') }
    finally { setSaving(false) }
  }

  // ── delete ─────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    setDeleting(true); setDeleteError('')
    try {
      const res = await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' })
      if (res.status === 401) { setDeleteError('unauthorised — please log in again'); return }
      if (!res.ok) { const b = await res.json().catch(() => ({})); setDeleteError(b.error ?? 'failed to delete photo'); return }
      router.push('/'); router.refresh()
    } catch { setDeleteError('network error — please try again') }
    finally { setDeleting(false) }
  }

  // ── display values ─────────────────────────────────────────────────────

  const displayDate = (() => {
    try { return format(new Date(photo.date_taken), 'MMMM dd, yyyy').toLowerCase() }
    catch { return photo.date_taken }
  })()

  const displayUploaded = (() => {
    try { return format(new Date(photo.upload_timestamp), 'MMMM dd, yyyy').toLowerCase() }
    catch { return photo.upload_timestamp }
  })()

  const showOverlay = !isEditing && (isAuthenticated || isAdmin)

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4 lg:px-6 max-w-5xl">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center text-stone-600 hover:text-stone-900 mb-8 text-sm lowercase tracking-wide transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          back to gallery
        </Link>

        {saveSuccess && (
          <div className="mb-6 p-3 bg-stone-900 text-white text-sm lowercase rounded animate-slideDown">
            changes saved successfully
          </div>
        )}

        {/* ── Photo ─────────────────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden rounded-sm mb-8 bg-stone-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.image_url}
            alt={photo.story}
            className="w-full h-auto block"
          />

          {/* Hover overlay — fades in on hover */}
          {showOverlay && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              {/* Favourite — top-left, authenticated users */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleToggleFavourite}
                  disabled={togglingFav}
                  className="absolute top-4 left-4 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-stone-800 text-xs lowercase tracking-wide rounded transition-colors duration-150 disabled:opacity-60"
                >
                  {isFavourited ? (
                    <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {isFavourited ? 'favourited' : 'favourite'}
                </button>
              )}

              {/* Edit / Delete — top-right, admin only */}
              {isAdmin && (
                <div className="absolute top-4 right-4 pointer-events-auto flex gap-2">
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-stone-800 text-xs lowercase tracking-wide rounded transition-colors duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeleteError(''); setShowDeleteModal(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-red-50 text-red-600 text-xs lowercase tracking-wide rounded transition-colors duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Details / Edit ─────────────────────────────────────────── */}
        <div className="space-y-8">
          {isEditing ? (
            <div className="space-y-6 animate-fadeIn">
              {saveError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm lowercase rounded">{saveError}</div>
              )}

              <div>
                <label className="block text-sm lowercase tracking-wide text-stone-500 mb-2">story</label>
                <textarea
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 text-lg leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-sm lowercase tracking-wide text-stone-500 mb-2">date taken</label>
                <DatePicker
                  value={editDate}
                  onChange={setEditDate}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer text-stone-900"
                />
              </div>

              <div>
                <label className="block text-sm lowercase tracking-wide text-stone-500 mb-2">country</label>
                <select
                  value={editCountry}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 lowercase text-stone-900"
                >
                  <option value="">select a country</option>
                  {countries.map((c) => (
                    <option key={c} value={c} className="lowercase">{c}</option>
                  ))}
                </select>
              </div>

              {editCountry && (
                <div>
                  <label className="block text-sm lowercase tracking-wide text-stone-500 mb-2">city</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 lowercase text-stone-900"
                  >
                    <option value="">select a city</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c} className="lowercase">{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={handleSave} disabled={saving}
                  className="px-6 py-2 bg-stone-900 text-white text-sm lowercase tracking-wide rounded hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {saving ? 'saving...' : 'save'}
                </button>
                <button
                  type="button" onClick={handleCancelEdit} disabled={saving}
                  className="px-6 py-2 bg-white border border-stone-300 text-stone-600 text-sm lowercase tracking-wide rounded hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 transition-colors duration-150"
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-stone-700 leading-relaxed text-lg">{photo.story}</p>
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="flex items-baseline">
                  <span className="text-sm lowercase tracking-wide text-stone-500 w-32">location</span>
                  <span className="text-stone-900 lowercase">{photo.country}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm lowercase tracking-wide text-stone-500 w-32">date taken</span>
                  <span className="text-stone-900 lowercase">{displayDate}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm lowercase tracking-wide text-stone-500 w-32">year</span>
                  <span className="text-stone-900">{photo.year}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm lowercase tracking-wide text-stone-500 w-32">month</span>
                  <span className="text-stone-900 lowercase">{photo.month}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm lowercase tracking-wide text-stone-500 w-32">uploaded</span>
                  <span className="text-stone-900 lowercase">{displayUploaded}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 animate-scaleIn">
            <h2 className="text-lg lowercase text-stone-900 mb-3">delete photo?</h2>
            <p className="text-sm text-stone-600 lowercase leading-relaxed mb-6">
              are you sure you want to delete this photo? this action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm lowercase rounded">{deleteError}</div>
            )}
            <div className="flex gap-3">
              <button
                type="button" onClick={handleDeleteConfirm} disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm lowercase tracking-wide rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {deleting ? 'deleting...' : 'delete'}
              </button>
              <button
                type="button" onClick={() => { setShowDeleteModal(false); setDeleteError('') }} disabled={deleting}
                className="flex-1 px-4 py-2 bg-white border border-stone-300 text-stone-700 text-sm lowercase tracking-wide rounded hover:border-stone-500 disabled:opacity-50 transition-colors duration-150"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
