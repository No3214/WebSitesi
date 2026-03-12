import type { ReactNode } from "react";
import { CookieConsent } from "@/components/cookie-consent";
import { DigitalConcierge } from "@/components/digital-concierge";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppBridge } from "@/components/whatsapp-bridge";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { defaultMetadata } from "@/lib/metadata";
import { hotelSchema } from "@/lib/schema";

import "./globals.css";

export const metadata = defaultMetadata;

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema()) }}
        />
        <AnalyticsScripts gtmId={gtmId} metaPixelId={metaPixelId} />
        {children}
        <SiteFooter />
        <WhatsAppBridge />
        <DigitalConcierge />
        <CookieConsent />
      </body>
    </html>
  );
}
