import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSmtpTransport } from '@/lib/smtp'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { to, subject, text, inReplyTo, references, cc } = body as {
    to: string
    subject: string
    text: string
    inReplyTo?: string
    references?: string
    cc?: string
  }

  if (!to || !subject || !text) {
    return NextResponse.json({ error: 'Missing required fields: to, subject, text' }, { status: 400 })
  }

  const transport = createSmtpTransport()
  const from = process.env.EMAIL_USER ?? 'renato@kialka.com.br'

  try {
    await transport.sendMail({
      from: `Renato Kialka <${from}>`,
      to,
      cc: cc || undefined,
      subject,
      text,
      ...(inReplyTo ? { inReplyTo } : {}),
      ...(references ? { references } : {}),
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SMTP error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
