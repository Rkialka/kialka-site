'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteType = 'interview_prep' | 'interview_note' | 'session_note' | 'obsidian_sync' | 'manual'

type ContextNote = {
  id: string
  created_at: string
  title: string
  type: NoteType
  note_date: string | null
  content: string
  source: string | null
  tags: string[] | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<NoteType, string> = {
  interview_prep: '#E84A1C',
  interview_note: '#185FA5',
  session_note:   '#3B6D11',
  obsidian_sync:  '#BA7517',
  manual:         '#5C5A54',
}

const TYPE_LABELS: Record<NoteType, string> = {
  interview_prep: 'Interview Prep',
  interview_note: 'Interview Note',
  session_note:   'Session Note',
  obsidian_sync:  'Obsidian Sync',
  manual:         'Manual',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: NoteType }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: TYPE_COLORS[type],
        border: `1px solid ${TYPE_COLORS[type]}`,
        borderRadius: '3px',
        padding: '2px 6px',
        lineHeight: 1.4,
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}

function SourceBadge({ source }: { source: string | null }) {
  if (!source) return null
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: '#9A9488',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '2px 6px',
        lineHeight: 1.4,
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {source}
    </span>
  )
}

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
        marginBottom: '12px',
      }}
    >
      {children}
    </div>
  )
}

// ─── Add Note Form ────────────────────────────────────────────────────────────

type AddNoteFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

function AddNoteForm({ onSuccess, onCancel }: AddNoteFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<NoteType>('manual')
  const [date, setDate] = useState(todayISO())
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#0E0C08',
    border: '1px solid #2E2C28',
    borderRadius: '3px',
    color: '#F5F0E8',
    fontFamily: 'Manrope, sans-serif',
    fontSize: '13px',
    padding: '8px 10px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#5C5A54',
    fontWeight: 700,
    marginBottom: '6px',
    fontFamily: 'Manrope, sans-serif',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean)
      const res = await fetch('/api/jobhunting/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer renato360',
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          note_date: date || null,
          content: content.trim(),
          tags: tagsArr.length ? tagsArr : null,
          source: 'manual',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string })?.error || `HTTP ${res.status}`)
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#1A1916',
        border: '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      <SectionLabel>Add Note</SectionLabel>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle}>Type</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={type}
            onChange={e => setType(e.target.value as NoteType)}
          >
            <option value="manual">Manual</option>
            <option value="interview_note">Interview Note</option>
            <option value="session_note">Session Note</option>
            <option value="obsidian_sync">Obsidian Sync</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Content</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '160px' }}
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Note content..."
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input
          style={inputStyle}
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g. prep, fintech, behavioral"
        />
      </div>

      {error && (
        <div style={{ color: '#E84A1C', fontSize: '12px', marginBottom: '12px', fontFamily: 'Manrope, sans-serif' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #2E2C28',
            borderRadius: '3px',
            color: '#9A9488',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 16px',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            backgroundColor: saving ? '#2E2C28' : '#E84A1C',
            border: 'none',
            borderRadius: '3px',
            color: saving ? '#5C5A54' : '#F5F0E8',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 20px',
            cursor: saving ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  )
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({ note, selected, onClick }: { note: ContextNote; selected: boolean; onClick: () => void }) {
  const preview = note.content.slice(0, 100) + (note.content.length > 100 ? '…' : '')

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: selected ? '#222018' : '#1A1916',
        border: '1px solid #2E2C28',
        borderLeft: selected ? '3px solid #E84A1C' : '1px solid #2E2C28',
        borderRadius: '3px',
        padding: '14px',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'border-color 0.1s',
      }}
      onMouseEnter={e => {
        if (!selected) {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#5C5A54'
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#2E2C28'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <TypeBadge type={note.type} />
        {note.source && <SourceBadge source={note.source} />}
      </div>
      <div style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '13px', marginBottom: '4px', fontFamily: 'Manrope, sans-serif' }}>
        {note.title}
      </div>
      <div style={{ color: '#5C5A54', fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '6px' }}>
        {formatDate(note.note_date || note.created_at)}
      </div>
      <div style={{ color: '#9A9488', fontSize: '12px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.5 }}>
        {preview}
      </div>
    </div>
  )
}

// ─── Note Detail Panel ────────────────────────────────────────────────────────

function NoteDetail({ note }: { note: ContextNote }) {
  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      <h2
        style={{
          color: '#F5F0E8',
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '12px',
          lineHeight: 1.3,
          marginTop: 0,
        }}
      >
        {note.title}
      </h2>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: '#5C5A54', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
          {formatDate(note.note_date || note.created_at)}
        </span>
        <TypeBadge type={note.type} />
        {note.source && <SourceBadge source={note.source} />}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {note.tags.map(tag => (
            <span
              key={tag}
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
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid #2E2C28', paddingTop: '20px' }}>
        <pre
          style={{
            color: '#F5F0E8',
            fontSize: '13px',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          {note.content}
        </pre>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContextView() {
  const [notes, setNotes] = useState<ContextNote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<ContextNote | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobhunting/context', {
        headers: { Authorization: 'Bearer renato360' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : (data as { notes?: ContextNote[] }).notes ?? [])
    } catch {
      // silently keep empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  function handleAddSuccess() {
    setShowForm(false)
    fetchNotes()
  }

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
          Context &amp; Notes
        </span>
        <div style={{ width: '80px' }} />
      </nav>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid #2E2C28', padding: '32px 32px 24px' }}>
        <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontWeight: 700, marginBottom: '6px', marginTop: 0 }}>
          Context &amp; Notes
        </h1>
        <p style={{ color: '#9A9488', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
          Notas de entrevistas, sessões e transcrições do Obsidian
        </p>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT — notes list + form */}
        <div>
          {/* List header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#5C5A54',
                fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {loading ? 'Loading...' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              style={{
                backgroundColor: showForm ? '#2E2C28' : '#E84A1C',
                border: 'none',
                borderRadius: '3px',
                color: '#F5F0E8',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={showForm ? 'Cancel' : 'Add note'}
            >
              {showForm ? '×' : '+'}
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <AddNoteForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Notes list */}
          {loading ? (
            <div style={{ color: '#5C5A54', fontSize: '13px', padding: '20px 0', fontFamily: 'Manrope, sans-serif' }}>
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div
              style={{
                backgroundColor: '#1A1916',
                border: '1px solid #2E2C28',
                borderRadius: '3px',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#5C5A54', fontSize: '13px', lineHeight: 1.6, fontFamily: 'Manrope, sans-serif' }}>
                Nenhuma nota ainda.
                <br />
                Adicione manualmente ou sincronize via Cowork.
              </div>
            </div>
          ) : (
            notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                selected={selectedNote?.id === note.id}
                onClick={() => setSelectedNote(note)}
              />
            ))
          )}
        </div>

        {/* RIGHT — note detail */}
        <div
          style={{
            position: 'sticky',
            top: '73px',
            backgroundColor: '#1A1916',
            border: '1px solid #2E2C28',
            borderRadius: '3px',
            padding: '24px',
            minHeight: '300px',
          }}
        >
          {selectedNote ? (
            <NoteDetail note={selectedNote} />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '220px',
                color: '#5C5A54',
                fontSize: '13px',
                textAlign: 'center',
                lineHeight: 1.6,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Select a note to read
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
