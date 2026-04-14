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
    const typeFilter = searchParams.get('type')

    let query = supabase
      .from('jh_context')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (typeFilter) {
      query = query.eq('type', typeFilter)
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

    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('jh_context')
      .insert([{
        title: body.title,
        content: body.content,
        type: body.type ?? 'manual',
        date: body.date ?? today,
        tags: body.tags ?? [],
        application_id: body.application_id ?? null,
        source: body.source ?? 'manual',
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
