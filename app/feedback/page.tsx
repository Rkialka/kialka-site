import Link from 'next/link'

export default function FeedbackLandingPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', backgroundColor: '#0E0C08',
      fontFamily: 'Manrope, sans-serif',
    }}>

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
          backgroundColor: '#E84A1C', opacity: 0.03, filter: 'blur(120px)', borderRadius: '50%',
        }} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: '100%', maxWidth: '900px', padding: '48px 24px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            display: 'block', marginBottom: '16px',
            color: '#E84A1C', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            kialka.com.br
          </span>
          <h1 style={{
            color: '#F5F0E8', fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '-0.04em', lineHeight: 1, margin: 0,
          }}>
            Career Feedback
          </h1>
          <p style={{
            color: '#9A9488', fontSize: '15px', fontWeight: 500,
            marginTop: '16px', maxWidth: '440px', lineHeight: 1.6,
          }}>
            Precision insight for Renato&apos;s professional growth. Choose the form below.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px', backgroundColor: '#2E2C28', width: '100%',
        }}>

          {/* Resume Evaluation */}
          <div style={{
            backgroundColor: '#1A1916', padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '300px',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '32px' }}>description</span>
                <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Module 01</span>
              </div>
              <h2 style={{ color: '#F5F0E8', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '10px' }}>Resume Evaluation</h2>
              <p style={{ color: '#9A9488', fontSize: '13px', lineHeight: 1.7 }}>
                Rate 15 skills and competencies from the CV. Slider-based, ~3 min.
              </p>
            </div>
            <Link
              href="/feedback/curriculo"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '28px', backgroundColor: '#E84A1C', color: '#F5F0E8',
                padding: '13px 20px', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Start Evaluation
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
            </Link>
          </div>

          {/* 360 Feedback */}
          <div style={{
            backgroundColor: '#1A1916', padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '300px',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '32px' }}>group</span>
                <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Module 02</span>
              </div>
              <h2 style={{ color: '#F5F0E8', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '10px' }}>360 Feedback</h2>
              <p style={{ color: '#9A9488', fontSize: '13px', lineHeight: 1.7 }}>
                4 open questions + 1 optional. Candid perspective from your network. ~5 min.
              </p>
            </div>
            <Link
              href="/feedback/360"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '28px', backgroundColor: '#E84A1C', color: '#F5F0E8',
                padding: '13px 20px', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Request Feedback
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>hub</span>
            </Link>
          </div>
        </div>

        <p style={{ marginTop: '32px', color: '#5C5A54', fontSize: '12px', letterSpacing: '0.05em' }}>
          100% anonymous · No identifying data collected
        </p>
      </div>
    </main>
  )
}
