'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from './DatePicker'
import { locationData, countries } from '@/lib/location-data'

export default function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [formData, setFormData] = useState({
    file: null as File | null,
    story: '',
    dateTaken: '',
    country: '',
    city: '',
  })

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('file size must be less than 10mb')
        return
      }
      setFormData({ ...formData, file })
      setError('')
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value
    setFormData({ ...formData, country, city: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.file || !formData.story || !formData.dateTaken || !formData.country || !formData.city) {
        setError('please fill in all fields')
        setLoading(false)
        return
      }

      const fileFormData = new FormData()
      fileFormData.append('file', formData.file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: fileFormData,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload file')

      const { url } = await uploadRes.json()
      const location = `${formData.city}, ${formData.country}`

      const photoRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          story: formData.story,
          date_taken: formData.dateTaken,
          country: location,
        }),
      })

      if (!photoRes.ok) throw new Error('Failed to save photo data')

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('failed to upload photo. please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const availableCities = formData.country ? locationData[formData.country] : []

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 shadow-sm rounded-lg p-8 animate-fadeIn">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded animate-slideDown">
          {error}
        </div>
      )}

      {/* Photo Upload Area */}
      <div className="mb-6">
        <label className="block text-sm lowercase mb-2 text-stone-700">photo</label>
        {!preview ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative w-full h-96 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-stone-400 bg-stone-100 scale-[1.02]'
                : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            <svg className="w-12 h-12 text-stone-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-stone-600 text-sm lowercase">choose a file or drag & drop it here</p>
            <p className="text-stone-400 text-xs mt-1">png, jpg, webp up to 10mb</p>
          </div>
        ) : (
          <div className="relative w-full h-96 rounded-lg overflow-hidden group animate-fadeIn">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setFormData({ ...formData, file: null })
              }}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
        <label htmlFor="story" className="block text-sm lowercase mb-2 text-stone-700">story</label>
        <textarea
          id="story"
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 transition-all duration-300 focus:scale-[1.01]"
          placeholder="tell the story behind this photo..."
          required
        />
      </div>

      <div className="mb-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
        <label className="block text-sm lowercase mb-2 text-stone-700">date taken</label>
        <DatePicker
          value={formData.dateTaken}
          onChange={(date) => setFormData({ ...formData, dateTaken: date })}
          className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer text-stone-900 transition-all duration-300 hover:bg-stone-50"
        />
      </div>

      <div className="mb-6 animate-slideUp" style={{ animationDelay: '300ms' }}>
        <label htmlFor="country" className="block text-sm lowercase mb-2 text-stone-700">country</label>
        <select
          id="country"
          value={formData.country}
          onChange={handleCountryChange}
          className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 lowercase text-stone-900 transition-all duration-300 hover:bg-stone-50"
          required
        >
          <option value="">select a country</option>
          {countries.map((country) => (
            <option key={country} value={country} className="lowercase">
              {country}
            </option>
          ))}
        </select>
      </div>

      {formData.country && (
        <div className="mb-6 animate-slideDown">
          <label htmlFor="city" className="block text-sm lowercase mb-2 text-stone-700">city</label>
          <select
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 lowercase text-stone-900 transition-all duration-300 hover:bg-stone-50"
            required
          >
            <option value="">select a city</option>
            {availableCities.map((city) => (
              <option key={city} value={city} className="lowercase">
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 text-white py-3 px-4 rounded-md hover:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed lowercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-slideUp"
        style={{ animationDelay: '400ms' }}
      >
        {loading ? 'uploading...' : 'upload photo'}
      </button>
    </form>
  )
}
