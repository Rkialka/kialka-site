import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createImapClient } from '@/lib/imap'
import { simpleParser } from 'mailparser'
import type { Readable } from 'stream'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uid: uidStr } = await params
  const uid = parseInt(uidStr, 10)
  if (isNaN(uid)) {
    return NextResponse.json({ error: 'Invalid UID' }, { status: 400 })
  }

  const client = createImapClient()

  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')

    try {
      const download = await client.download(String(uid), undefined, { uid: true })

      if (!download) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 })
      }

      const parsed = await simpleParser(download.content as Readable)

      // Mark as seen
      try {
        await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true })
      } catch { /* non-fatal */ }

      const toAddresses = parsed.to
        ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]).flatMap(a => a.value)
        : []
      const ccAddresses = parsed.cc
        ? (Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc]).flatMap(a => a.value)
        : []

      return NextResponse.json({
        uid,
        subject: parsed.subject ?? '(no subject)',
        from: parsed.from?.value ?? [],
        to: toAddresses,
        cc: ccAddresses,
        date: parsed.date?.toISOString() ?? null,
        messageId: parsed.messageId ?? null,
        html: parsed.html || null,
        text: parsed.text || null,
        attachments: parsed.attachments.map(a => ({
          filename: a.filename ?? 'attachment',
          contentType: a.contentType,
          size: a.size,
        })),
      })
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
