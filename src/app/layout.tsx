import type { ReactNode } from "react";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { TrackingScripts } from "@/components/tracking-scripts";
import { defaultMetadata } from "@/lib/metadata";
import "./globals.css";

import { FloatingContact } from "@/components/floating-contact";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from "@/components/analytics-provider";

export const metadata = defaultMetadata;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ErrorBoundary>
          <CSPostHogProvider>
            <TrackingScripts />
            {children}
            <SiteFooter />
            <FloatingContact />
            <MobileActionBar />
            <CookieConsent />
          </CSPostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
