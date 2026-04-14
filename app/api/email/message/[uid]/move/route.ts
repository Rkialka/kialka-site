import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createImapClient } from '@/lib/imap'

export const runtime = 'nodejs'
export const maxDuration = 30

// Common folder name variants across email providers
const FOLDER_ALIASES: Record<string, string[]> = {
  Archive: ['Archive', 'INBOX.Archive', 'Archives', 'Archived'],
  Trash:   ['Trash', 'INBOX.Trash', 'Deleted Items', 'Deleted Messages'],
  Spam:    ['Junk', 'Spam', 'INBOX.Spam', 'INBOX.Junk'],
  Sent:    ['Sent', 'Sent Items', 'Sent Messages', 'INBOX.Sent'],
}

export async function POST(
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

  const { folder: targetKey, sourceFolder = 'INBOX' } = await request.json() as {
    folder: string
    sourceFolder?: string
  }

  const client = createImapClient()

  try {
    await client.connect()

    // Discover available folders
    const folderList = await client.list()
    const folderPaths = folderList.map(f => f.path)

    // Resolve target folder path
    const aliases = FOLDER_ALIASES[targetKey] ?? [targetKey]
    const resolvedTarget = aliases.find(a => folderPaths.includes(a)) ?? targetKey

    const lock = await client.getMailboxLock(sourceFolder)
    try {
      await client.messageMove({ uid }, resolvedTarget, { uid: true })
    } finally {
      lock.release()
    }

    return NextResponse.json({ ok: true, movedTo: resolvedTarget })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'IMAP error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    try { await client.logout() } catch { /* ignore */ }
  }
}
