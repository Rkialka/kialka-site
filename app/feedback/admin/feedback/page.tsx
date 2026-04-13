'use client'

import { useEffect, useState } from 'react'

type FeedbackEntry = {
  id: number
  created_at: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5?: string
}

const QUESTIONS: { key: keyof FeedbackEntry; label: string }[] = [
  { key: 'q1', label: 'What are the 3 things Renato does better than most people?' },
  { key: 'q2', label: 'If you could change one thing about how he works, what would it be?' },
  { key: 'q3', label: 'What type of environment or company does he truly thrive in?' },
  { key: 'q4', label: 'If you could place him in any role or company, where would it be?' },
  { key: 'q5', label: 'Anything else you want to share?' },
]

export default function AdminFeedbackPage() {
  const [data, setData] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'q1'|'q2'|'q3'|'q4'|'q5'>('q1')

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then((json) => setData(json.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8" style={{ color: '#9A9488' }}>Loading...</div>
  if (error) return <div className="p-8" style={{ color: '#E84A1C' }}>Error: {error}</div>

  const withQ5 = data.filter((e) => e.q5?.trim()).length
  const latestDate = data.length
    ? new Date(Math.max(...data.map((e) => new Date(e.created_at).getTime()))).toLocaleDateString()
    : '—'

  const activeQ = QUESTIONS.find((q) => q.key === activeTab)!
  const responses = data.filter((e) => e[activeTab as keyof FeedbackEntry]?.toString().trim())

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#F5F0E8' }}>360 Feedback Responses</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div
          className="p-4"
          style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
        >
          <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>Total</p>
          <p className="text-2xl font-bold" style={{ color: '#F5F0E8' }}>{data.length}</p>
        </div>
        <div
          className="p-4"
          style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
        >
          <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>Latest</p>
          <p className="text-lg font-semibold" style={{ color: '#F5F0E8' }}>{latestDate}</p>
        </div>
        <div
          className="p-4"
          style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
        >
          <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>With Q5</p>
          <p className="text-2xl font-bold" style={{ color: '#F5F0E8' }}>{withQ5}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p style={{ color: '#9A9488' }}>No responses yet.</p>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {QUESTIONS.map((q) => (
              <button
                key={q.key}
                onClick={() => setActiveTab(q.key as 'q1'|'q2'|'q3'|'q4'|'q5')}
                className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: activeTab === q.key ? '#E84A1C' : '#1A1916',
                  color: activeTab === q.key ? '#F5F0E8' : '#9A9488',
                  border: '1px solid #2E2C28',
                }}
              >
                {q.key.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active question */}
          <div className="mb-4">
            <h2 className="text-base font-medium mb-4" style={{ color: '#F5F0E8' }}>
              {activeQ.label}
            </h2>
            {responses.length === 0 ? (
              <p style={{ color: '#5C5A54' }}>No responses for this question.</p>
            ) : (
              responses.map((entry, i) => (
                <div
                  key={entry.id}
                  className="p-4 mb-3"
                  style={{
                    backgroundColor: '#1A1916',
                    border: '1px solid #2E2C28',
                    borderRadius: '12px',
                  }}
                >
                  <p className="text-xs mb-2" style={{ color: '#5C5A54' }}>
                    Response #{i + 1} — {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm" style={{ color: '#F5F0E8', lineHeight: '1.7' }}>
                    {entry[activeTab as keyof FeedbackEntry] as string}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  )
}
