'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        throw new Error('Invalid password')
      }
      router.push('/feedback/admin/curriculo')
    } catch {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div
        className="w-full max-w-sm p-8"
        style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
      >
        <h1 className="text-xl font-semibold mb-6" style={{ color: '#F5F0E8' }}>Admin Login</h1>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm mb-1.5" style={{ color: '#9A9488' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 mb-4 outline-none text-sm"
            style={{
              backgroundColor: '#0E0C08',
              border: '1px solid #2E2C28',
              borderRadius: '8px',
              color: '#F5F0E8',
            }}
            placeholder="Enter password"
            required
            autoFocus
          />
          {error && <p className="mb-3 text-sm" style={{ color: '#E84A1C' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
