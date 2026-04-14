'use client'

import { useEffect, useState } from 'react'

// ─── Style constants ───────────────────────────────────────────────────────
const C = {
  bg:      '#0E0C08',
  surface: '#1A1916',
  border:  '1px solid #2E2C28',
  text:    '#F5F0E8',
  muted:   '#9A9488',
  faint:   '#5C5A54',
  accent:  '#E84A1C',
  font:    'Manrope, sans-serif',
  radius:  '4px',
}

// ─── Types ─────────────────────────────────────────────────────────────────
type ByStatus = Record<string, number>
type WeekBucket = { week: string; count: number }
type ScoreBucket = { range: string; color: string; count: number }
type SessionLog = {
  session_date: string
  session_name: string
  applications_count: number
  summary: string
  source: string
}
type Totals = { total: number; active: number; pipeline: number; interviewing: number }
type AnalyticsData = {
  byStatus: ByStatus
  byWeek: WeekBucket[]
  scoreDistribution: ScoreBucket[]
  sessionLogs: SessionLog[]
  totals: Totals
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ w, h }: { w: string | number; h: string | number }) {
  return (
    <div style={{
      width: w,
      height: h,
      background: '#2E2C28',
      borderRadius: C.radius,
      opacity: 0.5,
    }} />
  )
}

// ─── Section Label ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: C.faint,
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface,
      border: C.border,
      borderRadius: C.radius,
      padding: '20px 24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.faint, marginTop: 8 }}>
        {label}
      </div>
    </Card>
  )
}

// ─── Horizontal bar chart (funnel + score) ─────────────────────────────────
type HBarRow = { label: string; count: number; color: string }

function HorizontalBarChart({ rows, maxWidth = 300 }: { rows: HBarRow[]; maxWidth?: number }) {
  const maxCount = Math.max(...rows.map(r => r.count), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(row => {
        const barWidth = Math.round((row.count / maxCount) * maxWidth)
        return (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32 }}>
            {/* Label */}
            <div style={{ width: 110, fontSize: 12, color: C.muted, textAlign: 'right', flexShrink: 0 }}>
              {row.label}
            </div>
            {/* Bar */}
            <div style={{ flex: 1, position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: barWidth,
                height: 20,
                background: row.color,
                borderRadius: C.radius,
                minWidth: row.count > 0 ? 4 : 0,
                transition: 'width 0.3s ease',
              }} />
            </div>
            {/* Count badge */}
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.text,
              background: '#2E2C28',
              borderRadius: '3px',
              padding: '2px 7px',
              flexShrink: 0,
              minWidth: 26,
              textAlign: 'center',
            }}>
              {row.count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Weekly bar chart (SVG) ─────────────────────────────────────────────────
function WeeklyBarChart({ data }: { data: WeekBucket[] }) {
  const svgW = 440
  const svgH = 200
  const padL = 32
  const padR = 12
  const padT = 24
  const padB = 40
  const chartW = svgW - padL - padR
  const chartH = svgH - padT - padB

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const barCount = data.length
  const totalBarW = chartW / barCount
  const barW = Math.max(totalBarW * 0.55, 8)

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {/* Y-axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const y = padT + chartH - frac * chartH
        const val = Math.round(frac * maxCount)
        return (
          <g key={frac}>
            <line
              x1={padL} y1={y} x2={padL + chartW} y2={y}
              stroke="#2E2C28" strokeWidth={1}
            />
            <text
              x={padL - 6} y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill={C.faint}
              fontFamily={C.font}
            >
              {val}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padL + i * totalBarW + (totalBarW - barW) / 2
        const barH = d.count === 0 ? 0 : Math.max((d.count / maxCount) * chartH, 2)
        const y = padT + chartH - barH
        return (
          <g key={d.week}>
            <rect
              x={x} y={y}
              width={barW} height={barH}
              fill={C.accent}
              rx={2}
            />
            {d.count > 0 && (
              <text
                x={x + barW / 2} y={y - 5}
                textAnchor="middle"
                fontSize={10}
                fill={C.muted}
                fontFamily={C.font}
              >
                {d.count}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={padT + chartH + 16}
              textAnchor="middle"
              fontSize={10}
              fill={C.faint}
              fontFamily={C.font}
            >
              {d.week}
            </text>
          </g>
        )
      })}

      {/* X axis baseline */}
      <line
        x1={padL} y1={padT + chartH}
        x2={padL + chartW} y2={padT + chartH}
        stroke="#2E2C28" strokeWidth={1}
      />
    </svg>
  )
}

// ─── Session log table ──────────────────────────────────────────────────────
function SessionLogTable({ logs }: { logs: SessionLog[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: C.font }}>
        <thead>
          <tr>
            {['Date', 'Session', 'Apps', 'Summary', 'Source'].map(h => (
              <th key={h} style={{
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: C.faint,
                padding: '0 12px 10px 0',
                borderBottom: C.border,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: C.faint, padding: '16px 0', textAlign: 'center' }}>
                No sessions logged yet.
              </td>
            </tr>
          )}
          {logs.map((log, i) => (
            <tr
              key={`${log.session_date}-${i}`}
              style={{ background: i % 2 === 0 ? C.bg : '#111009' }}
            >
              <td style={{ padding: '10px 12px 10px 0', color: C.muted, whiteSpace: 'nowrap' }}>
                {log.session_date}
              </td>
              <td style={{ padding: '10px 12px 10px 0', color: C.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {log.session_name}
              </td>
              <td style={{ padding: '10px 12px 10px 0', color: C.text, fontWeight: 700 }}>
                {log.applications_count}
              </td>
              <td style={{ padding: '10px 12px 10px 0', color: C.muted, maxWidth: 380 }}>
                {log.summary}
              </td>
              <td style={{ padding: '10px 0 10px 0' }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: '#2E2C28',
                  color: C.muted,
                  borderRadius: '3px',
                  padding: '2px 7px',
                  whiteSpace: 'nowrap',
                }}>
                  {log.source || 'cowork'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobhunting/analytics')
      .then(r => r.json())
      .then((json) => {
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const funnelRows: HBarRow[] = data ? [
    { label: 'To Apply',       count: data.byStatus['cv_ready']      ?? 0, color: '#185FA5' },
    { label: 'Action Needed',  count: data.byStatus['action_needed'] ?? 0, color: '#BA7517' },
    { label: 'Applied',        count: data.byStatus['applied']       ?? 0, color: '#3B6D11' },
    { label: 'Interviewing',   count: data.byStatus['interviewing']  ?? 0, color: '#E84A1C' },
    { label: 'Offer',          count: data.byStatus['offer']         ?? 0, color: '#3B6D11' },
    { label: 'Archive',        count: (data.byStatus['closed'] ?? 0) + (data.byStatus['skip'] ?? 0), color: '#5C5A54' },
  ] : []

  const scoreRows: HBarRow[] = data
    ? data.scoreDistribution.map(s => ({ label: s.range, count: s.count, color: s.color }))
    : []

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.font }}>
      {/* Sticky nav */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: C.bg,
        borderBottom: C.border,
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, height: 56 }}>
          <a
            href="/jobhunting"
            style={{ fontSize: 13, color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
          >
            ← Job Hunt
          </a>
          <div style={{ width: 1, height: 16, background: '#2E2C28' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Analytics</div>
          <div style={{ fontSize: 12, color: C.faint, marginLeft: 'auto' }}>{today}</div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* Error */}
        {error && (
          <div style={{
            background: '#2A0D09',
            border: '1px solid #5C1A0F',
            borderRadius: C.radius,
            padding: '14px 18px',
            color: '#F87060',
            fontSize: 13,
            marginBottom: 24,
          }}>
            Error loading analytics: {error}
          </div>
        )}

        {/* Section A — Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, minWidth: 140 }}>
                <Card>
                  <Skeleton w="60px" h="36px" />
                  <div style={{ marginTop: 8 }}><Skeleton w="100px" h="12px" /></div>
                </Card>
              </div>
            ))
          ) : data ? (
            <>
              <StatCard label="Total Applications" value={data.totals.total} />
              <StatCard label="Active Pipeline" value={data.totals.active} />
              <StatCard label="Applied / Interviewing" value={`${data.totals.pipeline} / ${data.totals.interviewing}`} />
              <StatCard label="Sessions Logged" value={data.sessionLogs.length} />
            </>
          ) : null}
        </div>

        {/* Sections B + C — two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>
          {/* Section B — Pipeline Funnel */}
          <Card>
            <SectionLabel>Pipeline Funnel</SectionLabel>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} w="100%" h="32px" />)}
              </div>
            ) : (
              <HorizontalBarChart rows={funnelRows} maxWidth={260} />
            )}
          </Card>

          {/* Section C — Applications over time */}
          <Card>
            <SectionLabel>Applications Over Time</SectionLabel>
            {loading ? (
              <Skeleton w="100%" h="200px" />
            ) : data ? (
              <WeeklyBarChart data={data.byWeek} />
            ) : null}
          </Card>
        </div>

        {/* Sections D + E — two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>
          {/* Section D — Score Distribution */}
          <Card>
            <SectionLabel>Score Distribution</SectionLabel>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} w="100%" h="32px" />)}
              </div>
            ) : (
              <HorizontalBarChart rows={scoreRows} maxWidth={260} />
            )}
          </Card>

          {/* Extra stat — by-status breakdown */}
          <Card>
            <SectionLabel>Status Breakdown</SectionLabel>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} w="100%" h="22px" />)}
              </div>
            ) : data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: C.muted, textTransform: 'capitalize' }}>
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#2E2C28',
                      color: C.text,
                      borderRadius: '3px',
                      padding: '2px 8px',
                    }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Section E — Session Log */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <SectionLabel>Cowork Sessions</SectionLabel>
            <span style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
              Synced automatically via POST /api/jobhunting/logs
            </span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} w="100%" h="40px" />)}
            </div>
          ) : data ? (
            <SessionLogTable logs={data.sessionLogs} />
          ) : null}
        </Card>
      </div>
    </div>
  )
}
