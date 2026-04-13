import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['q1', 'q2', 'q3', 'q4']
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 })
      }
    }

    const insertData = {
      q1: String(body.q1).slice(0, 5000),
      q2: String(body.q2).slice(0, 5000),
      q3: String(body.q3).slice(0, 5000),
      q4: String(body.q4).slice(0, 5000),
      q5: body.q5 ? String(body.q5).slice(0, 5000) : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabase() as any).from('feedback_360').insert([insertData])
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/feedback error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
