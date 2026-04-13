import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F5F0E8' }}>kialka.com.br</h1>
        <p className="mb-10" style={{ color: '#9A9488' }}>Personal hub</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feedback Card */}
          <div
            className="p-6 flex flex-col justify-between"
            style={{
              backgroundColor: '#1A1916',
              border: '1px solid #2E2C28',
              borderRadius: '12px',
            }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>Career Feedback</h2>
              <p style={{ color: '#9A9488', lineHeight: '1.6' }}>
                Resume evaluation + 360 feedback. Help Renato understand how he&apos;s perceived.
              </p>
            </div>
            <Link
              href="/feedback"
              className="mt-6 inline-block text-center py-2.5 px-5 font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
            >
              Go →
            </Link>
          </div>

          {/* Job Hunt Card */}
          <div
            className="p-6 flex flex-col justify-between"
            style={{
              backgroundColor: '#1A1916',
              border: '1px solid #2E2C28',
              borderRadius: '12px',
            }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>Job Hunt</h2>
              <p style={{ color: '#9A9488', lineHeight: '1.6' }}>
                Active pipeline tracker. Applications, scores, and status.
              </p>
            </div>
            <Link
              href="/jobhunting/login"
              className="mt-6 inline-block text-center py-2.5 px-5 font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
            >
              Go →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
