"use client";

import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { Check, Heart, Star, Users } from "lucide-react";

const packages = [
  {
    name: "Taş Konak Paketi",
    subtitle: "Samimi & Otantik",
    capacity: "30-40 Kişi",
    icon: Heart,
    features: [
      "Tarihi taş avluda tören",
      "3 saatlik kokteyl resepsiyon",
      "İnci Hanım'ın özel menüsü",
      "Konaklama: 4 oda (çift için ücretsiz)",
      "Özel dekorasyon danışmanlığı",
      "Fotoğraf çekimi için özel saatler",
    ],
  },
  {
    name: "Ege Rüyası Paketi",
    subtitle: "Zarif & Kapsamlı",
    capacity: "40-60 Kişi",
    icon: Star,
    featured: true,
    features: [
      "Avlu + bahçe kullanımı",
      "5 saatlik tam organizasyon",
      "Açık büfe akşam yemeği + içecek paketi",
      "Konaklama: 6 oda (gelin-damat süiti dahil)",
      "DJ veya canlı müzik koordinasyonu",
      "Gelin hazırlık odası",
      "VIP transfer (havalimanı/otel)",
      "Profesyonel organizasyon koordinatörü",
    ],
  },
  {
    name: "Osmanlı Sarayı Paketi",
    subtitle: "Tüm Dahil Premium",
    capacity: "Konağın tamamı",
    icon: Users,
    features: [
      "Konağın tüm alanları özel kullanım",
      "2 gün boyunca tesis tahsisi",
      "Kına + düğün + brunch paketi",
      "Tüm odalar dahil (tam konaklama)",
      "Premium içecek paketi + şarap eşleştirmesi",
      "Havai fişek veya dilek feneri",
      "Profesyonel fotoğraf + video çekimi",
      "Özel menü tasarımı (tasting dahil)",
    ],
  },
];

export function WeddingClient() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section style={{ position: "relative", height: "50vh", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80" alt="Kozbeyli Konağı düğün organizasyonu" fill className="object-cover" priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "white" }}>
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>DÜĞÜN & ÖZEL ORGANİZASYON</span>
            <h1 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "700px", margin: "12px auto 0", lineHeight: 1.15 }}>
              Tarihi Taş Konakta<br />Unutulmaz Bir Gün
            </h1>
          </div>
        </section>

        {/* Packages */}
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow="PAKETLER" title="Düğün Paketlerimiz" text="Her bütçeye ve hayale uygun, kişiselleştirilebilir organizasyon seçenekleri." />
            </FadeIn>

            <div className="feature-grid">
              {packages.map((pkg, idx) => {
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
              <SectionTitle eyebrow="TEKLİF ALIN" title="Hayalinizdeki Günü Planlayalım" text="Formu doldurun, organizasyon danışmanımız 24 saat içinde size özel teklif hazırlasın." />
              <LeadForm />
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
