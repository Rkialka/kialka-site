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

const STATED_LABELS: Record<string, string> = {
  c1: 'GTM from scratch',
  c2: 'Complex enterprise sales',
  c3: 'Revenue Ops & Forecasting',
  c4: 'Team building',
  c5: 'Outbound pipeline',
  c6: 'AI applied to sales',
}

const RESULTS_LABELS: Record<string, string> = {
  r1: 'First hire building entire market',
  r2: 'Enterprise closings (Magalu, Amazon)',
  r3: 'Accelerated revenue growth',
  r4: 'Leading senior AE teams',
  r5: 'B2B AI sales reference in Brazil',
}

const PROFILE_LABELS: Record<string, string> = {
  p1: 'Thrives in 0→1',
  p2: 'Better IC than large-org VP',
  p3: 'C-level communication',
  p4: 'Strategic over operational',
}

function computeStats(
  rows: Record<string, number>[],
  keys: string[],
  labels: Record<string, string>
) {
  return keys.map((key) => {
    const values = rows
      .map((r) => r[key])
      .filter((v) => typeof v === 'number' && !isNaN(v))
    if (values.length === 0) {
      return { key, label: labels[key], avg: null, min: null, max: null }
    }
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { key, label: labels[key], avg, min, max }
  })
}

export async function GET() {
  try {
    const supabase = getDb()
    const { data, error } = await supabase
      .from('jh_curriculo_feedback')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as Record<string, number>[]

    const stated = computeStats(rows, Object.keys(STATED_LABELS), STATED_LABELS)
    const results = computeStats(rows, Object.keys(RESULTS_LABELS), RESULTS_LABELS)
    const profile = computeStats(rows, Object.keys(PROFILE_LABELS), PROFILE_LABELS)

    const comments: string[] = rows
      .map((r) => r['comment'] as unknown as string)
      .filter((c) => typeof c === 'string' && c.trim().length > 0)

    return NextResponse.json({
      responseCount: rows.length,
      stated,
      results,
      profile,
      comments,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
