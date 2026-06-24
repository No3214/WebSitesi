import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { faqs } from "@/data/faqs";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";
import { sanitizeJsonLd } from "@/lib/security";

type Locale = "tr" | "en";

const faqPageCopy = {
  tr: {
    eyebrow: "SIK SORULANLAR",
    title: "Merak Ettikleriniz",
    text: "Konaklamanızı planlarken en çok sorulan soruları bir araya getirdik. Yanıtını bulamadığınız her detay için misafir ilişkileri ekibimiz bir mesaj uzağınızda.",
    booking: "Rezervasyon Yapın",
    contactHref: "/iletisim",
    contact: "Başka Sorunuz mu Var?",
  },
  en: {
    eyebrow: "FAQ",
    title: "Before You Arrive",
    text: "We gathered the questions guests ask most while planning a stay. For anything more specific, our guest relations team is one message away.",
    booking: "Book Your Stay",
    contactHref: "/en/iletisim",
    contact: "Ask Another Question",
  },
};

export function FaqPageContent({ locale = "tr" }: { locale?: Locale }) {
  const copy = faqPageCopy[locale];
  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q[locale],
      acceptedAnswer: { "@type": "Answer", text: faq.a[locale] },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(faqJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero eyebrow={copy.eyebrow} title={copy.title} text={copy.text} />

        <section className="section">
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <details key={faq.q.tr} className="faq-static-item" open={idx === 0}>
                    <summary className="faq-static-q">{faq.q[locale]}</summary>
                    <p className="faq-static-a">{faq.a[locale]}</p>
                  </details>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 40 }}>
                <a
                  className="button gold"
                  href={bookingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="booking_engine_open"
                >
                  {copy.booking}
                </a>
                <Link className="button secondary" href={copy.contactHref}>
                  {copy.contact}
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
