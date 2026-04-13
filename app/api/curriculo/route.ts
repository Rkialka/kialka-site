import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const NUMERIC_FIELDS = ['c1','c2','c3','c4','c5','c6','r1','r2','r3','r4','r5','p1','p2','p3','p4']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    for (const field of NUMERIC_FIELDS) {
      const val = body[field]
      if (val === undefined || val === null) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
      const num = Number(val)
      if (isNaN(num) || num < 0 || num > 100) {
        return NextResponse.json({ error: `Invalid value for ${field}: must be 0–100` }, { status: 400 })
      }
    }

    const insertData: Record<string, unknown> = {}
    for (const field of NUMERIC_FIELDS) {
      insertData[field] = Number(body[field])
    }
    if (body.comment) {
      insertData['comment'] = String(body.comment).slice(0, 2000)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabase() as any).from('cv_evaluations').insert([insertData])
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/curriculo error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
