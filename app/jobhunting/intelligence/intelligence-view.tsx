'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type JhInsight = {
  id: string
  created_at: string
  insight_type: string
  title: string
  summary: string
  suggestions: string[]
  data_sources: Record<string, unknown>
  generated_at: string | null
}

type AnalyticsData = {
  total: number
  by_status: Record<string, number>
  response_rate?: number
  top_score?: { company: string; role: string; score: number } | null
}

type FeedbackAllData = {
  feedback360?: { count: number; responses: Record<string, number> }
  cv_evaluations?: {
    count: number
    averages: Record<string, number>
    labels: Record<string, string>
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.15em',
        color: '#5C5A54',
        fontWeight: 700,
        fontFamily: 'Manrope, sans-serif',
        marginBottom: '16px',
      }}
    >
      {children}
    </div>
  )
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '24px',
        marginBottom: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function InsightTypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: '#E84A1C',
        border: '1px solid #E84A1C',
        borderRadius: '3px',
        padding: '2px 6px',
        lineHeight: 1.4,
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {type.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        backgroundColor: '#1A1916',
        border: '1px solid #3B6D11',
        borderLeft: '3px solid #3B6D11',
        borderRadius: '3px',
        padding: '14px 20px',
        color: '#F5F0E8',
        fontSize: '13px',
        fontFamily: 'Manrope, sans-serif',
        zIndex: 200,
        maxWidth: '360px',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  )
}

// ─── Section 1: Pipeline Snapshot ────────────────────────────────────────────

function PipelineSnapshot({ analytics }: { analytics: AnalyticsData | null }) {
  const total = analytics?.total ?? 0
  const byStatus = analytics?.by_status ?? {}
  const interviewing = byStatus['interviewing'] ?? 0
  const applied = byStatus['applied'] ?? 0
  const responseRate = analytics?.response_rate ?? (total > 0 ? Math.round(((interviewing + (byStatus['offer'] ?? 0)) / total) * 100) : 0)
  const topScore = analytics?.top_score ?? null

  const cards = [
    {
      label: 'Total Apps',
      value: String(total),
      subtitle: 'applications tracked',
      color: '#F5F0E8',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      subtitle: 'replies / total',
      color: responseRate >= 20 ? '#3B6D11' : '#E84A1C',
    },
    {
      label: 'Active Interviews',
      value: String(interviewing),
      subtitle: `+ ${applied} applied`,
      color: interviewing > 0 ? '#185FA5' : '#5C5A54',
    },
    {
      label: 'Top Score Job',
      value: topScore ? `${topScore.score}` : '—',
      subtitle: topScore ? `${topScore.company} — ${topScore.role}` : 'no scored apps yet',
      color: '#BA7517',
    },
  ]

  return (
    <Section>
      <SectionLabel>Pipeline Snapshot</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {cards.map(card => (
          <div
            key={card.label}
            style={{
              backgroundColor: '#0E0C08',
              border: '1px solid #2E2C28',
              borderRadius: '3px',
              padding: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#5C5A54',
                fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
                marginBottom: '8px',
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: card.color,
                fontFamily: 'Manrope, sans-serif',
                lineHeight: 1,
                marginBottom: '6px',
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '11px', color: '#5C5A54', fontFamily: 'Manrope, sans-serif', lineHeight: 1.4 }}>
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── Section 2: Latest Insights ───────────────────────────────────────────────

function LatestInsights({
  insights,
  onRequestAnalysis,
}: {
  insights: JhInsight[]
  onRequestAnalysis: () => void
}) {
  const latest = insights[0] ?? null

  return (
    <Section>
      <SectionLabel>Latest Insights</SectionLabel>

      {!latest ? (
        <div
          style={{
            backgroundColor: '#0E0C08',
            border: '1px solid #2E2C28',
            borderRadius: '3px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: '#9A9488',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}
          >
            The system is learning.
            <br />
            No insights have been generated yet. Request the first analysis to start.
          </div>
          <button
            onClick={onRequestAnalysis}
            style={{
              backgroundColor: '#E84A1C',
              border: 'none',
              borderRadius: '3px',
              color: '#F5F0E8',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              padding: '10px 20px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            Request First Analysis
          </button>
        </div>
      ) : (
        <div>
          {/* Meta */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: '#5C5A54', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
              {formatDate(latest.generated_at || latest.created_at)}
            </span>
            <InsightTypeBadge type={latest.insight_type} />
          </div>

          {/* Title */}
          <h3
            style={{
              color: '#F5F0E8',
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '12px',
              marginTop: 0,
              fontFamily: 'Manrope, sans-serif',
              lineHeight: 1.3,
            }}
          >
            {latest.title}
          </h3>

          {/* Summary */}
          <p
            style={{
              color: '#9A9488',
              fontSize: '14px',
              lineHeight: 1.7,
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '20px',
              marginTop: 0,
            }}
          >
            {latest.summary}
          </p>

          {/* Suggestions */}
          {latest.suggestions && latest.suggestions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#5C5A54',
                  fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  marginBottom: '10px',
                }}
              >
                Suggestions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {latest.suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#0E0C08',
                      border: '1px solid #2E2C28',
                      borderRadius: '3px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: '#E84A1C', fontSize: '16px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>
                      ▸
                    </span>
                    <span style={{ color: '#F5F0E8', fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data sources */}
          {latest.data_sources && Object.keys(latest.data_sources).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#5C5A54',
                  fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  marginBottom: '8px',
                }}
              >
                Data Sources
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.keys(latest.data_sources).map(key => (
                  <span
                    key={key}
                    style={{
                      backgroundColor: '#2E2C28',
                      color: '#9A9488',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '3px',
                      padding: '3px 8px',
                      letterSpacing: '0.05em',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

// ─── Section 3: Peer Feedback Summary ────────────────────────────────────────

function FeedbackSummary({ feedbackData }: { feedbackData: FeedbackAllData | null }) {
  const f360 = feedbackData?.feedback360
  const cvEval = feedbackData?.cv_evaluations

  // Top 3 highest / lowest CV scores
  const cvEntries = cvEval
    ? Object.entries(cvEval.averages)
        .map(([key, val]) => ({ key, val, label: cvEval.labels?.[key] ?? key }))
        .sort((a, b) => b.val - a.val)
    : []
  const top3 = cvEntries.slice(0, 3)
  const bottom3 = [...cvEntries].sort((a, b) => a.val - b.val).slice(0, 3)

  return (
    <Section>
      <SectionLabel>Peer Feedback Summary</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 360 Feedback */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#9A9488',
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '12px',
              letterSpacing: '0.05em',
            }}
          >
            360 Feedback ({f360?.count ?? 0} respostas)
          </div>
          {f360 && Object.keys(f360.responses).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(f360.responses).map(([q, count]) => (
                <div
                  key={q}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#0E0C08',
                    border: '1px solid #2E2C28',
                    borderRadius: '3px',
                    padding: '8px 12px',
                  }}
                >
                  <span style={{ color: '#9A9488', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>{q}</span>
                  <span style={{ color: '#F5F0E8', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#5C5A54', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
              No 360 responses yet.
            </div>
          )}
        </div>

        {/* CV Evaluations */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#9A9488',
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '12px',
              letterSpacing: '0.05em',
            }}
          >
            CV Evaluation ({cvEval?.count ?? 0} avaliações)
          </div>
          {cvEntries.length > 0 ? (
            <>
              <div style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#3B6D11',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                    marginBottom: '6px',
                  }}
                >
                  Top 3 Highest
                </div>
                {top3.map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: '#0E0C08',
                      border: '1px solid #2E2C28',
                      borderRadius: '3px',
                      padding: '6px 10px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: '#9A9488', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#3B6D11', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                      {Math.round(item.val)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#E84A1C',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                    marginBottom: '6px',
                  }}
                >
                  Top 3 Lowest
                </div>
                {bottom3.map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      backgroundColor: '#0E0C08',
                      border: '1px solid #2E2C28',
                      borderRadius: '3px',
                      padding: '6px 10px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: '#9A9488', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#E84A1C', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                      {Math.round(item.val)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#5C5A54', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
              No CV evaluations yet.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Link
          href="/jobhunting/feedback"
          style={{ color: '#9A9488', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none' }}
        >
          Ver detalhes →
        </Link>
      </div>
    </Section>
  )
}

// ─── Section 4: What to Improve ───────────────────────────────────────────────

function WhatToImprove({
  analytics,
  feedbackData,
}: {
  analytics: AnalyticsData | null
  feedbackData: FeedbackAllData | null
}) {
  const byStatus = analytics?.by_status ?? {}
  const total = analytics?.total ?? 0
  const interviewing = byStatus['interviewing'] ?? 0
  const responseRate = analytics?.response_rate ?? (total > 0 ? Math.round(((interviewing + (byStatus['offer'] ?? 0)) / total) * 100) : 0)
  const cvReady = byStatus['cv_ready'] ?? 0
  const cvEvalAverages = feedbackData?.cv_evaluations?.averages ?? {}
  const hasLowCvItem = Object.values(cvEvalAverages).some(v => v < 40)

  const suggestions: { text: string; urgent: boolean }[] = []

  if (total > 0 && responseRate < 20) {
    suggestions.push({
      text: 'Taxa de resposta abaixo de 20% — revisar targeting ou CV',
      urgent: true,
    })
  }
  if (hasLowCvItem) {
    suggestions.push({
      text: 'Item de CV com credibilidade baixa — considerar reformular',
      urgent: true,
    })
  }
  if (cvReady > 5) {
    suggestions.push({
      text: `Mais de 5 vagas prontas para aplicar — priorizar submissão (${cvReady} pendentes)`,
      urgent: false,
    })
  }
  suggestions.push({
    text: 'Sincronizar notas do Obsidian para enriquecer os insights',
    urgent: false,
  })

  return (
    <Section>
      <SectionLabel>What to Improve</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {suggestions.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#0E0C08',
              border: `1px solid ${s.urgent ? '#E84A1C' : '#2E2C28'}`,
              borderLeft: `3px solid ${s.urgent ? '#E84A1C' : '#5C5A54'}`,
              borderRadius: '3px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                color: s.urgent ? '#E84A1C' : '#5C5A54',
                fontSize: '14px',
                lineHeight: 1,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {s.urgent ? '!' : '·'}
            </span>
            <span
              style={{
                color: s.urgent ? '#F5F0E8' : '#9A9488',
                fontSize: '13px',
                fontFamily: 'Manrope, sans-serif',
                lineHeight: 1.6,
              }}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── Section 5: How it Works ──────────────────────────────────────────────────

function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        marginBottom: '20px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#5C5A54',
            fontWeight: 700,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          How it Works
        </span>
        <span style={{ color: '#5C5A54', fontSize: '14px', fontFamily: 'Manrope, sans-serif' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 24px 24px' }}>
          <p
            style={{
              color: '#9A9488',
              fontSize: '13px',
              lineHeight: 1.7,
              fontFamily: 'Manrope, sans-serif',
              marginTop: 0,
              marginBottom: '16px',
            }}
          >
            The data flow: Obsidian notes → Context API → Cowork analyzes → Insights stored → Displayed here.
            Cowork reads the context notes plus application pipeline data, then generates structured insights with
            actionable suggestions. Insights are pushed via the Cowork agent using the endpoint below.
          </p>

          <div
            style={{
              backgroundColor: '#0E0C08',
              border: '1px solid #2E2C28',
              borderRadius: '3px',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#9A9488',
              lineHeight: 1.8,
              overflowX: 'auto',
            }}
          >
            <div style={{ color: '#5C5A54', marginBottom: '4px' }}># Push insights from Cowork:</div>
            <div>
              <span style={{ color: '#3B6D11' }}>POST</span>{' '}
              <span style={{ color: '#F5F0E8' }}>/api/jobhunting/insights</span>
            </div>
            <div style={{ color: '#5C5A54' }}>Authorization: Bearer renato360</div>
            <div style={{ marginTop: '8px', color: '#9A9488' }}>{'{'}</div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: '#BA7517' }}>&quot;insight_type&quot;</span>
              <span style={{ color: '#9A9488' }}>: &quot;weekly_analysis&quot;,</span>
            </div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: '#BA7517' }}>&quot;title&quot;</span>
              <span style={{ color: '#9A9488' }}>: &quot;...&quot;,</span>
            </div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: '#BA7517' }}>&quot;summary&quot;</span>
              <span style={{ color: '#9A9488' }}>: &quot;...&quot;,</span>
            </div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: '#BA7517' }}>&quot;suggestions&quot;</span>
              <span style={{ color: '#9A9488' }}>: [&quot;...&quot;, &quot;...&quot;],</span>
            </div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: '#BA7517' }}>&quot;data_sources&quot;</span>
              <span style={{ color: '#9A9488' }}>: {'{'} &quot;applications&quot;: 42, &quot;notes&quot;: 7 {'}'}</span>
            </div>
            <div style={{ color: '#9A9488' }}>{'}'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IntelligenceView() {
  const [insights, setInsights] = useState<JhInsight[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [feedbackData, setFeedbackData] = useState<FeedbackAllData | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [loadingFeedback, setLoadingFeedback] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const res = await fetch('/api/jobhunting/insights?current=true', {
        headers: { Authorization: 'Bearer renato360' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setInsights(Array.isArray(data) ? data : (data as { insights?: JhInsight[] }).insights ?? [])
    } catch {
      // ignore
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true)
    try {
      const res = await fetch('/api/jobhunting/analytics', {
        headers: { Authorization: 'Bearer renato360' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAnalytics(data as AnalyticsData)
    } catch {
      // ignore
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  const fetchFeedback = useCallback(async () => {
    setLoadingFeedback(true)
    try {
      const res = await fetch('/api/jobhunting/feedback-all', {
        headers: { Authorization: 'Bearer renato360' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setFeedbackData(data as FeedbackAllData)
    } catch {
      // ignore
    } finally {
      setLoadingFeedback(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
    fetchAnalytics()
    fetchFeedback()
  }, [fetchInsights, fetchAnalytics, fetchFeedback])

  async function handleRequestAnalysis() {
    if (requesting) return
    setRequesting(true)
    try {
      await fetch('/api/jobhunting/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer renato360',
        },
        body: JSON.stringify({ command_type: 'generate_insights' }),
      })
      setToast('Solicitado — Cowork irá processar em breve.')
    } catch {
      setToast('Erro ao solicitar análise. Tente novamente.')
    } finally {
      setRequesting(false)
    }
  }

  const isLoading = loadingInsights || loadingAnalytics || loadingFeedback

  return (
    <div
      style={{
        backgroundColor: '#0E0C08',
        minHeight: '100vh',
        fontFamily: 'Manrope, sans-serif',
        color: '#F5F0E8',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid #2E2C28',
          padding: '16px 32px',
          zIndex: 100,
          backgroundColor: '#0E0C08',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/jobhunting"
          style={{
            color: '#9A9488',
            fontSize: '12px',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          ← Job Hunt
        </Link>
        <span
          style={{
            color: '#F5F0E8',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Intelligence
        </span>
        <div style={{ width: '80px' }} />
      </nav>

      {/* Page header */}
      <div
        style={{
          borderBottom: '1px solid #2E2C28',
          padding: '32px 32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontWeight: 700, marginBottom: '6px', marginTop: 0 }}>
            Sistema de Aprendizado
          </h1>
          <p style={{ color: '#9A9488', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Insights gerados pela análise de feedbacks, entrevistas e evolução do pipeline.
          </p>
        </div>
        <button
          onClick={handleRequestAnalysis}
          disabled={requesting}
          style={{
            backgroundColor: requesting ? '#2E2C28' : 'transparent',
            border: '1px solid #2E2C28',
            borderRadius: '3px',
            color: requesting ? '#5C5A54' : '#9A9488',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            padding: '10px 18px',
            cursor: requesting ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <span>{requesting ? '...' : '🔄'}</span>
          {requesting ? 'Requesting...' : 'Request Analysis'}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 32px' }}>
        {isLoading && (
          <div style={{ color: '#5C5A54', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '20px' }}>
            Loading data...
          </div>
        )}

        <PipelineSnapshot analytics={analytics} />
        <LatestInsights insights={insights} onRequestAnalysis={handleRequestAnalysis} />
        <FeedbackSummary feedbackData={feedbackData} />
        <WhatToImprove analytics={analytics} feedbackData={feedbackData} />
        <HowItWorks />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
