import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JobHuntingDashboard from './dashboard'

export default async function JobHuntingPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('jh_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!session || session.value !== adminPassword) {
    redirect('/jobhunting/login')
  }

  return <JobHuntingDashboard />
}
