"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Phone, Mail, MapPin, MessageCircle, Clock, Instagram } from "lucide-react";
import { useDictionary } from "@/hooks/use-dictionary";

const contactInfo = {
  tr: [
    { icon: Phone, label: "Telefon", value: "0532 234 26 86", href: "tel:+905322342686" },
    { icon: MessageCircle, label: "WhatsApp", value: "+90 (532) 234 26 86", href: "https://wa.me/905322342686" },
    { icon: Mail, label: "E-posta", value: "info@kozbeylikonagi.com", href: "mailto:info@kozbeylikonagi.com" },
    { icon: Instagram, label: "Instagram", value: "@kozbeylikonagi", href: "https://www.instagram.com/kozbeylikonagi/" },
    { icon: Clock, label: "Resepsiyon", value: "08:30 – 23:00 (Her gün)", href: null },
    { icon: MapPin, label: "Adres", value: "Kozbeyli Küme Evleri No:188, Foça, İzmir 35680", href: "https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA" },
  ],
  en: [
    { icon: Phone, label: "Phone", value: "0532 234 26 86", href: "tel:+905322342686" },
    { icon: MessageCircle, label: "WhatsApp", value: "+90 (532) 234 26 86", href: "https://wa.me/905322342686" },
    { icon: Mail, label: "Email", value: "info@kozbeylikonagi.com", href: "mailto:info@kozbeylikonagi.com" },
    { icon: Instagram, label: "Instagram", value: "@kozbeylikonagi", href: "https://www.instagram.com/kozbeylikonagi/" },
    { icon: Clock, label: "Reception", value: "08:30 – 23:00 (Every day)", href: null },
    { icon: MapPin, label: "Address", value: "Kozbeyli Küme Evleri No:188, Foça, İzmir 35680", href: "https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA" },
  ],
};

const t = {
  tr: {
    eyebrow: "İLETİŞİM",
    title: "Bize Ulaşın",
    text: "Rezervasyon, restoran veya organizasyon talepleriniz için bizimle iletişime geçin.",
    contactHeading: "İletişim Bilgileri",
    directionsHeading: "Nasıl Gidilir?",
    fromIzmir: "İzmir'den:",
    fromIzmirText: "İzmir Çeşme Otoyolu → Menemen Çıkışı → Foça Yolu → Kozbeyli Köyü (yaklaşık 80 km, 1 saat)",
    fromAirport: "Havalimanından:",
    fromAirportText: "İzmir Adnan Menderes Havalimanı → Kozbeyli (yaklaşık 90 km). VIP transfer hizmeti mevcuttur.",
    fromFoca: "Foça'dan:",
    fromFocaText: "Foça merkeze 12 km mesafede, Kozbeyli Köyü iç yolundan ulaşabilirsiniz.",
    viewOnMap: "Haritada Gör",
  },
  en: {
    eyebrow: "CONTACT",
    title: "Get in Touch",
    text: "Contact us for reservations, restaurant inquiries, or event requests.",
    contactHeading: "Contact Information",
    directionsHeading: "How to Get Here?",
    fromIzmir: "From İzmir:",
    fromIzmirText: "İzmir Çeşme Highway → Menemen Exit → Foça Road → Kozbeyli Village (approx. 80 km, 1 hour)",
    fromAirport: "From the Airport:",
    fromAirportText: "İzmir Adnan Menderes Airport → Kozbeyli (approx. 90 km). VIP transfer service is available.",
    fromFoca: "From Foça:",
    fromFocaText: "12 km from Foça center, accessible via the Kozbeyli Village inner road.",
    viewOnMap: "View on Map",
  },
};

export function ContactClient() {
  const { locale } = useDictionary();
  const text = t[locale];
  const contacts = contactInfo[locale];

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={text.eyebrow} title={text.title} text={text.text} />
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", maxWidth: "1000px", margin: "0 auto" }}>
              <FadeIn direction="left">
                <div>
                  <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "32px", color: "var(--olive)" }}>{text.contactHeading}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {contacts.map((item) => {
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
                  <h3 className="serif" style={{ fontSize: "1.5rem", marginBottom: "32px", color: "var(--olive)" }}>{text.directionsHeading}</h3>
                  <div style={{ background: "var(--soft)", padding: "32px", marginBottom: "24px" }}>
                    <p style={{ lineHeight: 1.7, color: "#555", marginBottom: "16px" }}>
                      <strong>{text.fromIzmir}</strong> {text.fromIzmirText}
                    </p>
                    <p style={{ lineHeight: 1.7, color: "#555", marginBottom: "16px" }}>
                      <strong>{text.fromAirport}</strong> {text.fromAirportText}
                    </p>
                    <p style={{ lineHeight: 1.7, color: "#555" }}>
                      <strong>{text.fromFoca}</strong> {text.fromFocaText}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <a href="https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA" target="_blank" rel="noreferrer" className="button primary">
                      <MapPin size={16} style={{ marginRight: "8px" }} /> {text.viewOnMap}
                    </a>
                    <a href="https://wa.me/905322342686" target="_blank" rel="noreferrer" className="button secondary">
                      <MessageCircle size={16} style={{ marginRight: "8px" }} /> WhatsApp
                    </a>
                  </div>

                  <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden", marginTop: "32px" }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3117.5!2d26.7456!3d38.7275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzM5LjAiTiAyNsKwNDQnNDQuMiJF!5e0!3m2!1sen!2str!4v1"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Kozbeyli Konağı Location"
                    />
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
