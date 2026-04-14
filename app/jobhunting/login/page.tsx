'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JobHuntingLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/jobhunting/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error('Invalid password')
      router.push('/jobhunting')
    } catch {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backgroundColor: '#0E0C08',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #15130F 0%, #0E0C08 100%)',
      fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Card */}
        <div style={{
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
          padding: '40px',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              color: '#5C5A54', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px',
            }}>
              kialka.com.br
            </div>
            <h1 style={{ color: '#F5F0E8', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Access
            </h1>
            <div style={{ marginTop: '10px', width: '32px', height: '2px', backgroundColor: '#E84A1C' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoFocus
                style={{
                  width: '100%', padding: '14px 16px',
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  color: '#F5F0E8', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Manrope, sans-serif',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#E84A1C')}
                onBlur={e => (e.target.style.borderColor = '#2E2C28')}
              />
            </div>

            {error && (
              <p style={{ color: '#E84A1C', fontSize: '13px', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                backgroundColor: '#E84A1C', color: '#F5F0E8',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {loading ? 'Signing in...' : (
                <>
                  Enter
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer detail */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <span style={{
              color: '#5C5A54', fontSize: '10px',
              letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500,
            }}>
              Private Area
            </span>
          </div>
        </div>

        {/* Bottom line */}
        <div style={{
          marginTop: '0',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #5b4039, transparent)',
        }} />
      </div>
    </main>
  )
}
