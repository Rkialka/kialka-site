'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

function SliderRow({ item, value, onChange }: {
  item: { key: string; label: string; hint: string }
  value: number
  onChange: (key: string, val: number) => void
}) {
  const getColor = (v: number) => {
    if (v >= 75) return '#3B6D11'
    if (v >= 55) return '#185FA5'
    if (v >= 40) return '#BA7517'
    return '#A32D2D'
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="text-sm font-medium" style={{ color: '#F5F0E8' }}>{item.label}</span>
          <p className="text-xs mt-0.5" style={{ color: '#5C5A54' }}>{item.hint}</p>
        </div>
        <span
          className="ml-4 text-sm font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: getColor(value), color: '#F5F0E8' }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(item.key, parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#E84A1C' }}
      />
      <div className="flex justify-between text-xs mt-0.5" style={{ color: '#5C5A54' }}>
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  )
}

export default function CurriculoPage() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(() => {
    const init: FormValues = {}
    ;[...SLIDERS.stated, ...SLIDERS.results, ...SLIDERS.profile].forEach(
      (s) => (init[s.key] = 50)
    )
    return init
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

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
    <main className="min-h-screen p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/feedback" className="text-sm mb-8 inline-block" style={{ color: '#9A9488' }}>
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Resume Evaluation</h1>
        <p className="mb-8 text-sm" style={{ color: '#9A9488' }}>
          Rate each item from 0 (not credible at all) to 100 (completely credible).
        </p>

        <form onSubmit={handleSubmit}>
          {/* Section 1 */}
          <div
            className="p-5 mb-5"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>Stated Skills</h2>
            {SLIDERS.stated.map((item) => (
              <SliderRow
                key={item.key}
                item={item}
                value={values[item.key]}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Section 2 */}
          <div
            className="p-5 mb-5"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>Achievements & Track Record</h2>
            {SLIDERS.results.map((item) => (
              <SliderRow
                key={item.key}
                item={item}
                value={values[item.key]}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Section 3 */}
          <div
            className="p-5 mb-5"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: '#F5F0E8' }}>Profile & Fit</h2>
            {SLIDERS.profile.map((item) => (
              <SliderRow
                key={item.key}
                item={item}
                value={values[item.key]}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Optional comment */}
          <div
            className="p-5 mb-6"
            style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F0E8' }}>
              Free comment <span style={{ color: '#5C5A54' }}>(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 text-sm resize-none outline-none"
              style={{
                backgroundColor: '#0E0C08',
                border: '1px solid #2E2C28',
                borderRadius: '8px',
                color: '#F5F0E8',
              }}
              placeholder="Any additional thoughts..."
            />
          </div>

          {error && (
            <p className="mb-4 text-sm" style={{ color: '#E84A1C' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#E84A1C', color: '#F5F0E8', borderRadius: '12px' }}
          >
            {submitting ? 'Submitting...' : 'Submit evaluation'}
          </button>
        </form>
      </div>
    </main>
  )
}
