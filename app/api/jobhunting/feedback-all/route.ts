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

export async function GET() {
  try {
    const supabase = getDb()

    const [feedback360Result, cvEvalsResult] = await Promise.all([
      supabase
        .from('feedback_360')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('cv_evaluations')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (feedback360Result.error) {
      return NextResponse.json({ error: feedback360Result.error.message }, { status: 500 })
    }
    if (cvEvalsResult.error) {
      return NextResponse.json({ error: cvEvalsResult.error.message }, { status: 500 })
    }

    return NextResponse.json({
      feedback360: feedback360Result.data ?? [],
      cvEvals: cvEvalsResult.data ?? [],
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
