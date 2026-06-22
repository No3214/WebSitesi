import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Gauge,
  Globe2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";

type GateStatus = "verified" | "action_required" | "operator_required";

type LaunchGate = {
  id: string;
  title: string;
  owner: string;
  timing: string;
  status: GateStatus;
  command: string;
  evidence: string;
  kpi: string;
};

const launchGates: LaunchGate[] = [
  {
    id: "canonical_domain",
    title: "Public domain cutover",
    owner: "Vercel / DNS operator",
    timing: "Before public domain announcement",
    status: "verified",
    command: "npm run domain:verify:strict",
    evidence: "docs/evidence/canonical-domain.md",
    kpi: "The .com apex and www public origins return the current app health endpoint, expose the opening video, or securely redirect to the chosen canonical origin.",
  },
  {
    id: "production_database",
    title: "Payload database proof",
    owner: "Platform / CMS operator",
    timing: "Before relying on Payload admin or lead persistence",
    status: "operator_required",
    command: "npm run supabase:verify:strict",
    evidence: "docs/evidence/production-database.md",
    kpi: "Managed Postgres, Payload secret, backup policy and redacted persistence UAT are source-referenced.",
  },
  {
    id: "production_abuse_controls",
    title: "Production abuse controls",
    owner: "Security / platform operator",
    timing: "Before lead capture at scale",
    status: "operator_required",
    command: "npm run abuse:verify:strict",
    evidence: "docs/evidence/production-abuse-controls.md",
    kpi: "Turnstile and shared rate-limit controls accept valid traffic and block replay without logging secrets.",
  },
  {
    id: "hms_booking_engine",
    title: "HMS booking engine UAT",
    owner: "Revenue / booking operator",
    timing: "Before reservation CTA becomes the primary sales path",
    status: "operator_required",
    command: "npm run hms:verify:strict",
    evidence: "docs/evidence/hms-booking-engine.md",
    kpi: "Reservation CTA opens the approved Kozbeyli HMS engine in a new tab and date/guest selection is proven.",
  },
  {
    id: "garanti_pos",
    title: "Garanti Sanal POS evidence",
    owner: "Finance / payment operator",
    timing: "Before card payment launch",
    status: "operator_required",
    command: "npm run garanti:verify:strict",
    evidence: "docs/evidence/garanti-pos.md",
    kpi: "3D Secure success, failed payment, callback verification and refund/cancel flows are redacted and approved.",
  },
  {
    id: "analytics_purchase",
    title: "Analytics and purchase validation",
    owner: "Growth / analytics operator",
    timing: "Before paid acquisition or revenue reporting",
    status: "operator_required",
    command: "npm run analytics:verify:strict",
    evidence: "docs/evidence/analytics-purchase.md",
    kpi: "Consent-gated pageview, lead and booking events appear in GA4/GTM/Meta debug tools without PII.",
  },
  {
    id: "search_local_seo",
    title: "Search and local SEO proof",
    owner: "SEO / local listings operator",
    timing: "Before final canonical launch sign-off",
    status: "operator_required",
    command: "npm run search:verify:strict",
    evidence: "docs/evidence/search-local-seo.md",
    kpi: "Search Console, sitemap, Google Business Profile and Hotel Center states are source-referenced.",
  },
  {
    id: "legal_dpa",
    title: "Legal and vendor approval",
    owner: "Legal / operations owner",
    timing: "Before full booking/payment launch",
    status: "operator_required",
    command: "npm run launch:audit:strict",
    evidence: "docs/evidence/legal-dpa.md",
    kpi: "Vendor DPA, KVKK/privacy coverage and cancellation/payment terms are approved with redacted references.",
  },
];

const verifiedChecks = [
  "Source-controlled release gate: npm run release:verify",
  "Public route smoke set: hero video, location, media and publish routes",
  "Evidence redaction scan: docs/evidence/* must not contain secrets, card data, bank account details, IBAN or guest PII",
  "Reservation handoff contract: approved HMS URL only, opened outside the main page flow",
];

const operatingSop = [
  "Run npm run release:verify before any production deploy.",
  "Run npm run launch:cutover:json and work gates in order.",
  "Collect only redacted source-system evidence in docs/evidence/*.md.",
  "Re-run launch:audit:strict after every external DNS, HMS, POS, analytics or legal update.",
];

const reviewLoop = [
  "Daily until launch: domain, HMS, abuse controls and analytics evidence status.",
  "Weekly after launch: reservation funnel, lead quality, Search Console coverage and blocked form attempts.",
  "After every campaign: consented booking events, Meta/Google Ads attribution and guest inquiry quality.",
];

function statusLabel(status: GateStatus) {
  if (status === "verified") return "Verified";
  if (status === "action_required") return "Action required";
  return "Operator required";
}

function statusClass(status: GateStatus) {
  if (status === "verified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "action_required") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-stone-200 bg-stone-50 text-stone-700";
}

export function GrowthDashboardClient() {
  const blockedGateCount = launchGates.filter((gate) => gate.status !== "verified").length;

  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[#27352b]">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 border border-[#c9b07a]/40 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#a9813b]">
              <LockKeyhole size={16} />
              Payload admin only
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-[#27352b] sm:text-5xl lg:text-6xl">
              Kozbeyli Commercial Launch Control
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5e665d] sm:text-lg">
              Bu panel rastgele metrik veya hayali ajan durumu gostermiyor. Ticari yayina hazirlik yalnizca repo
              kapilari, resmi komutlar ve redakte edilmis kaynak sistem kanitlariyla ilerler.
            </p>
          </div>

          <div className="border border-[#d8c7a3] bg-white p-6 shadow-[0_24px_60px_rgba(56,47,32,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a9813b]">
                  Commercial readiness
                </p>
                <p className="mt-2 text-5xl font-semibold text-[#27352b]">82/100</p>
              </div>
              <Gauge className="text-[#a9813b]" size={42} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="border border-[#eadfc8] bg-[#fbfaf6] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7c6f5c]">Blocked points</p>
                <p className="mt-2 text-2xl font-semibold text-[#8a5c1f]">18</p>
              </div>
              <div className="border border-[#eadfc8] bg-[#fbfaf6] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7c6f5c]">Open gates</p>
                <p className="mt-2 text-2xl font-semibold text-[#8a5c1f]">{blockedGateCount}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#6b6254]">
              Hedef: HMS rezervasyon, POS, analytics, local SEO, database, abuse-control ve hukuk kanitlari tamamlanmadan
              100/100 veya production ready iddiasi kullanilmamali.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          {verifiedChecks.map((check) => (
            <div key={check} className="border border-[#dfd1b5] bg-white p-5">
              <CheckCircle2 className="mb-4 text-[#4f6b45]" size={22} />
              <p className="text-sm leading-6 text-[#4e584d]">{check}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-6">
            <div className="border border-[#dfd1b5] bg-white p-6">
              <div className="mb-5 flex items-center gap-3">
                <ClipboardList className="text-[#a9813b]" size={22} />
                <h2 className="text-xl font-semibold text-[#27352b]">Launch SOP</h2>
              </div>
              <ol className="space-y-4">
                {operatingSop.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[#555f54]">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#efe4ce] text-xs font-semibold text-[#8a5c1f]">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-[#dfd1b5] bg-[#ffffff] p-6">
              <div className="mb-5 flex items-center gap-3">
                <CalendarClock className="text-[#a9813b]" size={22} />
                <h2 className="text-xl font-semibold text-[#27352b]">KPI review loop</h2>
              </div>
              <div className="space-y-4">
                {reviewLoop.map((item) => (
                  <p key={item} className="border-l-2 border-[#c9b07a] pl-4 text-sm leading-6 text-[#555f54]">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="border border-[#ead3a0] bg-[#fff9ec] p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 shrink-0 text-[#a66b16]" size={20} />
                <p className="text-sm leading-6 text-[#6c552f]">
                  Public sayfalarda premium deneyim gosterilebilir; bu admin panelinde ise yalnizca kanitlanmis veya
                  kanit bekleyen operasyon durumu gosterilir.
                </p>
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-4 border border-[#dfd1b5] bg-white p-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a9813b]">Gate sequence</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#27352b]">100/100 icin kalan kanit akisi</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5f675d]">
                <ShieldCheck size={18} className="text-[#4f6b45]" />
                Fail closed until evidence is ready
              </div>
            </div>

            {launchGates.map((gate) => (
              <article key={gate.id} className="border border-[#dfd1b5] bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(gate.status)}`}>
                        {statusLabel(gate.status)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b806f]">{gate.id}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#27352b]">{gate.title}</h3>
                  </div>
                  <Globe2 className="text-[#a9813b]" size={24} />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="border border-[#efe4ce] bg-[#fbfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b806f]">Owner / timing</p>
                    <p className="mt-2 text-sm leading-6 text-[#4d584d]">
                      {gate.owner} - {gate.timing}
                    </p>
                  </div>
                  <div className="border border-[#efe4ce] bg-[#fbfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b806f]">Command</p>
                    <code className="mt-2 block break-words text-sm text-[#27352b]">{gate.command}</code>
                  </div>
                  <div className="border border-[#efe4ce] bg-[#fbfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b806f]">Evidence</p>
                    <code className="mt-2 block break-words text-sm text-[#27352b]">{gate.evidence}</code>
                  </div>
                  <div className="border border-[#efe4ce] bg-[#fbfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b806f]">KPI</p>
                    <p className="mt-2 text-sm leading-6 text-[#4d584d]">{gate.kpi}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>

        <section className="mt-12 border border-[#d8c7a3] bg-[#27352b] p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#d8bd7b]">
                <FileCheck2 size={20} />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">Next operator handoff</span>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-[#f7f4ec]">
                Vercel CLI kurulumu ve login sonrasinda domain/env/deploy kanitlari ayni sira ile tamamlanmali:
                npm i -g vercel, vercel login, vercel whoami, npm run launch:cutover:json.
              </p>
            </div>
            <div className="border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-[#f6e6bd]">
              No secrets or bank details in repo evidence
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
