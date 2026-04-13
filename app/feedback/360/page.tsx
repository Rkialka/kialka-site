'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const QUESTIONS = [
  {
    key: 'q1',
    label: 'What are the 3 things Renato does better than most people?',
    hint: 'Be specific — concrete examples are worth more than generic praise',
    required: true,
  },
  {
    key: 'q2',
    label: 'If you could change one thing about how he works, what would it be?',
    hint: 'Honest feedback is the most valuable. No need to soften it.',
    required: true,
  },
  {
    key: 'q3',
    label: 'What type of environment or company does he truly thrive in?',
    hint: 'Think about culture, company stage, team size, pace',
    required: true,
  },
  {
    key: 'q4',
    label: 'If you could place him in any role or company, where would it be?',
    hint: 'No limits — can be a type of company, a specific role, or a context',
    required: true,
  },
  {
    key: 'q5',
    label: 'Anything else you want to share?',
    hint: 'Optional',
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
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    for (const q of QUESTIONS.filter((q) => q.required)) {
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
    <main className="min-h-screen p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/feedback" className="text-sm mb-8 inline-block" style={{ color: '#9A9488' }}>
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F5F0E8' }}>360 Feedback</h1>
        <p className="mb-8 text-sm" style={{ color: '#9A9488' }}>
          4 questions + 1 optional. Be direct — there&apos;s no wrong answer.
        </p>

        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((q, idx) => (
            <div
              key={q.key}
              className="p-5 mb-4"
              style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
            >
              <label className="block mb-1">
                <span className="text-sm font-medium" style={{ color: '#F5F0E8' }}>
                  {idx + 1}. {q.label}
                  {!q.required && (
                    <span className="ml-2 text-xs" style={{ color: '#5C5A54' }}>(optional)</span>
                  )}
                </span>
              </label>
              <p className="text-xs mb-3" style={{ color: '#5C5A54' }}>{q.hint}</p>
              <textarea
                value={values[q.key]}
                onChange={(e) => handleChange(q.key, e.target.value)}
                rows={4}
                required={q.required}
                className="w-full p-3 text-sm resize-none outline-none"
                style={{
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  borderRadius: '8px',
                  color: '#F5F0E8',
                }}
                placeholder="Your answer..."
              />
            </div>
          ))}

          {error && (
            <p className="mb-4 text-sm" style={{ color: '#E84A1C' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
          >
            {submitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </main>
  )
}
