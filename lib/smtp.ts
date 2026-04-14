import nodemailer from 'nodemailer'

export function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST ?? 'smtp.hostinger.com',
    port: Number(process.env.EMAIL_SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER ?? 'renato@kialka.com.br',
      pass: process.env.EMAIL_PASS!,
    },
  })
}
