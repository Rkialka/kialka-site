'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/feedback/admin')
  }

  const isLoginPage = pathname === '/feedback/admin'

  if (isLoginPage) return <>{children}</>

  return (
    <div style={{ backgroundColor: '#0E0C08', minHeight: '100vh' }}>
      <nav
        className="px-6 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #2E2C28', backgroundColor: '#1A1916' }}
      >
        <div className="flex gap-2">
          <Link
            href="/feedback/admin/curriculo"
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: pathname === '/feedback/admin/curriculo' ? '#E84A1C' : 'transparent',
              color: pathname === '/feedback/admin/curriculo' ? '#F5F0E8' : '#9A9488',
            }}
          >
            Resume
          </Link>
          <Link
            href="/feedback/admin/feedback"
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: pathname === '/feedback/admin/feedback' ? '#E84A1C' : 'transparent',
              color: pathname === '/feedback/admin/feedback' ? '#F5F0E8' : '#9A9488',
            }}
          >
            360 Feedback
          </Link>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: '#5C5A54' }}
        >
          Sign out
        </button>
      </nav>
      {children}
    </div>
  )
}
