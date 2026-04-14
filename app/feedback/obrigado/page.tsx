export default function ObrigadoPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      backgroundColor: '#0E0C08', fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: '64px', height: '64px', margin: '0 auto 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#1A1916',
          border: '1px solid #2E2C28',
        }}>
          <span className="material-symbols-outlined" style={{ color: '#E84A1C', fontSize: '28px' }}>check_circle</span>
        </div>

        <span style={{
          display: 'block', marginBottom: '12px',
          color: '#E84A1C', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Submitted
        </span>
        <h1 style={{
          color: '#F5F0E8', fontWeight: 800,
          fontSize: '40px', letterSpacing: '-0.04em', margin: '0 0 20px',
        }}>
          Thank you.
        </h1>
        <p style={{ color: '#9A9488', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
          This kind of feedback is rare and genuinely valuable. It will be used to calibrate the next move.
        </p>

        <div style={{ marginTop: '48px', height: '1px', background: 'linear-gradient(to right, transparent, #2E2C28, transparent)' }} />

        <p style={{ marginTop: '24px', color: '#5C5A54', fontSize: '11px', letterSpacing: '0.1em' }}>
          kialka.com.br
        </p>
      </div>
    </main>
  )
}
