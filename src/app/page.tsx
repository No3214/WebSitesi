import { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { faqs } from "@/data/faqs";
import { getDictionary } from "@/lib/dictionary";
import { defaultMetadata } from "@/lib/metadata";

type HomeLocale = "tr" | "en";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Kozbeyli Konağı | Foça Taş Butik Otel & Restoran",
  description: "Foça’da beş asırlık köy dokusu içinde 19. yüzyıl tescilli taş konak, Antakya & Ege mutfağı ve kişiselleştirilmiş hizmet.",
  alternates: {
    canonical: "/",
  }
};

const buildFaqJsonLd = (locale: HomeLocale) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q[locale],
    acceptedAnswer: { "@type": "Answer", text: f.a[locale] },
  })),
});

export async function HomePageContent({ locale = "tr" }: { locale?: HomeLocale }) {
  // SSR/SSG: build embeds the correct dictionary for the active route, so /en
  // does not rely on a client cookie correction for its first meaningful paint.
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
};

export default async function HomePage() {
  return <HomePageContent locale="tr" />;
}
