'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDERS = {
  stated: [
    { key: 'c1', label: 'GTM from scratch', hint: 'Build a playbook and pipeline in a new market with no prior structure or support' },
    { key: 'c2', label: 'Complex enterprise sales', hint: 'Drive long cycles with multiple C-level decision-makers through to close' },
    { key: 'c3', label: 'Revenue Operations & Forecasting', hint: 'Structure forecasting, data, and revenue processes' },
    { key: 'c4', label: 'Team building & development', hint: 'Hire, train, and coach AEs and SDRs consistently' },
    { key: 'c5', label: 'Outbound pipeline generation', hint: 'Create demand from zero without relying on inbound or marketing' },
    { key: 'c6', label: 'AI applied to sales in practice', hint: 'Implement AI tools in the sales process — not just in the pitch' },
  ],
  results: [
    { key: 'r1', label: 'First hire who builds the entire market', hint: 'Being the sole commercial hire and building the legal, financial, and sales operation from scratch' },
    { key: 'r2', label: 'Enterprise closings with major accounts', hint: 'Deals with Magalu, Amazon BR, Shopee, Riot Games, WeWork, P&G, DuPont' },
    { key: 'r3', label: 'Accelerated revenue growth in short windows', hint: 'Scaling numbers significantly in a matter of months' },
    { key: 'r4', label: 'Leading senior AE teams', hint: 'Managing quota-carrying reps in a high-pressure environment' },
    { key: 'r5', label: 'Reference in B2B sales with AI in Brazil', hint: 'Book, teaching, and positioning as a thought leader on the topic' },
  ],
  profile: [
    { key: 'p1', label: 'Thrives in 0→1 more than in scaling', hint: 'Better at building from scratch than optimizing an existing operation' },
    { key: 'p2', label: 'Better as IC or small team lead than VP of a large org', hint: 'Performs better as an executor than as a multi-layer manager' },
    { key: 'p3', label: 'Communicates well with C-level buyers', hint: 'Translates complexity into business language for CEOs, CFOs, and CTOs' },
    { key: 'p4', label: 'More strategic than operational', hint: 'Thinks more in systems and structure than in day-to-day tactical execution' },
  ],
}

type FormValues = Record<string, number>

function getBarColor(v: number): string {
  if (v >= 75) return '#3B6D11'
  if (v >= 55) return '#185FA5'
  if (v >= 40) return '#BA7517'
  return '#A32D2D'
}

function SliderRow({ item, value, onChange }: {
  item: { key: string; label: string; hint: string }
  value: number
  onChange: (key: string, val: number) => void
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, marginRight: '16px' }}>
          <p style={{ color: '#F5F0E8', fontSize: '13px', fontWeight: 600, margin: '0 0 3px' }}>{item.label}</p>
          <p style={{ color: '#5C5A54', fontSize: '11px', margin: 0 }}>{item.hint}</p>
        </div>
        <span style={{
          flexShrink: 0, padding: '2px 10px',
          backgroundColor: getBarColor(value), color: '#F5F0E8',
          fontSize: '12px', fontWeight: 700, minWidth: '36px', textAlign: 'center',
        }}>
          {value}
        </span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(item.key, parseInt(e.target.value))}
        style={{ width: '100%', height: '3px', cursor: 'pointer', accentColor: '#E84A1C' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ color: '#5C5A54', fontSize: '10px' }}>0 — not credible</span>
        <span style={{ color: '#5C5A54', fontSize: '10px' }}>100 — fully credible</span>
      </div>
    </div>
  )
}

function Section({ title, module, items, values, onChange }: {
  title: string; module: string
  items: { key: string; label: string; hint: string }[]
  values: FormValues; onChange: (key: string, val: number) => void
}) {
  return (
    <div style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', padding: '32px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <h2 style={{ color: '#F5F0E8', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>{title}</h2>
        <span style={{ color: '#5C5A54', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{module}</span>
      </div>
      {items.map(item => (
        <SliderRow key={item.key} item={item} value={values[item.key]} onChange={onChange} />
      ))}
    </div>
  )
}

export default function CurriculoPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(() => {
    const init: FormValues = {}
    ;[...SLIDERS.stated, ...SLIDERS.results, ...SLIDERS.profile].forEach(s => (init[s.key] = 50))
    return init
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key: string, val: number) => setValues(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/curriculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      router.push('/feedback/obrigado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0E0C08', fontFamily: 'Manrope, sans-serif' }}>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#0E0C08',
        borderBottom: '1px solid rgba(91,64,57,0.15)', padding: '16px 32px',
      }}>
        <div style={{ color: '#E84A1C', fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Resume Evaluation
        </div>
      </nav>

      <div style={{ flex: 1, width: '100%', maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ color: '#F5F0E8', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
            Resume Evaluation
          </h1>
          <p style={{ color: '#9A9488', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Rate each item from 0 (not credible at all) to 100 (completely credible).
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <Section title="Stated Skills" module="Section 01" items={SLIDERS.stated} values={values} onChange={handleChange} />
          <Section title="Achievements & Track Record" module="Section 02" items={SLIDERS.results} values={values} onChange={handleChange} />
          <Section title="Profile & Fit" module="Section 03" items={SLIDERS.profile} values={values} onChange={handleChange} />

          <div style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', padding: '32px', marginBottom: '16px' }}>
            <label style={{ color: '#F5F0E8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              Free comment <span style={{ color: '#5C5A54', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder="Any additional thoughts..."
              style={{
                width: '100%', padding: '12px', backgroundColor: '#0E0C08', border: 'none',
                color: '#F5F0E8', fontSize: '14px', lineHeight: 1.6, resize: 'none', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'Manrope, sans-serif',
              }}
            />
          </div>

          {error && <p style={{ color: '#E84A1C', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ paddingBottom: '48px' }}>
            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '18px', backgroundColor: '#E84A1C', color: '#F5F0E8',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                opacity: submitting ? 0.7 : 1, fontFamily: 'Manrope, sans-serif',
              }}
            >
              {submitting ? 'Submitting...' : <>Submit Evaluation <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span></>}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
