'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Feedback360 = {
  id: string
  created_at: string
  q1: string | null
  q2: string | null
  q3: string | null
  q4: string | null
  q5: string | null
}

type CvEvaluation = {
  id: string
  created_at: string
  c1: number
  c2: number
  c3: number
  c4: number
  c5: number
  c6: number
  r1: number
  r2: number
  r3: number
  r4: number
  r5: number
  p1: number
  p2: number
  p3: number
  p4: number
  comment: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS: { key: keyof Feedback360; label: string; full: string }[] = [
  { key: 'q1', label: 'Q1', full: 'What are the 3 things Renato does better than most people?' },
  { key: 'q2', label: 'Q2', full: 'If you could change one thing about how he works, what would it be?' },
  { key: 'q3', label: 'Q3', full: 'What type of environment or company does he truly thrive in?' },
  { key: 'q4', label: 'Q4', full: 'If you could place him in any role or company, where would it be?' },
  { key: 'q5', label: 'Q5', full: 'Anything else you want to share? (optional)' },
]

const STATED_SKILLS: { key: keyof CvEvaluation; label: string }[] = [
  { key: 'c1', label: 'GTM from scratch' },
  { key: 'c2', label: 'Complex enterprise sales' },
  { key: 'c3', label: 'Revenue Operations & Forecasting' },
  { key: 'c4', label: 'Team building & development' },
  { key: 'c5', label: 'Outbound pipeline generation' },
  { key: 'c6', label: 'AI applied to sales in practice' },
]

const ACHIEVEMENTS: { key: keyof CvEvaluation; label: string }[] = [
  { key: 'r1', label: 'First hire who builds entire market' },
  { key: 'r2', label: 'Enterprise closings with major accounts' },
  { key: 'r3', label: 'Accelerated revenue growth' },
  { key: 'r4', label: 'Leading senior AE teams' },
  { key: 'r5', label: 'Reference in B2B sales with AI in Brazil' },
]

const PROFILE_FIT: { key: keyof CvEvaluation; label: string }[] = [
  { key: 'p1', label: 'Thrives in 0→1 more than scaling' },
  { key: 'p2', label: 'Better as IC or small team lead than VP' },
  { key: 'p3', label: 'Communicates well with C-level buyers' },
  { key: 'p4', label: 'More strategic than operational' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return '#3B6D11'
  if (score >= 55) return '#185FA5'
  if (score >= 40) return '#BA7517'
  return '#A32D2D'
}

function avg(vals: number[]): number {
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      color: '#5C5A54',
      fontWeight: 700,
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      backgroundColor: '#1A1916',
      border: '1px solid #2E2C28',
      borderRadius: '3px',
      padding: '20px 24px',
      flex: 1,
      minWidth: '140px',
    }}>
      <div style={{ fontSize: '11px', color: '#5C5A54', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: valueColor ?? '#F5F0E8', fontFamily: 'Manrope, sans-serif' }}>
        {value}
      </div>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score)
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#F5F0E8', fontFamily: 'Manrope, sans-serif' }}>{label}</span>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#F5F0E8',
          backgroundColor: color,
          padding: '2px 8px',
          borderRadius: '2px',
          minWidth: '36px',
          textAlign: 'center' as const,
        }}>
          {Math.round(score)}
        </span>
      </div>
      <div style={{ width: '100%', backgroundColor: '#2E2C28', height: '3px', borderRadius: '0' }}>
        <div style={{
          width: `${score}%`,
          backgroundColor: color,
          height: '3px',
          borderRadius: '0',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Tab: 360 Feedback ────────────────────────────────────────────────────────

function Tab360({ items }: { items: Feedback360[] }) {
  const [selectedQ, setSelectedQ] = useState<keyof Feedback360>('q1')

  const latestDate = items.length > 0 ? formatDate(items[0].created_at) : '—'
  const activeQ = QUESTIONS.find(q => q.key === selectedQ)!
  const responses = items
    .filter(item => item[selectedQ] !== null && item[selectedQ] !== '')
    .map(item => ({ date: item.created_at, text: item[selectedQ] as string }))

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' as const }}>
        <StatCard label="Total Responses" value={String(items.length)} />
        <StatCard label="Latest Date" value={latestDate} />
      </div>

      {/* Question selector */}
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <SectionHeader>Select Question</SectionHeader>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '20px' }}>
          {QUESTIONS.map(q => (
            <button
              key={q.key}
              onClick={() => setSelectedQ(q.key)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Manrope, sans-serif',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                border: '1px solid #2E2C28',
                borderRadius: '3px',
                backgroundColor: selectedQ === q.key ? '#E84A1C' : '#0E0C08',
                color: selectedQ === q.key ? '#F5F0E8' : '#9A9488',
                transition: 'all 0.15s',
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '14px', color: '#F5F0E8', fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}>
          {activeQ.full}
        </div>
      </div>

      {/* Responses */}
      <div>
        <SectionHeader>Responses ({responses.length})</SectionHeader>
        {responses.length === 0 ? (
          <div style={{
            backgroundColor: '#1A1916',
            border: '1px solid #2E2C28',
            borderRadius: '3px',
            padding: '32px',
            textAlign: 'center' as const,
            color: '#5C5A54',
            fontSize: '14px',
          }}>
            No responses for this question yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
            {responses.map((r, i) => (
              <div key={i} style={{
                backgroundColor: '#1A1916',
                border: '1px solid #2E2C28',
                borderRadius: '3px',
                padding: '24px',
              }}>
                <div style={{
                  fontSize: '10px',
                  color: '#5C5A54',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  marginBottom: '12px',
                }}>
                  {formatDate(r.date)}
                </div>
                <div style={{ fontSize: '14px', color: '#F5F0E8', lineHeight: 1.7, fontFamily: 'Manrope, sans-serif' }}>
                  {r.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Resume Evaluations ──────────────────────────────────────────────────

function TabCvEvals({ items }: { items: CvEvaluation[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allScoreFields: (keyof CvEvaluation)[] = ['c1','c2','c3','c4','c5','c6','r1','r2','r3','r4','r5','p1','p2','p3','p4']
  const allLabels: Record<string, string> = {
    c1: 'GTM from scratch', c2: 'Complex enterprise sales', c3: 'Revenue Operations & Forecasting',
    c4: 'Team building & development', c5: 'Outbound pipeline generation', c6: 'AI applied to sales in practice',
    r1: 'First hire who builds entire market', r2: 'Enterprise closings with major accounts',
    r3: 'Accelerated revenue growth', r4: 'Leading senior AE teams', r5: 'Reference in B2B sales with AI in Brazil',
    p1: 'Thrives in 0→1 more than scaling', p2: 'Better as IC or small team lead than VP',
    p3: 'Communicates well with C-level buyers', p4: 'More strategic than operational',
  }

  if (items.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '32px',
        textAlign: 'center' as const,
        color: '#5C5A54',
        fontSize: '14px',
      }}>
        No resume evaluations yet.
      </div>
    )
  }

  // Compute averages
  const avgMap: Record<string, number> = {}
  for (const field of allScoreFields) {
    avgMap[field] = avg(items.map(item => item[field] as number))
  }

  // Overall average
  const allValues = items.flatMap(item => allScoreFields.map(f => item[f] as number))
  const overallAvg = avg(allValues)

  // Highest / Lowest field
  let highestField = allScoreFields[0]
  let lowestField = allScoreFields[0]
  for (const field of allScoreFields) {
    if (avgMap[field] > avgMap[highestField]) highestField = field
    if (avgMap[field] < avgMap[lowestField]) lowestField = field
  }

  const itemsWithComments = items.filter(item => item.comment && item.comment.trim() !== '')

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' as const }}>
        <StatCard label="Total Evaluations" value={String(items.length)} />
        <StatCard
          label="Overall Average"
          value={`${Math.round(overallAvg)}`}
          valueColor={scoreColor(overallAvg)}
        />
        <StatCard label="Highest Scoring" value={allLabels[highestField]} />
        <StatCard label="Lowest Scoring" value={allLabels[lowestField]} />
      </div>

      {/* Stated Skills */}
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <SectionHeader>Stated Skills</SectionHeader>
        {STATED_SKILLS.map(({ key, label }) => (
          <ScoreBar key={key} label={label} score={avgMap[key]} />
        ))}
      </div>

      {/* Achievements */}
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <SectionHeader>Achievements &amp; Track Record</SectionHeader>
        {ACHIEVEMENTS.map(({ key, label }) => (
          <ScoreBar key={key} label={label} score={avgMap[key]} />
        ))}
      </div>

      {/* Profile & Fit */}
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <SectionHeader>Profile &amp; Fit</SectionHeader>
        {PROFILE_FIT.map(({ key, label }) => (
          <ScoreBar key={key} label={label} score={avgMap[key]} />
        ))}
      </div>

      {/* Individual Responses */}
      <div style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <SectionHeader>Individual Responses</SectionHeader>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
          {items.map((item, idx) => (
            <div key={item.id}>
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  borderRadius: '3px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: '#F5F0E8',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '13px',
                }}
              >
                <span>Response {idx + 1} — {formatDate(item.created_at)}</span>
                <span style={{ color: '#5C5A54', fontSize: '11px' }}>
                  {expandedId === item.id ? '▲ collapse' : '▼ expand'}
                </span>
              </button>
              {expandedId === item.id && (
                <div style={{
                  border: '1px solid #2E2C28',
                  borderTop: 'none',
                  borderRadius: '0 0 3px 3px',
                  padding: '20px',
                  backgroundColor: '#0E0C08',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: item.comment ? '16px' : 0,
                  }}>
                    {allScoreFields.map(field => (
                      <div key={field} style={{
                        backgroundColor: '#1A1916',
                        border: '1px solid #2E2C28',
                        borderRadius: '3px',
                        padding: '12px',
                      }}>
                        <div style={{ fontSize: '10px', color: '#5C5A54', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' as const }}>
                          {field.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F0E8' }}>
                          <span style={{
                            backgroundColor: scoreColor(item[field] as number),
                            padding: '2px 7px',
                            borderRadius: '2px',
                          }}>
                            {item[field]}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9A9488', marginTop: '4px', lineHeight: 1.4 }}>
                          {allLabels[field]}
                        </div>
                      </div>
                    ))}
                  </div>
                  {item.comment && (
                    <div style={{
                      backgroundColor: '#1A1916',
                      border: '1px solid #2E2C28',
                      borderRadius: '3px',
                      padding: '16px',
                    }}>
                      <div style={{ fontSize: '10px', color: '#5C5A54', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
                        Comment
                      </div>
                      <div style={{ fontSize: '14px', color: '#F5F0E8', lineHeight: 1.7, fontFamily: 'Manrope, sans-serif' }}>
                        {item.comment}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Free Comments */}
      {itemsWithComments.length > 0 && (
        <div style={{
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
          borderRadius: '3px',
          padding: '24px',
        }}>
          <SectionHeader>Free Comments</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
            {itemsWithComments.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#0E0C08',
                border: '1px solid #2E2C28',
                borderRadius: '3px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '10px', color: '#5C5A54', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                  {formatDate(item.created_at)}
                </div>
                <div style={{ fontSize: '14px', color: '#F5F0E8', lineHeight: 1.7, fontFamily: 'Manrope, sans-serif' }}>
                  {item.comment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FeedbackView() {
  const [activeTab, setActiveTab] = useState<'360' | 'cv'>('360')
  const [feedback360, setFeedback360] = useState<Feedback360[]>([])
  const [cvEvals, setCvEvals] = useState<CvEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/jobhunting/feedback-all')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setFeedback360(json.feedback360 ?? [])
        setCvEvals(json.cvEvals ?? [])
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0E0C08',
      fontFamily: 'Manrope, sans-serif',
      color: '#F5F0E8',
    }}>
      {/* Sticky Nav */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#0E0C08',
        borderBottom: '1px solid #2E2C28',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '52px',
        }}>
          <Link
            href="/jobhunting"
            style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em', textDecoration: 'none' }}
          >
            ← Job Hunt
          </Link>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F0E8', letterSpacing: '0.05em' }}>
            Feedback
          </div>
          <div style={{ width: '80px' }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Tab switcher */}
        <div style={{
          display: 'inline-flex',
          border: '1px solid #2E2C28',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '40px',
        }}>
          <button
            onClick={() => setActiveTab('360')}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              border: 'none',
              borderRight: '1px solid #2E2C28',
              backgroundColor: activeTab === '360' ? '#E84A1C' : '#1A1916',
              color: activeTab === '360' ? '#F5F0E8' : '#9A9488',
              transition: 'all 0.15s',
            }}
          >
            360 Feedback ({feedback360.length})
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'cv' ? '#E84A1C' : '#1A1916',
              color: activeTab === 'cv' ? '#F5F0E8' : '#9A9488',
              transition: 'all 0.15s',
            }}
          >
            Resume Evaluations ({cvEvals.length})
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div style={{ color: '#5C5A54', fontSize: '14px' }}>Loading...</div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#1A1916',
            border: '1px solid #A32D2D',
            borderRadius: '3px',
            padding: '16px',
            color: '#F5F0E8',
            fontSize: '14px',
          }}>
            Error: {error}
          </div>
        )}

        {/* Tab content */}
        {!loading && !error && (
          <>
            {activeTab === '360' && <Tab360 items={feedback360} />}
            {activeTab === 'cv' && <TabCvEvals items={cvEvals} />}
          </>
        )}
      </div>
    </div>
  )
}
