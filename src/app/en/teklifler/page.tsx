import type { Metadata } from "next";
import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWhatsAppHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Curated Offers",
  description:
    "Seasonal stay and event offers at Kozbeyli Konağı. Contact the concierge team for curated romantic escapes, family weekends and private event proposals.",
  alternates: { canonical: "/en/teklifler" },
  openGraph: {
    url: absoluteUrl("/en/teklifler"),
    title: "Curated Offers | Kozbeyli Konağı",
    description:
      "Seasonal accommodation and private event offers curated with Aegean hospitality.",
  },
};

const whatsappOffersHref = getWhatsAppHref(
  "Hello, I would like to receive information about your current offers."
);

const offers = [
  {
    no: "01",
    title: "Romantic Aegean Escape",
    text: "Watch the sunset from a stone room with an Aegean view, then begin the morning slowly with a curated village breakfast in the courtyard. An authentic pause shaped for couples.",
    href: "/en/rezervasyon",
    cta: "Plan Your Stay",
  },
  {
    no: "02",
    title: "Family Weekend in Kozbeyli",
    text: "Two-part family rooms, quiet garden access and a calm weekend rhythm for parents and children. Historic texture remains close while the experience stays comfortable and considered.",
    href: "/en/rezervasyon",
    cta: "Explore Rooms",
  },
  {
    no: "03",
    title: "Private Event Curation",
    text: "Engagements, intimate celebrations and special dinners in the stone courtyard, paired with curated Antakya and Aegean menus for a memorable evening.",
    href: "/en/organizasyonlar",
    cta: "View Events",
  },
];

export default function EnglishOffersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="SEASONAL"
          title="Curated Offers from the Mansion"
          text="Our seasonal stays and event proposals are shaped around availability, occasion and guest profile. The concierge team will help you choose the right experience."
        />

        <section className="section">
          <div className="container">
            <FadeIn>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 48,
                }}
              >
                <p style={{ margin: 0, maxWidth: 640 }}>
                  Offers are updated seasonally and prepared for a limited room
                  inventory. For current availability and a personalised plan,
                  contact the WhatsApp Concierge.
                </p>
                <a
                  href={whatsappOffersHref}
                  className="button secondary"
                  data-event="whatsapp_click"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Concierge
                </a>
              </div>
            </FadeIn>

            <div className="feature-grid">
              {offers.map((offer, idx) => (
                <FadeIn key={offer.no} delay={idx * 0.12}>
                  <div className="feature-box">
                    <span className="feature-no" aria-hidden>
                      {offer.no}
                    </span>
                    <h3>{offer.title}</h3>
                    <p>{offer.text}</p>
                    <div style={{ marginTop: 22 }}>
                      <Link className="button gold sm" href={offer.href}>
                        {offer.cta}
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
