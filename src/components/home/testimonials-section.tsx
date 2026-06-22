"use client";

import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const services = {
  tr: [
    {
      no: "01",
      title: "Konaklamanızı Planlayın",
      text: "Tarih, oda tipi ve özel ihtiyaçlarınızı doğrudan misafir ilişkileri ekibimizle paylaşın.",
      href: "/rezervasyon",
      cta: "Müsaitliği Kontrol Et",
    },
    {
      no: "02",
      title: "Sofranızı Ayırın",
      text: "Kahvaltı ve restoran talepleriniz için güncel servis bilgilerini ekibimizden doğrulayın.",
      href: "/gastronomi",
      cta: "Gastronomiyi Keşfet",
    },
    {
      no: "03",
      title: "Davetiniz İçin Teklif Alın",
      text: "Tarih, kişi sayısı ve ihtiyaçlarınıza göre güncel bir organizasyon teklifi hazırlayalım.",
      href: "/organizasyonlar",
      cta: "Davetleri İncele",
    },
  ],
  en: [
    {
      no: "01",
      title: "Plan Your Stay",
      text: "Share your dates, preferred room type and special requirements directly with our guest relations team.",
      href: "/en/rezervasyon",
      cta: "Check Availability",
    },
    {
      no: "02",
      title: "Plan Your Table",
      text: "Confirm current breakfast and restaurant service details directly with our team before your visit.",
      href: "/en/gastronomi",
      cta: "Explore Gastronomy",
    },
    {
      no: "03",
      title: "Request an Event Proposal",
      text: "Let us prepare a current proposal based on your date, guest count and event requirements.",
      href: "/en/organizasyonlar",
      cta: "Explore Events",
    },
  ],
} as const;

export function TestimonialsSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt grain" id="misafir-iliskileri">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MİSAFİR İLİŞKİLERİ" : "GUEST RELATIONS"}
            title={locale === "tr" ? "Deneyiminizi Doğrudan Planlayın" : "Plan Your Experience Directly"}
            text={
              locale === "tr"
                ? "Doğrulanmamış yorumlar yerine, güncel bilgi ve teklifleri doğrudan konağın ekibinden alın."
                : "Receive current information and proposals directly from the mansion team."
            }
          />
        </FadeIn>

        <div className="feature-grid">
          {services[locale].map((item, index) => (
            <FadeIn key={item.no} delay={index * 0.12}>
              <article className="feature-box">
                <span className="feature-no" aria-hidden>
                  {item.no}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="card-link" href={item.href}>
                  {item.cta}
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
