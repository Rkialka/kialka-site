import { ImapFlow } from 'imapflow'

export function createImapClient() {
  return new ImapFlow({
    host: process.env.EMAIL_IMAP_HOST ?? 'imap.hostinger.com',
    port: Number(process.env.EMAIL_IMAP_PORT ?? 993),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER ?? 'renato@kialka.com.br',
      pass: process.env.EMAIL_PASS!,
    },
    logger: false,
  })
}
