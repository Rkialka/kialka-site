import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createImapClient } from '@/lib/imap'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') ?? 'INBOX'

  const client = createImapClient()

  try {
    await client.connect()
    const lock = await client.getMailboxLock(folder)

    try {
      const mailbox = client.mailbox as { exists?: number } | undefined
      const total = mailbox?.exists ?? 0

      if (total === 0) {
        return NextResponse.json({ messages: [], total: 0 })
      }

      const start = Math.max(1, total - 99)
      const messages: object[] = []

      for await (const msg of client.fetch(`${start}:*`, {
        envelope: true,
        flags: true,
        uid: true,
      })) {
        const envelope = msg.envelope as {
          subject?: string
          from?: { name?: string; address?: string }[]
          to?: { name?: string; address?: string }[]
          date?: Date
          messageId?: string
        }
        messages.push({
          uid: msg.uid,
          seq: msg.seq,
          subject: envelope.subject ?? '(no subject)',
          from: envelope.from?.[0] ?? null,
          to: envelope.to?.[0] ?? null,
          date: envelope.date?.toISOString() ?? null,
          messageId: envelope.messageId ?? null,
          seen: (msg.flags as Set<string>).has('\\Seen'),
          flagged: (msg.flags as Set<string>).has('\\Flagged'),
          answered: (msg.flags as Set<string>).has('\\Answered'),
        })
      }

      messages.reverse()

      return NextResponse.json({ messages, total, folder })
    } finally {
      lock.release()
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'IMAP error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    try { await client.logout() } catch { /* ignore */ }
  }
}
