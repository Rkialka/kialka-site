import Link from 'next/link'

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="max-w-lg text-center">
        <div
          className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-2xl"
          style={{ backgroundColor: '#1A1916', borderRadius: '12px', border: '1px solid #2E2C28' }}
        >
          ✓
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#F5F0E8' }}>Submitted.</h1>
        <p className="text-lg mb-8" style={{ color: '#9A9488', lineHeight: '1.7' }}>
          Thank you for your honesty. This kind of feedback is rare and valuable.
        </p>
        <Link
          href="/feedback"
          className="inline-block py-2.5 px-6 font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#1A1916', color: '#9A9488', borderRadius: '12px', border: '1px solid #2E2C28' }}
        >
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
