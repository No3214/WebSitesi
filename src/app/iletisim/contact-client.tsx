"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Phone, Mail, MapPin, MessageCircle, Clock, Instagram } from "lucide-react";

const contactInfo = [
  { icon: Phone, label: "Telefon", value: "+90 (232) 676 10 10", href: "tel:+902326761010" },
  { icon: MessageCircle, label: "WhatsApp", value: "+90 (532) 252 10 10", href: "https://wa.me/905322521010" },
  { icon: Mail, label: "E-posta", value: "info@kozbeylikonagi.com.tr", href: "mailto:info@kozbeylikonagi.com.tr" },
  { icon: Instagram, label: "Instagram", value: "@kozbeylikonagi", href: "https://www.instagram.com/kozbeylikonagi/" },
  { icon: Clock, label: "Resepsiyon", value: "07:00 – 23:00 (Her gün)", href: null },
  { icon: MapPin, label: "Adres", value: "Kozbeyli Köyü İç Yolu, Foça, İzmir 35680", href: "https://maps.app.goo.gl/kozbeylikonagi" },
];

export function ContactClient() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow="İLETİŞİM" title="Bize Ulaşın" text="Rezervasyon, restoran veya organizasyon talepleriniz için bizimle iletişime geçin." />
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", maxWidth: "1000px", margin: "0 auto" }}>
              <FadeIn direction="left">
                <div>
                  <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "32px", color: "var(--olive)" }}>İletişim Bilgileri</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {contactInfo.map((item) => {
                      const Icon = item.icon;
                      const content = (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                          <div style={{ padding: "10px", background: "var(--soft)", borderRadius: "8px", flexShrink: 0 }}>
                            <Icon size={20} style={{ color: "var(--gold)" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", fontWeight: 600, display: "block", marginBottom: "4px" }}>{item.label}</span>
                            <span style={{ fontSize: "0.95rem", color: "var(--text)" }}>{item.value}</span>
                          </div>
                        </div>
                      );
                      return item.href ? (
                        <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>
                          {content}
                        </a>
                      ) : (
                        <div key={item.label}>{content}</div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="right">
                <div>
                  <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "32px", color: "var(--olive)" }}>Nasıl Gidilir?</h3>
                  <div style={{ background: "var(--soft)", padding: "32px", marginBottom: "24px" }}>
                    <p style={{ lineHeight: 1.7, color: "#555", marginBottom: "16px" }}>
                      <strong>İzmir&apos;den:</strong> İzmir Çeşme Otoyolu → Menemen Çıkışı → Foça Yolu → Kozbeyli Köyü (yaklaşık 80 km, 1 saat)
                    </p>
                    <p style={{ lineHeight: 1.7, color: "#555", marginBottom: "16px" }}>
                      <strong>Havalimanından:</strong> İzmir Adnan Menderes Havalimanı → Kozbeyli (yaklaşık 90 km). VIP transfer hizmeti mevcuttur.
                    </p>
                    <p style={{ lineHeight: 1.7, color: "#555" }}>
                      <strong>Foça&apos;dan:</strong> Foça merkeze 12 km mesafede, Kozbeyli Köyü iç yolundan ulaşabilirsiniz.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <a href="https://maps.app.goo.gl/kozbeylikonagi" target="_blank" rel="noreferrer" className="button primary">
                      <MapPin size={16} style={{ marginRight: "8px" }} /> Haritada Gör
                    </a>
                    <a href="https://wa.me/905322521010" target="_blank" rel="noreferrer" className="button secondary">
                      <MessageCircle size={16} style={{ marginRight: "8px" }} /> WhatsApp
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </>
  );
}
