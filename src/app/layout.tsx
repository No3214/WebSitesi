import type { ReactNode } from "react";
import { ConversionMotivators } from "@/components/conversion-motivators";
import { CookieConsent } from "@/components/cookie-consent";
import { DigitalConcierge } from "@/components/digital-concierge";
import { SiteFooter } from "@/components/site-footer";
import { TrackingScripts } from "@/components/tracking-scripts";
import { defaultMetadata } from "@/lib/metadata";
import { defaultMetadata } from "@/lib/metadata";
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

export const metadata = defaultMetadata;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <ErrorBoundary>
          <CSPostHogProvider>
            <LoadingBar />
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
