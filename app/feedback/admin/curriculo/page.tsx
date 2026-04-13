'use client'

import { useEffect, useState } from 'react'

type Evaluation = {
  id: number
  created_at: string
  c1: number; c2: number; c3: number; c4: number; c5: number; c6: number
  r1: number; r2: number; r3: number; r4: number; r5: number
  p1: number; p2: number; p3: number; p4: number
  comment?: string
}

const ALL_KEYS = ['c1','c2','c3','c4','c5','c6','r1','r2','r3','r4','r5','p1','p2','p3','p4']

const LABELS: Record<string, string> = {
  c1: 'GTM from scratch',
  c2: 'Complex enterprise sales',
  c3: 'Revenue Operations & Forecasting',
  c4: 'Team building & development',
  c5: 'Outbound pipeline generation',
  c6: 'AI applied to sales in practice',
  r1: 'First hire who builds the entire market',
  r2: 'Enterprise closings with major accounts',
  r3: 'Accelerated revenue growth in short windows',
  r4: 'Leading senior AE teams',
  r5: 'Reference in B2B sales with AI in Brazil',
  p1: 'Thrives in 0→1 more than in scaling',
  p2: 'Better as IC or small team lead than VP of large org',
  p3: 'Communicates well with C-level buyers',
  p4: 'More strategic than operational',
}

function scoreColor(v: number) {
  if (v >= 75) return '#3B6D11'
  if (v >= 55) return '#185FA5'
  if (v >= 40) return '#BA7517'
  return '#A32D2D'
}

function avg(arr: number[]) {
  if (!arr.length) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

export default function AdminCurriculoPage() {
  const [data, setData] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/curriculo')
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

  const allScores = data.flatMap((ev) => ALL_KEYS.map((k) => (ev as unknown as Record<string, number>)[k]))
  const overallAvg = avg(allScores)

  const keyAvgs = ALL_KEYS.map((k) => ({
    key: k,
    avg: avg(data.map((ev) => (ev as unknown as Record<string, number>)[k])),
  }))
  const highest = keyAvgs.reduce((a, b) => (a.avg > b.avg ? a : b), keyAvgs[0])
  const lowest = keyAvgs.reduce((a, b) => (a.avg < b.avg ? a : b), keyAvgs[0])

  const sections = [
    { title: 'Stated Skills', keys: ['c1','c2','c3','c4','c5','c6'] },
    { title: 'Achievements & Track Record', keys: ['r1','r2','r3','r4','r5'] },
    { title: 'Profile & Fit', keys: ['p1','p2','p3','p4'] },
  ]

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#F5F0E8' }}>Resume Evaluations</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: data.length },
          { label: 'Overall Avg', value: overallAvg, color: scoreColor(overallAvg) },
          { label: 'Highest', value: highest ? `${LABELS[highest.key]} (${highest.avg})` : '—' },
          { label: 'Lowest', value: lowest ? `${LABELS[lowest.key]} (${lowest.avg})` : '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>{stat.label}</p>
            <p
              className="text-lg font-semibold truncate"
              style={{ color: stat.color || '#F5F0E8' }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <p style={{ color: '#9A9488' }}>No evaluations yet.</p>
      ) : (
        <>
          {/* Section averages */}
          {sections.map((section) => {
            const sectionAvgs = section.keys.map((k) => ({
              key: k,
              avg: avg(data.map((ev) => (ev as unknown as Record<string, number>)[k])),
            }))
            return (
              <div
                key={section.title}
                className="p-5 mb-5"
                style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
              >
                <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>{section.title}</h2>
                {sectionAvgs.map(({ key, avg: a }) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm" style={{ color: '#9A9488' }}>{LABELS[key]}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: scoreColor(a), color: '#F5F0E8' }}
                      >
                        {a}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0E0C08' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${a}%`, backgroundColor: scoreColor(a) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Individual responses */}
          <div
            className="p-5 mb-5"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>Individual Responses</h2>
            {data.map((ev, i) => (
              <div
                key={ev.id}
                className="mb-3 overflow-hidden"
                style={{ border: '1px solid #2E2C28', borderRadius: '8px' }}
              >
                <button
                  className="w-full flex justify-between items-center p-3 text-left"
                  style={{ backgroundColor: '#0E0C08' }}
                  onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                >
                  <span className="text-sm" style={{ color: '#9A9488' }}>
                    Response #{i + 1} — {new Date(ev.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ color: '#5C5A54' }}>{expanded === ev.id ? '▲' : '▼'}</span>
                </button>
                {expanded === ev.id && (
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {ALL_KEYS.map((k) => {
                        const val = (ev as unknown as Record<string, number>)[k]
                        return (
                          <div key={k} className="flex justify-between text-xs">
                            <span style={{ color: '#5C5A54' }}>{k}</span>
                            <span
                              className="px-1.5 rounded"
                              style={{ backgroundColor: scoreColor(val), color: '#F5F0E8' }}
                            >
                              {val}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {ev.comment && (
                      <div
                        className="p-3 text-sm"
                        style={{
                          backgroundColor: '#0E0C08',
                          borderRadius: '8px',
                          color: '#9A9488',
                          border: '1px solid #2E2C28',
                        }}
                      >
                        <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>Comment:</p>
                        {ev.comment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Free comments */}
          {data.some((ev) => ev.comment) && (
            <div
              className="p-5"
              style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>Free Comments</h2>
              {data
                .filter((ev) => ev.comment)
                .map((ev, i) => (
                  <div
                    key={ev.id}
                    className="mb-3 p-3 text-sm"
                    style={{
                      backgroundColor: '#0E0C08',
                      borderRadius: '8px',
                      color: '#9A9488',
                      border: '1px solid #2E2C28',
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>
                      #{i + 1} — {new Date(ev.created_at).toLocaleDateString()}
                    </p>
                    {ev.comment}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
