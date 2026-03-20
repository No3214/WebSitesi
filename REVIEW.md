# Code Review Guidelines — Kozbeyli Konağı

## Always Check
- New API endpoints have rate limiting and input validation
- User-facing strings support both Turkish (TR) and English (EN) locales
- Images use Next.js `<Image>` component with `alt`, `sizes`, and priority where needed
- Form submissions validate with Zod schemas before processing
- External links have `rel="noopener noreferrer"` and `target="_blank"`
- No hardcoded secrets, API keys, or credentials in source code
- All pages have `export const metadata` with title, description, and canonical URL
- Schema.org JSON-LD is present on content pages (Hotel, HotelRoom, Restaurant, FAQ, BreadcrumbList)
- Client components use `useDictionary()` hook, not direct `getDictionary()` calls
- Room data uses `localizeRoom()` for locale-aware rendering

## Security
- API routes validate `Content-Length` and enforce body size limits
- Client-submitted messages never use `role: "system"` in AI chat
- Lead/contact forms use Turnstile CAPTCHA verification
- Webhook endpoints verify HMAC signatures before processing
- No `eval()`, `dangerouslySetInnerHTML` with user input, or template injection vectors
- Sensitive data (IP addresses, tokens) is not logged in plaintext

## Performance
- Avoid inline `style={{}}` objects in frequently re-rendered components — use CSS classes
- Images below the fold should not have `priority={true}`
- Use `loading.tsx` for route-level loading states
- Dictionary should be fetched once via `DictionaryProvider`, not per-component

## SEO
- Every page must have unique `<title>` and `<meta description>`
- `alternates.canonical` must be set on every page
- OG images should be contextually relevant to the page content
- BreadcrumbList schema should reflect actual page hierarchy
- Room pages must include HotelRoom + Offer structured data

## Accessibility
- Interactive elements must be keyboard accessible (focusable, Enter/Space activation)
- Modals/overlays must trap focus and close on Escape
- Images must have descriptive `alt` text (not empty unless decorative)
- Color contrast must meet WCAG 2.1 AA (4.5:1 for text)

## Skip
- Generated files under `node_modules/`
- Lock file changes (`package-lock.json`)
- Storybook stories under `src/stories/`
- Build output (`.next/`, `out/`)
- Formatting-only changes
