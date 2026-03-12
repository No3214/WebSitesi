import type { ReactNode } from "react";

import { CookieConsent } from "@/components/cookie-consent";
import { DigitalConcierge } from "@/components/digital-concierge";
import { SiteFooter } from "@/components/site-footer";
import { TrackingScripts } from "@/components/tracking-scripts";
import { WhatsAppBridge } from "@/components/whatsapp-bridge";
import { defaultMetadata } from "@/lib/metadata";
import { hotelSchema } from "@/lib/schema";
import "./globals.css";

export const metadata = defaultMetadata;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <TrackingScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema()) }}
        />
        {children}
        <SiteFooter />
        <WhatsAppBridge />
        <DigitalConcierge />
        <CookieConsent />
      </body>
    </html>
  );
}
