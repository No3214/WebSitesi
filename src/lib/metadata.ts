import type { Metadata } from "next";

import { env } from "@/lib/env.server";
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
    "Foça Kozbeyli’de 500 yıllık Osmanlı taş mimarisiyle butik konaklama ve gurme restoran deneyimi. Köy kahvaltısı, Ege & Antakya mutfağı ve huzur dolu bir tatil.",
  keywords: [
    "kozbeyli konağı",
    "foça butik otel",
    "izmir butik oteller",
    "kozbeyli köyü otel",
    "taş ev konaklama",
    "organik köy kahvaltısı izmir",
    "antakya mutfağı izmir",
    "ege mutfağı restoran",
    "doğa tatili foça",
    "evcil hayvan dostu butik otel",
  ],
  authors: [{ name: "Kozbeyli Konağı Team" }],
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
      "tr-TR": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: absoluteUrl("/"),
    siteName: "Kozbeyli Konağı",
    title: "Kozbeyli Konağı | Lüks Taş Butik Otel & Gurme Restoran | Foça",
    description:
      "Tarihin kalbinde, lüks ve konforun buluşma noktası. Taş mimari odalar, ödüllü mutfak ve Ege'nin en huzurlu köyü Kozbeyli'de sizi bekliyoruz.",
    images: [
      {
        url: absoluteUrl("/img/hero-main.jpg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Genel Görünüm",
      },
      {
        url: absoluteUrl("/img/stone-room-premium.jpg"),
        width: 1200,
        height: 630,
        alt: "Lüks Taş Oda Deneyimi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kozbeylikonagi",
    creator: "@kozbeylikonagi",
    title: "Kozbeyli Konağı | Foça'nın En Prestijli Butik Oteli",
    description: "Taş mimari, gurme lezzetler ve eşsiz bir Ege köyü hikayesi.",
    images: [absoluteUrl("/img/hero-main.jpg")],
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
