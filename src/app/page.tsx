import { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { faqs } from "@/data/faqs";
import { getDictionary } from "@/lib/dictionary";
import { defaultMetadata } from "@/lib/metadata";

type HomeLocale = "tr" | "en";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Kozbeyli Konağı | Tarihi Taş Butik Otel & Restoran | Foça",
  description:
    "Foça'da beş asırlık köy dokusu içinde 19. yüzyıl tescilli taş konak, Ege ve Antakya mutfağı ile kişiselleştirilmiş konaklama.",
  alternates: {
    canonical: "/",
  },
};

const buildFaqJsonLd = (locale: HomeLocale) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q[locale],
    acceptedAnswer: { "@type": "Answer", text: faq.a[locale] },
  })),
});

export async function HomePageContent({ locale = "tr" }: { locale?: HomeLocale }) {
  const initialDict = await getDictionary(locale);
  const faqJsonLd = buildFaqJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient initialDict={initialDict} initialLocale={locale} />
    </>
  );
}

export default async function HomePage() {
  return <HomePageContent locale="tr" />;
}
