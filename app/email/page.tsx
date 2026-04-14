import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EmailDashboard from './dashboard'

export default async function EmailPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!session || session.value !== adminPassword) {
    redirect('/jobhunting/login')
  }

  return <EmailDashboard />
}
