import { Metadata } from "next";
import { CorporateClient } from "./corporate-client";

export const metadata: Metadata = {
  title: "Kurumsal Etkinlikler & Retreat",
  description:
    "Kozbeyli Konağı'nda kurumsal toplantı, team building, off-site retreat ve workshop organizasyonları. Foça'da doğayla iç içe kurumsal etkinlik.",
  alternates: { canonical: "/kurumsal" },
};

export default function CorporatePage() {
  return <CorporateClient />;
}
