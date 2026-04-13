import Link from 'next/link'

export default function FeedbackHomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-sm mb-8 inline-block" style={{ color: '#9A9488' }}>
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Career Feedback</h1>
        <p className="mb-10" style={{ color: '#9A9488' }}>Choose what you&apos;d like to fill out.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* CV Evaluation Card */}
          <div
            className="p-6 flex flex-col justify-between"
            style={{
              backgroundColor: '#1A1916',
              border: '1px solid #2E2C28',
              borderRadius: '12px',
            }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>Resume Evaluation</h2>
              <p className="mb-2" style={{ color: '#9A9488', lineHeight: '1.6' }}>
                Rate 15 skills and competencies from the CV.
              </p>
              <p className="text-sm" style={{ color: '#5C5A54' }}>~3 min</p>
            </div>
            <Link
              href="/feedback/curriculo"
              className="mt-6 inline-block text-center py-2.5 px-5 font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
            >
              Start →
            </Link>
          </div>

          {/* 360 Feedback Card */}
          <div
            className="p-6 flex flex-col justify-between"
            style={{
              backgroundColor: '#1A1916',
              border: '1px solid #2E2C28',
              borderRadius: '12px',
            }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>360 Feedback</h2>
              <p className="mb-2" style={{ color: '#9A9488', lineHeight: '1.6' }}>
                4 open questions about how Renato works and fits.
              </p>
              <p className="text-sm" style={{ color: '#5C5A54' }}>~5 min</p>
            </div>
            <Link
              href="/feedback/360"
              className="mt-6 inline-block text-center py-2.5 px-5 font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
            >
              Start →
            </Link>
          </div>
        </div>

        <p className="text-sm text-center" style={{ color: '#5C5A54' }}>
          100% anonymous. No identifying data is collected.
        </p>
      </div>
    </main>
  )
}
