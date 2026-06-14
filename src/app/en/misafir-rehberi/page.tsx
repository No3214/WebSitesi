import type { Metadata } from "next";
import { Clock, Coffee, HeartPulse, MapPin, ShieldCheck, Wifi } from "lucide-react";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { getWhatsAppHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Guest Guide & Stay Information",
  description:
    "Check-in and check-out hours, breakfast service, Wi-Fi, location, hygiene standards and cancellation details for guests of Kozbeyli Konağı.",
  alternates: { canonical: "/en/misafir-rehberi" },
  openGraph: {
    url: absoluteUrl("/en/misafir-rehberi"),
    title: "Guest Guide & Stay Information | Kozbeyli Konağı",
    description:
      "Practical stay details for guests planning a refined visit to Kozbeyli Konağı.",
  },
};

const guideItems = [
  {
    icon: <Clock className="w-6 h-6 text-gold" />,
    title: "Check-in & Check-out",
    content:
      "Room check-in begins at 14:00 and check-out is at 12:00. Early check-in and late check-out requests are evaluated according to availability.",
  },
  {
    icon: <Coffee className="w-6 h-6 text-gold" />,
    title: "Breakfast Hours",
    content:
      "The Kozbeyli village breakfast is served each morning between 09:00 and 11:30 in the restaurant or garden.",
  },
  {
    icon: <Wifi className="w-6 h-6 text-gold" />,
    title: "Internet",
    content:
      "High-speed fibre internet is available throughout the mansion for guests.",
  },
  {
    icon: <MapPin className="w-6 h-6 text-gold" />,
    title: "Location & Transfers",
    content:
      "We are in the heart of Kozbeyli Village, 12 km from Yeni Foça and 18 km from Eski Foça. Contact guest relations for transfer support.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-gold" />,
    title: "Safety & Hygiene",
    content:
      "The property is monitored by security cameras and cleaned daily according to high hospitality standards.",
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-gold" />,
    title: "Flexibility & Cancellation",
    content:
      "For direct reservations, free cancellation and date changes are available up to 48 hours before arrival.",
  },
];

export default function EnglishGuestGuidePage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <main className="guest-guide-page">
        <PageHero
          eyebrow="GUEST STANDARDS"
          title="Guest Guide"
          text="Practical details for a calm stay at Kozbeyli Konağı. For anything more specific, the guest relations team is close at hand."
        />

        <section className="section py-24 bg-white">
          <div className="container">
            <StaggerContainer>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guideItems.map((item) => (
                  <FadeIn key={item.title}>
                    <div className="guide-card p-10 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="mb-6 p-4 bg-white rounded-xl w-fit shadow-sm border border-zinc-50">
                        {item.icon}
                      </div>
                      <h3 className="serif text-2xl mb-4 text-zinc-900">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed text-sm">
                        {item.content}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section className="section section-dark grain py-20 overflow-hidden">
          <div className="container relative text-center" style={{ zIndex: 2 }}>
            <FadeIn>
              <h2 className="serif text-3xl md:text-5xl mb-8">Need a Specific Answer?</h2>
              <p className="mb-10 max-w-xl mx-auto" style={{ color: "rgba(250,249,246,0.7)" }}>
                The Kozbeyli Konağı guest relations team can help you refine arrival,
                dining and local experience details before your stay.
              </p>
              <a
                href={getWhatsAppHref("Hello, I am reading the guest guide and have a question.")}
                className="button ghost-light"
                data-event="whatsapp_click"
              >
                ASK VIA WHATSAPP
              </a>
            </FadeIn>
          </div>
        </section>
      </main>

      <style>{`
        .guest-guide-page { min-height: 100vh; }
        .guide-card { cursor: default; }
      `}</style>
    </>
  );
}
