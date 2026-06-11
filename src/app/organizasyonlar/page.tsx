import { Metadata } from "next";
import { OrganizationsClient } from "@/components/organizations-client";

import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Düğün & Özel Davetler",
  description: "Foça'da tescilli taş konak avlusunda masalsı butik düğünler, nişan davetleri ve kurumsal 'off-site' toplantılar. Uzman organizasyon ekibi ve şık detaylar.",
  keywords: [
    "foça düğün mekanları",
    "izmir butik düğün",
    "kurumsal toplantı mekanları izmir",
    "kozbeyli organizasyon",
    "taş ev düğünü",
    "butik nişan yeri izmir"
  ],
  alternates: { canonical: "/organizasyonlar" },
  openGraph: {
    title: "Düğün & Özel Davetler | Kozbeyli Konağı",
    description: "Foça'da tescilli taş konak avlusunda masalsı butik düğünler, nişan davetleri ve kurumsal 'off-site' toplantılar.",
    url: absoluteUrl("/organizasyonlar"),
    images: [
      {
        url: absoluteUrl("/images/odalar/aile-odasi-4-kisilik/1.jpg"),
        alt: "Kozbeyli Konağı'nın taş duvarlı, panoramik pencereli geniş aile odası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Düğün & Davet Organizasyonları",
    description: "Tescilli taş konak avlusunda masalsı butik düğünler ve kurumsal toplantılar.",
    images: [absoluteUrl("/images/odalar/aile-odasi-4-kisilik/1.jpg")],
  }
};

export default function OrganizationsPage() {
  return <OrganizationsClient />;
}
