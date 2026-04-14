'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailAddress = { name?: string; address?: string }

type EmailMessage = {
  uid: number
  seq: number
  subject: string
  from: EmailAddress | null
  to: EmailAddress | null
  date: string | null
  messageId: string | null
  seen: boolean
  flagged: boolean
  answered: boolean
}

type EmailDetail = {
  uid: number
  subject: string
  from: EmailAddress[]
  to: EmailAddress[]
  cc: EmailAddress[]
  date: string | null
  messageId: string | null
  html: string | null
  text: string | null
  attachments: { filename: string; contentType: string; size: number }[]
}

type ComposeMode = 'new' | 'reply' | 'reply-all' | 'forward'

type ComposeState = {
  mode: ComposeMode
  to: string
  cc: string
  subject: string
  body: string
  inReplyTo?: string
  references?: string
}

// ─── Job-related filter ───────────────────────────────────────────────────────

const JOB_SUBJECT_KEYWORDS = [
  'interview', 'entrevista', 'candidatura', 'application',
  'hired', 'offer', 'oferta', 'rejected', 'recusado', 'reprovado',
  'recruiter', 'recrutament', 'vaga', 'oportunidade',
  'talent', 'talento', 'assessment', 'screening', 'onboarding',
  'congratulations', 'next steps', 'próximos passos',
  'your application', 'sua candidatura', 'we reviewed',
  'thank you for applying', 'obrigado pela candidatura',
  'position', 'opportunity', 'career', 'carreira',
  'workable', 'lever', 'greenhouse', 'workday', 'crossover',
  'linkedin job', 'indeed', 'glassdoor',
  'sales director', 'head of sales', 'country manager',
  'vp sales', 'diretor', 'processo seletivo',
]

const JOB_SENDER_PATTERNS = [
  'hr@', 'careers@', 'talent@', 'jobs@', 'recruiting@', 'recrutamento@',
  'apply@', 'applications@', 'selecao@', 'seleção@',
  'linkedin', 'indeed', 'glassdoor', 'workable', 'lever',
  'greenhouse', 'recruit', 'jobvite', 'smartrecruiters',
  'bamboohr', 'workday', 'taleo', 'icims', 'successfactors',
]

// Known company domains from the active pipeline
const PIPELINE_DOMAINS = [
  'hellotext.com', 'cobli.com.br', 'luxoft.com', 'designity.com',
  'meta.com', 'mastercard.com', 'zebra.com', 'google.com', 'amazon.com',
  'toptal.com', 'mirakl.com', 'toku.com', 'sensortower.com',
  'yuno.com', 'wellhub.com', 'gympass.com', 'aleph.com', 'ebanx.com',
  'degreed.com', 'salesforce.com', 'crypto.com', 'vimeo.com',
  'activecampaign.com', 'useinsider.com', 'cabify.com',
  'bytedance.com', 'wati.io', 'ignitetech.com', 'crossover.com',
  'thomsonreuters.com', 'gracemark.com', 'rategain.com', 'revenue3.co',
]

function isJobRelated(msg: EmailMessage): boolean {
  const subject = (msg.subject ?? '').toLowerCase()
  const fromAddr = (msg.from?.address ?? '').toLowerCase()
  const fromName = (msg.from?.name ?? '').toLowerCase()

  if (JOB_SUBJECT_KEYWORDS.some(k => subject.includes(k))) return true
  if (JOB_SENDER_PATTERNS.some(p => fromAddr.includes(p))) return true
  if (PIPELINE_DOMAINS.some(d => fromAddr.endsWith('@' + d) || fromAddr.includes('.' + d))) return true
  if (fromName.includes('recruit') || fromName.includes('talent') || fromName.includes('hr ')) return true
  return false
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays < 7) {
    return d.toLocaleDateString('pt-BR', { weekday: 'short' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDateFull(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function displayName(addr: EmailAddress | null | undefined): string {
  if (!addr) return 'Unknown'
  return addr.name || addr.address || 'Unknown'
}

function addressStr(addr: EmailAddress): string {
  if (addr.name) return `${addr.name} <${addr.address ?? ''}>`
  return addr.address ?? ''
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function quoteEmail(detail: EmailDetail): string {
  const date = formatDateFull(detail.date)
  const from = detail.from[0] ? addressStr(detail.from[0]) : ''
  const divider = `\n\n---\nEm ${date}, ${from} escreveu:\n`
  const body = detail.text ?? ''
  return divider + body.split('\n').map(l => '> ' + l).join('\n')
}

// ─── FOLDER SIDEBAR ───────────────────────────────────────────────────────────

const MAIN_FOLDERS = [
  { key: 'INBOX', label: 'Inbox', icon: '📥' },
  { key: 'Sent',  label: 'Sent',  icon: '📤' },
  { key: 'Archive', label: 'Archive', icon: '📦' },
  { key: 'Trash',   label: 'Trash',   icon: '🗑' },
  { key: 'Junk',    label: 'Spam',    icon: '⚠️' },
]

// ─── Compose Modal ────────────────────────────────────────────────────────────

function ComposeModal({
  state,
  onChange,
  onSend,
  onClose,
  sending,
}: {
  state: ComposeState
  onChange: (s: ComposeState) => void
  onSend: () => void
  onClose: () => void
  sending: boolean
}) {
  const title = { new: 'New Email', reply: 'Reply', 'reply-all': 'Reply All', forward: 'Forward' }[state.mode]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full md:max-w-2xl flex flex-col"
        style={{
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
          borderRadius: '12px 12px 0 0',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid #2E2C28' }}
        >
          <span className="font-medium" style={{ color: '#F5F0E8' }}>{title}</span>
          <button onClick={onClose} style={{ color: '#9A9488', fontSize: 20 }}>×</button>
        </div>

        {/* Fields */}
        <div className="flex flex-col flex-1 overflow-auto">
          {['To', 'Cc', 'Subject'].map(field => (
            <div
              key={field}
              className="flex items-center px-4 py-2"
              style={{ borderBottom: '1px solid #2E2C28' }}
            >
              <span className="text-xs w-12 shrink-0" style={{ color: '#5C5A54' }}>{field}</span>
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#F5F0E8' }}
                value={field === 'To' ? state.to : field === 'Cc' ? state.cc : state.subject}
                onChange={e => onChange({
                  ...state,
                  [field === 'To' ? 'to' : field === 'Cc' ? 'cc' : 'subject']: e.target.value
                })}
                placeholder={field === 'Cc' ? 'optional' : ''}
              />
            </div>
          ))}

          <textarea
            className="flex-1 p-4 bg-transparent text-sm outline-none resize-none"
            style={{ color: '#F5F0E8', minHeight: 200 }}
            value={state.body}
            onChange={e => onChange({ ...state, body: e.target.value })}
            placeholder="Write your message…"
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid #2E2C28' }}
        >
          <span className="text-xs" style={{ color: '#5C5A54' }}>renato@kialka.com.br</span>
          <button
            onClick={onSend}
            disabled={sending || !state.to || !state.subject}
            className="px-4 py-2 text-sm font-medium rounded-[8px] transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: '#E84A1C', color: '#F5F0E8' }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Email List Item ──────────────────────────────────────────────────────────

function EmailItem({
  msg,
  selected,
  onClick,
  folder,
}: {
  msg: EmailMessage
  selected: boolean
  onClick: () => void
  folder: string
}) {
  const showFrom = folder !== 'Sent'
  const nameLabel = showFrom ? displayName(msg.from) : displayName(msg.to)

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 transition-colors"
      style={{
        backgroundColor: selected ? '#2E2C28' : 'transparent',
        borderBottom: '1px solid #1E1C18',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {!msg.seen && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E84A1C' }} />
          )}
          {msg.flagged && <span className="shrink-0 text-xs">🔖</span>}
          {msg.answered && <span className="shrink-0 text-xs" style={{ color: '#5C5A54' }}>↩</span>}
          <span
            className="text-sm truncate"
            style={{
              color: msg.seen ? '#9A9488' : '#F5F0E8',
              fontWeight: msg.seen ? 400 : 600,
            }}
          >
            {nameLabel}
          </span>
        </div>
        <span className="text-xs shrink-0" style={{ color: '#5C5A54' }}>
          {formatDate(msg.date)}
        </span>
      </div>
      <p className="text-xs mt-0.5 truncate pl-3" style={{ color: '#5C5A54' }}>
        {msg.subject}
      </p>
    </button>
  )
}

// ─── Detail Toolbar ───────────────────────────────────────────────────────────

function DetailToolbar({
  detail,
  folder,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onTrash,
  onToggleFlag,
  onToggleRead,
}: {
  detail: EmailDetail
  folder: string
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onArchive: () => void
  onTrash: () => void
  onToggleFlag: () => void
  onToggleRead: () => void
}) {
  const btnStyle = {
    backgroundColor: '#2E2C28',
    color: '#9A9488',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  }

  return (
    <div className="flex items-center gap-2 flex-wrap px-5 py-2 shrink-0" style={{ borderBottom: '1px solid #2E2C28' }}>
      <button style={btnStyle} onClick={onReply}>↩ Reply</button>
      <button style={btnStyle} onClick={onReplyAll}>↩ Reply All</button>
      <button style={btnStyle} onClick={onForward}>→ Forward</button>
      <span style={{ color: '#2E2C28', margin: '0 4px' }}>|</span>
      {folder !== 'Archive' && (
        <button style={btnStyle} onClick={onArchive}>📦 Archive</button>
      )}
      <button style={{ ...btnStyle, color: '#E84A1C' }} onClick={onTrash}>🗑 Delete</button>
      <span style={{ color: '#2E2C28', margin: '0 4px' }}>|</span>
      <button style={btnStyle} onClick={onToggleFlag}>🔖 Flag</button>
      <button style={btnStyle} onClick={onToggleRead}>◉ Mark unread</button>
    </div>
  )
}

// ─── Email Detail Panel ───────────────────────────────────────────────────────

function EmailDetailPanel({
  detail,
  loading,
  folder,
  onClose,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onTrash,
  onToggleFlag,
  onToggleRead,
}: {
  detail: EmailDetail | null
  loading: boolean
  folder: string
  onClose?: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onArchive: () => void
  onTrash: () => void
  onToggleFlag: () => void
  onToggleRead: () => void
}) {
  const [showHtml, setShowHtml] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setShowHtml(true)
  }, [detail?.uid])

  // Auto-resize iframe
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !showHtml) return
    const handler = () => {
      try {
        const h = iframe.contentDocument?.documentElement.scrollHeight
        if (h) iframe.style.height = h + 'px'
      } catch { /* ignore cross-origin */ }
    }
    iframe.addEventListener('load', handler)
    return () => iframe.removeEventListener('load', handler)
  }, [showHtml, detail?.uid])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#5C5A54', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-2" style={{ color: '#5C5A54', fontSize: 14 }}>
        <span style={{ fontSize: 32 }}>✉️</span>
        <span>Select an email to read</span>
      </div>
    )
  }

  const htmlDoc = detail.html
    ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;line-height:1.6;color:#333;background:#fff;word-wrap:break-word}img{max-width:100%}a{color:#0066cc}</style></head><body>${detail.html}</body></html>`
    : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Back button on mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-5 py-2 text-xs shrink-0"
          style={{ color: '#9A9488', borderBottom: '1px solid #2E2C28' }}
        >
          ← Back to list
        </button>
      )}

      {/* Toolbar */}
      <DetailToolbar
        detail={detail}
        folder={folder}
        onReply={onReply}
        onReplyAll={onReplyAll}
        onForward={onForward}
        onArchive={onArchive}
        onTrash={onTrash}
        onToggleFlag={onToggleFlag}
        onToggleRead={onToggleRead}
      />

      {/* Headers */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #2E2C28' }}>
        <h2 className="text-base font-semibold mb-3 leading-snug" style={{ color: '#F5F0E8' }}>
          {detail.subject}
        </h2>
        <div className="flex flex-col gap-1 text-xs" style={{ color: '#9A9488' }}>
          <div className="flex gap-2">
            <span style={{ color: '#5C5A54', minWidth: 32 }}>From</span>
            <span style={{ color: '#F5F0E8' }}>
              {detail.from[0] ? addressStr(detail.from[0]) : '—'}
            </span>
          </div>
          {detail.to.length > 0 && (
            <div className="flex gap-2">
              <span style={{ color: '#5C5A54', minWidth: 32 }}>To</span>
              <span>{detail.to.map(a => a.address).join(', ')}</span>
            </div>
          )}
          {detail.cc.length > 0 && (
            <div className="flex gap-2">
              <span style={{ color: '#5C5A54', minWidth: 32 }}>Cc</span>
              <span>{detail.cc.map(a => a.address).join(', ')}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span style={{ color: '#5C5A54', minWidth: 32 }}>Date</span>
            <span>{formatDateFull(detail.date)}</span>
          </div>
        </div>

        {/* Attachments */}
        {detail.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {detail.attachments.map((att, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-[6px]"
                style={{ backgroundColor: '#2E2C28', color: '#9A9488' }}
              >
                📎 {att.filename} ({formatBytes(att.size)})
              </span>
            ))}
          </div>
        )}

        {/* HTML / Text toggle */}
        {detail.html && detail.text && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowHtml(true)}
              className="text-xs px-2 py-1 rounded-[6px] transition-colors"
              style={{ backgroundColor: showHtml ? '#E84A1C' : '#2E2C28', color: showHtml ? '#F5F0E8' : '#9A9488' }}
            >
              HTML
            </button>
            <button
              onClick={() => setShowHtml(false)}
              className="text-xs px-2 py-1 rounded-[6px] transition-colors"
              style={{ backgroundColor: !showHtml ? '#E84A1C' : '#2E2C28', color: !showHtml ? '#F5F0E8' : '#9A9488' }}
            >
              Plain text
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: showHtml && htmlDoc ? '#fff' : '#0E0C08' }}>
        {showHtml && htmlDoc ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlDoc}
            sandbox="allow-same-origin"
            title="Email content"
            className="w-full"
            style={{ border: 'none', display: 'block', minHeight: 400 }}
          />
        ) : (
          <pre
            className="p-5 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#9A9488', fontFamily: 'inherit' }}
          >
            {detail.text ?? '(empty)'}
          </pre>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function EmailDashboard() {
  const [folder, setFolder] = useState('INBOX')
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [detail, setDetail] = useState<EmailDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  const [filterJob, setFilterJob] = useState(false)
  const [search, setSearch] = useState('')
  const [compose, setCompose] = useState<ComposeState | null>(null)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchMessages = useCallback(async (f = folder) => {
    setLoading(true)
    setError('')
    setSelectedUid(null)
    setDetail(null)
    try {
      const res = await fetch(`/api/email/messages?folder=${encodeURIComponent(f)}`)
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setMessages(data.messages ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to connect to inbox')
    } finally {
      setLoading(false)
    }
  }, [folder])

  useEffect(() => { fetchMessages(folder) }, [folder]) // eslint-disable-line

  // Filter messages
  const visibleMessages = messages.filter(m => {
    if (search) {
      const q = search.toLowerCase()
      if (!(m.subject.toLowerCase().includes(q) || displayName(m.from).toLowerCase().includes(q))) return false
    }
    if (filterJob && folder === 'INBOX') return isJobRelated(m)
    return true
  })

  const unreadCount = messages.filter(m => !m.seen && (filterJob && folder === 'INBOX' ? isJobRelated(m) : true)).length

  const openEmail = useCallback(async (uid: number) => {
    setSelectedUid(uid)
    setMobileView('detail')
    setDetailLoading(true)
    setDetail(null)
    try {
      const res = await fetch(`/api/email/message/${uid}`)
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setDetail(data)
      setMessages(prev => prev.map(m => m.uid === uid ? { ...m, seen: true } : m))
    } catch {
      setError('Failed to load email')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Actions
  const doMove = async (uid: number, dest: string) => {
    await fetch(`/api/email/message/${uid}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: dest, sourceFolder: folder }),
    })
    setMessages(prev => prev.filter(m => m.uid !== uid))
    setDetail(null)
    setSelectedUid(null)
    showToast(`Moved to ${dest}`)
  }

  const doFlag = async (uid: number, flagged: boolean) => {
    await fetch(`/api/email/message/${uid}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagged, folder }),
    })
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, flagged } : m))
  }

  const doMarkRead = async (uid: number, seen: boolean) => {
    await fetch(`/api/email/message/${uid}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seen, folder }),
    })
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, seen } : m))
  }

  const openCompose = (mode: ComposeMode) => {
    if (!detail && mode !== 'new') return
    if (mode === 'new') {
      setCompose({ mode: 'new', to: '', cc: '', subject: '', body: '' })
    } else if (mode === 'reply' && detail) {
      const replyTo = detail.from[0]?.address ?? ''
      setCompose({
        mode: 'reply',
        to: replyTo,
        cc: '',
        subject: `Re: ${detail.subject.replace(/^Re:\s*/i, '')}`,
        body: quoteEmail(detail),
        inReplyTo: detail.messageId ?? undefined,
        references: detail.messageId ?? undefined,
      })
    } else if (mode === 'reply-all' && detail) {
      const to = [
        detail.from[0]?.address,
        ...detail.to.map(a => a.address).filter(a => a !== 'renato@kialka.com.br'),
      ].filter(Boolean).join(', ')
      const cc = detail.cc.map(a => a.address).join(', ')
      setCompose({
        mode: 'reply-all',
        to,
        cc,
        subject: `Re: ${detail.subject.replace(/^Re:\s*/i, '')}`,
        body: quoteEmail(detail),
        inReplyTo: detail.messageId ?? undefined,
        references: detail.messageId ?? undefined,
      })
    } else if (mode === 'forward' && detail) {
      setCompose({
        mode: 'forward',
        to: '',
        cc: '',
        subject: `Fwd: ${detail.subject.replace(/^Fwd:\s*/i, '')}`,
        body: quoteEmail(detail),
      })
    }
  }

  const sendEmail = async () => {
    if (!compose) return
    setSending(true)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: compose.to,
          cc: compose.cc || undefined,
          subject: compose.subject,
          text: compose.body,
          inReplyTo: compose.inReplyTo,
          references: compose.references,
        }),
      })
      const data = await res.json()
      if (data.error) { showToast('Error: ' + data.error); return }
      setCompose(null)
      showToast('Email sent!')
      // Mark original as answered
      if (detail && (compose.mode === 'reply' || compose.mode === 'reply-all')) {
        setMessages(prev => prev.map(m => m.uid === detail.uid ? { ...m, answered: true } : m))
      }
    } catch {
      showToast('Send failed')
    } finally {
      setSending(false)
    }
  }

  const changeFolder = (f: string) => {
    setFolder(f)
    setSidebarOpen(false)
    setFilterJob(f === 'INBOX')
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0E0C08', color: '#F5F0E8' }}>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 flex flex-col shrink-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: 180, height: '100vh', backgroundColor: '#0E0C08', borderRight: '1px solid #2E2C28' }}
      >
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => { setCompose({ mode: 'new', to: '', cc: '', subject: '', body: '' }) }}
            className="w-full text-sm font-medium py-2 rounded-[8px] transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#E84A1C', color: '#F5F0E8' }}
          >
            ✏ Compose
          </button>
        </div>

        <nav className="flex-1 px-2 pt-1">
          {MAIN_FOLDERS.map(f => (
            <button
              key={f.key}
              onClick={() => changeFolder(f.key)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-[8px] transition-colors"
              style={{
                backgroundColor: folder === f.key ? '#2E2C28' : 'transparent',
                color: folder === f.key ? '#F5F0E8' : '#9A9488',
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {f.key === 'INBOX' && unreadCount > 0 && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#E84A1C', color: '#F5F0E8' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 text-xs" style={{ color: '#5C5A54', borderTop: '1px solid #2E2C28' }}>
          renato@kialka.com.br
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{ borderBottom: '1px solid #2E2C28', backgroundColor: '#1A1916' }}
        >
          {/* Mobile: sidebar toggle */}
          <button
            className="md:hidden text-lg px-1"
            style={{ color: '#9A9488' }}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {/* Search */}
          <input
            className="flex-1 text-sm bg-transparent outline-none px-3 py-1.5 rounded-[8px]"
            style={{ backgroundColor: '#2E2C28', color: '#F5F0E8', maxWidth: 360 }}
            placeholder="Search emails…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Filter toggle (only Inbox) */}
          {folder === 'INBOX' && (
            <button
              onClick={() => setFilterJob(v => !v)}
              className="text-xs px-3 py-1.5 rounded-[8px] transition-colors"
              style={{
                backgroundColor: filterJob ? '#E84A1C' : '#2E2C28',
                color: filterJob ? '#F5F0E8' : '#9A9488',
                whiteSpace: 'nowrap',
              }}
            >
              {filterJob ? '🎯 Keywords only' : '📬 All emails'}
            </button>
          )}

          <button
            onClick={() => fetchMessages(folder)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-[8px] transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#2E2C28', color: '#9A9488', whiteSpace: 'nowrap' }}
          >
            {loading ? '…' : '↻'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 text-sm shrink-0" style={{ backgroundColor: 'rgba(232,74,28,0.1)', color: '#E84A1C' }}>
            {error}
          </div>
        )}

        {/* Content split */}
        <div className="flex flex-1 overflow-hidden">

          {/* Email list */}
          <div
            className={`flex flex-col overflow-hidden ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}`}
            style={{ width: '100%', maxWidth: 340, borderRight: '1px solid #2E2C28', flexShrink: 0 }}
          >
            <div className="px-3 py-1.5 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1C18' }}>
              <span className="text-xs" style={{ color: '#5C5A54' }}>
                {loading ? 'Loading…' : `${visibleMessages.length} emails${filterJob && folder === 'INBOX' ? ' (filtered)' : ''}`}
              </span>
            </div>

            <div className="overflow-y-auto flex-1">
              {!loading && visibleMessages.length === 0 && !error && (
                <div className="p-4 text-sm" style={{ color: '#5C5A54' }}>
                  {filterJob && folder === 'INBOX'
                    ? 'No job-related emails. Toggle the filter to see all.'
                    : 'No emails here.'}
                </div>
              )}
              {visibleMessages.map(msg => (
                <EmailItem
                  key={msg.uid}
                  msg={msg}
                  selected={msg.uid === selectedUid}
                  onClick={() => openEmail(msg.uid)}
                  folder={folder}
                />
              ))}
            </div>
          </div>

          {/* Detail pane */}
          <div
            className={`flex-1 overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-col`}
            style={{ backgroundColor: '#0E0C08' }}
          >
            <EmailDetailPanel
              detail={detail}
              loading={detailLoading}
              folder={folder}
              onClose={mobileView === 'detail' ? () => setMobileView('list') : undefined}
              onReply={() => openCompose('reply')}
              onReplyAll={() => openCompose('reply-all')}
              onForward={() => openCompose('forward')}
              onArchive={() => detail && doMove(detail.uid, 'Archive')}
              onTrash={() => detail && doMove(detail.uid, 'Trash')}
              onToggleFlag={() => detail && doFlag(detail.uid, !messages.find(m => m.uid === detail.uid)?.flagged)}
              onToggleRead={() => detail && doMarkRead(detail.uid, !messages.find(m => m.uid === detail.uid)?.seen)}
            />
          </div>
        </div>
      </div>

      {/* Compose modal */}
      {compose && (
        <ComposeModal
          state={compose}
          onChange={setCompose}
          onSend={sendEmail}
          onClose={() => setCompose(null)}
          sending={sending}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 text-sm rounded-[8px] z-50"
          style={{ backgroundColor: '#2E2C28', color: '#F5F0E8', border: '1px solid #3E3C38' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
