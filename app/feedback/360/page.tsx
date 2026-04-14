'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const QUESTIONS = [
  {
    key: 'q1',
    icon: 'star',
    label: 'What are the 3 things Renato does better than most people?',
    hint: 'Be specific — concrete examples are worth more than generic praise',
    required: true,
  },
  {
    key: 'q2',
    icon: 'trending_up',
    label: 'If you could change one thing about how he works, what would it be?',
    hint: 'Honest feedback is the most valuable. No need to soften it.',
    required: true,
  },
  {
    key: 'q3',
    icon: 'groups',
    label: 'What type of environment or company does he truly thrive in?',
    hint: 'Think about culture, company stage, team size, pace',
    required: true,
  },
  {
    key: 'q4',
    icon: 'shutter_speed',
    label: 'If you could place him in any role or company, where would it be?',
    hint: 'No limits — can be a type of company, a specific role, or a context',
    required: true,
  },
  {
    key: 'q5',
    icon: 'edit_note',
    label: 'Anything else you want to share?',
    hint: 'Optional — any extra context, observation, or advice',
    required: false,
  },
]

export default function FeedbackPage() {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({
    q1: '', q2: '', q3: '', q4: '', q5: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    for (const q of QUESTIONS.filter(q => q.required)) {
      if (!values[q.key].trim()) {
        setError(`Please answer: "${q.label}"`)
        return
      }
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      router.push('/feedback/obrigado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#0E0C08', fontFamily: 'Manrope, sans-serif',
    }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: '#0E0C08', borderBottom: '1px solid rgba(91,64,57,0.15)',
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ color: '#E84A1C', fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          360 Feedback
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, width: '100%', maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>

        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ color: '#F5F0E8', fontWeight: 800, fontSize: '40px', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
            360 Feedback
          </h1>
          <p style={{ color: '#9A9488', fontSize: '15px', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
            4 questions + 1 optional. Be direct — there&apos;s no wrong answer.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {QUESTIONS.map((q, idx) => (
            <div
              key={q.key}
              style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', padding: '32px', transition: 'border-color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,74,28,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2E2C28')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                  {q.icon}
                </span>
                <label style={{ color: '#F5F0E8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {idx + 1}. {q.label}
                  {!q.required && <span style={{ color: '#5C5A54', marginLeft: '8px', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>}
                </label>
              </div>
              <p style={{ color: '#9A9488', fontSize: '12px', marginBottom: '14px', fontStyle: 'italic' }}>{q.hint}</p>
              <textarea
                value={values[q.key]}
                onChange={e => handleChange(q.key, e.target.value)}
                rows={4}
                required={q.required}
                placeholder="Your answer..."
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#0E0C08', border: 'none',
                  color: '#F5F0E8', fontSize: '14px', lineHeight: 1.6, resize: 'none', outline: 'none',
                  boxSizing: 'border-box', fontFamily: 'Manrope, sans-serif', transition: 'box-shadow 0.2s',
                }}
                onFocus={e => (e.target.style.boxShadow = '0 0 0 1px rgba(232,74,28,0.4)')}
                onBlur={e => (e.target.style.boxShadow = 'none')}
              />
            </div>
          ))}

          {error && <p style={{ color: '#E84A1C', fontSize: '13px' }}>{error}</p>}

          <div style={{ paddingTop: '8px', paddingBottom: '48px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '18px', backgroundColor: '#E84A1C', color: '#F5F0E8',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s', fontFamily: 'Manrope, sans-serif',
              }}
            >
              {submitting ? 'Submitting...' : <>Submit Feedback <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span></>}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#5C5A54', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              kialka.com.br · Confidential
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
