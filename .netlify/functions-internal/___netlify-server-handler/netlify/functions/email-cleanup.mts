import type { Config } from '@netlify/functions'
import { ImapFlow } from 'imapflow'

export const config: Config = {
  schedule: '@hourly',
}

// ─── Patterns ─────────────────────────────────────────────────────────────────

// These subjects signal a genuine job/pipeline email — NEVER delete
const KEEP_SUBJECT = [
  'interview', 'entrevista', 'candidatura', 'application',
  'hired', 'offer', 'oferta', 'rejected', 'recusado', 'reprovado',
  'recruiter', 'recrutament', 'vaga', 'oportunidade',
  'talent', 'assessment', 'screening', 'onboarding',
  'next steps', 'próximos passos', 'your application',
  'processo seletivo', 'position', 'sales director', 'head of sales',
  'country manager', 'vp sales', 'diretor',
]

// These senders/domains — NEVER delete
const KEEP_SENDER = [
  'wise.com', 'wisebusiness.com', 'agentmail',
  'linkedin', 'indeed', 'glassdoor', 'workable', 'lever',
  'greenhouse', 'workday', 'crossover', 'bamboohr',
  'hellotext.com', 'cobli.com', 'luxoft.com', 'designity.com',
  'meta.com', 'mastercard.com', 'zebra.com', 'google.com', 'amazon.com',
  'toptal.com', 'mirakl.com', 'toku.com', 'sensortower.com',
  'yuno.com', 'wellhub.com', 'gympass.com', 'aleph.com', 'ebanx.com',
  'degreed.com', 'salesforce.com', 'crypto.com', 'vimeo.com',
  'activecampaign.com', 'useinsider.com', 'cabify.com',
  'bytedance.com', 'wati.io', 'ignitetech.com', 'thomsonreuters.com',
  'gracemark.com', 'revenue3.co',
]

// Subjects that signal promotional/transactional junk
const PROMO_SUBJECT = [
  'descubra', 'desconto', 'promoção', 'oferta especial', 'aproveite',
  'newsletter', 'novidades', 'exclusivo para você', 'frete grátis',
  'compre agora', 'últimas horas', 'só hoje',
  'sale', 'discount', '% off', 'free shipping', 'deal of the day',
  'unsubscribe', 'desinscrever', 'cancelar inscrição',
  'how was your experience', 'como foi a sua experiência',
  'rate your experience', 'avalie sua experiência',
  'diga olá', 'say hello', 'bem-vindo ao', 'welcome to',
  'novas formas de receber', 'formas de receber pagamento',
  'cashback', 'pontos', 'recompensa', 'reward',
]

// Sender patterns that indicate promo/marketing
const PROMO_SENDER = [
  'marketing@', 'newsletter@', 'promo@', 'news@',
  'noreply@meliuz', 'hello@meliuz', 'meliuz.com',
  'ofertas@', 'promocoes@', 'promoções@',
  'digest@', 'weekly@', 'updates@marketing',
]

function shouldDelete(subject: string, fromAddr: string): boolean {
  const subj = subject.toLowerCase()
  const from = fromAddr.toLowerCase()

  // 1. Hard keep — never delete these
  if (KEEP_SUBJECT.some(k => subj.includes(k))) return false
  if (KEEP_SENDER.some(k => from.includes(k))) return false

  // 2. Promo signals — delete
  if (PROMO_SUBJECT.some(k => subj.includes(k))) return true
  if (PROMO_SENDER.some(k => from.includes(k))) return true

  return false
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default async () => {
  const client = new ImapFlow({
    host: process.env.EMAIL_IMAP_HOST ?? 'imap.hostinger.com',
    port: Number(process.env.EMAIL_IMAP_PORT ?? 993),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER ?? 'renato@kialka.com.br',
      pass: process.env.EMAIL_PASS!,
    },
    logger: false,
  })

  try {
    await client.connect()

    // Discover trash folder
    const folderList = await client.list()
    const folderPaths = folderList.map(f => f.path)
    const trashFolder =
      ['Trash', 'INBOX.Trash', 'Deleted Items', 'Deleted Messages'].find(f => folderPaths.includes(f))
      ?? 'Trash'

    const lock = await client.getMailboxLock('INBOX')
    const toDelete: number[] = []

    try {
      const mailbox = client.mailbox as { exists?: number } | undefined
      const total = mailbox?.exists ?? 0

      if (total === 0) {
        console.log('[email-cleanup] Inbox empty, nothing to do.')
        return
      }

      const start = Math.max(1, total - 199)

      for await (const msg of client.fetch(`${start}:*`, {
        envelope: true,
        uid: true,
      })) {
        const envelope = msg.envelope as {
          subject?: string
          from?: { address?: string }[]
        }
        const subject = envelope.subject ?? ''
        const fromAddr = envelope.from?.[0]?.address ?? ''

        if (shouldDelete(subject, fromAddr)) {
          toDelete.push(msg.uid)
        }
      }

      if (toDelete.length > 0) {
        await client.messageMove(toDelete, trashFolder, { uid: true })
        console.log(`[email-cleanup] Moved ${toDelete.length} promo email(s) to ${trashFolder}.`)
      } else {
        console.log('[email-cleanup] Inbox clean, no promo emails found.')
      }
    } finally {
      lock.release()
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email-cleanup] Error:', msg)
  } finally {
    try { await client.logout() } catch { /* ignore */ }
  }
}
