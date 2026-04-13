'use client'

import { useState } from 'react'
import Link from 'next/link'

type Application = {
  id: number
  company: string
  role: string
  score: number | null
  status: string
  ats: string | null
  cv_file: string | null
  apply_url: string | null
  applied_at: string | null
  notes: string | null
}

const applications: Application[] = [
  // APPLIED
  { id: 1, company: "Hellotext", role: "Country Manager Brazil", score: 20, status: "applied", ats: "LinkedIn Easy Apply", cv_file: "cv_renato_kialka_hellotext_country_manager_brazil.docx", apply_url: null, applied_at: "2026-04-02", notes: "Confirmed submitted" },
  { id: 2, company: "Cobli", role: "Sales Director", score: 20, status: "applied", ats: "inhire.app", cv_file: "cv_renato_kialka_cobli_sales_director.pdf", apply_url: null, applied_at: "2026-04-03", notes: "Applied manually. FleetTech SaaS, SP Hybrid." },
  { id: 3, company: "Luxoft (DXC Technology)", role: "Sales Director", score: 14, status: "applied", ats: "LinkedIn Easy Apply", cv_file: "Renato Kialka CV Dez2025.pdf", apply_url: null, applied_at: "2026-04-11", notes: "Hybrid SP. Financial services clients." },
  { id: 4, company: "Confidential", role: "Head of Sales (SMB, São Paulo)", score: 18, status: "applied", ats: "LinkedIn Easy Apply", cv_file: "cv_renato_kialka_confidential_head_of_sales_smb_sp.docx", apply_url: null, applied_at: "2026-04-11", notes: "High-velocity SMB" },
  { id: 5, company: "GraceMark Solutions", role: "Head of Sales (Staffing, Remote)", score: 15, status: "applied", ats: "LinkedIn Easy Apply", cv_file: "cv_renato_kialka_gracemark_head_of_sales_staffing.docx", apply_url: null, applied_at: "2026-04-11", notes: "Outbound pipeline builder angle" },
  { id: 6, company: "Designity", role: "B2B Head of Sales", score: 18, status: "applied", ats: "forms.designity.com", cv_file: "cv_renato_kialka_designity_b2b_head_of_sales.docx", apply_url: null, applied_at: "2026-04-11", notes: "3-page form. Confirmed submitted." },
  // FORM FILLED
  { id: 7, company: "Yuno", role: "Head of Sales LATAM", score: 20, status: "form_filled", ats: "Lever", cv_file: "cv_renato_kialka_yuno_head_of_sales_latam.docx", apply_url: "https://jobs.lever.co/yuno/5477c080-5cfe-4638-96cd-37f8aba14edc/apply", applied_at: null, notes: "⚠️ Listed for Mexico-based only. Needs CV upload + submit." },
  { id: 8, company: "Toptal", role: "General Manager, New Business Unit", score: 19, status: "form_filled", ats: "toptal.com/careers", cv_file: "cv_renato_kialka_toptal_general_manager.docx", apply_url: "https://www.toptal.com/careers/general-manager-new-business-unit", applied_at: null, notes: "Needs CV upload + reCAPTCHA + submit." },
  // WORKDAY PENDING
  { id: 9, company: "Thomson Reuters Brasil", role: "Diretor Sales Digital/Growth", score: 18, status: "workday_pending", ats: "Workday", cv_file: "cv_renato_kialka_thomson_reuters_diretor_sales_digital.docx", apply_url: "https://thomsonreuters.wd5.myworkdayjobs.com/pt-BR/External_Career_Site/job/Brazil-So-Paulo-So-Paulo/Diretor-Sales-Digital-Growth_JREQ195438", applied_at: null, notes: "Deadline: 30/Apr/2026. Renato must log in and submit." },
  // CV READY
  { id: 10, company: "Vimeo", role: "Director, Head of Sales (LATAM)", score: 20, status: "cv_ready", ats: "Greenhouse", cv_file: "cv_renato_kialka.pdf", apply_url: "https://job-boards.greenhouse.io/vimeo/jobs/6561048", applied_at: null, notes: "🔥 TOP PRIORITY. SP-based, LATAM scope." },
  { id: 11, company: "Degreed", role: "Regional VP, Sales LATAM", score: 20, status: "cv_ready", ats: "Greenhouse", cv_file: "cv_renato_kialka_degreed_regional_vp_sales_latam.pdf", apply_url: "https://job-boards.greenhouse.io/degreed/jobs/5356463004", applied_at: null, notes: "Learning SaaS." },
  { id: 12, company: "Mirakl", role: "Country Manager LATAM", score: 20, status: "cv_ready", ats: "Workable", cv_file: "cv_renato_kialka_mirakl_country_manager_latam.pdf", apply_url: "https://apply.workable.com/mirakl-careers/j/5AB3422ADB/", applied_at: null, notes: "Marketplace SaaS. Base/BaseLinker fit." },
  { id: 13, company: "Toku", role: "Country Manager Brasil", score: 19, status: "cv_ready", ats: "Workable", cv_file: "cv_renato_kialka_toku_country_manager_brasil.pdf", apply_url: "https://apply.workable.com/trytoku/j/862487DE51", applied_at: null, notes: "Stablecoin payroll fintech." },
  { id: 14, company: "Revenue3", role: "Country Manager Brazil", score: 19, status: "cv_ready", ats: "LinkedIn Easy Apply", cv_file: "cv_renato_kialka_revenue3_country_manager_brazil.docx", apply_url: "https://www.linkedin.com/jobs/view/4397755352/", applied_at: null, notes: "Fintech cross-border payments." },
  { id: 15, company: "ActiveCampaign", role: "Manager, Sales (Trilingual)", score: 18, status: "cv_ready", ats: "Lever", cv_file: "cv_renato_kialka.pdf", apply_url: "https://jobs.lever.co/activecampaign/b1024f69-38af-4840-ac2b-ae1a9b80db4c", applied_at: null, notes: "⚠️ Verify Spanish fluency. Remote LATAM." },
  { id: 16, company: "Insider.", role: "Sales Manager, Brazil", score: 18, status: "cv_ready", ats: "Lever", cv_file: "cv_renato_kialka.pdf", apply_url: "https://jobs.lever.co/useinsider/d025e433-f419-4070-84de-7618db9b7916", applied_at: null, notes: "B2B AI SaaS Unicorn. ⚠️ Manager level." },
  { id: 17, company: "Salesforce", role: "RVP, Sales Brazil", score: 18, status: "cv_ready", ats: "Workday", cv_file: "cv_renato_kialka_salesforce_rvp_sales_brazil.pdf", apply_url: "https://careers.salesforce.com/en/jobs/jr324606/rvp-sales/", applied_at: null, notes: "Retail & Consumer Goods segment." },
  { id: 18, company: "Crypto.com", role: "Country Manager Brazil", score: 18, status: "cv_ready", ats: "Lever", cv_file: "cv_renato_kialka_cryptocom_country_manager_brazil.pdf", apply_url: "https://jobs.lever.co/crypto/43a8cabf-4d76-4274-894d-f8ac6bf2b5a5", applied_at: null, notes: "SP Hybrid." },
  { id: 19, company: "Meta", role: "Enterprise Tech Sales Director LATAM", score: 18, status: "cv_ready", ats: "Meta Careers", cv_file: "cv_renato_kialka_meta_enterprise_sales_director_latam.docx", apply_url: "https://www.linkedin.com/jobs/view/4393621624/", applied_at: null, notes: "Business Messaging & AI." },
  { id: 20, company: "EBANX", role: "Country Manager Brazil", score: null, status: "cv_ready", ats: "Greenhouse", cv_file: "cv_renato_kialka_ebanx_country_manager_brazil.docx", apply_url: "https://boards.greenhouse.io/ebanx", applied_at: null, notes: "⚠️ Requires fluent Spanish." },
  { id: 21, company: "Aleph (Spotify LATAM)", role: "Head of Sales", score: null, status: "cv_ready", ats: "Lever", cv_file: "cv_renato_kialka_aleph_head_of_sales_spotify_latam.docx", apply_url: "https://jobs.lever.co/aleph", applied_at: null, notes: "Spotify ad sales partner." },
  { id: 22, company: "Mastercard", role: "VP Account Management", score: 17, status: "cv_ready", ats: "Mastercard Careers", cv_file: "cv_renato_kialka_mastercard_vp_account_management.docx", apply_url: "https://www.linkedin.com/jobs/view/4373173178/", applied_at: null, notes: "LAC regional. Hybrid SP." },
  { id: 23, company: "Cabify", role: "Head of Sales LATAM", score: 14, status: "cv_ready", ats: "Greenhouse", cv_file: "cv_renato_kialka.pdf", apply_url: "https://boards.greenhouse.io/cabify/jobs/5141417002", applied_at: null, notes: "⚠️ Listed for Santiago/Buenos Aires." },
  { id: 24, company: "Google", role: "Director Brazil Google Cloud Sales", score: null, status: "cv_ready", ats: "Google Careers", cv_file: "cv_renato_kialka_google_director_cloud_sales_brazil.docx", apply_url: "https://www.linkedin.com/jobs/view/4397188685/", applied_at: null, notes: "Big Tech — apply always." },
  { id: 25, company: "AWS", role: "Manager Brazil AGS", score: null, status: "cv_ready", ats: "amazon.jobs", cv_file: "cv_renato_kialka_aws_manager_brazil_ags.docx", apply_url: "https://www.amazon.jobs/en/jobs/A10379150", applied_at: null, notes: "Big Tech — apply always." },
  { id: 26, company: "Zebra Technologies", role: "Senior Director Sales Brazil", score: null, status: "cv_ready", ats: "LinkedIn", cv_file: "cv_renato_kialka_zebra_senior_director_sales_brazil.docx", apply_url: "https://www.linkedin.com/jobs/view/4395570398/", applied_at: null, notes: null },
  // CLOSED
  { id: 27, company: "Wellhub (Gympass)", role: "Digital Sales Director SMB", score: 20, status: "closed", ats: "startup.jobs", cv_file: null, apply_url: null, applied_at: null, notes: "Job no longer available." },
  { id: 28, company: "Sensor Tower", role: "Country Manager Brazil", score: 20, status: "closed", ats: "Lever", cv_file: null, apply_url: null, applied_at: null, notes: "404 on Lever." },
  { id: 29, company: "Degreed", role: "Regional VP Sales LATAM", score: 20, status: "closed", ats: "Greenhouse", cv_file: null, apply_url: null, applied_at: null, notes: "Greenhouse returned error." },
  { id: 30, company: "Mirakl", role: "Country Manager LATAM", score: 20, status: "closed", ats: "Workable", cv_file: null, apply_url: null, applied_at: null, notes: "Job no longer available." },
  // SKIP
  { id: 31, company: "RateGain", role: "Associate Director of Sales LATAM", score: 10, status: "skip", ats: null, cv_file: null, apply_url: null, applied_at: null, notes: "TravelTech vertical — incompatible sector." },
  { id: 32, company: "Mindbody (Playlist)", role: "Team Lead, Sales Development", score: 7, status: "skip", ats: null, cv_file: null, apply_url: null, applied_at: null, notes: "SDR team lead — too junior." },
  { id: 33, company: "D Prime", role: "Sales Director Brazil", score: 11, status: "skip", ats: null, cv_file: null, apply_url: null, applied_at: null, notes: "CFD/forex — requires financial trading exp." },
]

type StatusFilter = 'all' | 'applied' | 'pending' | 'cv_ready' | 'closed' | 'skip'

function getStatusStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'applied':
      return { bg: '#3B6D11', color: '#F5F0E8', label: 'Applied' }
    case 'form_filled':
      return { bg: '#BA7517', color: '#F5F0E8', label: 'Form Filled' }
    case 'workday_pending':
      return { bg: '#BA7517', color: '#F5F0E8', label: 'Workday Pending' }
    case 'cv_ready':
      return { bg: '#185FA5', color: '#F5F0E8', label: 'CV Ready' }
    case 'closed':
      return { bg: '#A32D2D', color: '#F5F0E8', label: 'Closed' }
    case 'skip':
      return { bg: '#2E2C28', color: '#5C5A54', label: 'Skip' }
    default:
      return { bg: '#2E2C28', color: '#9A9488', label: status }
  }
}

function scoreColor(v: number): string {
  if (v >= 75) return '#3B6D11'
  if (v >= 55) return '#185FA5'
  if (v >= 40) return '#BA7517'
  return '#A32D2D'
}

const TABS: { key: StatusFilter; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: applications.length },
  { key: 'applied', label: 'Applied', count: applications.filter((a) => a.status === 'applied').length },
  { key: 'pending', label: 'Pending', count: applications.filter((a) => a.status === 'form_filled' || a.status === 'workday_pending').length },
  { key: 'cv_ready', label: 'CV Ready', count: applications.filter((a) => a.status === 'cv_ready').length },
  { key: 'closed', label: 'Closed', count: applications.filter((a) => a.status === 'closed').length },
  { key: 'skip', label: 'Skip', count: applications.filter((a) => a.status === 'skip').length },
]

export default function JobHuntingDashboard() {
  const [filter, setFilter] = useState<StatusFilter>('all')

  const filtered = applications.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'pending') return a.status === 'form_filled' || a.status === 'workday_pending'
    return a.status === filter
  })

  const stats = [
    { label: 'Total Processed', value: applications.length },
    { label: 'Applied', value: applications.filter((a) => a.status === 'applied').length, icon: '✅' },
    { label: 'Pending Manual Submit', value: applications.filter((a) => a.status === 'form_filled' || a.status === 'workday_pending').length, icon: '📋' },
    { label: 'CV Ready', value: applications.filter((a) => a.status === 'cv_ready').length, icon: '📄' },
    { label: 'Closed / Skip', value: applications.filter((a) => a.status === 'closed' || a.status === 'skip').length, icon: '❌' },
  ]

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: '#0E0C08' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#F5F0E8' }}>Job Hunt Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#5C5A54' }}>Renato Kialka — Active Pipeline</p>
          </div>
          <Link href="/" className="text-sm" style={{ color: '#5C5A54' }}>← Home</Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-4"
              style={{ backgroundColor: '#1A1916', border: '1px solid #2E2C28', borderRadius: '12px' }}
            >
              <p className="text-xs mb-1" style={{ color: '#5C5A54' }}>
                {s.icon ? `${s.icon} ` : ''}{s.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: '#F5F0E8' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: filter === tab.key ? '#E84A1C' : '#1A1916',
                color: filter === tab.key ? '#F5F0E8' : '#9A9488',
                border: '1px solid #2E2C28',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto"
          style={{ borderRadius: '12px', border: '1px solid #2E2C28' }}
        >
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1A1916', borderBottom: '1px solid #2E2C28' }}>
                {['Company', 'Role', 'Score', 'Status', 'ATS', 'CV File', 'Apply', 'Notes'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold"
                    style={{ color: '#5C5A54', whiteSpace: 'nowrap' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const statusStyle = getStatusStyle(app.status)
                return (
                  <tr
                    key={app.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#0E0C08' : '#111009',
                      borderBottom: '1px solid #2E2C28',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#F5F0E8', whiteSpace: 'nowrap' }}>
                      {app.company}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#9A9488', minWidth: '160px' }}>
                      {app.role}
                    </td>
                    <td className="px-4 py-3" style={{ whiteSpace: 'nowrap' }}>
                      {app.score !== null ? (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ backgroundColor: scoreColor(app.score), color: '#F5F0E8' }}
                        >
                          {app.score}
                        </span>
                      ) : (
                        <span style={{ color: '#5C5A54' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#9A9488', whiteSpace: 'nowrap' }}>
                      {app.ats || '—'}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: '#5C5A54' }}>
                      {app.cv_file || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ whiteSpace: 'nowrap' }}>
                      {app.apply_url ? (
                        <a
                          href={app.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity"
                          style={{ color: '#E84A1C' }}
                        >
                          Apply →
                        </a>
                      ) : app.applied_at ? (
                        <span style={{ color: '#3B6D11' }}>{app.applied_at}</span>
                      ) : (
                        <span style={{ color: '#5C5A54' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#9A9488', minWidth: '200px' }}>
                      {app.notes || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-right" style={{ color: '#5C5A54' }}>
          Last updated: Apr 13, 2026
        </p>
      </div>
    </main>
  )
}
