'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus =
  | 'cv_ready'
  | 'action_needed'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'closed'
  | 'skip'

type Application = {
  id: string
  created_at: string
  updated_at: string
  company: string
  role: string
  score: number | null
  status: ApplicationStatus
  ats: string | null
  apply_url: string | null
  cv_file: string | null
  notes: string | null
  candidate_notes: string | null
  application_qa: Array<{ question: string; answer: string; source?: string }> | null
  manual_action: string | null
  applied_at: string | null
  priority: boolean
  track: string | null
}

type DailyLog = {
  id: string
  session_date: string
  session_name: string
  summary: string
  details: string | null
  applications_count: number
  source: string
}

type JhEvent = {
  id: string
  created_at: string
  event_type: string
  description: string
  old_status: string | null
  new_status: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'cv_ready',      label: 'To Apply',       color: '#185FA5', statuses: ['cv_ready'] as ApplicationStatus[] },
  { id: 'action_needed', label: 'Action Needed',   color: '#BA7517', statuses: ['action_needed'] as ApplicationStatus[] },
  { id: 'applied',       label: 'Applied',         color: '#3B6D11', statuses: ['applied'] as ApplicationStatus[] },
  { id: 'interviewing',  label: 'Interviewing',    color: '#E84A1C', statuses: ['interviewing'] as ApplicationStatus[] },
  { id: 'offer',         label: 'Offer',           color: '#3B6D11', statuses: ['offer'] as ApplicationStatus[] },
  { id: 'archive',       label: 'Archive',         color: '#5C5A54', statuses: ['closed', 'skip'] as ApplicationStatus[] },
]

const ALL_STATUSES: ApplicationStatus[] = [
  'cv_ready', 'action_needed', 'applied', 'interviewing', 'offer', 'closed', 'skip',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  cv_ready: 'CV Ready',
  action_needed: 'Action Needed',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  closed: 'Closed',
  skip: 'Skip',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number | null): string {
  if (score === null) return '#5C5A54'
  if (score >= 18) return '#3B6D11'
  if (score >= 15) return '#185FA5'
  if (score >= 12) return '#BA7517'
  return '#A32D2D'
}

function statusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'cv_ready':      return '#185FA5'
    case 'action_needed': return '#BA7517'
    case 'applied':       return '#3B6D11'
    case 'interviewing':  return '#E84A1C'
    case 'offer':         return '#3B6D11'
    case 'closed':        return '#A32D2D'
    case 'skip':          return '#5C5A54'
    default:              return '#5C5A54'
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <div style={{ height: '14px', backgroundColor: '#2E2C28', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '11px', backgroundColor: '#2E2C28', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

function isEasyApply(ats: string | null): boolean {
  if (!ats) return false
  const a = ats.toLowerCase()
  return a.includes('easy apply') || a.includes('candidatura simplificada') || a.includes('linkedin easy')
}

function KanbanCard({ app, onClick, onProcess }: { app: Application; onClick: () => void; onProcess?: (app: Application) => void }) {
  const isActionNeeded = app.status === 'action_needed'
  const isPriority = app.priority
  const easyApply = isEasyApply(app.ats)

  let leftBorder = 'none'
  if (isPriority) leftBorder = '2px solid #E84A1C'
  else if (isActionNeeded) leftBorder = '2px solid #BA7517'

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderLeft: leftBorder,
        borderRadius: '4px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        marginBottom: '8px',
        fontFamily: 'Manrope, sans-serif',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#5C5A54'
        if (leftBorder !== 'none') {
          (e.currentTarget as HTMLDivElement).style.borderLeft = leftBorder
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#2E2C28'
        if (leftBorder !== 'none') {
          (e.currentTarget as HTMLDivElement).style.borderLeft = leftBorder
        }
      }}
    >
      {/* Company + Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <span style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '14px', marginRight: '8px', lineHeight: 1.3 }}>
          {app.priority && <span style={{ marginRight: '4px' }}>🔥</span>}
          {app.company}
        </span>
        {app.score !== null && (
          <span
            style={{
              backgroundColor: scoreColor(app.score),
              color: '#F5F0E8',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '3px',
              flexShrink: 0,
            }}
          >
            {app.score}
          </span>
        )}
      </div>

      {/* Role */}
      <p style={{ color: '#9A9488', fontSize: '12px', marginBottom: '6px', lineHeight: 1.4 }}>
        {app.role}
      </p>

      {/* ATS + Easy Apply badge + Status pill + CV/QA indicators */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
        {easyApply ? (
          <span
            style={{
              backgroundColor: 'rgba(59,109,17,0.18)',
              color: '#6DBF3E',
              border: '1px solid rgba(59,109,17,0.4)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '3px',
              letterSpacing: '0.02em',
            }}
          >
            ⚡ Easy Apply
          </span>
        ) : app.ats ? (
          <span style={{ color: '#5C5A54', fontSize: '11px' }}>{app.ats}</span>
        ) : null}
        <span
          style={{
            backgroundColor: statusColor(app.status),
            color: '#F5F0E8',
            fontSize: '10px',
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: '3px',
            opacity: 0.85,
          }}
        >
          {STATUS_LABELS[app.status]}
        </span>
        {app.cv_file && (
          <span
            title={app.cv_file}
            style={{
              color: '#5C5A54',
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '3px',
              border: '1px solid #2E2C28',
            }}
          >
            📄 CV
          </span>
        )}
        {app.application_qa && app.application_qa.length > 0 && (
          <span
            title={`${app.application_qa.length} form questions answered`}
            style={{
              color: '#5C5A54',
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '3px',
              border: '1px solid #2E2C28',
            }}
          >
            📋 {app.application_qa.length}Q
          </span>
        )}
      </div>

      {/* Action button — Process (cv_ready/action_needed) OR Open link (other statuses) */}
      {(app.status === 'cv_ready' || app.status === 'action_needed') && onProcess ? (
        <div style={{ marginBottom: app.manual_action ? '4px' : '0' }}>
          <button
            onClick={e => { e.stopPropagation(); onProcess(app) }}
            style={{
              backgroundColor: app.status === 'action_needed' ? '#BA7517' : '#185FA5',
              border: 'none',
              borderRadius: '3px',
              color: '#F5F0E8',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 10px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            🚀 Process
          </button>
        </div>
      ) : app.apply_url ? (
        <div style={{ marginBottom: app.manual_action ? '4px' : '0' }}>
          <a
            href={app.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              color: '#E84A1C',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Open →
          </a>
        </div>
      ) : null}

      {/* Manual action */}
      {app.manual_action && (
        <p style={{ color: '#BA7517', fontSize: '11px', marginTop: '4px' }}>
          🔧 {app.manual_action.length > 60 ? app.manual_action.slice(0, 60) + '…' : app.manual_action}
        </p>
      )}
    </div>
  )
}

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

function KanbanBoard({
  applications,
  loading,
  onSelectApp,
  onProcessApp,
}: {
  applications: Application[]
  loading: boolean
  onSelectApp: (app: Application) => void
  onProcessApp: (app: Application) => void
}) {
  const [archiveExpanded, setArchiveExpanded] = useState(true)

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '12px',
        alignItems: 'flex-start',
      }}
    >
      {COLUMNS.map(col => {
        const colApps = applications.filter(a => col.statuses.includes(a.status))
        const isArchive = col.id === 'archive'

        return (
          <div
            key={col.id}
            style={{
              minWidth: '280px',
              width: '280px',
              flexShrink: 0,
            }}
          >
            {/* Column header */}
            <div
              style={{
                borderTop: `3px solid ${col.color}`,
                paddingTop: '10px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: isArchive ? 'pointer' : 'default',
              }}
              onClick={isArchive ? () => setArchiveExpanded(v => !v) : undefined}
            >
              <span style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '13px' }}>
                {col.label}
                {isArchive && (
                  <span style={{ color: '#5C5A54', fontSize: '12px', marginLeft: '6px' }}>
                    {archiveExpanded ? '▲' : '▼'}
                  </span>
                )}
              </span>
              <span
                style={{
                  backgroundColor: col.color,
                  color: '#F5F0E8',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '3px',
                  opacity: 0.9,
                }}
              >
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            {(!isArchive || archiveExpanded) && (
              <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '2px' }}>
                {loading
                  ? [1, 2, 3].map(i => <CardSkeleton key={i} />)
                  : colApps.length === 0
                  ? (
                    <div
                      style={{
                        border: '1px dashed #2E2C28',
                        borderRadius: '4px',
                        padding: '20px',
                        textAlign: 'center',
                        color: '#5C5A54',
                        fontSize: '12px',
                      }}
                    >
                      Empty
                    </div>
                  )
                  : colApps.map(app => (
                    <KanbanCard key={app.id} app={app} onClick={() => onSelectApp(app)} onProcess={onProcessApp} />
                  ))
                }
              </div>
            )}

            {isArchive && !archiveExpanded && colApps.length > 0 && (
              <div
                style={{
                  border: '1px dashed #2E2C28',
                  borderRadius: '4px',
                  padding: '12px',
                  textAlign: 'center',
                  color: '#5C5A54',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => setArchiveExpanded(true)}
              >
                {colApps.length} items — click to expand
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({
  applications,
  loading,
  onSelectApp,
}: {
  applications: Application[]
  loading: boolean
  onSelectApp: (app: Application) => void
}) {
  return (
    <div style={{ borderRadius: '4px', border: '1px solid #2E2C28', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#1A1916', borderBottom: '1px solid #2E2C28' }}>
            {['Company', 'Role', 'Score', 'Status', 'ATS', 'Applied', 'Actions'].map(h => (
              <th
                key={h}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  color: '#5C5A54',
                  fontWeight: 600,
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? [1, 2, 3, 4, 5].map(i => (
              <tr key={i} style={{ borderBottom: '1px solid #2E2C28' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                  <td key={j} style={{ padding: '10px 14px' }}>
                    <div style={{ height: '12px', backgroundColor: '#2E2C28', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                ))}
              </tr>
            ))
            : applications.map((app, i) => (
              <tr
                key={app.id}
                onClick={() => onSelectApp(app)}
                style={{
                  backgroundColor: i % 2 === 0 ? '#0E0C08' : '#111009',
                  borderBottom: '1px solid #2E2C28',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#1A1916'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = i % 2 === 0 ? '#0E0C08' : '#111009'
                }}
              >
                <td style={{ padding: '10px 14px', color: '#F5F0E8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {app.priority && '🔥 '}{app.company}
                </td>
                <td style={{ padding: '10px 14px', color: '#9A9488', minWidth: '160px' }}>{app.role}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {app.score !== null ? (
                    <span style={{ backgroundColor: scoreColor(app.score), color: '#F5F0E8', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                      {app.score}
                    </span>
                  ) : <span style={{ color: '#5C5A54' }}>—</span>}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ backgroundColor: statusColor(app.status), color: '#F5F0E8', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#9A9488', whiteSpace: 'nowrap' }}>{app.ats || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#9A9488', whiteSpace: 'nowrap' }}>{formatDate(app.applied_at)}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {app.apply_url && (
                    <a
                      href={app.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#E84A1C', fontSize: '12px', fontWeight: 600 }}
                    >
                      Open →
                    </a>
                  )}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

// ─── QuickApplyBlock ──────────────────────────────────────────────────────────

const PROFILE_FIELDS = [
  { label: 'Full Name',        value: 'Renato Kialka' },
  { label: 'Email',            value: 'renato@kialka.com.br' },
  { label: 'Phone',            value: '+55 11 98993-6304' },
  { label: 'LinkedIn',         value: 'https://linkedin.com/in/rkialka' },
  { label: 'Location',         value: 'São Paulo, SP, Brasil' },
  { label: 'Current Company',  value: 'Patagon AI' },
  { label: 'Current Title',    value: 'Head of Sales & Country Manager Brazil' },
  { label: 'Experience',       value: '17+ years' },
  { label: 'Salary (BRL)',     value: 'R$ 30.000' },
  { label: 'Salary (USD)',     value: 'USD 100,000 / year' },
  { label: 'Graduation Year',  value: '2006' },
]

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '7px 0', borderBottom: '1px solid #2E2C28' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }}>{label}</p>
        <p style={{ color: '#F5F0E8', fontSize: '13px', wordBreak: 'break-all' }}>{value}</p>
      </div>
      <button
        onClick={copy}
        style={{
          flexShrink: 0,
          backgroundColor: copied ? '#3B6D11' : '#2E2C28',
          color: copied ? '#F5F0E8' : '#9A9488',
          border: 'none',
          borderRadius: '3px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}

function generateFillPrompt(app: Application): string {
  const cvPath = app.cv_file
    ? `~/Desktop/job-hunter-cowork/cvs/${app.cv_file}`
    : '(no CV file specified)'

  const atsHint = app.ats
    ? `The form uses ${app.ats} as the ATS.`
    : 'The ATS is not specified.'

  return `You are helping me fill out a job application form. Please navigate to the following URL and fill every visible field using the data below. If a field is not listed, leave it blank or choose the most appropriate option.

URL: ${app.apply_url ?? '(no URL)'}

CANDIDATE DATA:
- Full Name: Renato Kialka
- Email: renato@kialka.com.br
- Phone: +55 11 98993-6304
- LinkedIn: https://linkedin.com/in/rkialka
- Location / City: São Paulo, SP, Brasil
- Current Company: Patagon AI
- Current Title: Head of Sales & Country Manager Brazil
- Years of Experience: 17+
- Graduation Year: 2006
- Salary Expectation (BRL): R$ 30.000
- Salary Expectation (USD): USD 100,000 / year

CV / RESUME FILE:
${cvPath}
(Attach this file to the resume upload field if there is one)

APPLICATION CONTEXT:
- Company: ${app.company}
- Role: ${app.role}
- ${atsHint}
${app.notes ? `- Notes: ${app.notes}` : ''}

INSTRUCTIONS:
1. Open the URL above.
2. Read all visible form fields on the page.
3. Fill each one using the candidate data above — match field labels to the right value.
4. For dropdowns, select the closest matching option.
5. For the resume/CV upload field, use the file path provided.
6. Do NOT submit the form — stop after filling all fields and wait for my confirmation.
7. If you find fields that are not covered by the data above (e.g. cover letter, portfolio, custom questions), flag them so I can answer them manually.`
}

function PromptModal({ prompt, onClose }: { prompt: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(14,12,8,0.85)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E2C28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F5F0E8', fontWeight: 700, fontSize: '14px' }}>🤖 Claude Chrome Extension Prompt</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5C5A54', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Instructions */}
        <div style={{ padding: '12px 20px', backgroundColor: 'rgba(232,74,28,0.06)', borderBottom: '1px solid #2E2C28' }}>
          <p style={{ color: '#9A9488', fontSize: '12px', lineHeight: 1.5 }}>
            Copy this prompt → open the Claude Chrome Extension (or Cowork) → paste and run. Claude will fill the form for you.
          </p>
        </div>

        {/* Prompt text */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <pre
            style={{
              color: '#F5F0E8',
              fontSize: '12px',
              lineHeight: 1.6,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {prompt}
          </pre>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #2E2C28', display: 'flex', gap: '10px' }}>
          <button
            onClick={copy}
            style={{
              flex: 1,
              backgroundColor: copied ? '#3B6D11' : '#E84A1C',
              color: '#F5F0E8',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {copied ? '✓ Copied to clipboard!' : 'Copy Prompt'}
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2E2C28',
              color: '#9A9488',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickApplyBlock({ app, onMarkApplied, onTriggerPrep }: { app: Application; onMarkApplied: () => void; onTriggerPrep?: (app: Application) => void }) {
  const [open, setOpen] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleGeneratePrompt = () => {
    const prompt = generateFillPrompt(app)
    navigator.clipboard.writeText(prompt).catch(() => {})
    setShowPrompt(true)
  }

  return (
    <>
    {showPrompt && (
      <PromptModal prompt={generateFillPrompt(app)} onClose={() => setShowPrompt(false)} />
    )}
    <div
      style={{
        border: '1px solid #E84A1C',
        borderRadius: '4px',
        marginBottom: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'rgba(232,74,28,0.08)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ color: '#E84A1C', fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
          ⚡ Quick Apply
        </span>
        <span style={{ color: '#5C5A54', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '12px 14px', backgroundColor: '#0E0C08' }}>

          {/* Open button */}
          {app.apply_url && (
            <a
              href={app.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                backgroundColor: '#E84A1C',
                color: '#F5F0E8',
                textAlign: 'center',
                borderRadius: '4px',
                padding: '11px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '14px',
              }}
            >
              Open Application Form →
            </a>
          )}

          {/* CV file */}
          {app.cv_file && (
            <div
              style={{
                backgroundColor: '#1A1916',
                border: '1px solid #2E2C28',
                borderRadius: '4px',
                padding: '10px 12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div>
                <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>CV to attach</p>
                <p style={{ color: '#F5F0E8', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{app.cv_file}</p>
                <p style={{ color: '#5C5A54', fontSize: '11px', marginTop: '2px' }}>Desktop/job-hunter-cowork/cvs/</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(app.cv_file!)}
                style={{ flexShrink: 0, backgroundColor: '#2E2C28', color: '#9A9488', border: 'none', borderRadius: '3px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
          )}

          {/* ATS hint */}
          {app.ats && (
            <p style={{ color: '#BA7517', fontSize: '12px', marginBottom: '12px', padding: '8px 10px', backgroundColor: 'rgba(186,117,23,0.08)', borderRadius: '3px' }}>
              📋 <strong>ATS:</strong> {app.ats}
            </p>
          )}

          {/* Profile fields */}
          <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Profile — click Copy next to each field
          </p>
          {PROFILE_FIELDS.map(f => (
            <CopyField key={f.label} label={f.label} value={f.value} />
          ))}

          {/* Generate prompt button */}
          {app.apply_url && (
            <button
              onClick={handleGeneratePrompt}
              style={{
                marginTop: '12px',
                width: '100%',
                backgroundColor: 'rgba(232,74,28,0.1)',
                color: '#E84A1C',
                border: '1px solid rgba(232,74,28,0.35)',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(232,74,28,0.18)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(232,74,28,0.1)' }}
            >
              🤖 Generate Fill Prompt (Chrome Extension)
            </button>
          )}

          {/* Mark as applied */}
          <button
            onClick={onMarkApplied}
            style={{
              marginTop: '10px',
              width: '100%',
              backgroundColor: '#3B6D11',
              color: '#F5F0E8',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✓ Mark as Applied
          </button>

          {/* Interview Prep */}
          {onTriggerPrep && (
            <button
              onClick={() => onTriggerPrep(app)}
              style={{
                marginTop: '8px',
                width: '100%',
                backgroundColor: 'rgba(24,95,165,0.12)',
                color: '#185FA5',
                border: '1px solid rgba(24,95,165,0.35)',
                borderRadius: '4px',
                padding: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(24,95,165,0.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(24,95,165,0.12)' }}
            >
              🎯 Prep
            </button>
          )}
        </div>
      )}
    </div>
    </>
  )
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({
  app,
  onClose,
  onUpdate,
  onDelete,
  onTriggerPrep,
}: {
  app: Application | null
  onClose: () => void
  onUpdate: (id: string, fields: Partial<Application>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onTriggerPrep?: (app: Application) => void
}) {
  const [events, setEvents] = useState<JhEvent[]>([])
  const [notesValue, setNotesValue] = useState('')
  const [candidateNotesValue, setCandidateNotesValue] = useState('')
  const [candidateNotesEditing, setCandidateNotesEditing] = useState(false)
  const [savingCandidateNotes, setSavingCandidateNotes] = useState(false)
  const [statusValue, setStatusValue] = useState<ApplicationStatus>('cv_ready')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (!app) return
    setNotesValue(app.notes ?? '')
    setCandidateNotesValue(app.candidate_notes ?? '')
    setCandidateNotesEditing(false)
    setStatusValue(app.status)
    setLoadingEvents(true)
    fetch(`/api/jobhunting/applications/${app.id}/events`)
      .then(r => r.json())
      .then(json => setEvents(json.data ?? []))
      .finally(() => setLoadingEvents(false))
  }, [app?.id])

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!app) return
    setStatusValue(newStatus)
    setSavingStatus(true)
    const fields: Partial<Application> = { status: newStatus }
    // Auto-fill applied_at when moving to applied and it's not already set
    if (newStatus === 'applied' && !app.applied_at) {
      fields.applied_at = new Date().toISOString().split('T')[0]
    }
    await onUpdate(app.id, fields)
    setSavingStatus(false)
  }

  const handleSaveNotes = async () => {
    if (!app) return
    setSavingNotes(true)
    await onUpdate(app.id, { notes: notesValue })
    setSavingNotes(false)
  }

  const handleSaveCandidateNotes = async () => {
    if (!app) return
    setSavingCandidateNotes(true)
    await onUpdate(app.id, { candidate_notes: candidateNotesValue })
    setSavingCandidateNotes(false)
    setCandidateNotesEditing(false)
  }

  const handleMarkAsDone = async () => {
    if (!app) return
    await onUpdate(app.id, { status: 'applied', manual_action: null })
    setStatusValue('applied')
  }

  const handleMarkClosed = async () => {
    if (!app) return
    if (!confirm(`Move "${app.company}" to Archive?`)) return
    await onUpdate(app.id, { status: 'closed' })
    setStatusValue('closed')
    onClose()
  }

  const handleDelete = async () => {
    if (!app) return
    if (!confirm(`Permanently delete "${app.company} — ${app.role}"? This cannot be undone.`)) return
    await onDelete(app.id)
    onClose()
  }

  const isOpen = !!app

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(14,12,8,0.7)',
          zIndex: 40,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          backgroundColor: '#1A1916',
          borderLeft: '1px solid #2E2C28',
          zIndex: 50,
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        {app && (
          <div style={{ padding: '24px', flex: 1 }}>
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#5C5A54',
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ marginBottom: '20px', paddingRight: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
                {app.priority && <span style={{ fontSize: '18px' }}>🔥</span>}
                {app.score !== null && (
                  <span style={{ backgroundColor: scoreColor(app.score), color: '#F5F0E8', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px' }}>
                    {app.score}/26
                  </span>
                )}
                {app.track && (
                  <span style={{ backgroundColor: '#2E2C28', color: '#9A9488', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '3px' }}>
                    Track {app.track}
                  </span>
                )}
              </div>
              <h2 style={{ color: '#F5F0E8', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>{app.company}</h2>
              <p style={{ color: '#9A9488', fontSize: '14px' }}>{app.role}</p>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                Status {savingStatus && <span style={{ color: '#BA7517' }}>saving…</span>}
              </label>
              <select
                value={statusValue}
                onChange={e => handleStatusChange(e.target.value as ApplicationStatus)}
                style={{
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  borderRadius: '4px',
                  color: '#F5F0E8',
                  padding: '8px 12px',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Manual Action callout */}
            {app.manual_action && (
              <div
                style={{
                  backgroundColor: 'rgba(186,117,23,0.1)',
                  border: '1px solid #BA7517',
                  borderRadius: '4px',
                  padding: '14px',
                  marginBottom: '20px',
                }}
              >
                <p style={{ color: '#BA7517', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>⚠️ Action Required</p>
                <p style={{ color: '#F5F0E8', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>{app.manual_action}</p>
                <button
                  onClick={handleMarkAsDone}
                  style={{
                    backgroundColor: '#3B6D11',
                    color: '#F5F0E8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark as Done (Applied)
                </button>
              </div>
            )}

            {/* Quick Apply block — only for cv_ready / action_needed */}
            {(app.status === 'cv_ready' || app.status === 'action_needed') && (
              <QuickApplyBlock app={app} onMarkApplied={handleMarkAsDone} onTriggerPrep={onTriggerPrep} />
            )}

            {/* Apply URL — other statuses */}
            {app.apply_url && app.status !== 'cv_ready' && app.status !== 'action_needed' && (
              <div style={{ marginBottom: '20px' }}>
                <a
                  href={app.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    backgroundColor: '#E84A1C',
                    color: '#F5F0E8',
                    textAlign: 'center',
                    borderRadius: '4px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Open Application →
                </a>
              </div>
            )}

            {/* Details grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px',
                padding: '14px',
                backgroundColor: '#0E0C08',
                borderRadius: '4px',
                border: '1px solid #2E2C28',
              }}
            >
              {[
                { label: 'ATS', value: app.ats },
                { label: 'Applied', value: formatDate(app.applied_at) },
                { label: 'Track', value: app.track },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>{item.label}</p>
                  <p style={{ color: '#9A9488', fontSize: '12px', wordBreak: 'break-word' }}>{item.value || '—'}</p>
                </div>
              ))}
              <div>
                <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>CV File</p>
                {app.cv_file ? (
                  <a
                    href={`http://localhost:9876/${app.cv_file.replace(/^cvs\//, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download from local CV server (watcher must be running)"
                    style={{ color: '#185FA5', fontSize: '12px', wordBreak: 'break-word', textDecoration: 'underline' }}
                  >
                    {app.cv_file}
                  </a>
                ) : (
                  <p style={{ color: '#9A9488', fontSize: '12px' }}>—</p>
                )}
              </div>
            </div>

            {/* Minhas anotações — for all statuses except archive */}
            {!['closed', 'skip'].includes(app.status) && (
              <div style={{
                marginBottom: '20px',
                backgroundColor: '#0E0C08',
                border: '1px solid #2E2C28',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: candidateNotesEditing || candidateNotesValue ? '1px solid #2E2C28' : 'none',
                }}>
                  <span style={{ color: '#9A9488', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    ✏️ Minhas anotações
                  </span>
                  {!candidateNotesEditing && (
                    <button
                      onClick={() => setCandidateNotesEditing(true)}
                      style={{
                        background: 'none',
                        border: '1px solid #2E2C28',
                        borderRadius: '3px',
                        color: '#9A9488',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        cursor: 'pointer',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                    >
                      {candidateNotesValue ? 'Editar' : '+ Adicionar'}
                    </button>
                  )}
                </div>

                {/* Read mode */}
                {!candidateNotesEditing && candidateNotesValue && (
                  <p style={{
                    padding: '12px 14px',
                    color: '#F5F0E8',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}>
                    {candidateNotesValue}
                  </p>
                )}

                {/* Edit mode */}
                {candidateNotesEditing && (
                  <div style={{ padding: '12px 14px' }}>
                    <textarea
                      value={candidateNotesValue}
                      onChange={e => setCandidateNotesValue(e.target.value)}
                      rows={5}
                      autoFocus
                      placeholder="Como foi o processo? O que perguntaram? Próximos passos..."
                      style={{
                        width: '100%',
                        backgroundColor: '#1A1916',
                        border: '1px solid #2E2C28',
                        borderRadius: '3px',
                        color: '#F5F0E8',
                        padding: '10px 12px',
                        fontSize: '13px',
                        resize: 'vertical',
                        outline: 'none',
                        lineHeight: 1.6,
                        boxSizing: 'border-box',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(232,74,28,0.4)')}
                      onBlur={e => (e.target.style.borderColor = '#2E2C28')}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={handleSaveCandidateNotes}
                        disabled={savingCandidateNotes}
                        style={{
                          backgroundColor: '#E84A1C',
                          color: '#F5F0E8',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '7px 18px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: savingCandidateNotes ? 'not-allowed' : 'pointer',
                          opacity: savingCandidateNotes ? 0.6 : 1,
                          fontFamily: 'Manrope, sans-serif',
                        }}
                      >
                        {savingCandidateNotes ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => { setCandidateNotesEditing(false); setCandidateNotesValue(app.candidate_notes ?? '') }}
                        style={{
                          background: 'none',
                          border: '1px solid #2E2C28',
                          borderRadius: '3px',
                          color: '#9A9488',
                          fontSize: '12px',
                          padding: '7px 14px',
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Application Q&A — registered by Cowork during processing */}
            {app.application_qa && app.application_qa.length > 0 && (
              <div style={{ marginBottom: '20px', backgroundColor: '#0E0C08', border: '1px solid #2E2C28', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #2E2C28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9A9488', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    📋 Form Q&A
                  </span>
                  <span style={{ color: '#5C5A54', fontSize: '11px' }}>
                    {app.application_qa.length} {app.application_qa.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {app.application_qa.map((qa, i) => (
                    <div key={i} style={{ borderLeft: '2px solid #2E2C28', paddingLeft: '10px' }}>
                      <p style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Q{i + 1}{qa.source ? ` · ${qa.source}` : ''}
                      </p>
                      <p style={{ color: '#9A9488', fontSize: '12px', marginBottom: '6px', lineHeight: 1.5 }}>{qa.question}</p>
                      <p style={{ color: '#F5F0E8', fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                Notes
              </label>
              <textarea
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  borderRadius: '4px',
                  color: '#F5F0E8',
                  padding: '10px 12px',
                  fontSize: '13px',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
                placeholder="Add notes..."
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{
                  marginTop: '8px',
                  backgroundColor: '#2E2C28',
                  color: '#F5F0E8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: savingNotes ? 'not-allowed' : 'pointer',
                  opacity: savingNotes ? 0.6 : 1,
                }}
              >
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                Timeline
              </p>
              {loadingEvents ? (
                <p style={{ color: '#5C5A54', fontSize: '12px' }}>Loading…</p>
              ) : events.length === 0 ? (
                <p style={{ color: '#5C5A54', fontSize: '12px' }}>No events yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {events.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#0E0C08',
                        borderRadius: '4px',
                        border: '1px solid #2E2C28',
                      }}
                    >
                      <p style={{ color: '#9A9488', fontSize: '12px', marginBottom: '3px' }}>{ev.description}</p>
                      <p style={{ color: '#5C5A54', fontSize: '11px' }}>{formatDate(ev.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div style={{ borderTop: '1px solid #2E2C28', paddingTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                onClick={handleMarkClosed}
                style={{
                  backgroundColor: 'transparent',
                  color: '#A32D2D',
                  border: '1px solid #A32D2D',
                  borderRadius: '4px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📦 Move to Archive
              </button>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: 'transparent',
                  color: '#5C5A54',
                  border: '1px solid #2E2C28',
                  borderRadius: '4px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── AddApplicationModal ──────────────────────────────────────────────────────

function AddApplicationModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (fields: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    score: '',
    status: 'cv_ready' as ApplicationStatus,
    ats: '',
    apply_url: '',
    cv_file: '',
    notes: '',
    manual_action: '',
    applied_at: '',
    priority: false,
    track: 'C',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.role) return
    setSaving(true)
    await onAdd({
      company: form.company,
      role: form.role,
      score: form.score ? parseInt(form.score) : null,
      status: form.status,
      ats: form.ats || null,
      apply_url: form.apply_url || null,
      cv_file: form.cv_file || null,
      notes: form.notes || null,
      candidate_notes: null,
      application_qa: null,
      manual_action: form.manual_action || null,
      applied_at: form.applied_at || null,
      priority: form.priority,
      track: form.track || null,
    })
    setSaving(false)
    onClose()
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0E0C08',
    border: '1px solid #2E2C28',
    borderRadius: '4px',
    color: '#F5F0E8',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: '#5C5A54',
    fontSize: '11px',
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block' as const,
    marginBottom: '4px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(14,12,8,0.8)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
          borderRadius: '4px',
          padding: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#F5F0E8', fontSize: '18px', fontWeight: 700 }}>Add Application</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5C5A54', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Company *</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required style={inputStyle} placeholder="e.g. Stripe" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Role *</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required style={inputStyle} placeholder="e.g. Country Manager Brazil" />
            </div>
            <div>
              <label style={labelStyle}>Score (/26)</label>
              <input type="number" min="1" max="26" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} style={inputStyle} placeholder="e.g. 18" />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ApplicationStatus }))} style={inputStyle}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ATS</label>
              <input value={form.ats} onChange={e => setForm(f => ({ ...f, ats: e.target.value }))} style={inputStyle} placeholder="e.g. Greenhouse" />
            </div>
            <div>
              <label style={labelStyle}>Track</label>
              <input value={form.track} onChange={e => setForm(f => ({ ...f, track: e.target.value }))} style={inputStyle} placeholder="A / B / C" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Apply URL</label>
              <input value={form.apply_url} onChange={e => setForm(f => ({ ...f, apply_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>CV File</label>
              <input value={form.cv_file} onChange={e => setForm(f => ({ ...f, cv_file: e.target.value }))} style={inputStyle} placeholder="cv_renato_kialka_company.pdf" />
            </div>
            <div>
              <label style={labelStyle}>Applied Date</label>
              <input type="date" value={form.applied_at} onChange={e => setForm(f => ({ ...f, applied_at: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
              <input type="checkbox" id="priority-check" checked={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.checked }))} style={{ accentColor: '#E84A1C' }} />
              <label htmlFor="priority-check" style={{ color: '#F5F0E8', fontSize: '13px', cursor: 'pointer' }}>🔥 Priority</label>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Context, fit notes, warnings..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Manual Action</label>
              <textarea value={form.manual_action} onChange={e => setForm(f => ({ ...f, manual_action: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Step-by-step action required..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#2E2C28', color: '#9A9488', border: 'none', borderRadius: '4px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', border: 'none', borderRadius: '4px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Adding…' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── DailyLog ─────────────────────────────────────────────────────────────────

function DailyLogSection({ logs, loading }: { logs: DailyLog[]; loading: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const displayed = expanded ? logs : logs.slice(0, 3)

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#F5F0E8', fontSize: '16px', fontWeight: 700 }}>Session Log</h2>
        {logs.length > 3 && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', color: '#5C5A54', fontSize: '12px', cursor: 'pointer' }}
          >
            {expanded ? 'Show less ▲' : `View all (${logs.length}) ▼`}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '4px', padding: '16px' }}>
              <div style={{ height: '12px', backgroundColor: '#2E2C28', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '12px', backgroundColor: '#2E2C28', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {displayed.map(log => (
            <div
              key={log.id}
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              style={{
                backgroundColor: '#1A1916',
                border: '1px solid #2E2C28',
                borderRadius: '4px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#5C5A54'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#2E2C28'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ color: '#5C5A54', fontSize: '11px' }}>{formatDate(log.session_date)}</span>
                {log.applications_count > 0 && (
                  <span style={{ backgroundColor: '#3B6D11', color: '#F5F0E8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                    +{log.applications_count}
                  </span>
                )}
              </div>
              <p style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{log.session_name}</p>
              <p style={{ color: '#9A9488', fontSize: '12px', lineHeight: 1.5 }}>{log.summary}</p>
              {expandedLog === log.id && log.details && (
                <p style={{ color: '#5C5A54', fontSize: '12px', marginTop: '10px', lineHeight: 1.5, borderTop: '1px solid #2E2C28', paddingTop: '10px' }}>
                  {log.details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cowork integration callout */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#0E0C08',
          border: '1px solid #2E2C28',
          borderRadius: '4px',
          padding: '14px 16px',
          fontFamily: 'monospace',
        }}
      >
        <p style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Cowork Integration</p>
        <p style={{ color: '#9A9488', fontSize: '12px', lineHeight: 1.7 }}>
          POST /api/jobhunting/logs<br />
          Authorization: Bearer {'<ADMIN_PASSWORD>'}<br />
          Body: {'{ session_date, session_name, summary, details, applications_count, source: "cowork" }'}
        </p>
      </div>
    </div>
  )
}

// ─── CommandCenter ────────────────────────────────────────────────────────────

type CommandType = 'new_search' | 'email_check' | 'weekly_review' | 'interview_prep' | 'sync' | 'process_applications' | 'generate_insights'
type CommandStatus = 'pending' | 'running' | 'done' | 'error'

type JhCommand = {
  id: string
  created_at: string
  command_type: CommandType
  status: CommandStatus
  payload: Record<string, string> | null
  result: string | null
  triggered_by: 'website' | 'cowork' | 'manual'
}

const COMMAND_LABELS: Record<CommandType, string> = {
  new_search: 'Search Jobs',
  email_check: 'Email Check',
  weekly_review: 'Weekly Review',
  interview_prep: 'Interview Prep',
  sync: 'Sync Tracker',
  process_applications: 'Process Pending',
  generate_insights: 'Insights',
}

const COMMAND_ICONS: Record<CommandType, string> = {
  new_search: '🔍',
  email_check: '📧',
  weekly_review: '📊',
  interview_prep: '🎯',
  sync: '🔄',
  process_applications: '🚀',
  generate_insights: '💡',
}

const COMMAND_STATUS_COLORS: Record<CommandStatus, string> = {
  pending: '#BA7517',
  running: '#185FA5',
  done: '#3B6D11',
  error: '#A32D2D',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function CommandCenter({ onTrigger }: { onTrigger: (type: CommandType, payload?: Record<string, string>) => Promise<void> }) {
  const [commands, setCommands] = useState<JhCommand[]>([])
  const [triggering, setTriggering] = useState<CommandType | null>(null)

  const fetchCommands = useCallback(async () => {
    try {
      const res = await fetch('/api/jobhunting/commands')
      const json = await res.json()
      setCommands((json.data ?? []).slice(0, 10))
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchCommands()
  }, [fetchCommands])

  // Auto-refresh every 15s when there are pending/running commands
  useEffect(() => {
    const hasPendingOrRunning = commands.some(c => c.status === 'pending' || c.status === 'running')
    if (!hasPendingOrRunning) return
    const id = setInterval(fetchCommands, 15000)
    return () => clearInterval(id)
  }, [commands, fetchCommands])

  const handleTrigger = async (type: CommandType) => {
    setTriggering(type)
    try {
      await onTrigger(type)
      await fetchCommands()
    } finally {
      setTriggering(null)
    }
  }

  const TRIGGER_BUTTONS: { type: CommandType }[] = [
    { type: 'email_check' },
    { type: 'weekly_review' },
    { type: 'sync' },
  ]

  return (
    <div
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '14px 16px',
        marginBottom: '24px',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ color: '#F5F0E8', fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          ⚡ Command Center
        </span>
        {/* Trigger buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {TRIGGER_BUTTONS.map(({ type }) => (
            <button
              key={type}
              onClick={() => handleTrigger(type)}
              disabled={triggering === type}
              style={{
                border: '1px solid #2E2C28',
                backgroundColor: '#1A1916',
                color: triggering === type ? '#5C5A54' : '#9A9488',
                padding: '7px 12px',
                fontSize: '12px',
                borderRadius: '3px',
                cursor: triggering === type ? 'not-allowed' : 'pointer',
                fontFamily: 'Manrope, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                if (triggering !== type) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5F0E8'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#5C5A54'
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = '#9A9488'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2E2C28'
              }}
            >
              <span>{COMMAND_ICONS[type]}</span>
              <span>{triggering === type ? '…' : COMMAND_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent commands list */}
      {commands.length === 0 ? (
        <p style={{ color: '#5C5A54', fontSize: '12px' }}>No commands yet. Use the buttons above to trigger a Cowork session.</p>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {commands.map(cmd => (
            <div
              key={cmd.id}
              style={{
                backgroundColor: '#0E0C08',
                border: '1px solid #2E2C28',
                borderRadius: '3px',
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{COMMAND_ICONS[cmd.command_type] ?? '⚙️'}</span>
              <span style={{ color: '#F5F0E8', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {COMMAND_LABELS[cmd.command_type] ?? cmd.command_type}
              </span>
              <span
                style={{
                  backgroundColor: COMMAND_STATUS_COLORS[cmd.status] ?? '#5C5A54',
                  color: '#F5F0E8',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  flexShrink: 0,
                }}
              >
                {cmd.status}
              </span>
              <span style={{ color: '#5C5A54', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {timeAgo(cmd.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string; type: 'success' | 'error' }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          style={{
            backgroundColor: t.type === 'success' ? '#1A2E12' : '#2E1212',
            border: `1px solid ${t.type === 'success' ? '#3B6D11' : '#A32D2D'}`,
            borderRadius: '4px',
            padding: '10px 16px',
            color: '#F5F0E8',
            fontSize: '13px',
            fontFamily: 'Manrope, sans-serif',
            cursor: 'pointer',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {t.type === 'success' ? '✅ ' : '❌ '}{t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function JobHuntingDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [appsRes, logsRes] = await Promise.all([
        fetch('/api/jobhunting/applications'),
        fetch('/api/jobhunting/logs'),
      ])
      const [appsJson, logsJson] = await Promise.all([appsRes.json(), logsRes.json()])
      setApplications(appsJson.data ?? [])
      setLogs(logsJson.data ?? [])
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleUpdate = useCallback(async (id: string, fields: Partial<Application>) => {
    // Optimistic update
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...fields } : a))
    if (selectedApp?.id === id) {
      setSelectedApp(prev => prev ? { ...prev, ...fields } : prev)
    }
    try {
      const res = await fetch(`/api/jobhunting/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Update failed')
      const json = await res.json()
      setApplications(prev => prev.map(a => a.id === id ? json.data : a))
      if (selectedApp?.id === id) {
        setSelectedApp(json.data)
      }
    } catch (err) {
      console.error('Update failed', err)
      fetchAll()
    }
  }, [selectedApp, fetchAll])

  const handleDelete = useCallback(async (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id))
    try {
      const res = await fetch(`/api/jobhunting/applications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
    } catch (err) {
      console.error('Delete failed', err)
      fetchAll()
    }
  }, [fetchAll])

  const handleAdd = useCallback(async (fields: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => {
    // Deduplication: warn if same company+role already exists
    const duplicate = applications.find(
      a => a.company.trim().toLowerCase() === fields.company.trim().toLowerCase() &&
           a.role.trim().toLowerCase() === fields.role.trim().toLowerCase()
    )
    if (duplicate) {
      const confirm = window.confirm(
        `"${fields.company} — ${fields.role}" já existe no pipeline (status: ${STATUS_LABELS[duplicate.status]}).\n\nAdicionar mesmo assim?`
      )
      if (!confirm) return
    }
    try {
      const res = await fetch('/api/jobhunting/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Add failed')
      await fetchAll()
    } catch (err) {
      console.error('Add failed', err)
    }
  }, [fetchAll, applications])

  const handleTriggerCommand = useCallback(async (type: CommandType, payload?: Record<string, string>) => {
    try {
      const res = await fetch('/api/jobhunting/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer renato360',
        },
        body: JSON.stringify({
          command_type: type,
          payload: payload ?? null,
          triggered_by: 'website',
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        addToast(`Failed to trigger ${type}: ${json.error ?? res.status}`, 'error')
      } else {
        addToast(`Command dispatched: ${type}`, 'success')
      }
    } catch (err) {
      addToast(`Network error triggering ${type}`, 'error')
      console.error('Trigger command failed', err)
    }
  }, [addToast])

  const handleTriggerPrep = useCallback(async (app: Application) => {
    await handleTriggerCommand('interview_prep', {
      company: app.company,
      role: app.role,
      apply_url: app.apply_url ?? '',
    })
  }, [handleTriggerCommand])

  const handleProcessApp = useCallback(async (app: Application) => {
    await handleTriggerCommand('process_applications', {
      application_id: app.id,
      company: app.company,
      role: app.role,
      apply_url: app.apply_url ?? '',
    })
  }, [handleTriggerCommand])

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    action_needed: applications.filter(a => a.status === 'action_needed').length,
    cv_ready: applications.filter(a => a.status === 'cv_ready').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offer: applications.filter(a => a.status === 'offer').length,
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0E0C08; }
        ::-webkit-scrollbar-thumb { background: #2E2C28; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #5C5A54; }
      `}</style>

      <main style={{ minHeight: '100vh', backgroundColor: '#0E0C08', padding: '24px', fontFamily: 'Manrope, sans-serif' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ color: '#F5F0E8', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '4px' }}>Job Hunt Dashboard</h1>
              <p style={{ color: '#5C5A54', fontSize: '13px' }}>Renato Kialka — Active Pipeline</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* View toggle */}
              <div style={{ display: 'flex', backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '4px', overflow: 'hidden' }}>
                {(['kanban', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: view === v ? '#E84A1C' : 'transparent',
                      color: view === v ? '#F5F0E8' : '#9A9488',
                      transition: 'all 0.15s',
                    }}
                  >
                    {v === 'kanban' ? '⊞ Kanban' : '☰ List'}
                  </button>
                ))}
              </div>
              {/* Refresh */}
              <button
                onClick={fetchAll}
                style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '4px', color: '#9A9488', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                ↻ Refresh
              </button>
              {/* Search Jobs */}
              <button
                onClick={() => handleTriggerCommand('new_search')}
                style={{
                  backgroundColor: '#E84A1C',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#F5F0E8',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                🔍 Search Jobs
              </button>
              {/* Add */}
              <button
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: '#E84A1C', border: 'none', borderRadius: '4px', color: '#F5F0E8', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                + Add
              </button>
              <Link href="/jobhunting/cv" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>CV</Link>
              <Link href="/jobhunting/strategy" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>Strategy</Link>
              <Link href="/jobhunting/feedback" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>Feedback</Link>
              <Link href="/jobhunting/context" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>Notes</Link>
              <Link href="/jobhunting/intelligence" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>Intelligence</Link>
              <Link href="/jobhunting/analytics" style={{ color: '#9A9488', fontSize: '12px', letterSpacing: '0.05em' }}>Analytics</Link>
              <Link href="/" style={{ color: '#5C5A54', fontSize: '12px' }}>← Home</Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            {[
              { label: 'Total', value: stats.total, color: '#F5F0E8' },
              { label: 'Action Needed', value: stats.action_needed, color: '#BA7517' },
              { label: 'CV Ready', value: stats.cv_ready, color: '#185FA5' },
              { label: 'Applied', value: stats.applied, color: '#3B6D11' },
              { label: 'Interviewing', value: stats.interviewing, color: '#E84A1C' },
              { label: 'Offer', value: stats.offer, color: '#3B6D11' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  backgroundColor: '#1A1916',
                  border: '1px solid #2E2C28',
                  borderTop: `3px solid ${s.color}`,
                  borderRadius: '3px',
                  padding: '14px',
                }}
              >
                <p style={{ color: '#5C5A54', fontSize: '11px', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: '26px', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Command Center */}
          <CommandCenter onTrigger={handleTriggerCommand} />

          {/* Board */}
          {view === 'kanban' ? (
            <KanbanBoard applications={applications} loading={loading} onSelectApp={setSelectedApp} onProcessApp={handleProcessApp} />
          ) : (
            <ListView applications={applications} loading={loading} onSelectApp={setSelectedApp} />
          )}

          {/* Daily Log */}
          <DailyLogSection logs={logs} loading={loading} />
        </div>
      </main>

      {/* Detail Panel */}
      <DetailPanel
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onTriggerPrep={handleTriggerPrep}
      />

      {/* Add Modal */}
      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </>
  )
}
