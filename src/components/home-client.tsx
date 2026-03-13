"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { HotelRunnerEmbed } from "@/components/hotel-runner-embed";
import { SectionTitle } from "@/components/section-title";
import { SiteHeader } from "@/components/site-header";
import { rooms } from "@/data/rooms";
import { getDictionary } from "@/lib/dictionary";

// High-Conversion Content
const experiences = [
  {
    title: { tr: "Antakya & Ege Gastronomisi", en: "Antakya & Aegean Gastronomy" },
    text: { 
      tr: "İnci Hanım'ın özel reçeteleri, sac kavurma ve 500 yıllık taş dibekte dövülen taze kahve.", 
      en: "İnci Hanım's special recipes, sac kavurma, and fresh coffee ground in a 500-year-old stone dibek." 
    }
  },
  {
    title: { tr: "VIP Transfer & Hızlı Check-in", en: "VIP Transfer & Fast Check-in" },
    text: { 
      tr: "İzmir Havalimanı transferi ve odaya doğrudan giriş ayrıcalığı.", 
      en: "Airport transfer and direct room entry privilege." 
    }
  },
  {
    title: { tr: "Küratörlü Foça Kaçamağı", en: "Curated Foça Escape" },
    text: { 
      tr: "Tekne turu, köy rotası ve gastronomi deneyimi tek pakette.", 
      en: "Boat tour, village route, and gastronomy experience in one package." 
    }
  }
];

const faqs = [
  {
    q: { tr: "Check-in / Check-out saatleri nedir?", en: "What are the check-in / check-out times?" },
    a: { 
      tr: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır.", 
      en: "Check-in is from 14:00, and check-out is by 12:00." 
    }
  },
  {
    q: { tr: "Çocuklu aileler için uygun mu?", en: "Is it suitable for families with children?" },
    a: { 
      tr: "Evet, aile odalarımız ve çocuk dostu menülerimiz bulunmaktadır.", 
      en: "Yes, we have family rooms and child-friendly menus available." 
    }
  },
  {
    q: { tr: "Organizasyon rezervasyonu nasıl yapılır?", en: "How to make an event booking?" },
    a: { 
      tr: "Talep formunu doldurduğunuzda satış ekibimiz 24 saat içinde size döner.", 
      en: "Our sales team will contact you within 24 hours of form submission." 
    }
  }
];

export function HomeClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const [locale, setLocale] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    setLocale(currentLocale as 'tr' | 'en');
    getDictionary(currentLocale as 'tr' | 'en').then(setDict);
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Home;
  const nav = dict.Navigation;

  return (
    <>
      <SiteHeader />

      <main>
        {/* PREMIUM HERO OVERHAUL */}
        <section className="hero">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="hero-bg" 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 0,
              backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
              alt="Kozbeyli Konağı Luxury Escape"
              fill
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
          </motion.div>
          
          <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '100px', textAlign: 'center' }}>
            <FadeIn direction="down">
              <span className="eyebrow" style={{ color: 'var(--ivory)' }}>{t.eyebrow}</span>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="serif" style={{ color: 'var(--white)', fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '24px' }}>
                {locale === 'tr' ? (
                  <>Premium Taş Konakta<br />Zarif Ege Deneyimi</>
                ) : (
                  <>Elegant Aegean Experience<br />In a Premium Stone Mansion</>
                )}
              </h1>
              <p style={{ color: '#f7f4ec', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                {locale === 'tr' 
                  ? "500 yıllık tescilli taş mimarinin içinde, denize 12 km mesafede, kişiselleştirilmiş hizmet and rafine bir kaçış."
                   : "Within 500-year-old registered stone architecture, 12 km from the sea, personalized service and a refined escape."
                }
              </p>
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                 <Link href="/#rezervasyon" className="button primary">
                   {locale === 'tr' ? "HEMEN REZERVASYON" : "BOOK NOW"}
                 </Link>
                 <Link href="/organizasyonlar" className="button secondary" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>
                   {locale === 'tr' ? "ETKİNLİK PLANLA" : "PLAN AN EVENT"}
                 </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* KPI TRUST BAND */}
        <section className="section" style={{ padding: '60px 0' }}>
          <div className="container">
            <FadeIn>
              <div className="kpi-row">
                <div><strong>9.4/10</strong><span>{locale === 'tr' ? "MİSAFİR DENEYİMİ" : "GUEST EXPERIENCE"}</span></div>
                <div><strong>100%</strong><span>{locale === 'tr' ? "DİREKT REZERVASYON GÜVENİ" : "DIRECT BOOKING TRUST"}</span></div>
                <div><strong>24 {locale === 'tr' ? "SAAT" : "HOURS"}</strong><span>{locale === 'tr' ? "GERİ DÖNÜŞ SÜRESİ" : "RESPONSE TIME"}</span></div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="section" id="konaklama">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={nav.rooms}
                title={locale === 'tr' ? "Sükunet ve Konfor" : "Serenity & Comfort"}
                text={locale === 'tr' ? "Her detayı özenle tasarlanmış, ruhu olan odalarımızda tarihin dokusunu hissedin." : "Feel the texture of history in our soulfully designed rooms."}
              />
            </FadeIn>
            <StaggerContainer delay={0.2}>
              <div className="card-grid">
                {rooms.map((room) => (
                  <FadeIn key={room.slug}>
                    <Link href={`/odalar/${room.slug}`} className="card">
                      <div style={{ position: 'relative', height: '250px' }}>
                        <Image
                          src={room.images[0]}
                          alt={room.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="card-body">
                        <span className="meta">{room.capacity} · {room.view}</span>
                        <h3>{room.title}</h3>
                        <p>{room.short}</p>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* EXPERIENCE PACKAGES */}
        <section className="section section-alt" id="experiences">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={locale === 'tr' ? "CONCIERGE" : "CONCIERGE"}
                title={locale === 'tr' ? "Premium Deneyim Paketleri" : "Premium Experience Packages"}
                text={locale === 'tr' ? "Sadece konaklama değil; ömür boyu hatırlanacak anılar biriktirmeniz için tasarlanmış özel servisler." : "Not just a stay; specially designed services for you to collect memories that last a lifetime."}
              />
            </FadeIn>
            <div className="feature-grid">
              {experiences.map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <div className="feature-box" style={{ background: 'var(--white)', padding: '40px', border: '1px solid var(--border)' }}>
                    <h3 className="serif" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{item.title[locale]}</h3>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>{item.text[locale]}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="rezervasyon">
          <div className="container" style={{ maxWidth: '900px' }}>
            <FadeIn>
              <SectionTitle
                eyebrow={nav.booking}
                title={locale === 'tr' ? "Yerinizi Ayırtın" : "Reserve Your Stay"}
                text={locale === 'tr' ? "En iyi fiyat garantisi, esnek iptal ve concierge desteği ile direkt rezervasyon avantajı." : "Direct booking advantage with best price guarantee, flexible cancellation, and concierge support."}
              />
              <HotelRunnerEmbed />
            </FadeIn>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="section section-alt" id="faq">
          <div className="container" style={{ maxWidth: '900px' }}>
            <FadeIn>
              <SectionTitle
                eyebrow={locale === 'tr' ? "SIK SORULANLAR" : "FAQ"}
                title={locale === 'tr' ? "Karar Sürecini Kısaltın" : "Shorten the Decision Process"}
                text={locale === 'tr' ? "Rezervasyon öncesi aklınıza takılabilecek detaylar." : "Details that might cross your mind before booking."}
              />
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <h3 className="serif" style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{faq.q[locale]}</h3>
                    <p style={{ color: '#555' }}>{faq.a[locale]}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
