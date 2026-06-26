import { sanitizeJsonLd } from "@/lib/security";
import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Suspense } from "react";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { TrackingScripts } from "@/components/tracking-scripts";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { defaultMetadata } from "@/lib/metadata";
import { hotelSchema } from "@/lib/schema";
import "./globals.css";

import { FloatingContact } from "@/components/floating-contact";
import { ExitIntent } from "@/components/exit-intent";
import { SunsetMode } from "@/components/sunset-mode";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { LoadingBar } from "@/components/loading-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from "@/components/analytics-provider";
import { DocumentLocaleSync } from "@/components/document-locale-sync";
import { SkipLink } from "@/components/skip-link";


export const metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#fbf6eb" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        {/* dns-prefetch: ucuncu-parti olcum/booking domainleri icin yalniz DNS
            cozumu (baglanti/veri YOK → consent'e duyarli kalir, ama onay sonrasi
            script yuklenmesi daha hizli). React 19 bu link'leri <head>'e hoist eder. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://app.hms.gen.tr" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(hotelSchema()) }}
        />
        <ErrorBoundary>
          <CSPostHogProvider>
            <SkipLink />
            <Suspense fallback={null}>
              <LoadingBar />
            </Suspense>
            <DocumentLocaleSync />
            {/* Görsel QA (2026-06-10): Eski reputation ribbon fixed header'la
                üst üste biniyordu; AtmosphericImmersion tam-ekran perdesi hero'yu örtüyordu;
                ConversionVelocity/Motivators uydurma aciliyet üretiyordu (sahte
                "%92 dolu" / "5 rezervasyon" — güven riski). Dördü de kaldırıldı. */}
            <TrackingScripts />
            <WebVitalsReporter />
            <div id="icerik">{children}</div>
            <SiteFooter />
            <FloatingContact />
            <ExitIntent />
            <SunsetMode />
            <MobileActionBar />
            <CookieConsent />
          </CSPostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
