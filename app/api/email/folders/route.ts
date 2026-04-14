import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createImapClient } from '@/lib/imap'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = createImapClient()

  try {
    await client.connect()
    const list = await client.list()
    const folders = list
      .filter(f => !f.flags.has('\\Noselect'))
      .map(f => ({ name: f.name, path: f.path, delimiter: f.delimiter }))
    return NextResponse.json({ folders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'IMAP error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    try { await client.logout() } catch { /* ignore */ }
  }
}
