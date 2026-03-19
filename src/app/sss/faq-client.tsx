"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { ChevronDown, MessageCircle } from "lucide-react";

const faqGroups = [
  {
    title: "Konaklama",
    items: [
      { q: "Check-in ve check-out saatleri nedir?", a: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır. Erken giriş ve geç çıkış talepleriniz için bizimle iletişime geçebilirsiniz." },
      { q: "Otopark mevcut mu?", a: "Evet, konağımızda ücretsiz özel otopark bulunmaktadır." },
      { q: "Evcil hayvan kabul ediyor musunuz?", a: "Evet, küçük evcil hayvanlar (10 kg'a kadar) belirli odalarda kabul edilmektedir. Lütfen rezervasyon sırasında bilgi veriniz." },
      { q: "Bebek yatağı temin ediliyor mu?", a: "Evet, aile odalarımızda ücretsiz bebek yatağı hizmeti sunulmaktadır. Önceden talep edilmesi gerekmektedir." },
      { q: "Direkt rezervasyonun avantajı nedir?", a: "Web sitemizden yapacağınız direkt rezervasyonlarda en iyi fiyat garantisi, ücretsiz hoşgeldin kokteyli ve esnek iptal koşulları sunuyoruz." },
      { q: "İptal koşulları nedir?", a: "48 saat öncesine kadar ücretsiz iptal. 48 saat içinde yapılan iptallerde ilk gece ücreti tahsil edilir." },
    ],
  },
  {
    title: "Restoran & Gastronomi",
    items: [
      { q: "Restoran sadece konaklayan misafirlere mi açık?", a: "Hayır, restoranımız dış misafirlere de açıktır. Yoğun dönemlerde rezervasyon yapmanızı öneririz." },
      { q: "Kahvaltı dahil mi?", a: "Evet, organik köy kahvaltısı tüm konaklama paketlerine dahildir." },
      { q: "Özel diyet ihtiyaçlarına uyum sağlıyor musunuz?", a: "Evet, vejetaryen, vegan, glutensiz ve alerjik besin ihtiyaçları için önceden bilgi vermeniz durumunda özel menü hazırlıyoruz." },
      { q: "Canlı müzik hangi günler?", a: "Cuma ve Cumartesi akşamları 20:30-23:00 arası akustik canlı müzik programımız bulunmaktadır." },
    ],
  },
  {
    title: "Ulaşım & Konum",
    items: [
      { q: "İzmir'den nasıl ulaşılır?", a: "İzmir merkezden yaklaşık 80 km, 1 saat sürüş mesafesindedir. İzmir-Çeşme Otoyolu → Menemen çıkışı → Foça yolu → Kozbeyli Köyü." },
      { q: "Havalimanı transfer hizmeti var mı?", a: "Evet, İzmir Adnan Menderes Havalimanı'ndan VIP transfer hizmetimiz mevcuttur. Lütfen önceden bilgi veriniz." },
      { q: "En yakın plaj ne kadar uzakta?", a: "Ege Denizi'ne 12 km mesafede bulunuyoruz. Foça plajlarına araçla 15-20 dakikada ulaşabilirsiniz." },
    ],
  },
  {
    title: "Organizasyon & Etkinlik",
    items: [
      { q: "Düğün organizasyonu yapıyor musunuz?", a: "Evet, 30-60 kişilik butik düğünler düzenliyoruz. Detaylı bilgi için düğün sayfamızı ziyaret edebilirsiniz." },
      { q: "Kurumsal toplantı düzenleyebilir miyiz?", a: "Evet, 30 kişiye kadar kurumsal toplantı, workshop ve retreat organizasyonları yapıyoruz." },
      { q: "Özel akşam yemeği organize edebilir miyiz?", a: "Evet, 8-40 kişi arası özel menü ile akşam yemeği organizasyonları düzenliyoruz." },
    ],
  },
];

export function FAQClient() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container" style={{ maxWidth: "800px" }}>
            <FadeIn>
              <SectionTitle eyebrow="SSS" title="Sık Sorulan Sorular" text="Rezervasyon öncesi aklınıza takılabilecek her şey." />
            </FadeIn>

            {faqGroups.map((group, gi) => (
              <FadeIn key={gi} delay={gi * 0.1}>
                <div style={{ marginBottom: "48px" }}>
                  <h2 className="serif" style={{ fontSize: "1.4rem", color: "var(--olive)", marginBottom: "24px" }}>{group.title}</h2>
                  {group.items.map((item, idx) => {
                    const key = `${gi}-${idx}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                        <button
                          onClick={() => toggle(key)}
                          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                          aria-expanded={isOpen}
                        >
                          <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text)" }}>{item.q}</span>
                          <ChevronDown size={18} style={{ color: "#999", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0, marginLeft: "16px" }} />
                        </button>
                        {isOpen && (
                          <p style={{ color: "#555", lineHeight: 1.7, paddingBottom: "18px", margin: 0 }}>{item.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </FadeIn>
            ))}

            <FadeIn>
              <div style={{ textAlign: "center", padding: "40px", background: "var(--soft)", marginTop: "20px" }}>
                <p style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--olive)" }} className="serif">Sorunuzun cevabını bulamadınız mı?</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="https://wa.me/905322521010" className="button primary" target="_blank" rel="noreferrer">
                    <MessageCircle size={16} style={{ marginRight: "8px" }} /> WhatsApp ile Sorun
                  </Link>
                  <Link href="/iletisim" className="button secondary">İletişim Sayfası</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
