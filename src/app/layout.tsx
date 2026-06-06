import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { ConversionMotivators } from "@/components/conversion-motivators";
import { CookieConsent } from "@/components/cookie-consent";
import { DigitalConcierge } from "@/components/digital-concierge";
import { SiteFooter } from "@/components/site-footer";
import { TrackingScripts } from "@/components/tracking-scripts";
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

import { ReputationRibbon } from "@/components/reputation-ribbon";

import { ConversionVelocity } from "@/components/conversion-velocity";
import { AtmosphericImmersion } from "@/components/atmospheric-immersion";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-playfair" });

export const metadata = defaultMetadata;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema()) }}
        />
        <ErrorBoundary>
          <CSPostHogProvider>
            <Suspense fallback={null}>
              <LoadingBar />
            </Suspense>
            <ReputationRibbon />
            <ConversionVelocity />
            <AtmosphericImmersion />
            <TrackingScripts />
            {children}
            <SiteFooter />
            <FloatingContact />
            <ExitIntent />
            <SunsetMode />
            <MobileActionBar />
            <DigitalConcierge />
            <ConversionMotivators />
            <CookieConsent />
          </CSPostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
