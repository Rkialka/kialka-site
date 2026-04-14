/**
 * Google Stitch SDK — site redesign generator v2
 * Generates HTML screens for kialka.com.br pages
 * Run: node scripts/stitch-generate.mjs
 */

import { StitchToolClient, Stitch } from '@google/stitch-sdk'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../stitch-output')

const API_KEY = process.env.STITCH_API_KEY ?? ''

// Fetch actual content from a Stitch download URL
async function fetchContent(urlOrContent) {
  if (!urlOrContent) return ''
  // If it looks like a URL, fetch it
  if (urlOrContent.startsWith('http')) {
    const res = await fetch(urlOrContent)
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    return await res.text()
  }
  return urlOrContent
}

const SCREENS = [
  {
    id: 'homepage',
    prompt: `Dark personal hub homepage. Background #0E0C08, cards #1A1916, border #2E2C28, text #F5F0E8, accent #E84A1C. Header: "kialka.com.br" bold left, tagline "Sales · AI · Job Hunt". Hero: large name "Renato Kialka", subtitle "Head of Sales & Country Manager Brazil". Three horizontal cards: Career Feedback, Job Hunt Dashboard, Email Inbox — each with title, 1-line description, orange CTA button. Minimal dark UI.`,
    device: 'DESKTOP',
  },
  {
    id: 'login',
    prompt: `Minimal dark login page. Background #0E0C08, centered card #1A1916, border #2E2C28, text #F5F0E8, button #E84A1C. Title "Access". Single password field. Full-width "Enter →" button. No other elements.`,
    device: 'DESKTOP',
  },
  {
    id: 'kanban-board',
    prompt: `Dark Kanban job tracking board. Background #0E0C08, columns #1A1916, border #2E2C28, text #F5F0E8, accent #E84A1C. Top nav with title and logout. Six columns: To Apply (blue), Action Needed (amber), Applied (green), Interviewing (red), Offer (green), Archive (grey). Cards show company name, role, score badge, ATS label. Compact dark UI.`,
    device: 'DESKTOP',
  },
  {
    id: 'email-client',
    prompt: `Dark 3-column email client. Background #0E0C08, sidebar #1A1916, border #2E2C28, text #F5F0E8, accent #E84A1C. Left: folder list (Inbox, Sent, Archive, Trash) + Compose button. Center: email list with sender, subject, date. Right: email reading pane with reply/archive/trash toolbar. Minimal dark UI like Linear.`,
    device: 'DESKTOP',
  },
  {
    id: 'feedback-360',
    prompt: `Dark 360 feedback form. Background #0E0C08, cards #1A1916, border #2E2C28, text #F5F0E8, button #E84A1C. Centered max 640px. Title "360 Feedback". Five textarea cards with question labels and hint text. Submit button full width orange-red. Clean form UI.`,
    device: 'DESKTOP',
  },
  {
    id: 'feedback-home',
    prompt: `Dark feedback landing page. Background #0E0C08, cards #1A1916, border #2E2C28, text #F5F0E8, button #E84A1C. Centered. Title "Career Feedback". Two option cards: "Resume Evaluation" and "360 Feedback" — each with description and orange button. Clean minimal dark UI.`,
    device: 'DESKTOP',
  },
]

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  // Load existing project if available
  let projectId = null
  try {
    const prev = JSON.parse(readFileSync(join(OUT_DIR, 'project.json'), 'utf8'))
    projectId = prev.projectId
    console.log(`♻️  Reusing project: ${projectId}`)
  } catch {}

  console.log('🔌 Connecting to Stitch...')
  const client = new StitchToolClient({ apiKey: API_KEY })
  const stitch = new Stitch(client)

  let project
  if (projectId) {
    project = stitch.project(projectId)
  } else {
    console.log('📁 Creating project...')
    project = await stitch.createProject('kialka.com.br Redesign')
    projectId = project.id
    console.log(`   Project ID: ${projectId}`)
    writeFileSync(join(OUT_DIR, 'project.json'), JSON.stringify({ projectId }, null, 2))
  }

  // Load existing results
  let results = {}
  try {
    results = JSON.parse(readFileSync(join(OUT_DIR, 'results.json'), 'utf8'))
  } catch {}

  for (const screen of SCREENS) {
    // Skip already-successful screens
    if (results[screen.id]?.htmlLength > 300) {
      console.log(`⏭️  Skipping ${screen.id} (already done)`)
      continue
    }

    console.log(`\n🖼️  Generating: ${screen.id}...`)
    try {
      const generated = await project.generate(screen.prompt, screen.device, 'GEMINI_3_PRO')
      console.log(`   Screen ID: ${generated.id}`)

      const htmlUrl = await generated.getHtml()
      const imgUrl  = await generated.getImage()

      console.log(`   Fetching HTML from: ${htmlUrl?.slice(0, 80)}...`)
      const html = await fetchContent(htmlUrl)
      const img  = await fetchContent(imgUrl)

      const htmlPath = join(OUT_DIR, `${screen.id}.html`)
      const imgPath  = join(OUT_DIR, `${screen.id}.png`)

      writeFileSync(htmlPath, html)
      // img might be base64 or a URL-fetched binary
      if (img && img.length > 100) {
        try {
          // Try base64 decode first
          const buf = Buffer.from(img, 'base64')
          writeFileSync(imgPath, buf)
        } catch {
          writeFileSync(imgPath, img)
        }
      }

      results[screen.id] = {
        screenId: generated.id,
        htmlPath,
        imgPath,
        htmlLength: html.length,
      }

      // Save incrementally
      writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
      console.log(`   ✅ HTML: ${html.length} chars`)
      // Show first 200 chars of HTML
      console.log(`   Preview: ${html.slice(0, 200).replace(/\n/g, ' ')}`)
    } catch (e) {
      console.error(`   ❌ Failed ${screen.id}:`, e.message)
      results[screen.id] = { error: e.message }
      writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
    }
  }

  console.log('\n✅ All done.')
  for (const [id, r] of Object.entries(results)) {
    if (r.error) console.log(`  ❌ ${id}: ${r.error}`)
    else console.log(`  ✅ ${id}: ${r.htmlLength} chars`)
  }
}

main().catch(console.error)
