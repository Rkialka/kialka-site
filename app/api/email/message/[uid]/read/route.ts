import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createImapClient } from '@/lib/imap'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uid: uidStr } = await params
  const uid = parseInt(uidStr, 10)
  if (isNaN(uid)) return NextResponse.json({ error: 'Invalid UID' }, { status: 400 })

  const { seen, folder = 'INBOX' } = await request.json() as { seen: boolean; folder?: string }
  const client = createImapClient()

  try {
    await client.connect()
    const lock = await client.getMailboxLock(folder)
    try {
      if (seen) {
        await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true })
      } else {
        await client.messageFlagsRemove({ uid }, ['\\Seen'], { uid: true })
      }
    } finally {
      lock.release()
    }
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'IMAP error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    try { await client.logout() } catch { /* ignore */ }
  }
}
