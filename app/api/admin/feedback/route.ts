import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!session || session.value !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getSupabase() as any)
      .from('feedback_360')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/admin/feedback error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
