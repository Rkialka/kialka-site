'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0E0C08', fontFamily: 'Manrope, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: '#0E0C08',
        borderBottom: '1px solid #2E2C28',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
      }}>
        <span style={{ color: '#F5F0E8', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.04em' }}>
          kialka.com.br
        </span>
        <span style={{ color: '#9A9488', fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Sales · AI · Job Hunt
        </span>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 32px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'flex-end', marginBottom: '80px' }}>
          <div>
            <span style={{
              display: 'block', marginBottom: '16px',
              color: '#E84A1C', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              Executive Portfolio
            </span>
            <h1 style={{
              color: '#F5F0E8', fontWeight: 800,
              fontSize: 'clamp(56px, 8vw, 96px)',
              lineHeight: 0.9, letterSpacing: '-0.05em',
              margin: 0,
            }}>
              Renato<br />Kialka
            </h1>
          </div>
          <div style={{ paddingBottom: '8px' }}>
            <p style={{ color: '#9A9488', fontSize: '18px', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
              Head of Sales &amp;<br />Country Manager Brazil
            </p>
            <div style={{ marginTop: '20px', width: '48px', height: '3px', backgroundColor: '#E84A1C' }} />
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid #2E2C28',
        }}>

          {/* Career Feedback */}
          <div style={{
            backgroundColor: '#1A1916',
            borderRight: '1px solid #2E2C28',
            padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '360px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#221f1b')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1916')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '36px' }}>analytics</span>
                <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Module 01</span>
              </div>
              <h3 style={{ color: '#F5F0E8', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Career Feedback</h3>
              <p style={{ color: '#9A9488', fontSize: '14px', lineHeight: 1.6 }}>
                Resume evaluation + 360 feedback from peers. Understand how you&apos;re perceived in the market.
              </p>
            </div>
            <Link
              href="/feedback"
              style={{
                display: 'inline-block', marginTop: '32px',
                backgroundColor: '#E84A1C', color: '#F5F0E8',
                padding: '14px 32px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.opacity = '1')}
            >
              Start
            </Link>
          </div>

          {/* Job Hunt */}
          <div style={{
            backgroundColor: '#1A1916',
            borderRight: '1px solid #2E2C28',
            padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '360px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#221f1b')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1916')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '36px' }}>view_kanban</span>
                <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Module 02</span>
              </div>
              <h3 style={{ color: '#F5F0E8', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Job Hunt</h3>
              <p style={{ color: '#9A9488', fontSize: '14px', lineHeight: 1.6 }}>
                Active pipeline tracker. Applications, scores, and status across all stages.
              </p>
            </div>
            <Link
              href="/jobhunting/login"
              style={{
                display: 'inline-block', marginTop: '32px',
                backgroundColor: '#E84A1C', color: '#F5F0E8',
                padding: '14px 32px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open
            </Link>
          </div>

          {/* Email */}
          <div style={{
            backgroundColor: '#1A1916',
            padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '360px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#221f1b')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1916')}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '36px' }}>mail</span>
                <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Module 03</span>
              </div>
              <h3 style={{ color: '#F5F0E8', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Email</h3>
              <p style={{ color: '#9A9488', fontSize: '14px', lineHeight: 1.6 }}>
                renato@kialka.com.br inbox. Read and track replies from applications.
              </p>
            </div>
            <Link
              href="/email"
              style={{
                display: 'inline-block', marginTop: '32px',
                backgroundColor: '#E84A1C', color: '#F5F0E8',
                padding: '14px 32px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open
            </Link>
          </div>

        </div>
      </section>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '40%', height: '40%',
          backgroundColor: '#E84A1C', opacity: 0.03,
          filter: 'blur(120px)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '50%', height: '50%',
          backgroundColor: '#9A9488', opacity: 0.02,
          filter: 'blur(150px)', borderRadius: '50%',
        }} />
      </div>

    </main>
  )
}
