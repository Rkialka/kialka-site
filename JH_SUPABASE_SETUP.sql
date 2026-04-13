-- Job applications
create table if not exists jh_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  company text not null,
  role text not null,
  score int2,
  status text not null default 'cv_ready',
  ats text,
  apply_url text,
  cv_file text,
  notes text,
  manual_action text,
  applied_at date,
  priority boolean default false,
  track text
);

-- Status change history
create table if not exists jh_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  application_id uuid references jh_applications(id) on delete cascade,
  event_type text not null,
  description text not null,
  old_status text,
  new_status text
);

-- Daily session logs (Claude Cowork integration)
create table if not exists jh_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  session_date date not null,
  session_name text not null,
  summary text not null,
  details text,
  applications_count int2 default 0,
  source text default 'cowork'
);

-- RLS
alter table jh_applications enable row level security;
alter table jh_events enable row level security;
alter table jh_logs enable row level security;

-- All access via service role only (no public access)
create policy "Service role only - jh_applications" on jh_applications for all to service_role using (true) with check (true);
create policy "Service role only - jh_events" on jh_events for all to service_role using (true) with check (true);
create policy "Service role only - jh_logs" on jh_logs for all to service_role using (true) with check (true);

-- Seed: all 33 applications
insert into jh_applications (company, role, score, status, ats, cv_file, apply_url, applied_at, notes, manual_action, priority, track) values
('Hellotext', 'Country Manager Brazil', 20, 'applied', 'LinkedIn Easy Apply', 'cv_renato_kialka_hellotext_country_manager_brazil.docx', null, '2026-04-02', 'Confirmed submitted. eCommerce SaaS / messaging platform.', null, false, 'C'),
('Cobli', 'Sales Director', 20, 'applied', 'inhire.app', 'cv_renato_kialka_cobli_sales_director.pdf', null, '2026-04-03', 'FleetTech SaaS, SP Hybrid. Pretensão: R$30k.', null, false, 'C'),
('Luxoft (DXC Technology)', 'Sales Director', 14, 'applied', 'LinkedIn Easy Apply', 'Renato Kialka CV Dez2025.pdf', null, '2026-04-11', 'Hybrid SP. Financial services clients. Recruiter: Jyotsna Gupta.', null, false, 'C'),
('Confidential', 'Head of Sales (SMB, São Paulo)', 18, 'applied', 'LinkedIn Easy Apply', 'cv_renato_kialka_confidential_head_of_sales_smb_sp.docx', null, '2026-04-11', 'High-velocity SMB sales org builder.', null, false, 'C'),
('GraceMark Solutions', 'Head of Sales (Staffing, Remote)', 15, 'applied', 'LinkedIn Easy Apply', 'cv_renato_kialka_gracemark_head_of_sales_staffing.docx', null, '2026-04-11', 'Outbound pipeline builder, BDR/AE team building.', null, false, 'C'),
('Designity', 'B2B Head of Sales', 18, 'applied', 'forms.designity.com', 'cv_renato_kialka_designity_b2b_head_of_sales.docx', null, '2026-04-11', '3-page form. Confirmed submitted. $100k USD expectation.', null, false, 'C'),
('Yuno', 'Head of Sales LATAM', 20, 'action_needed', 'Lever', 'cv_renato_kialka_yuno_head_of_sales_latam.docx', 'https://jobs.lever.co/yuno/5477c080-5cfe-4638-96cd-37f8aba14edc/apply', null, 'Payment orchestration SaaS (a16z/Tiger backed). Manages commercial ops + KAM team across LATAM, P&L. Strong fit with Base/BaseLinker (Magalu/Amazon/Shopee/Shein). ⚠️ Listed for Mexico-based only — decide whether to submit anyway.', 'Open apply URL → upload cv_renato_kialka_yuno_head_of_sales_latam.docx → click Submit. Note: listing says Mexico-based only.', false, 'C'),
('Toptal', 'General Manager, New Business Unit', 19, 'action_needed', 'toptal.com/careers', 'cv_renato_kialka_toptal_general_manager.docx', 'https://www.toptal.com/careers/general-manager-new-business-unit', null, 'Largest remote talent marketplace ($200M+ ARR). GM role to build new business line from scratch (P&L, PMF, scale). Direct fit: twice first commercial hire with P&L ownership.', 'Open apply URL → upload cv_renato_kialka_toptal_general_manager.docx → solve reCAPTCHA → click Submit.', false, 'C'),
('Thomson Reuters Brasil', 'Diretor Sales Digital/Growth', 18, 'action_needed', 'Workday', 'cv_renato_kialka_thomson_reuters_diretor_sales_digital.docx', 'https://thomsonreuters.wd5.myworkdayjobs.com/pt-BR/External_Career_Site/job/Brazil-So-Paulo-So-Paulo/Diretor-Sales-Digital-Growth_JREQ195438', null, 'TR Brasil Unidade Inova. Lead digital growth for SMBs: GTM, conversion funnel, data monetization. LinkedIn flagged as top candidate. CV in PT with keywords.', '⚠️ DEADLINE: Apr 30, 2026. Log in to Workday (JREQ195438) → complete 6 steps → upload cv_renato_kialka_thomson_reuters_diretor_sales_digital.docx → Submit.', false, 'B'),
('Vimeo', 'Director, Head of Sales (LATAM)', 20, 'cv_ready', 'Greenhouse', 'cv_renato_kialka.pdf', 'https://job-boards.greenhouse.io/vimeo/jobs/6561048', null, '🔥 TOP PRIORITY. SP-based, LATAM scope, Channel Partner GTM. BR clients: Itaú, JBS, Eletrobrás, Boticário, Santander. Direct fit with Base/BaseLinker.', null, true, 'C'),
('Degreed', 'Regional VP, Sales LATAM', 20, 'cv_ready', 'Greenhouse', 'cv_renato_kialka_degreed_regional_vp_sales_latam.pdf', 'https://job-boards.greenhouse.io/degreed/jobs/5356463004', null, 'Learning SaaS. Gupy framed as adjacent to learning & workforce development. Audens Edu reinforces domain.', null, false, 'C'),
('Mirakl', 'Country Manager LATAM', 20, 'cv_ready', 'Workable', 'cv_renato_kialka_mirakl_country_manager_latam.pdf', 'https://apply.workable.com/mirakl-careers/j/5AB3422ADB/', null, 'Marketplace SaaS. Base/BaseLinker partnerships (Magalu/Amazon/Shopee/Shein = top 4 marketplace operators in Brazil) is a direct hit.', null, false, 'C'),
('Toku', 'Country Manager Brasil', 19, 'cv_ready', 'Workable', 'cv_renato_kialka_toku_country_manager_brasil.pdf', 'https://apply.workable.com/trytoku/j/862487DE51', null, 'Stablecoin payroll fintech. Builder-from-zero angle. Team 6→35+. Base/BaseLinker (fintech-adjacent, payment operators).', null, false, 'C'),
('Revenue3', 'Country Manager Brazil', 19, 'cv_ready', 'LinkedIn Easy Apply', 'cv_renato_kialka_revenue3_country_manager_brazil.docx', 'https://www.linkedin.com/jobs/view/4397755352/', null, 'Fintech cross-border payments/stablecoins. Easy Apply available.', null, false, 'C'),
('ActiveCampaign', 'Manager, Sales (Trilingual)', 18, 'cv_ready', 'Lever', 'cv_renato_kialka.pdf', 'https://jobs.lever.co/activecampaign/b1024f69-38af-4840-ac2b-ae1a9b80db4c', null, 'MarTech/CRM SaaS. Remote LATAM. ⚠️ Requires PT+ES+EN — verify Spanish before applying.', null, false, 'B'),
('Insider.', 'Sales Manager, Brazil', 18, 'cv_ready', 'Lever', 'cv_renato_kialka.pdf', 'https://jobs.lever.co/useinsider/d025e433-f419-4070-84de-7618db9b7916', null, 'B2B AI SaaS, Unicorn Sequoia. Retail/eComm fit (Magalu/Amazon/Shopee/Shein). SP. ⚠️ Manager level — below usual seniority.', null, false, 'C'),
('Salesforce', 'RVP, Sales Brazil', 18, 'cv_ready', 'Workday', 'cv_renato_kialka_salesforce_rvp_sales_brazil.pdf', 'https://careers.salesforce.com/en/jobs/jr324606/rvp-sales/', null, 'Retail & Consumer Goods segment. Magalu/Amazon/Shopee/Shein = direct fit. Gympass enterprise (DuPont/P&G/SAP/Oracle) reinforces enterprise AE management.', null, false, 'C'),
('Crypto.com', 'Country Manager Brazil', 18, 'cv_ready', 'Lever', 'cv_renato_kialka_cryptocom_country_manager_brazil.pdf', 'https://jobs.lever.co/crypto/43a8cabf-4d76-4274-894d-f8ac6bf2b5a5', null, 'Digital assets/payments. Base/BaseLinker as country CEO (entity, banking, regulatory). SP Hybrid.', null, false, 'C'),
('Meta', 'Enterprise Tech Sales Director LATAM', 18, 'cv_ready', 'Meta Careers', 'cv_renato_kialka_meta_enterprise_sales_director_latam.docx', 'https://www.linkedin.com/jobs/view/4393621624/', null, 'Business Messaging & AI. 0-to-1 product launch, player-coach leadership, LATAM GTM.', null, false, 'C'),
('EBANX', 'Country Manager Brazil', null, 'cv_ready', 'Greenhouse', 'cv_renato_kialka_ebanx_country_manager_brazil.docx', 'https://boards.greenhouse.io/ebanx', null, 'Cross-border payments fintech. Partnerships with Magalu/Amazon/Shopee/Shein = payment ecosystem fit. ⚠️ Requires fluent Spanish.', null, false, 'C'),
('Aleph (Spotify LATAM)', 'Head of Sales', null, 'cv_ready', 'Lever', 'cv_renato_kialka_aleph_head_of_sales_spotify_latam.docx', 'https://jobs.lever.co/aleph', null, 'Spotify ad sales partner (80+ markets). LATAM leadership, C-level, platform revenue. Moderate fit (ad/media sales, not pure B2B SaaS).', null, false, 'C'),
('Mastercard', 'VP Account Management', 17, 'cv_ready', 'Mastercard Careers', 'cv_renato_kialka_mastercard_vp_account_management.docx', 'https://www.linkedin.com/jobs/view/4373173178/', null, 'LAC regional client P&L. Magalu/Amazon/Shopee/Shein = payment ecosystem fit. Hybrid SP.', null, false, 'C'),
('Cabify', 'Head of Sales LATAM', 14, 'cv_ready', 'Greenhouse', 'cv_renato_kialka.pdf', 'https://boards.greenhouse.io/cabify/jobs/5141417002', null, 'B2B mobility LATAM. ⚠️ Listed for Santiago/Buenos Aires — confirm remote-from-SP before applying.', null, false, 'C'),
('Google', 'Director Brazil Google Cloud Sales', null, 'cv_ready', 'Google Careers', 'cv_renato_kialka_google_director_cloud_sales_brazil.docx', 'https://www.linkedin.com/jobs/view/4397188685/', null, 'Big Tech — apply always regardless of score.', null, false, 'C'),
('AWS', 'Manager Brazil AGS', null, 'cv_ready', 'amazon.jobs', 'cv_renato_kialka_aws_manager_brazil_ags.docx', 'https://www.amazon.jobs/en/jobs/A10379150', null, 'Big Tech — apply always regardless of score.', null, false, 'C'),
('Zebra Technologies', 'Senior Director Sales Brazil', null, 'cv_ready', 'LinkedIn', 'cv_renato_kialka_zebra_senior_director_sales_brazil.docx', 'https://www.linkedin.com/jobs/view/4395570398/', null, null, null, false, 'C'),
('Wellhub (Gympass)', 'Digital Sales Director SMB', 20, 'closed', 'startup.jobs', null, null, null, 'Job no longer available when attempted.', null, false, 'C'),
('Sensor Tower', 'Country Manager Brazil', 20, 'closed', 'Lever', null, null, null, '404 on Lever when attempted.', null, false, 'C'),
('Degreed', 'Regional VP Sales LATAM', 20, 'closed', 'Greenhouse', null, null, null, 'Greenhouse returned error when attempted.', null, false, 'C'),
('Mirakl', 'Country Manager LATAM', 20, 'closed', 'Workable', null, null, null, 'Job no longer available on Workable.', null, false, 'C'),
('RateGain', 'Associate Director of Sales LATAM', 10, 'skip', null, null, null, null, 'TravelTech vertical (hotels/OTAs) — incompatible sector.', null, false, 'C'),
('Mindbody (Playlist)', 'Team Lead, Sales Development', 7, 'skip', null, null, null, null, 'SDR team lead — too junior (3-6 years exp required).', null, false, 'A'),
('D Prime', 'Sales Director Brazil', 11, 'skip', null, null, null, null, 'CFD/forex broker — requires financial trading experience.', null, false, 'C');

-- Seed: daily logs
insert into jh_logs (session_date, session_name, summary, details, applications_count, source) values
('2026-04-02', 'Session 1 — First Applications', 'First LinkedIn Easy Apply submissions. Set up workspace and tracker.', 'Applied to Hellotext via LinkedIn Easy Apply. Set up job-hunter-cowork workspace. Created SKILL.md with full candidate profile.', 1, 'cowork'),
('2026-04-06', 'Session 2 — Action Plan', 'Created prioritized action plan with 10 top roles. Generated tailored CVs.', 'Built action-plan.md with 10 prioritized roles. Generated CVs in batch via gen_cvs.mjs. Created outreach messages for LinkedIn.', 0, 'cowork'),
('2026-04-11', 'Session 3 — LinkedIn Expanded', 'Expanded LinkedIn search + Trampos + Indeed. Applied to 4 roles.', 'Applied to Luxoft (LinkedIn Easy Apply), Confidential SMB (Easy Apply), GraceMark (Easy Apply), Designity (3-page form). Thomson Reuters identified — awaits manual login.', 4, 'cowork'),
('2026-04-11', 'Session 4 — External ATSs', 'Attempted 7 external ATS applications. 4 were already closed.', '4 of 7 targeted roles already closed (Wellhub, Sensor Tower, Degreed, Mirakl). Filled Yuno (Lever) and Toptal forms — awaiting manual CV upload + submit. Thomson Reuters requires Workday login.', 2, 'cowork'),
('2026-04-11', 'Session 5 — CV Generation Batch', 'Generated tailored CVs for Degreed, Salesforce, Crypto.com.', 'Ran gen_cvs_today.mjs. Generated 3 new tailored PDFs. Scored 6 additional roles identified on LinkedIn.', 0, 'cowork'),
('2026-04-13', 'Session 6 — Pipeline Review', 'Identified Vimeo (top priority), ActiveCampaign, Insider, Cabify. Built CLAUDE.md documentation.', 'Vimeo flagged as top priority (score 20, SP-based, LATAM scope). Generated CVs for Google, AWS, Zebra. Built comprehensive CLAUDE.md for CLI onboarding.', 0, 'cowork');
