"use client";

import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { Check, Heart, Star, Users } from "lucide-react";
import { useDictionary } from "@/hooks/use-dictionary";

const packages = {
  tr: [
    {
      name: "Taş Konak Paketi",
      subtitle: "Kokteyl · Sade & Şık",
      capacity: "~100 Kişi",
      icon: Heart,
      features: [
        "Tarihi taş avluda kokteyl organizasyonu",
        "Yemeksiz, sade ve şık konsept",
        "Standart dekorasyon",
        "Hafta içi: 5 oda konaklama dahil",
        "Cumartesi: 16 oda (tüm otel) çifte dahil",
        "%50 kapora ile rezervasyon",
      ],
    },
    {
      name: "Ege Rüyası Paketi",
      subtitle: "★ ÖNERİLEN — Gala Yemek Dahil",
      capacity: "~100 Kişi",
      icon: Star,
      featured: true,
      features: [
        "Kokteyl açılış + gala yemek",
        "Standart dekorasyon dahil",
        "Hafta içi: 5 oda konaklama dahil",
        "Cumartesi: 16 oda (tüm otel) çifte dahil",
        "Fix menü servis (şef seçimi)",
        "İçecek paketi seçenekleri (ayrı fiyatlandırılır)",
        "DJ koordinasyonu opsiyonel",
        "Gelin hazırlık odası",
      ],
    },
    {
      name: "Osmanlı Sarayı Paketi",
      subtitle: "Full Premium · Tüm Dahil",
      capacity: "Konağın Tamamı (16 oda)",
      icon: Users,
      features: [
        "Konağın tüm alanları özel kullanım",
        "VIP dekorasyon paketi",
        "Premium menü (şef ile tasting dahil)",
        "Premium alkollü içecek paketi",
        "Tüm 16 oda konaklama dahil",
        "DJ performans (House/Afro House) — 2 saat",
        "Profesyonel fotoğraf & video çekimi",
        "Sinematik düğün filmi + drone çekimi",
      ],
    },
  ],
  en: [
    {
      name: "Stone Manor Package",
      subtitle: "Cocktail · Simple & Elegant",
      capacity: "~100 Guests",
      icon: Heart,
      features: [
        "Cocktail event in the historic stone courtyard",
        "No dinner, simple and elegant concept",
        "Standard decoration",
        "Weekdays: 5 rooms accommodation included",
        "Saturday: 16 rooms (entire hotel) included for the couple",
        "Reservation with 50% deposit",
      ],
    },
    {
      name: "Aegean Dream Package",
      subtitle: "★ RECOMMENDED — Gala Dinner Included",
      capacity: "~100 Guests",
      icon: Star,
      featured: true,
      features: [
        "Cocktail reception + gala dinner",
        "Standard decoration included",
        "Weekdays: 5 rooms accommodation included",
        "Saturday: 16 rooms (entire hotel) included for the couple",
        "Fixed menu service (chef's selection)",
        "Beverage package options (priced separately)",
        "DJ coordination optional",
        "Bridal preparation room",
      ],
    },
    {
      name: "Ottoman Palace Package",
      subtitle: "Full Premium · All Inclusive",
      capacity: "Entire Manor (16 rooms)",
      icon: Users,
      features: [
        "Exclusive use of all manor areas",
        "VIP decoration package",
        "Premium menu (chef tasting included)",
        "Premium alcoholic beverage package",
        "All 16 rooms accommodation included",
        "DJ performance (House/Afro House) — 2 hours",
        "Professional photography & videography",
        "Cinematic wedding film + drone footage",
      ],
    },
  ],
};

const t = {
  tr: {
    heroEyebrow: "DÜĞÜN & ÖZEL ORGANİZASYON",
    heroTitle1: "Tarihi Taş Konakta",
    heroTitle2: "Unutulmaz Bir Gün",
    heroAlt: "Kozbeyli Konağı düğün organizasyonu",
    packagesEyebrow: "PAKETLER",
    packagesTitle: "Düğün Paketlerimiz",
    packagesText: "~100 kişi kapasiteli tarihi taş konakta, 3 farklı paket seçeneği. Cumartesi günleri tüm otel çifte dahil.",
    formEyebrow: "TEKLİF ALIN",
    formTitle: "Hayalinizdeki Günü Planlayalım",
    formText: "Formu doldurun, organizasyon danışmanımız 24 saat içinde size özel teklif hazırlasın.",
  },
  en: {
    heroEyebrow: "WEDDING & SPECIAL EVENTS",
    heroTitle1: "In a Historic Stone Manor",
    heroTitle2: "An Unforgettable Day",
    heroAlt: "Kozbeyli Konagi wedding organization",
    packagesEyebrow: "PACKAGES",
    packagesTitle: "Our Wedding Packages",
    packagesText: "3 different package options in a historic stone manor with ~100 guest capacity. Saturdays include the entire hotel for the couple.",
    formEyebrow: "GET A QUOTE",
    formTitle: "Let Us Plan Your Dream Day",
    formText: "Fill out the form and our event consultant will prepare a custom offer within 24 hours.",
  },
};

export function WeddingClient() {
  const { locale } = useDictionary();
  const text = t[locale];
  const pkgs = packages[locale];

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section style={{ position: "relative", height: "50vh", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Image src="/images/rooms/balkonlu-aile-1.jpeg" alt={text.heroAlt} fill className="object-cover" priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "white" }}>
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>{text.heroEyebrow}</span>
            <h1 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "700px", margin: "12px auto 0", lineHeight: 1.15 }}>
              {text.heroTitle1}<br />{text.heroTitle2}
            </h1>
          </div>
        </section>

        {/* Packages */}
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={text.packagesEyebrow} title={text.packagesTitle} text={text.packagesText} />
            </FadeIn>

            <div className="feature-grid">
              {pkgs.map((pkg, idx) => {
                const Icon = pkg.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.1}>
                    <div
                      className="feature-box"
                      style={{
                        padding: "40px 32px",
                        background: pkg.featured ? "var(--olive)" : "var(--white)",
                        color: pkg.featured ? "white" : "var(--text)",
                        border: pkg.featured ? "none" : "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Icon size={28} style={{ color: pkg.featured ? "var(--gold)" : "var(--gold)", marginBottom: "16px" }} />
                      <h3 className="serif" style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{pkg.name}</h3>
                      <p style={{ color: pkg.featured ? "rgba(255,255,255,0.7)" : "#999", fontSize: "0.85rem", marginBottom: "8px" }}>{pkg.subtitle}</p>
                      <p style={{ color: "var(--gold)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>{pkg.capacity}</p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                        {pkg.features.map((f, i) => (
                          <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            <Check size={16} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section className="section section-alt" id="teklif">
          <div className="container" style={{ maxWidth: "900px" }}>
            <FadeIn>
              <SectionTitle eyebrow={text.formEyebrow} title={text.formTitle} text={text.formText} />
              <LeadForm />
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
