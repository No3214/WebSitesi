import { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { faqs } from "@/data/faqs";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Check-in saatleri, aileler, organizasyon rezervasyonları ve konaklama detayları. Kozbeyli Konağı hakkında en çok sorulan soruların yanıtları.",
  alternates: { canonical: "/sss" },
  openGraph: {
    title: "Sık Sorulan Sorular | Kozbeyli Konağı",
    description: "Konaklama ve rezervasyon hakkında merak edilenler.",
    url: absoluteUrl("/sss"),
  },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q.tr,
      acceptedAnswer: { "@type": "Answer", text: faq.a.tr },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="SIK SORULANLAR"
          title="Merak Ettikleriniz"
          text="Konaklamanızı planlarken en çok sorulan soruları bir araya getirdik. Yanıtını bulamadığınız her detay için concierge ekibimiz bir mesaj uzağınızda."
        />

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="faq-static-item" open={idx === 0}>
                    <summary className="faq-static-q">{faq.q.tr}</summary>
                    <p className="faq-static-a">{faq.a.tr}</p>
                  </details>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 40 }}>
                <Link className="button gold" href="/rezervasyon">
                  Rezervasyon Yapın
                </Link>
                <Link className="button secondary" href="/iletisim">
                  Başka Sorunuz mu Var?
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
