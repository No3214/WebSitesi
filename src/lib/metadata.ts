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
    default: "Kozbeyli Konağı | Taş Butik Otel & Restoran | Foça",
    template: "%s | Kozbeyli Konağı",
  },
  description:
    "Foça Kozbeyli’de taş mimariyle harmanlanmış butik otel konforu, gurme restoran deneyimi ve unutulmaz etkinlik alanları.",
  keywords: ["butik otel", "foça otelleri", "kozbeyli", "taş ev", "restoran", "düğün mekanları", "ege mutfağı"],
  verification,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: absoluteUrl("/"),
    siteName: "Kozbeyli Konağı",
    title: "Kozbeyli Konağı | Taş Butik Otel & Restoran | Foça",
    description:
      "Foça’nın kalbinde huzur, lezzet ve zarafet. Taş mimari odalarımız ve eşsiz restoranımızla sizi bekliyoruz.",
    images: [
      {
        url: absoluteUrl("/og-image.jpg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Dış Görünüm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı | Foça",
    description: "Taş butik otel ve gurme restoran deneyimi.",
    images: [absoluteUrl("/og-image.jpg")],
  },
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
