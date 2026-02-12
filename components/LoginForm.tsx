'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('invalid username or password')
      } else {
        router.push('/upload')
        router.refresh()
      }
    } catch (error) {
      setError('an error occurred. please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-stone-200 p-10 max-w-md mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 text-sm border-l-2 border-red-800 lowercase">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="username" className="block text-sm lowercase tracking-wide text-stone-600 mb-3">
          username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 border-b-2 border-stone-300 focus:border-stone-900 focus:outline-none transition-colors text-stone-900"
          required
        />
      </div>

      <div className="mb-8">
        <label htmlFor="password" className="block text-sm lowercase tracking-wide text-stone-600 mb-3">
          password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 border-b-2 border-stone-300 focus:border-stone-900 focus:outline-none transition-colors text-stone-900"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 text-white py-3 px-6 lowercase tracking-wide text-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'logging in...' : 'login'}
      </button>
    </form>
  )
}
