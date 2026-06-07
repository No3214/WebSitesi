import { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { faqs } from "@/data/faqs";
import { getDictionary } from "@/lib/dictionary";
import { defaultMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Kozbeyli Konağı | Foça’nın En Prestijli Taş Butik Oteli & Restoranı",
  description: "Foça Kozbeyli’de 500 yıllık tescilli taş mimari, Antakya & Ege mutfağı ve kişiselleştirilmiş hizmet. Horasan harcıyla dokunmuş huzur ve sükunet.",
  alternates: {
    canonical: "/",
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q.tr,
    acceptedAnswer: { "@type": "Answer", text: f.a.tr },
  })),
};

export default async function HomePage() {
  // SSR/SSG: TR sözlüğü build'de gömülür → ilk boyamada içerik dolu (loading-screen yok).
  const initialDict = await getDictionary("tr");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient initialDict={initialDict} initialLocale="tr" />
    </>
  );
}
