'use client'

import { useState, useEffect, useCallback } from 'react'
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
        borderRadius: '12px',
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

function KanbanCard({ app, onClick }: { app: Application; onClick: () => void }) {
  const isActionNeeded = app.status === 'action_needed'
  const isPriority = app.priority

  let leftBorder = 'none'
  if (isPriority) leftBorder = '3px solid #E84A1C'
  else if (isActionNeeded) leftBorder = '3px solid #BA7517'

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderLeft: leftBorder,
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        marginBottom: '8px',
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
              borderRadius: '6px',
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

      {/* ATS + Status pill */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
        {app.ats && (
          <span style={{ color: '#5C5A54', fontSize: '11px' }}>{app.ats}</span>
        )}
        <span
          style={{
            backgroundColor: statusColor(app.status),
            color: '#F5F0E8',
            fontSize: '10px',
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: '4px',
            opacity: 0.85,
          }}
        >
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      {/* Apply button */}
      {app.apply_url && (
        <a
          href={app.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-block',
            color: '#E84A1C',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: app.manual_action ? '4px' : '0',
          }}
        >
          Apply →
        </a>
      )}

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
}: {
  applications: Application[]
  loading: boolean
  onSelectApp: (app: Application) => void
}) {
  const [archiveExpanded, setArchiveExpanded] = useState(false)

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
                borderLeft: `3px solid ${col.color}`,
                paddingLeft: '10px',
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
                  borderRadius: '8px',
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
                        borderRadius: '12px',
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
                    <KanbanCard key={app.id} app={app} onClick={() => onSelectApp(app)} />
                  ))
                }
              </div>
            )}

            {isArchive && !archiveExpanded && colApps.length > 0 && (
              <div
                style={{
                  border: '1px dashed #2E2C28',
                  borderRadius: '12px',
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
    <div style={{ borderRadius: '12px', border: '1px solid #2E2C28', overflowX: 'auto' }}>
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
                    <span style={{ backgroundColor: scoreColor(app.score), color: '#F5F0E8', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
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
                      Apply →
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

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({
  app,
  onClose,
  onUpdate,
  onDelete,
}: {
  app: Application | null
  onClose: () => void
  onUpdate: (id: string, fields: Partial<Application>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [events, setEvents] = useState<JhEvent[]>([])
  const [notesValue, setNotesValue] = useState('')
  const [statusValue, setStatusValue] = useState<ApplicationStatus>('cv_ready')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (!app) return
    setNotesValue(app.notes ?? '')
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
    await onUpdate(app.id, { status: newStatus })
    setSavingStatus(false)
  }

  const handleSaveNotes = async () => {
    if (!app) return
    setSavingNotes(true)
    await onUpdate(app.id, { notes: notesValue })
    setSavingNotes(false)
  }

  const handleMarkAsDone = async () => {
    if (!app) return
    await onUpdate(app.id, { status: 'applied', manual_action: null })
    setStatusValue('applied')
  }

  const handleMarkClosed = async () => {
    if (!app) return
    if (!confirm(`Mark "${app.company}" as Closed?`)) return
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
                  <span style={{ backgroundColor: scoreColor(app.score), color: '#F5F0E8', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    {app.score}/20
                  </span>
                )}
                {app.track && (
                  <span style={{ backgroundColor: '#2E2C28', color: '#9A9488', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
                    Track {app.track}
                  </span>
                )}
              </div>
              <h2 style={{ color: '#F5F0E8', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{app.company}</h2>
              <p style={{ color: '#9A9488', fontSize: '14px' }}>{app.role}</p>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Status {savingStatus && <span style={{ color: '#BA7517' }}>saving…</span>}
              </label>
              <select
                value={statusValue}
                onChange={e => handleStatusChange(e.target.value as ApplicationStatus)}
                style={{
                  backgroundColor: '#0E0C08',
                  border: '1px solid #2E2C28',
                  borderRadius: '8px',
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
                  borderRadius: '10px',
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
                    borderRadius: '8px',
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

            {/* Apply URL */}
            {app.apply_url && (
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
                    borderRadius: '10px',
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
                borderRadius: '10px',
                border: '1px solid #2E2C28',
              }}
            >
              {[
                { label: 'ATS', value: app.ats },
                { label: 'Applied', value: formatDate(app.applied_at) },
                { label: 'CV File', value: app.cv_file },
                { label: 'Track', value: app.track },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</p>
                  <p style={{ color: '#9A9488', fontSize: '12px', wordBreak: 'break-word' }}>{item.value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
              <p style={{ color: '#5C5A54', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
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
                        borderRadius: '8px',
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
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark as Closed
              </button>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: 'transparent',
                  color: '#5C5A54',
                  border: '1px solid #2E2C28',
                  borderRadius: '8px',
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
    borderRadius: '8px',
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
          borderRadius: '12px',
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
              <label style={labelStyle}>Score (/20)</label>
              <input type="number" min="1" max="20" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} style={inputStyle} placeholder="e.g. 18" />
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
            <button type="button" onClick={onClose} style={{ backgroundColor: '#2E2C28', color: '#9A9488', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
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
            <div key={i} style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px', padding: '16px' }}>
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
                borderRadius: '12px',
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
          borderRadius: '10px',
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function JobHuntingDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

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
  }, [fetchAll])

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

      <main style={{ minHeight: '100vh', backgroundColor: '#0E0C08', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ color: '#F5F0E8', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Job Hunt Dashboard</h1>
              <p style={{ color: '#5C5A54', fontSize: '13px' }}>Renato Kialka — Active Pipeline</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* View toggle */}
              <div style={{ display: 'flex', backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '8px', overflow: 'hidden' }}>
                {(['kanban', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
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
                style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '8px', color: '#9A9488', padding: '7px 12px', fontSize: '12px', cursor: 'pointer' }}
              >
                ↻ Refresh
              </button>
              {/* Add */}
              <button
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: '#E84A1C', border: 'none', borderRadius: '8px', color: '#F5F0E8', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add
              </button>
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
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <p style={{ color: '#5C5A54', fontSize: '11px', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: '26px', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Board */}
          {view === 'kanban' ? (
            <KanbanBoard applications={applications} loading={loading} onSelectApp={setSelectedApp} />
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
      />

      {/* Add Modal */}
      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </>
  )
}
