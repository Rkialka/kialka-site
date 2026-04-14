'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#0E0C08',
  card: '#1A1916',
  border: '1px solid #2E2C28',
  text: '#F5F0E8',
  muted: '#9A9488',
  faint: '#5C5A54',
  accent: '#E84A1C',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: T.faint,
      fontWeight: 700,
      margin: '0 0 20px',
    }}>
      {children}
    </p>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: T.card,
      border: T.border,
      borderRadius: 4,
      padding: '16px 20px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function ExpandableCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          textAlign: 'left',
        }}
      >
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</span>
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 10 }}>{subtitle}</span>
        </div>
        <span style={{ fontSize: 14, color: T.faint, flexShrink: 0, marginLeft: 12 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: T.border }}>
          {children}
        </div>
      )}
    </Card>
  )
}

// ─── Stage data ───────────────────────────────────────────────────────────────

const STAGES = [
  { label: 'Backlog', color: '#5C5A54', desc: 'Identified but not yet researched or scored.' },
  { label: 'Researching', color: '#3b82f6', desc: 'Gathering info, calculating fit score.' },
  { label: 'Applied', color: '#8b5cf6', desc: 'Application sent. Awaiting response.' },
  { label: 'In Process', color: T.accent, desc: 'Active conversations, interviews, or assessments.' },
  { label: 'Offer', color: '#22c55e', desc: 'Offer received. Under evaluation.' },
  { label: 'Closed', color: '#9A9488', desc: 'Filled, declined, or 21 days no response.' },
]

// ─── Scoring dimensions ───────────────────────────────────────────────────────

const SCORING_DIMS = [
  {
    title: 'Role alignment',
    subtitle: '0–6 pts',
    content: (
      <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>6 pts: Exact title match (Head of Sales, Country Manager, VP Sales)</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>4 pts: Strong overlap (Sales Director, Regional VP, Commercial Lead)</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>2 pts: Partial fit (Senior AE, Business Development, Growth)</li>
        <li style={{ fontSize: 13, color: T.text }}>0 pts: No meaningful overlap</li>
      </ul>
    ),
  },
  {
    title: 'Company stage / type',
    subtitle: '0–5 pts',
    content: (
      <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>5 pts: International scale-up entering Brazil/LATAM, Series B–D</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>3 pts: Series A or E+, or established international with LATAM presence</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>1 pt: Brazilian company or early pre-seed</li>
        <li style={{ fontSize: 13, color: T.text }}>0 pts: No company stage signal available</li>
      </ul>
    ),
  },
  {
    title: 'Compensation signal',
    subtitle: '0–4 pts',
    content: (
      <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>4 pts: Stated comp ≥ R$30k/month or USD 7k/month (≈ USD 84k/year)</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>2 pts: Comp signal present but slightly below target</li>
        <li style={{ fontSize: 13, color: T.text }}>0 pts: No comp signal or clearly below range</li>
      </ul>
    ),
  },
  {
    title: 'Location / remote',
    subtitle: '0–3 pts',
    content: (
      <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>3 pts: Fully remote or São Paulo based</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>1 pt: Hybrid with reasonable commute</li>
        <li style={{ fontSize: 13, color: T.text }}>0 pts: Relocation required or office-only outside SP</li>
      </ul>
    ),
  },
  {
    title: 'Language',
    subtitle: '0–2 pts',
    content: (
      <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>2 pts: English-first, multilingual (EN/PT/ES), or Spanish-first global company</li>
        <li style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>1 pt: Portuguese-first with English required</li>
        <li style={{ fontSize: 13, color: T.text }}>0 pts: Portuguese-only local company, no international scope</li>
      </ul>
    ),
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StrategyPage() {
  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', backgroundColor: T.bg, minHeight: '100vh', color: T.text }}>
      <style>{`* { box-sizing: border-box; }`}</style>

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
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Strategy &amp; Rules</span>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>

        {/* Section 1 — What I'm Looking For */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>What I&apos;m Looking For</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}>
            {[
              { icon: '🎯', title: 'Role', items: ['Head of Sales', 'Country Manager', 'VP Sales', 'Sales Director', 'Regional VP', 'Sales Manager (Global companies)', 'GTM Engineer / GTM Lead', 'Revenue Operations Manager/Director', 'Sales Operations Manager/Director'] },
              { icon: '🏢', title: 'Company', items: ['International scale-ups entering Brazil/LATAM', 'Series B–D', '$10M–$200M ARR'] },
              { icon: '💰', title: 'Compensation', items: ['R$ 30.000+/month', 'USD 7.000+/month'] },
              { icon: '📍', title: 'Location', items: ['Remote', 'São Paulo'] },
              { icon: '⚡', title: 'Stage', items: ['Prefer 0→1 and early-stage'] },
              { icon: '🌍', title: 'Language', items: ['Portuguese', 'English', 'Spanish'] },
            ].map((c) => (
              <Card key={c.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.title}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {c.items.map((item) => (
                    <span key={item} style={{ fontSize: 13, color: T.muted }}>{item}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2 — Scoring System */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Scoring System (/20)</SectionLabel>

          <Card style={{ marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 11, color: T.faint, textAlign: 'left', paddingBottom: 10, fontWeight: 700, letterSpacing: '0.05em' }}>Score</th>
                  <th style={{ fontSize: 11, color: T.faint, textAlign: 'left', paddingBottom: 10, fontWeight: 700, letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ fontSize: 11, color: T.faint, textAlign: 'left', paddingBottom: 10, fontWeight: 700, letterSpacing: '0.05em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: '18–20', dot: '🟢', label: 'Top Priority', action: 'Apply immediately, full CV tailoring' },
                  { range: '15–17', dot: '🔵', label: 'Strong fit', action: 'Apply with standard CV' },
                  { range: '12–14', dot: '🟡', label: 'Moderate fit', action: 'Apply if pipeline is thin' },
                  { range: '<12', dot: '🔴', label: 'Low fit', action: 'Skip or archive' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: i > 0 ? T.border : 'none' }}>
                    <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 700, color: T.text }}>{row.range}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: T.text }}>
                      <span style={{ marginRight: 6 }}>{row.dot}</span>{row.label}
                    </td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: T.muted }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SCORING_DIMS.map((dim) => (
              <ExpandableCard key={dim.title} title={dim.title} subtitle={dim.subtitle}>
                {dim.content}
              </ExpandableCard>
            ))}
          </div>
        </section>

        {/* Section 3 — Pipeline Stages */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Pipeline Stages</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {STAGES.map((stage) => (
              <Card key={stage.label} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 4, backgroundColor: stage.color }} />
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>{stage.label}</p>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}>{stage.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 4 — Application Rules */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Application Rules</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Only apply to score ≥ 12.',
              'Tailor CV filename: cv_renato_kialka_[company]_[role].pdf',
              'Use renato@kialka.com.br for all applications.',
              'Track everything in this system — no off-system applications.',
              'Follow up after 7 days if no response.',
              'Mark as Closed if filled or 21 days no response.',
              '🔥 Priority flag: score ≥ 18 or strategic target.',
            ].map((rule, i) => (
              <div key={i} style={{
                backgroundColor: T.card,
                border: T.border,
                borderRadius: 4,
                padding: '12px 16px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.faint,
                  backgroundColor: '#2E2C28',
                  borderRadius: 3,
                  padding: '2px 7px',
                  flexShrink: 0,
                  marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 — Target Companies */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Target Companies</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                tier: 'Tier 1',
                label: 'Dream',
                color: T.accent,
                companies: ['Google', 'Salesforce', 'Meta', 'AWS', 'Mastercard', 'ByteDance', 'Stripe'],
              },
              {
                tier: 'Tier 2',
                label: 'Strong',
                color: '#3b82f6',
                companies: ['Linear', 'Notion', 'Figma', 'Vercel', 'Intercom', 'HubSpot LATAM', 'Loom'],
              },
              {
                tier: 'Tier 3',
                label: 'Good',
                color: '#22c55e',
                companies: ['Regional funded startups entering Brazil', 'International SaaS LATAM expansion'],
              },
            ].map((t) => (
              <Card key={t.tier} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 3, backgroundColor: t.color }} />
                <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.tier}</span>
                    <span style={{ fontSize: 11, color: T.faint, display: 'block', marginTop: 2 }}>{t.label}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', paddingTop: 2 }}>
                    {t.companies.map((c) => (
                      <span key={c} style={{ fontSize: 13, color: T.text }}>{c}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 6 — Job Search Sources */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Job Search Sources</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
          }}>
            {[
              { name: 'LinkedIn', url: 'https://linkedin.com/jobs', note: 'Principal — Easy Apply + Direto', priority: true },
              { name: 'Gupy', url: 'https://gupy.io', note: 'Empresas brasileiras e multinacionais', priority: true },
              { name: 'Indeed', url: 'https://indeed.com.br', note: 'Ampla cobertura BR + global', priority: true },
              { name: 'Wellfound', url: 'https://wellfound.com', note: 'Startups e scale-ups', priority: false },
              { name: 'Himalayas', url: 'https://himalayas.app', note: 'Remote-first global', priority: false },
              { name: 'Glassdoor', url: 'https://glassdoor.com.br', note: 'Salários + vagas abertas', priority: false },
              { name: 'Trampos.co', url: 'https://trampos.co', note: 'Tech BR, remoto e híbrido', priority: false },
              { name: 'RemoteOK', url: 'https://remoteok.com', note: 'Vagas 100% remote', priority: false },
              { name: 'Built In', url: 'https://builtin.com', note: 'Tech companies EUA', priority: false },
              { name: 'CareerVault', url: 'https://careervault.io', note: 'Agregador de ATS', priority: false },
              { name: 'Greenhouse', url: 'https://job-boards.greenhouse.io', note: 'ATS direto (site:greenhouse.io)', priority: false },
              { name: 'Lever', url: 'https://jobs.lever.co', note: 'ATS direto (site:lever.co)', priority: false },
            ].map((source) => (
              <Card key={source.name} style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{source.name}</span>
                  {source.priority && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: T.accent,
                      backgroundColor: 'rgba(232,74,28,0.1)',
                      padding: '2px 6px', borderRadius: 2,
                    }}>
                      Primary
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{source.note}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 7 — Cowork Integration */}
        <section style={{ marginBottom: 48 }}>
          <SectionLabel>Cowork Integration</SectionLabel>
          <Card>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 14px', lineHeight: 1.6 }}>
              Claude Cowork automatically syncs this after each job hunt session.
            </p>
            <pre style={{
              backgroundColor: '#0E0C08',
              border: T.border,
              borderRadius: 4,
              padding: '16px 18px',
              margin: 0,
              overflowX: 'auto',
              fontSize: 12,
              lineHeight: 1.7,
              color: '#a3e635',
              fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
            }}>
              {`curl -X POST https://kialka.com.br/api/jobhunting/logs \\
  -H "Authorization: Bearer <ADMIN_PASSWORD>" \\
  -H "Content-Type: application/json" \\
  -d '{"session_date":"2026-04-13","session_name":"Session 7","summary":"...", "applications_count": 3}'`}
            </pre>
          </Card>
        </section>

      </div>
    </div>
  )
}
