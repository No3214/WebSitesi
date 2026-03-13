import { Metadata } from "next";
import { OrganizationsClient } from "@/components/organizations-client";

export const metadata: Metadata = {
  title: "Düğün & Kurumsal Etkinlikler | Kozbeyli Konağı",
  description: "Foça'da tescilli taş konak avlusunda masalsı düğünler ve kurumsal 'off-site' toplantılar. 200 kişiye kadar kapasite ve uzman organizasyon ekibi.",
  keywords: ["foça düğün mekanları", "izmir butik düğün", "kurumsal toplantı mekanları izmir", "kozbeyli organizasyon", "taş ev düğünü"],
};

export default function OrganizationsPage() {
  return <OrganizationsClient />;
}
