import { Metadata } from "next";
import { WeddingClient } from "./wedding-client";

export const metadata: Metadata = {
  title: "Düğün & Özel Organizasyon",
  description:
    "Kozbeyli Konağı'nda butik düğün, nişan, kına ve özel kutlamalar. 500 yıllık taş avluda 60 kişilik samimi organizasyonlar. Foça'da unutulmaz bir gün.",
  alternates: { canonical: "/dugun-organizasyon" },
};

export default function WeddingPage() {
  return <WeddingClient />;
}
