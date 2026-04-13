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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getDb()
    const { id } = await params
    const body = await req.json()

    // Fetch current record to detect status change
    const { data: current, error: fetchError } = await supabase
      .from('jh_applications')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 })
    }

    const updatePayload = { ...body, updated_at: new Date().toISOString() }

    const { data, error } = await supabase
      .from('jh_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status changed, insert event
    if (body.status && body.status !== current.status) {
      await supabase.from('jh_events').insert([{
        application_id: id,
        event_type: 'status_change',
        description: `Status changed from ${current.status} to ${body.status}`,
        old_status: current.status,
        new_status: body.status,
      }])
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getDb()
    const { id } = await params

    const { error } = await supabase
      .from('jh_applications')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
