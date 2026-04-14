import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(req: NextRequest) {
  try {
    const supabase = getDb()
    const { searchParams } = new URL(req.url)
    const currentOnly = searchParams.get('current') === 'true'

    let query = supabase
      .from('jh_insights')
      .select('*')
      .order('generated_at', { ascending: false })

    if (currentOnly) {
      query = query.eq('is_current', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    const authHeader = req.headers.get('authorization')

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getDb()
    const body = await req.json()

    // Mark all existing insights as not current
    const { error: updateError } = await supabase
      .from('jh_insights')
      .update({ is_current: false })
      .neq('id', '00000000-0000-0000-0000-000000000000') // update all rows

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('jh_insights')
      .insert([{
        insight_type: body.insight_type ?? 'general',
        title: body.title ?? null,
        summary: body.summary ?? null,
        suggestions: body.suggestions ?? [],
        data_sources: body.data_sources ?? {},
        is_current: body.is_current ?? true,
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
