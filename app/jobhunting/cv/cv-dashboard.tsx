'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreItem {
  key: string
  label: string
  avg: number | null
  min: number | null
  max: number | null
}

interface CvFeedbackData {
  responseCount: number
  stated: ScoreItem[]
  results: ScoreItem[]
  profile: ScoreItem[]
  comments: string[]
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#0E0C08',
  card: '#1A1916',
  border: '1px solid #2E2C28',
  text: '#F5F0E8',
  muted: '#9A9488',
  faint: '#5C5A54',
  accent: '#E84A1C',
  green: '#22c55e',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
}

function scoreColor(avg: number | null): string {
  if (avg === null) return T.faint
  if (avg >= 75) return T.green
  if (avg >= 55) return T.blue
  if (avg >= 40) return T.amber
  return T.red
}

function scoreBg(avg: number | null): string {
  if (avg === null) return '#2E2C28'
  if (avg >= 75) return 'rgba(34,197,94,0.15)'
  if (avg >= 55) return 'rgba(59,130,246,0.15)'
  if (avg >= 40) return 'rgba(245,158,11,0.15)'
  return 'rgba(239,68,68,0.15)'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: T.faint,
      marginBottom: 20,
      fontWeight: 700,
      margin: '0 0 20px',
    }}>
      {children}
    </p>
  )
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div style={{
      height: 8,
      borderRadius: 4,
      backgroundColor: '#2E2C28',
      width,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function ScoreRow({ item }: { item: ScoreItem }) {
  const color = scoreColor(item.avg)
  const bg = scoreBg(item.avg)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.text }}>{item.label}</span>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          backgroundColor: bg,
          padding: '2px 8px',
          borderRadius: 3,
          minWidth: 40,
          textAlign: 'center',
          flexShrink: 0,
          marginLeft: 8,
        }}>
          {item.avg !== null ? `${item.avg}` : '—'}
        </span>
      </div>
      <div style={{ height: 6, backgroundColor: '#2E2C28', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: item.avg !== null ? `${item.avg}%` : '0%',
          backgroundColor: color,
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

function SkeletonScoreSection() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ height: 11, width: 120, backgroundColor: '#2E2C28', borderRadius: 3, marginBottom: 20 }} />
      {[80, 65, 90, 55, 70].map((w, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
            <SkeletonBar width={`${w}%`} />
            <SkeletonBar width="40px" />
          </div>
          <SkeletonBar width="100%" />
        </div>
      ))}
    </div>
  )
}

function ScoreSection({ label, items }: { label: string; items: ScoreItem[] }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionLabel>{label}</SectionLabel>
      {items.map((item) => <ScoreRow key={item.key} item={item} />)}
    </div>
  )
}

function SuggestionCard({ icon, text, type }: { icon: string; text: string; type: 'check' | 'warn' | 'info' }) {
  const borderColor = type === 'check' ? T.green : type === 'warn' ? T.amber : T.blue
  const iconColor = type === 'check' ? T.green : type === 'warn' ? T.amber : T.blue
  return (
    <div style={{
      backgroundColor: T.card,
      border: T.border,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 4,
      padding: '12px 16px',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 16, color: iconColor, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CvDashboard() {
  const [data, setData] = useState<CvFeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/jobhunting/cv-feedback')
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setFetchError(json.error)
        else setData(json)
      })
      .catch((e) => setFetchError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  // Derive improvement suggestions
  const allItems: ScoreItem[] = data
    ? [...data.stated, ...data.results, ...data.profile]
    : []

  const suggestions: Array<{ icon: string; text: string; type: 'check' | 'warn' | 'info' }> = []

  if (data && data.responseCount > 0) {
    allItems.forEach((item) => {
      if (item.avg !== null && item.avg < 55) {
        suggestions.push({
          icon: '⚠',
          text: `Strengthen evidence for "${item.label}" in your CV — peers scored this low (${item.avg}/100).`,
          type: 'warn',
        })
      } else if (item.avg !== null && item.avg >= 75) {
        suggestions.push({
          icon: '✓',
          text: `Lead with "${item.label}" — this is a high credibility signal with peers (${item.avg}/100).`,
          type: 'check',
        })
      }
    })
  } else if (!loading) {
    suggestions.push(
      { icon: 'ℹ', text: 'Add quantified revenue outcomes to each role — enterprise buyers respond to numbers.', type: 'info' },
      { icon: 'ℹ', text: 'Highlight 0→1 market building examples — this is a rare and valued skill at Series B–D.', type: 'info' },
      { icon: 'ℹ', text: 'Make the AI angle prominent early — it differentiates you in a crowded sales leadership market.', type: 'info' },
      { icon: 'ℹ', text: 'Include logos prominently (Magalu, Amazon BR, Shopee) — recognizable names build instant credibility.', type: 'info' },
    )
  }

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', backgroundColor: T.bg, minHeight: '100vh', color: T.text }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1916; }
        ::-webkit-scrollbar-thumb { background: #2E2C28; border-radius: 3px; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        backgroundColor: T.bg,
        borderBottom: T.border,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        zIndex: 100,
      }}>
        <Link href="/jobhunting" style={{
          color: T.muted,
          textDecoration: 'none',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          &larr; Job Hunt
        </Link>
        <span style={{ color: T.faint }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>CV Intelligence</span>
        {data && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: T.muted }}>
            {data.responseCount} peer evaluation{data.responseCount !== 1 ? 's' : ''}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>

        {/* Section 1 — CV Base */}
        <SectionLabel>CV Base</SectionLabel>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          marginBottom: 48,
        }}>
          {/* Left: CV Content */}
          <div style={{
            backgroundColor: T.card,
            border: T.border,
            borderRadius: 4,
            padding: '32px 28px',
            maxHeight: 720,
            overflowY: 'auto',
          }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: T.text }}>Renato Kialka</h1>
              <p style={{ fontSize: 14, color: T.muted, margin: '4px 0 0' }}>Head of Sales &amp; Country Manager Brazil</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginBottom: 20 }}>
              {[
                'renato@kialka.com.br',
                '+55 (11) 99999-9999',
                'linkedin.com/in/renatokialka',
                'São Paulo, SP',
              ].map((c) => (
                <span key={c} style={{ fontSize: 12, color: T.muted }}>{c}</span>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #2E2C28', marginBottom: 20 }} />

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.7, margin: 0 }}>
                17+ years in B2B enterprise sales with deep focus on GTM from scratch, 0→1 market building, and AI-applied sales methodologies. Built the Brazil operation of Patagon AI from zero, closing enterprise accounts including Magalu, Amazon BR, Shopee, Riot Games, WeWork, P&amp;G, and DuPont. Author of a book on AI in B2B sales. Trilingual: Portuguese, English, Spanish.
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.faint, marginBottom: 14 }}>Experience</p>

              {[
                {
                  company: 'Patagon AI',
                  title: 'Head of Sales & Country Manager Brazil',
                  period: '2023 – present',
                  bullets: [
                    'Built Brazil market from zero (first commercial hire)',
                    'Enterprise pipeline: Magalu, Amazon BR, Shopee, Riot Games, WeWork, P&G, DuPont',
                    'GTM strategy, legal entity setup, revenue operations',
                  ],
                },
                {
                  company: 'Previous Experience',
                  title: 'Director of Sales LATAM',
                  period: '2020–2023',
                  bullets: [
                    'Led team of senior AEs, quota-carrying environment',
                    'Complex enterprise cycles, multi-stakeholder deals',
                  ],
                },
                {
                  company: 'Earlier Career',
                  title: 'Sales Leadership roles',
                  period: '2009–2020',
                  bullets: [
                    'Consistent revenue growth track record in B2B',
                  ],
                },
              ].map((job, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{job.company}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>{job.period}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, margin: '0 0 6px' }}>{job.title}</p>
                  <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                    {job.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 13, color: T.text, lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.faint, marginBottom: 10 }}>Education</p>
              <div style={{ fontSize: 13, color: T.text }}>Graduation 2006 · Business / related field</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.faint, marginBottom: 10 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['GTM', 'Enterprise Sales', 'RevOps', 'Team Building', 'AI in Sales', 'Trilingual'].map((s) => (
                  <span key={s} style={{
                    fontSize: 12,
                    color: T.muted,
                    backgroundColor: T.bg,
                    border: T.border,
                    borderRadius: 3,
                    padding: '3px 8px',
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.faint, marginBottom: 10 }}>Languages</p>
              <div style={{ fontSize: 13, color: T.text }}>Portuguese (Native) · English (Fluent) · Spanish (Advanced)</div>
            </div>
          </div>

          {/* Right: Credibility Scores */}
          <div style={{
            backgroundColor: T.card,
            border: T.border,
            borderRadius: 4,
            padding: '24px 20px',
            overflowY: 'auto',
            maxHeight: 720,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 20px' }}>Peer Credibility Scores</p>

            {loading ? (
              <>
                <SkeletonScoreSection />
                <SkeletonScoreSection />
                <SkeletonScoreSection />
              </>
            ) : fetchError ? (
              <div style={{ color: T.accent, fontSize: 13 }}>Error loading scores: {fetchError}</div>
            ) : !data || data.responseCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: T.muted, fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>—</div>
                No peer evaluations yet
              </div>
            ) : (
              <>
                <ScoreSection label="Stated Skills" items={data.stated} />
                <ScoreSection label="Results" items={data.results} />
                <ScoreSection label="Profile" items={data.profile} />
              </>
            )}
          </div>
        </div>

        {/* Section 2 — Improvement Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <SectionLabel>Improvement Suggestions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} icon={s.icon} text={s.text} type={s.type} />
              ))}
            </div>
          </div>
        )}

        {/* Section 3 — Peer Comments */}
        {data && data.comments.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <SectionLabel>Peer Comments</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.comments.map((comment, i) => (
                <div key={i} style={{
                  backgroundColor: T.card,
                  border: T.border,
                  borderLeft: `3px solid ${T.faint}`,
                  borderRadius: 4,
                  padding: '14px 18px',
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.7, fontStyle: 'italic' }}>
                    &ldquo;{comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
