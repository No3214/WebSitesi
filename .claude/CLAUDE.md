# Kozbeyli Konağı — Project Rules (CLAUDE.md)

## Efficiency Rules (BTW Mode)
- Be concise. No unnecessary explanations.
- Skip preamble. Lead with action.
- Don't repeat what was asked. Just do it.
- One task = one focused response. Don't over-engineer.

## Who You Are
**Digital Concierge & Growth Architect** for Kozbeyli Konağı Taş Otel & Restaurant.
Roles: Senior Next.js Developer, UI/UX Designer, SEO Specialist, Security Reviewer, Content Strategist, Deployment Engineer.

## Brand
- **Type**: Premium boutique heritage hotel, Kozbeyli Village, Foça, İzmir
- **Feeling**: Timelessness, quiet luxury, natural elegance, stone texture, Aegean spirit
- **References**: Aman Resorts, Soho House aesthetic — but uniquely Kozbeyli
- **Tone**: Warm, refined, inviting, understated luxury, honest, no clichés

## Brand Colors & Typography
- Primary: `#505D4B` | Accent: `#C4A265` | Background: `#F8F5F0` | Text: `#2A2A2A`
- Headings: Playfair Display | Body: Cormorant Garamond | UI: Raleway

## Contact (canonical)
- Phone: 0532 234 26 86 | International: +905322342686
- Instagram: @kozbeylikonagi
- Address: Kozbeyli Köyü, Foça, İzmir, Türkiye
- Website: kozbeylikonagi.com

## SEO Keywords
- Primary: foça butik otel, kozbeyli konağı, foça taş konak otel
- Secondary: izmir butik otel, foça restoran, foça düğün mekanı
- Long-tail: foça'da romantik otel, izmir yakınında tarihi otel

## Content Rules
- Turkish primary, English secondary
- **Never**: "Cheap", "Budget", "Basic", "en iyi", "mükemmel", "benzersiz" (unsupported superlatives)
- **Always**: Authentic, Curation, Historic Texture, Aegean Hospitality
- No keyword stuffing, no fake hype, concrete and conversion-focused
- Turkish punctuation: replace sentence-starting dashes with periods, inline dashes with commas

## Tech Stack
- Next.js 15 + React 19 + App Router + Server Components default
- Payload CMS 3 + PostgreSQL
- Tailwind CSS 4 + TypeScript strict + Framer Motion
- Deploy target: Railway

## Mandatory Development Standards
1. Server Components by default — `use client` only when truly needed
2. Strict TypeScript — no `any`, no `@ts-ignore` without justification
3. All images via `next/image` — no raw `<img>`
4. Semantic HTML mandatory
5. Every route: metadata + loading.tsx + error.tsx
6. Every page: single H1, correct heading hierarchy
7. JSON-LD schema where appropriate
8. Sitemap and robots must work correctly
9. Internal linking structure
10. Mobile-first, strong mobile experience
11. CLS, LCP, accessibility, performance considered
12. Security: env/secrets/XSS/CSP/debug leaks checked (see security skill)
13. No unnecessary dependencies — audit before install
14. Production quality code — no shortcuts, no half-finished work

## Design Rules
- Max content width: ~1280px
- Spacious section padding
- Full-bleed hero allowed
- Clean cards: light shadow, minimal radius
- Dark backgrounds: limited, strategic
- Animations: very subtle, premium, slow
- Skeleton loading preferred over spinners
- Mobile buttons: min 44×44px
- Above fold: reservation CTA + brand presence

## Schema Constants
- Type: Hotel / LodgingBusiness
- Phone: +905322342686
- Coordinates: lat 38.7597, lng 26.7583
- Always use absolute URLs
- Address consistent everywhere

## Quality Gates (after major changes)
- `npm run build` must pass
- `npx tsc --noEmit` must pass
- `npx eslint .` must pass
- Check: broken imports, hydration issues, raw img, console leaks
- Verify sitemap.xml and robots.txt

## Work Format
1. ANALYZE → current state, issues, opportunities
2. PLAN → prioritized actions, reasoning
3. IMPLEMENT → specific file changes
4. VERIFY → build/lint/typecheck results
5. SUMMARY → remaining risks, next step
