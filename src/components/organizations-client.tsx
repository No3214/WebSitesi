"use client";

import Image from "next/image";
import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";

type Locale = "tr" | "en";

const copy = {
  tr: {
    hero: {
      eyebrow: "ORGANİZASYON",
      title: "Sizin Hikayeniz, Bizim Mekânımız",
      text: "Ege'nin kalbinde, tarihin ve doğanın kucağında unutulmaz etkinliklere imza atıyoruz.",
    },
    requestCta: "TEKLİF TALEBİ",
    lead: {
      eyebrow: "İLETİŞİM",
      title: "Hayalinizi Planlayalım",
      text: "Detayları bizimle paylaşın, uzman ekibimiz en kısa sürede size özel bir teklif hazırlasın.",
    },
    packages: [
      {
        title: "Tescilli Mirasta Butik Düğün",
        description: "Kozbeyli Konağı, Rum ve Türk mimarisinin ortak mirasından süzülen tescilli bir yapıdır. 200 kişiye kadar ağırlama kapasitesine sahip geniş avlumuzda, aslına uygun restore edilmiş taş duvarlar ve geleneksel Horasan harcı işçiliği arasında, her detayı uzman ekibimizce planlanan prestijli düğünlere ev sahipliği yapıyoruz.",
        category: "Düğün & Nişan",
        image: "/images/organizasyonlar/butik-dugun.jpg",
      },
      {
        title: "Kurumsal Off-Site Deneyimi",
        description: "Şehrin gürültüsünden arınmış, Kozbeyli taşının doğal nefes alma özelliği sayesinde yaz aylarında bile doğal serinlik sunan toplantı alanlarımızda verimliliği artırın. 40 kişiye kadar butik toplantı kapasitemiz, yüksek hızlı internet ve şömineli kapalı alanımızla kurumsal prestiji tarihle birleştiriyoruz.",
        category: "Kurumsal",
        image: "/images/organizasyonlar/kurumsal-offsite.jpg",
      },
      {
        title: "Gurme Gastronomi Kutlamaları",
        description: "Doğum günü veya yıl dönümü gibi özel anlarınızı, Antakya ve Ege mutfağının hibritleştiği gurme lezzetlerle taçlandırın. Konak avlusundaki 180 yıllık orijinal dibek taşında elde dövülen ve odun ateşinde ağır ağır pişen imza dibek kahvemiz, kutlamanıza gerçek bir tarihsel doku katacak.",
        category: "Özel Gün",
        image: "/videos/kahvalti-poster.jpg",
      },
    ],
    weddingDetails: {
      eyebrow: "DÜĞÜN PAKETİ",
      title: "Hayalinizdeki Düğün İçin Kürasyon",
      text: "Menü, konaklama, karşılama ve sinematik kayıt akışı tek bir konak ekibi tarafından planlanır; davetiniz tarihi dokuyla uyumlu, rafine ve akıcı kalır.",
      highlight: "Her menü paketinde 6 çift konaklama ve kahvaltı dahildir.",
      mediaAlt: "Kozbeyli Konağı terasında butik düğün ve davet atmosferi",
      detailMediaAlt: "Kozbeyli Konağı terasında hazırlanmış düğün masa düzeni",
      items: [
        {
          title: "Kokteyl & Karşılama",
          description: "Kişi başı 2 kokteyl; pizza, peynir tabağı, mini pesto kanape, zeytin ezmeli kanape, tavuk ve baharatlı patates kızartması.",
        },
        {
          title: "Akşam Yemeği",
          description: "Meze, kişiye özel salata, paçanga böreği, levrek / köfte / tavuk şiş seçenekleri ve meyve tabağı.",
        },
        {
          title: "Fotoğraf & Video",
          description: "Profesyonel düğün fotoğrafçılığı, after movie, sinematik düğün videosu ve opsiyonel drone çekimi.",
        },
        {
          title: "DJ Performansı",
          description: "2 saat profesyonel DJ performansı; House ve Afro House ağırlıklı premium davet akışı.",
        },
        {
          title: "Dekorasyon",
          description: "Taş avluya uyumlu masa düzeni, çiçek kürasyonu, mum ışığı ve tarihi dokuyu öne çıkaran atmosfer planı.",
        },
      ],
    },
    gallery: {
      eyebrow: "GERÇEK DÜĞÜNLER",
      title: "Konakta Yaşanan Anlardan",
      text: "Taş avlu, çiçek kürasyonu ve Ege ışığında gerçekleşen davetlerden kareler.",
      items: [
        { src: "/images/organizasyonlar/teras-davet.jpg", alt: "Kozbeyli Konağı terasında Ege manzarasına bakan davet masaları" },
        { src: "/images/organizasyonlar/butik-dugun.jpg", alt: "Kozbeyli Konağı terasında gün batımı düğün masa düzeni" },
        { src: "/images/organizasyonlar/dugun/dugun-4.jpg", alt: "Düğün buketi, pasta ve Ege manzarası" },
        { src: "/images/organizasyonlar/dugun/dugun-3.jpg", alt: "Düğünde elde dövülen Türk kahvesi servisi" },
      ],
    },
  },
  en: {
    hero: {
      eyebrow: "EVENTS",
      title: "Your Story, Our Historic Setting",
      text: "In the heart of the Aegean, Kozbeyli Konağı curates intimate weddings, private celebrations and focused corporate gatherings with historic texture.",
    },
    requestCta: "REQUEST A PROPOSAL",
    lead: {
      eyebrow: "GUEST RELATIONS",
      title: "Let Us Curate Your Event",
      text: "Share the occasion, guest profile and preferred rhythm; our team will prepare a tailored proposal for your celebration or gathering.",
    },
    packages: [
      {
        title: "Boutique Wedding in Registered Heritage",
        description: "Kozbeyli Konağı is a registered stone mansion shaped by the shared heritage of Greek and Turkish architecture. In the restored courtyard, among stone walls and Horasan mortar craftsmanship, our team curates refined weddings for up to 200 guests.",
        category: "Wedding & Engagement",
        image: "/images/organizasyonlar/butik-dugun.jpg",
      },
      {
        title: "Corporate Off-Site Experience",
        description: "Away from the city's pace, the natural comfort of Kozbeyli stone creates a calm setting for focused meetings. With boutique meeting capacity for up to 40 guests, high-speed internet and a fireplace salon, corporate gatherings gain a distinctive Aegean character.",
        category: "Corporate",
        image: "/images/organizasyonlar/kurumsal-offsite.jpg",
      },
      {
        title: "Gourmet Gastronomy Celebrations",
        description: "Birthdays, anniversaries and private dinners can be shaped around a curated Antakya and Aegean table. The original 180-year-old dibek stone and slow-cooked Turkish coffee bring a memorable layer of historic texture to the evening.",
        category: "Private Occasion",
        image: "/videos/kahvalti-poster.jpg",
      },
    ],
    weddingDetails: {
      eyebrow: "WEDDING PACKAGE",
      title: "Curated For Your Wedding Story",
      text: "Menu, accommodation, welcome service and cinematic capture are planned by one in-house team so the celebration stays refined, fluid and true to the historic setting.",
      highlight: "Each menu package includes accommodation and breakfast for 6 couples.",
      mediaAlt: "Boutique wedding and private event atmosphere on the Kozbeyli Konağı terrace",
      detailMediaAlt: "Wedding table setting prepared on the Kozbeyli Konağı terrace",
      items: [
        {
          title: "Cocktail & Welcome",
          description: "Two cocktails per guest with pizza, cheese plates, mini pesto canapes, olive paste canapes, chicken and spiced fried potatoes.",
        },
        {
          title: "Dinner",
          description: "Meze, individually plated salad, paçanga pastry, sea bass / meatball / chicken skewer options and fruit service.",
        },
        {
          title: "Photo & Video",
          description: "Professional wedding photography, after movie, cinematic wedding film and optional drone footage.",
        },
        {
          title: "DJ Performance",
          description: "Two hours of professional DJ performance with a premium House and Afro House focused flow.",
        },
        {
          title: "Decoration",
          description: "Table styling, floral curation, candlelight and atmosphere planning matched to the stone courtyard.",
        },
      ],
    },
    gallery: {
      eyebrow: "REAL WEDDINGS",
      title: "Moments Lived at the Mansion",
      text: "Frames from celebrations held in the stone courtyard, among floral curation and the Aegean light.",
      items: [
        { src: "/images/organizasyonlar/teras-davet.jpg", alt: "Event tables on the Kozbeyli Konağı terrace overlooking the Aegean" },
        { src: "/images/organizasyonlar/butik-dugun.jpg", alt: "Sunset wedding table setting on the Kozbeyli Konağı terrace" },
        { src: "/images/organizasyonlar/dugun/dugun-4.jpg", alt: "Wedding bouquet, cake and Aegean view" },
        { src: "/images/organizasyonlar/dugun/dugun-3.jpg", alt: "Hand-poured Turkish coffee served at the wedding" },
      ],
    },
  },
} satisfies Record<
  Locale,
  {
    hero: { eyebrow: string; title: string; text: string };
    requestCta: string;
    lead: { eyebrow: string; title: string; text: string };
    packages: { title: string; description: string; category: string; image: string }[];
    weddingDetails: {
      eyebrow: string;
      title: string;
      text: string;
      highlight: string;
      mediaAlt: string;
      detailMediaAlt: string;
      items: { title: string; description: string }[];
    };
    gallery: {
      eyebrow: string;
      title: string;
      text: string;
      items: { src: string; alt: string }[];
    };
  }
>;

export function OrganizationsClient({ locale = "tr" }: { locale?: Locale }) {
  const t = copy[locale];

  return (
    <>
      <SiteHeader variant="overlay" />
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        text={t.hero.text}
      />
      <main className="section org-main">
        <div className="container">
          <StaggerContainer delay={0.1}>
            <div className="org-grid">
              {t.packages.map((item, index) => (
                <FadeIn key={item.title}>
                  <div className="org-card">
                    <div className="org-image-wrapper">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                    <div className="org-content">
                      <span className="eyebrow">{item.category}</span>
                      <h2 className="serif">{item.title}</h2>
                      <p>{item.description}</p>
                      <a href="#teklif" className="button secondary">{t.requestCta}</a>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </StaggerContainer>

          <FadeIn delay={0.2}>
            <section className="wedding-detail" aria-labelledby="wedding-detail-title">
              <div className="wedding-media">
                <div className="wedding-image">
                  <Image
                    src="/images/organizasyonlar/teras-davet.jpg"
                    alt={t.weddingDetails.mediaAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
                <div className="wedding-detail-image">
                  <Image
                    src="/images/organizasyonlar/butik-dugun.jpg"
                    alt={t.weddingDetails.detailMediaAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 44vw, 22vw"
                  />
                </div>
              </div>
              <div className="wedding-copy">
                <span className="eyebrow">{t.weddingDetails.eyebrow}</span>
                <h2 id="wedding-detail-title" className="serif">{t.weddingDetails.title}</h2>
                <p>{t.weddingDetails.text}</p>
                <strong>{t.weddingDetails.highlight}</strong>
                <div className="wedding-detail-grid">
                  {t.weddingDetails.items.map((item) => (
                    <article key={item.title} className="wedding-detail-card">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.35}>
            <section className="wedding-gallery" aria-labelledby="wedding-gallery-title">
              <span className="eyebrow">{t.gallery.eyebrow}</span>
              <h2 id="wedding-gallery-title" className="serif">{t.gallery.title}</h2>
              <p>{t.gallery.text}</p>
              <div className="wedding-gallery-grid">
                {t.gallery.items.map((shot, index) => (
                  <figure key={shot.src} className="wedding-gallery-item">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </figure>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div id="teklif" className="lead-section">
               <SectionTitle
                  eyebrow={t.lead.eyebrow}
                  title={t.lead.title}
                  text={t.lead.text}
                />
              <LeadForm locale={locale} />
            </div>
          </FadeIn>
        </div>
      </main>

      <style jsx>{`
        .org-grid {
          display: flex;
          flex-direction: column;
          gap: 100px;
          margin-top: 24px;
        }

        .org-main {
          padding-top: clamp(48px, 6vw, 76px);
        }

        .org-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .org-card:nth-child(even) {
          direction: rtl;
        }

        .org-card:nth-child(even) .org-content {
          direction: ltr;
        }

        .org-image-wrapper {
          position: relative;
          height: 500px;
          border-radius: 4px;
          overflow: hidden;
        }

        .org-content h2 {
          font-size: 2.5rem;
          margin: 20px 0;
        }

        .org-content .eyebrow,
        .wedding-copy .eyebrow,
        .lead-section :global(.eyebrow) {
          color: var(--gold-text);
        }

        .org-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--muted);
          margin-bottom: 32px;
        }

        .wedding-detail {
          margin-top: 120px;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: clamp(40px, 6vw, 76px);
          align-items: center;
        }

        .wedding-media {
          position: relative;
          min-height: 620px;
        }

        .wedding-image,
        .wedding-detail-image {
          position: absolute;
          overflow: hidden;
          box-shadow: var(--shadow-lift);
        }

        .wedding-image {
          inset: 0 16% 17% 0;
          border-radius: 4px;
        }

        .wedding-detail-image {
          right: 0;
          bottom: 0;
          width: 46%;
          aspect-ratio: 9 / 14;
          border: 10px solid var(--ivory);
          border-radius: 4px;
          object-fit: cover;
          background: var(--ink);
        }

        .wedding-copy h2 {
          color: var(--olive);
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 1.1;
          margin: 12px 0 20px;
        }

        .wedding-copy > p {
          color: var(--muted);
          font-size: 1.05rem;
          line-height: 1.85;
          margin: 0 0 22px;
        }

        .wedding-copy > strong {
          display: block;
          color: var(--gold-text);
          font-size: 0.92rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .wedding-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .wedding-detail-card {
          border-top: 1px solid var(--border);
          padding-top: 18px;
        }

        .wedding-detail-card h3 {
          color: var(--olive);
          font-size: 1.15rem;
          margin: 0 0 10px;
        }

        .wedding-detail-card p {
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.7;
          margin: 0;
        }

        .wedding-gallery {
          margin-top: clamp(72px, 9vw, 120px);
          text-align: center;
        }

        .wedding-gallery .eyebrow {
          color: var(--gold-text);
        }

        .wedding-gallery h2 {
          color: var(--olive);
          font-size: clamp(1.9rem, 3.6vw, 3rem);
          margin: 12px 0 14px;
        }

        .wedding-gallery > p {
          color: var(--muted);
          font-size: 1.05rem;
          line-height: 1.8;
          max-width: 620px;
          margin: 0 auto 40px;
        }

        .wedding-gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .wedding-gallery-item {
          position: relative;
          margin: 0;
          aspect-ratio: 2 / 3;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: var(--shadow-lift);
        }

        .lead-section {
          margin-top: 150px;
          padding: 100px 0;
          background: var(--soft);
        }

        @media (max-width: 1024px) {
          .org-card {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .org-card:nth-child(even) {
            direction: ltr;
          }
          .org-image-wrapper {
            height: 350px;
          }
          .wedding-detail {
            grid-template-columns: 1fr;
            margin-top: 84px;
          }
          .wedding-media {
            min-height: 520px;
          }
          .wedding-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .org-grid {
            gap: 72px;
            margin-top: 16px;
          }
          .org-content h2 {
            font-size: 2rem;
          }
          .org-content p {
            font-size: 1rem;
          }
          .wedding-media {
            min-height: 430px;
          }
          .wedding-gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .wedding-image {
            inset: 0 0 26% 0;
          }
        .wedding-detail-image {
            width: 44%;
            border-width: 6px;
          }
        }
      `}</style>
    </>
  );
}
