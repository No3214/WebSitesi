import { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { getWhatsAppHref } from "@/lib/contact";
import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Teklifler",
  description:
    "Romantik kaçamaklar, aile hafta sonları ve taş avluda özel davetler. Kozbeyli Konağı'nın dönemsel teklifleri için rezervasyon ekibimizle iletişime geçin.",
  alternates: altLanguages("/teklifler", "/en/offers"),
  openGraph: {
    title: "Teklifler | Kozbeyli Konağı",
    description: "Dönemsel konaklama ve davet paketleri hakkında bilgi alın.",
    url: absoluteUrl("/teklifler"),
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        alt: "Kozbeyli Konağı — Özel teklifler",
      },
    ],
  },
};

// getWhatsAppHref saf bir yardımcıdır (client API kullanmaz);
// href server component içinde modül seviyesinde üretilir.
const whatsappOffersHref = getWhatsAppHref(
  "Merhaba, dönemsel teklifleriniz hakkında bilgi almak istiyorum."
);

const offers = [
  {
    no: "01",
    title: "Romantik Kaçamak",
    text: "Panoramik Ege Denizi manzaralı taş odanızda gün batımını izleyin; sabahları avluda hazırlanan serpme kahvaltıyla güne yavaş başlayın. Çiftler için kurgulanmış otantik bir mola.",
    href: "/rezervasyon",
    cta: "Rezervasyon Yapın",
  },
  {
    no: "02",
    title: "Aile Hafta Sonu",
    text: "İki bölümlü aile odalarında ebeveynler ve çocuklar için mahremiyet dengesi, bebek yatağı opsiyonu ve bahçeye açılan sakin bir hafta sonu ritmi. Tarihi avlu bir adım uzağınızda.",
    href: "/rezervasyon",
    cta: "Rezervasyon Yapın",
  },
  {
    no: "03",
    title: "Davet & Organizasyon",
    text: "Tarihi taş avluda nişan, kına ve özel kutlamalar; Antakya ve Ege mutfağından küratörlü menüler eşliğinde misafirlerinize unutulmaz bir akşam kurgulayın.",
    href: "/organizasyonlar",
    cta: "Organizasyonları İnceleyin",
  },
];

export default function OffersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="DÖNEMSEL"
          title="Konaktan Teklifler"
          text="Sezona ve özel günlere göre özenle kurgulanan konaklama ve davet paketlerimiz için rezervasyon ekibimizle iletişime geçin; size en uygun deneyimi birlikte planlayalım."
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
                  Tekliflerimiz dönemsel olarak güncellenir ve sınırlı sayıda oda
                  için hazırlanır. Güncel içerikler, uygunluk ve kişiselleştirilmiş
                  planlama için WhatsApp destek hattımıza yazmanız yeterli.
                </p>
                <a
                  href={whatsappOffersHref}
                  className="button secondary"
                  data-event="whatsapp_click"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Destek
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
    </>
  );
}
