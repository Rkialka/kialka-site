import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const STATUS_ORDER: Record<string, number> = {
  action_needed: 0,
  cv_ready: 1,
  applied: 2,
  interviewing: 3,
  offer: 4,
  closed: 5,
  skip: 6,
}

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

export async function GET() {
  try {
    const supabase = getDb()
    const { data, error } = await supabase
      .from('jh_applications')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort: status order, then priority desc, then score desc nulls last
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = ((data ?? []) as any[]).sort((a, b) => {
      const aOrder = STATUS_ORDER[a.status] ?? 99
      const bOrder = STATUS_ORDER[b.status] ?? 99
      if (aOrder !== bOrder) return aOrder - bOrder
      if (a.priority !== b.priority) return a.priority ? -1 : 1
      const aScore = a.score ?? -1
      const bScore = b.score ?? -1
      return bScore - aScore
    })

    return NextResponse.json({ data: sorted })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getDb()
    const body = await req.json()

    const { data, error } = await supabase
      .from('jh_applications')
      .insert([{
        company: body.company,
        role: body.role,
        score: body.score ?? null,
        status: body.status ?? 'cv_ready',
        ats: body.ats ?? null,
        apply_url: body.apply_url ?? null,
        cv_file: body.cv_file ?? null,
        notes: body.notes ?? null,
        manual_action: body.manual_action ?? null,
        applied_at: body.applied_at ?? null,
        priority: body.priority ?? false,
        track: body.track ?? null,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
