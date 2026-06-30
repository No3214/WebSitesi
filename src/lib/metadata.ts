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

/**
 * Sayfa-bazlı canonical + hreflang (TR/EN + x-default).
 * Sayfalar `...defaultMetadata` yayıp `alternates` set ettiğinde languages
 * DÜŞÜYORDU (alternates objesi tümüyle eziliyor). Bu helper canonical ile
 * birlikte languages'i de korur → `<head>`'de hreflang link'leri üretilir.
 */
export function altLanguages(tr: string, en: string) {
  return {
    canonical: tr,
    languages: { tr, en, "x-default": tr },
  } as const;
}

/**
 * EN tarafı için aynı hreflang seti, ama canonical EN sayfanın kendisidir
 * (self-referencing canonical). TR ve EN aynı dil setini bildirir → karşılıklı
 * (reciprocal) hreflang. x-default daima TR (sitenin birincil dili).
 */
export function altLanguagesEn(tr: string, en: string) {
  return {
    canonical: en,
    languages: { tr, en, "x-default": tr },
  } as const;
}

type EnOpenGraphInput = {
  url?: string;
  title?: string;
  description?: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
};

/**
 * EN sayfalar kendi `openGraph` objelerini set ettiğinde Next.js parent (root)
 * openGraph'ı TÜMÜYLE eziyor → og:locale / og:site_name / og:type düşüyor.
 * Bu helper her EN sayfada en_US locale + website type + siteName'i korur,
 * sayfanın kendi url/title/description/images alanlarını üstüne yazar.
 */
export function enOpenGraph(input: EnOpenGraphInput): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "en_US",
    siteName: "Kozbeyli Konağı",
    ...input,
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Kozbeyli Konağı | Taş Butik Otel & Restoran | Foça",
    template: "%s | Kozbeyli Konağı",
  },
  description:
    "Foça Kozbeyli’de beş asırlık köy dokusu içinde 19. yüzyıl tescilli taş konak, butik konaklama ve gurme restoran deneyimi.",
  keywords: [
    "kozbeyli konağı",
    "foça butik otel",
    "izmir butik oteller",
    "tarihi taş butik otel",
    "tarihi taş konak",
    "kozbeyli kahvaltı",
    "kozbeyli köyü serpme kahvaltı",
    "kozbeyli dibek kahvesi",
    "yetişkin oteli foça",
    "taş ev konaklama izmir",
    "ege mutfağı gurme restoran",
    "antakya mutfağı izmir",
    "evcil hayvan kabul eden taş otel",
    "horasan harçlı mimari otel",
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
    // hreflang: TR kök, EN /en (T16)
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
    title: "Kozbeyli Konağı | Taş Butik Otel & Ege Restoranı | Foça",
    description:
      "Tarihin kalbinde taş mimari odalar, Antakya & Ege mutfağı ve Kozbeyli köy dokusuna yakın sakin bir konaklama deneyimi.",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — 19. yüzyıl tescilli taş konak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kozbeylikonagi",
    creator: "@kozbeylikonagi",
    title: "Kozbeyli Konağı | Foça Taş Butik Otel & Restoran",
    description: "Taş mimari, gurme lezzetler ve eşsiz bir Ege köyü hikayesi.",
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
