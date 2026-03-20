import { Metadata } from "next";
import { OrganizationsClient } from "@/components/organizations-client";
import { JsonLd, breadcrumbSchema, eventSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Düğün & Kurumsal Etkinlikler | Kozbeyli Konağı",
  description: "Foça'da tescilli taş konak avlusunda masalsı düğünler ve kurumsal 'off-site' toplantılar. 200 kişiye kadar kapasite ve uzman organizasyon ekibi.",
  keywords: ["foça düğün mekanları", "izmir butik düğün", "kurumsal toplantı mekanları izmir", "kozbeyli organizasyon", "taş ev düğünü"],
  alternates: { canonical: "/organizasyonlar" },
  openGraph: {
    title: "Düğün & Kurumsal Etkinlikler | Kozbeyli Konağı",
    description: "Foça'da tescilli taş konak avlusunda masalsı düğünler ve kurumsal 'off-site' toplantılar.",
    images: [
      {
        url: "/images/rooms/aile-1.jpeg",
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Organizasyon Mekanı",
      },
    ],
  },
};

export default function OrganizationsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Organizasyonlar" },
          ]),
          eventSchema({
            name: "Kozbeyli Konağı Organizasyonlar",
            description:
              "Foça'da tescilli taş konak avlusunda masalsı düğünler ve kurumsal 'off-site' toplantılar. 200 kişiye kadar kapasite ve uzman organizasyon ekibi.",
          }),
        ]}
      />
      <OrganizationsClient />
    </>
  );
}
