import type { Metadata } from "next";

import { env } from "@/lib/env";
import { absoluteUrl } from "./utils";

const verification = {
  ...(env.GOOGLE_SITE_VERIFICATION ? { google: env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(env.FACEBOOK_DOMAIN_VERIFICATION
    ? {
        other: {
          "facebook-domain-verification": [env.FACEBOOK_DOMAIN_VERIFICATION],
        },
      }
    : {}),
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Kozbeyli Konağı | Tarihi Taş Butik Otel & Restoran | Foça",
    template: "%s | Kozbeyli Konağı",
  },
  description:
    "Foça Kozbeyli'de 19. yüzyıl tescilli taş konakta butik konaklama, Ege ve Antakya mutfağı ile özel davet deneyimi.",
  keywords: [
    "kozbeyli konağı",
    "foça butik otel",
    "izmir butik otel",
    "tarihi taş butik otel",
    "tarihi taş konak",
    "kozbeyli kahvaltı",
    "kozbeyli köyü serpme kahvaltı",
    "kozbeyli dibek kahvesi",
    "taş ev konaklama izmir",
    "ege mutfağı restoran",
    "antakya mutfağı izmir",
    "kozbeyli düğün mekanı",
  ],
  authors: [{ name: "Kozbeyli Konağı" }],
  creator: "Kozbeyli Konağı",
  publisher: "Kozbeyli Konağı",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  verification,
  alternates: {
    canonical: "/",
    languages: {
      tr: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: absoluteUrl("/"),
    siteName: "Kozbeyli Konağı",
    title: "Kozbeyli Konağı | Tarihi Taş Butik Otel & Restoran | Foça",
    description:
      "Kozbeyli Köyü'nde 19. yüzyıl tescilli taş konakta butik konaklama, Ege ve Antakya mutfağı ile özel davetler.",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — 19. yüzyıl tescilli taş konak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı | Tarihi Taş Butik Otel & Restoran | Foça",
    description: "Kozbeyli'de taş konaklama, yerel gastronomi ve özel davet deneyimi.",
    images: [absoluteUrl("/images/hero.jpg")],
  },
  category: "travel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
