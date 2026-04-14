import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(): ReturnType<typeof createClient<any>> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(supabaseUrl, supabaseServiceRoleKey)
}

type ApplicationRow = {
  id: string
  status: string
  score: number | null
  created_at: string
  applied_at: string | null
  ats: string | null
}

type LogRow = {
  session_date: string
  session_name: string
  applications_count: number
  summary: string
  source: string
}

function getWeekLabel(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const dow = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - dow)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  try {
    const supabase = getDb()

    const [appsResult, logsResult] = await Promise.all([
      supabase
        .from('jh_applications')
        .select('id, status, score, created_at, applied_at, ats'),
      supabase
        .from('jh_logs')
        .select('session_date, session_name, applications_count, summary, source')
        .order('session_date', { ascending: false }),
    ])

    if (appsResult.error) {
      return NextResponse.json({ error: appsResult.error.message }, { status: 500 })
    }
    if (logsResult.error) {
      return NextResponse.json({ error: logsResult.error.message }, { status: 500 })
    }

    const apps: ApplicationRow[] = appsResult.data ?? []
    const logs: LogRow[] = logsResult.data ?? []

    // --- byStatus ---
    const statusKeys = ['cv_ready', 'action_needed', 'applied', 'interviewing', 'offer', 'closed', 'skip']
    const byStatus: Record<string, number> = {}
    for (const key of statusKeys) byStatus[key] = 0
    for (const app of apps) {
      const s = app.status ?? 'unknown'
      if (s in byStatus) byStatus[s]++
      else byStatus[s] = (byStatus[s] ?? 0) + 1
    }

    // --- byWeek (last 8 weeks) ---
    const now = new Date()
    const weeks: { start: Date; label: string; count: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000))
      weeks.push({ start: weekStart, label: getWeekLabel(weekStart), count: 0 })
    }
    const oldestWeekStart = weeks[0].start

    for (const app of apps) {
      const createdAt = new Date(app.created_at)
      if (createdAt < oldestWeekStart) continue
      const appWeekStart = getWeekStart(createdAt)
      for (const week of weeks) {
        if (week.start.getTime() === appWeekStart.getTime()) {
          week.count++
          break
        }
      }
    }
    const byWeek = weeks.map(w => ({ week: w.label, count: w.count }))

    // --- scoreDistribution ---
    const scoreBuckets = [
      { range: '18-20', color: '#3B6D11', min: 18, max: 20, count: 0 },
      { range: '15-17', color: '#185FA5', min: 15, max: 17, count: 0 },
      { range: '12-14', color: '#BA7517', min: 12, max: 14, count: 0 },
      { range: '<12',   color: '#A32D2D', min: 0,  max: 11, count: 0 },
    ]
    for (const app of apps) {
      if (app.score === null || app.score === undefined) continue
      for (const bucket of scoreBuckets) {
        if (app.score >= bucket.min && app.score <= bucket.max) {
          bucket.count++
          break
        }
      }
    }
    const scoreDistribution = scoreBuckets.map(({ range, color, count }) => ({ range, color, count }))

    // --- totals ---
    const total = apps.length
    const active = (byStatus['cv_ready'] ?? 0) + (byStatus['action_needed'] ?? 0)
    const pipeline = (byStatus['applied'] ?? 0) + (byStatus['interviewing'] ?? 0) + (byStatus['offer'] ?? 0)
    const interviewing = byStatus['interviewing'] ?? 0

    // --- sessionLogs ---
    const sessionLogs = logs.map(l => ({
      session_date: l.session_date,
      session_name: l.session_name,
      applications_count: l.applications_count,
      summary: l.summary,
      source: l.source,
    }))

    // --- responseRate ---
    const respondedStatuses = new Set(['interviewing', 'offer', 'closed'])
    const skipStatuses = new Set(['skip', 'cv_ready'])
    const activeApps = apps.filter(a => !skipStatuses.has(a.status))
    const respondedCount = activeApps.filter(a => respondedStatuses.has(a.status)).length
    const responseRate = activeApps.length > 0
      ? Math.round((respondedCount / activeApps.length) * 1000) / 10
      : 0

    // --- avgDaysToApply ---
    const appsWithAppliedAt = apps.filter(a => a.applied_at !== null)
    let avgDaysToApply: number | null = null
    if (appsWithAppliedAt.length > 0) {
      const totalDays = appsWithAppliedAt.reduce((sum, a) => {
        const created = new Date(a.created_at).getTime()
        const applied = new Date(a.applied_at!).getTime()
        return sum + (applied - created) / (1000 * 60 * 60 * 24)
      }, 0)
      avgDaysToApply = Math.round((totalDays / appsWithAppliedAt.length) * 10) / 10
    }

    // --- bySource ---
    const sourceMap = new Map<string, { total: number; responses: number }>()
    for (const app of apps) {
      const key = app.ats ?? 'unknown'
      if (!sourceMap.has(key)) sourceMap.set(key, { total: 0, responses: 0 })
      const entry = sourceMap.get(key)!
      entry.total++
      if (respondedStatuses.has(app.status)) entry.responses++
    }
    const bySource = Array.from(sourceMap.entries()).map(([ats, { total, responses }]) => ({
      ats,
      total,
      responses,
      rate: total > 0 ? Math.round((responses / total) * 1000) / 10 : 0,
    }))

    // --- scoreCorrelation ---
    function scoreResponseRate(filtered: ApplicationRow[]): { count: number; responseRate: number } {
      const count = filtered.length
      const responses = filtered.filter(a => respondedStatuses.has(a.status)).length
      return {
        count,
        responseRate: count > 0 ? Math.round((responses / count) * 1000) / 10 : 0,
      }
    }
    const scoredApps = apps.filter(a => a.score !== null && a.score !== undefined)
    const scoreCorrelation = {
      highScore: scoreResponseRate(scoredApps.filter(a => (a.score as number) >= 18)),
      midScore: scoreResponseRate(scoredApps.filter(a => (a.score as number) >= 12 && (a.score as number) <= 17)),
      lowScore: scoreResponseRate(scoredApps.filter(a => (a.score as number) < 12)),
    }

    // --- activeWeeks ---
    const weekSet = new Set<string>()
    for (const app of apps) {
      const weekStart = getWeekStart(new Date(app.created_at))
      weekSet.add(weekStart.toISOString())
    }
    const activeWeeks = weekSet.size

    return NextResponse.json({
      byStatus,
      byWeek,
      scoreDistribution,
      sessionLogs,
      totals: { total, active, pipeline, interviewing },
      responseRate,
      avgDaysToApply,
      bySource,
      scoreCorrelation,
      activeWeeks,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
