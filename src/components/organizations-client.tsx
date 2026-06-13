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
      title: "Sizin Hikayeniz, Bizim Mekanımız",
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
        description: "Kozbeyli Konağı, Rum ve Türk mimarisinin ortak mirasından süzülen tescilli bir yapıdır. 150-200 kişiye kadar ağırlama kapasitesine sahip geniş avlumuzda, aslına uygun restore edilmiş taş duvarlar ve geleneksel Horasan harcı işçiliği arasında, her detayı uzman ekibimizce planlanan prestijli düğünlere ev sahipliği yapıyoruz.",
        category: "Düğün & Nişan",
        image: "/images/odalar/aile-odasi-4-kisilik/2.jpg",
      },
      {
        title: "Kurumsal Off-Site Deneyimi",
        description: "Şehrin gürültüsünden arınmış, Kozbeyli taşının doğal nefes alma özelliği sayesinde yaz aylarında bile doğal serinlik sunan toplantı alanlarımızda verimliliği artırın. 40 kişiye kadar butik toplantı kapasitemiz, yüksek hızlı internet ve şömineli kapalı alanımızla kurumsal prestiji tarihle birleştiriyoruz.",
        category: "Kurumsal",
        image: "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg",
      },
      {
        title: "Gurme Gastronomi Kutlamaları",
        description: "Doğum günü veya yıl dönümü gibi özel anlarınızı, Antakya ve Ege mutfağının hibritleştiği gurme lezzetlerle taçlandırın. Konak avlusundaki 180 yıllık orijinal dibek taşında elde dövülen ve odun ateşinde ağır ağır pişen imza dibek kahvemiz, kutlamanıza gerçek bir tarihsel doku katacak.",
        category: "Özel Gün",
        image: "/images/odalar/aile-odasi-4-kisilik/4.jpg",
      },
    ],
  },
  en: {
    hero: {
      eyebrow: "EVENTS",
      title: "Your Story, Our Historic Setting",
      text: "In the heart of the Aegean, Kozbeyli Konağı curates intimate weddings, private celebrations and focused corporate gatherings with historic texture.",
    },
    requestCta: "REQUEST A PROPOSAL",
    lead: {
      eyebrow: "CONCIERGE",
      title: "Let Us Curate Your Event",
      text: "Share the occasion, guest profile and preferred rhythm; our team will prepare a tailored proposal for your celebration or gathering.",
    },
    packages: [
      {
        title: "Boutique Wedding in Registered Heritage",
        description: "Kozbeyli Konağı is a registered stone mansion shaped by the shared heritage of Greek and Turkish architecture. In the restored courtyard, among stone walls and Horasan mortar craftsmanship, our team curates refined weddings for up to 150-200 guests.",
        category: "Wedding & Engagement",
        image: "/images/odalar/aile-odasi-4-kisilik/2.jpg",
      },
      {
        title: "Corporate Off-Site Experience",
        description: "Away from the city's pace, the natural comfort of Kozbeyli stone creates a calm setting for focused meetings. With boutique meeting capacity for up to 40 guests, high-speed internet and a fireplace salon, corporate gatherings gain a distinctive Aegean character.",
        category: "Corporate",
        image: "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg",
      },
      {
        title: "Gourmet Gastronomy Celebrations",
        description: "Birthdays, anniversaries and private dinners can be shaped around a curated Antakya and Aegean table. The original 180-year-old dibek stone and slow-cooked Turkish coffee bring a memorable layer of historic texture to the evening.",
        category: "Private Occasion",
        image: "/images/odalar/aile-odasi-4-kisilik/4.jpg",
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    hero: { eyebrow: string; title: string; text: string };
    requestCta: string;
    lead: { eyebrow: string; title: string; text: string };
    packages: { title: string; description: string; category: string; image: string }[];
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
      <main className="section">
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

          <FadeIn delay={0.5}>
            <div id="teklif" className="lead-section">
               <SectionTitle
                  eyebrow={t.lead.eyebrow}
                  title={t.lead.title}
                  text={t.lead.text}
                />
              <LeadForm />
            </div>
          </FadeIn>
        </div>
      </main>

      <style jsx>{`
        .org-grid {
          display: flex;
          flex-direction: column;
          gap: 100px;
          margin-top: 80px;
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

        .org-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 32px;
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
        }
      `}</style>
    </>
  );
}
