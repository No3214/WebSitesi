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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap"
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
