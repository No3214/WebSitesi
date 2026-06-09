"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { Counter, FadeIn, RevealLines, StaggerContainer } from "@/components/animations";
import { HMSBookingEmbed } from "@/components/hms-booking-embed";
import { WeatherRibbon } from "@/components/weather-ribbon";
import { SectionTitle } from "@/components/section-title";
import { SiteHeader } from "@/components/site-header";
import { faqs } from "@/data/faqs";
import { rooms } from "@/data/rooms";
import { getDictionary } from "@/lib/dictionary";
import { getWhatsAppHref } from "@/lib/contact";

const EASE_LUX = [0.16, 1, 0.3, 1] as const;

// ---------- İçerik ----------
const experiences = [
  {
    no: "01",
    title: { tr: "Antakya & Ege Gastronomisi", en: "Antakya & Aegean Gastronomy" },
    text: {
      tr: "İnci Hanım'ın özel reçeteleri, sac kavurma ve 500 yıllık taş dibekte dövülen taze kahve.",
      en: "İnci Hanım's special recipes, sac kavurma, and fresh coffee ground in a 500-year-old stone dibek.",
    },
  },
  {
    no: "02",
    title: { tr: "VIP Transfer & Hızlı Check-in", en: "VIP Transfer & Fast Check-in" },
    text: {
      tr: "İzmir Havalimanı transferi ve odaya doğrudan giriş ayrıcalığı.",
      en: "Airport transfer and direct room entry privilege.",
    },
  },
  {
    no: "03",
    title: { tr: "Küratörlü Foça Kaçamağı", en: "Curated Foça Escape" },
    text: {
      tr: "Tekne turu, köy rotası ve gastronomi deneyimi tek pakette.",
      en: "Boat tour, village route, and gastronomy experience in one package.",
    },
  },
];

const testimonials = [
  {
    quote: {
      tr: "Taş duvarların arasında uyanmak, avluda dibek kahvesi içmek... Şehirden sonra bambaşka bir zaman dilimi.",
      en: "Waking up between stone walls, sipping dibek coffee in the courtyard... a different dimension of time after the city.",
    },
    name: "Elif & Mert",
    meta: { tr: "İSTANBUL — BALAYI", en: "ISTANBUL — HONEYMOON" },
  },
  {
    quote: {
      tr: "Kahvaltı bir öğün değil, bir tören. İnci Hanım'ın mutfağından çıkan her tabakta bir hikaye var.",
      en: "Breakfast is not a meal here, it's a ceremony. Every plate from İnci Hanım's kitchen tells a story.",
    },
    name: "Zeynep K.",
    meta: { tr: "ANKARA — GASTRONOMİ KAÇAMAĞI", en: "ANKARA — GASTRONOMY ESCAPE" },
  },
  {
    quote: {
      tr: "Kızımızın nişanını konağın avlusunda yaptık. Ekip her detayı bizden önce düşündü.",
      en: "We hosted our daughter's engagement in the courtyard. The team thought of every detail before we did.",
    },
    name: "Ayhan Ailesi",
    meta: { tr: "İZMİR — ÖZEL DAVET", en: "IZMIR — PRIVATE EVENT" },
  },
];

const marqueeItems = {
  tr: ["500 Yıllık Taş Mimari", "Dibek Kahvesi Ritüeli", "Ege & Antakya Mutfağı", "Foça — Kozbeyli Köyü", "Slow Living", "Butik Misafirperverlik"],
  en: ["500-Year Stone Architecture", "Dibek Coffee Ritual", "Aegean & Antakya Cuisine", "Foça — Kozbeyli Village", "Slow Living", "Boutique Hospitality"],
};

// ---------- FAQ Accordion ----------
function FaqAccordion({ locale }: { locale: "tr" | "en" }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((faq, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span>{faq.q[locale]}</span>
              <span className="faq-icon" aria-hidden>+</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="faq-a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_LUX }}
                >
                  <p>{faq.a[locale]}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Gastronomi video bölümü ----------
function GastronomyEditorial({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt" id="gastronomi">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MUTFAĞIN RİTMİ" : "RHYTHM OF THE KITCHEN"}
            title={locale === "tr" ? "Sofrada Yaşayan Miras" : "A Living Heritage at the Table"}
            text={
              locale === "tr"
                ? "Antakya'dan Ege'ye uzanan bir lezzet köprüsü; taş fırından serpme kahvaltıya her an bir tören."
                : "A bridge of flavor from Antakya to the Aegean; every moment a ceremony, from stone oven to breakfast spread."
            }
          />
        </FadeIn>

        <div style={{ display: "grid", gap: "clamp(48px, 7vw, 96px)" }}>
          <FadeIn>
            <div className="editorial">
              <div className="editorial-media">
                <video
                  src="/videos/kahvalti.mp4"
                  poster="/videos/kahvalti-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={locale === "tr" ? "Serpme köy kahvaltısı videosu" : "Village breakfast video"}
                />
                <span className="media-frame" aria-hidden />
              </div>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "SABAH GÜNEŞİ" : "MORNING SUN"}</span>
                <h3>{locale === "tr" ? "Köy Kahvaltısı Töreni" : "The Village Breakfast Ceremony"}</h3>
                <p>
                  {locale === "tr"
                    ? "Avlunun taş gölgesinde kurulan sofra; köy tereyağı, kahvaltılıklar ve taş fırından yeni çıkmış sıcak ekmekle başlar."
                    : "A table set in the stone shade of the courtyard; it begins with village butter, local delicacies, and warm bread fresh from the stone oven."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Yöreden toplanan mevsim ürünleri" : "Seasonal produce from the village"}</li>
                  <li>{locale === "tr" ? "Taş dibekte dövülen kahve ritüeli" : "Coffee ritual in the stone dibek"}</li>
                  <li>{locale === "tr" ? "Konak misafirlerine özel sofra düzeni" : "A table reserved for mansion guests"}</li>
                </ul>
                <Link href="/gastronomi" className="button secondary">
                  {locale === "tr" ? "Gastronomi Hikayesi" : "Gastronomy Story"}
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="editorial reverse">
              <div className="editorial-media">
                <video
                  src="/videos/mihlama.mp4"
                  poster="/videos/mihlama-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={locale === "tr" ? "Ocakta hazırlanan yöresel lezzet videosu" : "Regional dish on the stove video"}
                />
                <span className="media-frame" aria-hidden />
              </div>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "OCAK BAŞI" : "BY THE HEARTH"}</span>
                <h3>{locale === "tr" ? "İnci Hanım'ın Mutfağı" : "İnci Hanım's Kitchen"}</h3>
                <p>
                  {locale === "tr"
                    ? "Antakya kökenli aile reçeteleri, Ege otlarıyla buluşur. Ocakta ağır ağır pişen her tencere, konağın hafızasından bir sayfadır."
                    : "Family recipes rooted in Antakya meet Aegean herbs. Every pot simmering on the stove is a page from the mansion's memory."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Antakya & Ege füzyon menüsü" : "Antakya & Aegean fusion menu"}</li>
                  <li>{locale === "tr" ? "Taş fırında pişen yöresel tarifler" : "Regional recipes from the stone oven"}</li>
                  <li>{locale === "tr" ? "Akşam yemeğinde şef sofrası deneyimi" : "Chef's table experience at dinner"}</li>
                </ul>
                <Link href="/menu" className="button secondary">
                  {locale === "tr" ? "Menüyü Keşfet" : "Explore the Menu"}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

type HomeClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDict?: any;
  initialLocale?: "tr" | "en";
};

export function HomeClient({ initialDict, initialLocale = "tr" }: HomeClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(initialDict ?? null);
  const [locale, setLocale] = useState<"tr" | "en">(initialLocale);

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    if (currentLocale === initialLocale && initialDict) return; // SSR sözlüğü zaten doğru
    setLocale(currentLocale as "tr" | "en");
    getDictionary(currentLocale as "tr" | "en").then(setDict);
  }, [initialDict, initialLocale]);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Home;
  const nav = dict.Navigation;
  const marquee = marqueeItems[locale];
  const whatsappHref = getWhatsAppHref(
    locale === "tr"
      ? "Merhaba, Kozbeyli Konağı'nda konaklama planlıyorum. Yardımcı olur musunuz?"
      : "Hello, I am planning a stay at Kozbeyli Konağı. Could you assist me?"
  );

  return (
    <>
      <SiteHeader variant="overlay" />

      <main>
        {/* ============ SİNEMATİK HERO ============ */}
        <section className="hero grain">
          <motion.div
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 9, ease: "easeOut" }}
            className="hero-media"
          >
            <Image
              src="/images/hero.jpg"
              alt={locale === "tr" ? "Kozbeyli Konağı taş avlusu" : "Kozbeyli Konağı stone courtyard"}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              fetchPriority="high"
              quality={82}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
          </motion.div>

          <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
            <FadeIn direction="down">
              <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
                {t.eyebrow}
              </span>
            </FadeIn>

            <RevealLines
              as="h1"
              lines={
                locale === "tr"
                  ? ["Taşın Hafızasında", "Zarif Bir Ege Kaçamağı"]
                  : ["An Elegant Aegean Escape", "In the Memory of Stone"]
              }
            />

            <FadeIn delay={0.35}>
              <p className="hero-text">
                {locale === "tr"
                  ? "500 yıllık tescilli taş mimarinin içinde, Foça'ya 12 dakika; kişiselleştirilmiş hizmet ve rafine bir sükunet."
                  : "Within 500-year-old registered stone architecture, 12 minutes from Foça; personalized service and refined serenity."}
              </p>
            </FadeIn>

            <FadeIn delay={0.5} direction="up">
              <div className="hero-actions">
                <Link href="/rezervasyon" className="button gold">
                  {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
                </Link>
                <Link href="/organizasyonlar" className="button ghost-light">
                  {locale === "tr" ? "Davet & Etkinlik Planla" : "Plan an Event"}
                </Link>
              </div>
              <div className="hero-divider" aria-hidden />
            </FadeIn>
          </div>

          <div className="scroll-cue" aria-hidden>
            <span>{locale === "tr" ? "Keşfet" : "Explore"}</span>
            <span className="line" />
          </div>
        </section>

        {/* ============ MARQUEE BANT ============ */}
        <div className="section-dark" aria-hidden>
          <div className="marquee">
            <div className="marquee-track">
              {[...marquee, ...marquee].map((item, i) => (
                <span key={i} className="marquee-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============ KPI / GÜVEN BANDI ============ */}
        <section className="section" style={{ paddingBlock: "72px" }}>
          <div className="container">
            <FadeIn>
              <div className="kpi-row">
                <div>
                  <strong>
                    <Counter to={9.4} decimals={1} suffix="/10" />
                  </strong>
                  <span>{locale === "tr" ? "Misafir Deneyimi" : "Guest Experience"}</span>
                </div>
                <div>
                  <strong>
                    <Counter to={500} suffix="+" />
                  </strong>
                  <span>{locale === "tr" ? "Yıllık Taş Miras" : "Years of Stone Heritage"}</span>
                </div>
                <div>
                  <strong>
                    <Counter to={24} suffix={locale === "tr" ? " Saat" : " Hrs"} />
                  </strong>
                  <span>{locale === "tr" ? "Concierge Geri Dönüş" : "Concierge Response"}</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============ ODALAR ============ */}
        <section className="section" id="konaklama" style={{ paddingTop: 0 }}>
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={nav.rooms}
                title={locale === "tr" ? "Sükunet ve Konfor" : "Serenity & Comfort"}
                text={
                  locale === "tr"
                    ? "Her detayı özenle tasarlanmış, ruhu olan odalarımızda tarihin dokusunu hissedin."
                    : "Feel the texture of history in our soulfully designed rooms."
                }
              />
            </FadeIn>
            <StaggerContainer delay={0.15}>
              <div className="card-grid">
                {rooms.slice(0, 6).map((room) => (
                  <FadeIn key={room.slug}>
                    <Link href={`/odalar/${room.slug}`} className="card">
                      <div className="card-media">
                        <Image
                          src={room.images[0]}
                          alt={room.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="card-body">
                        <span className="meta">
                          {room.capacity} · {room.view}
                        </span>
                        <h3>{room.title}</h3>
                        <p>{room.short}</p>
                        <span className="card-link">
                          {locale === "tr" ? "Odayı İncele" : "View Room"}
                          <span className="arrow" aria-hidden>→</span>
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
            <FadeIn delay={0.2}>
              <div style={{ textAlign: "center", marginTop: 56 }}>
                <Link href="/odalar" className="button secondary">
                  {locale === "tr" ? "Tüm Odaları Gör" : "View All Rooms"}
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============ GASTRONOMİ (VİDEO EDİTORYAL) ============ */}
        <GastronomyEditorial locale={locale} />

        {/* ============ DENEYİM PAKETLERİ ============ */}
        <section className="section" id="experiences">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow="CONCIERGE"
                title={locale === "tr" ? "Premium Deneyim Paketleri" : "Premium Experience Packages"}
                text={
                  locale === "tr"
                    ? "Sadece konaklama değil; ömür boyu hatırlanacak anılar biriktirmeniz için tasarlanmış özel servisler."
                    : "Not just a stay; specially designed services for you to collect memories that last a lifetime."
                }
              />
            </FadeIn>
            <div className="feature-grid">
              {experiences.map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.12}>
                  <div className="feature-box">
                    <span className="feature-no" aria-hidden>{item.no}</span>
                    <h3>{item.title[locale]}</h3>
                    <p>{item.text[locale]}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MİSAFİR SESLERİ (KOYU) ============ */}
        <section className="section section-dark grain" id="misafir-sesleri">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "MİSAFİR DEFTERİ" : "GUEST BOOK"}
                title={locale === "tr" ? "Konaktan Ayrılanların Sözleri" : "Words From Our Departing Guests"}
              />
            </FadeIn>
            <div className="testimonial-grid">
              {testimonials.map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.12}>
                  <figure className="testimonial" style={{ margin: 0 }}>
                    <span className="stars" aria-label="5 yıldız">★★★★★</span>
                    <blockquote>“{item.quote[locale]}”</blockquote>
                    <figcaption>
                      {item.name} · {item.meta[locale]}
                    </figcaption>
                  </figure>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ============ REZERVASYON ============ */}
        <section className="section" id="rezervasyon">
          <div className="container" style={{ maxWidth: 900 }}>
            <FadeIn>
              <SectionTitle
                eyebrow={nav.booking}
                title={locale === "tr" ? "Yerinizi Ayırtın" : "Reserve Your Stay"}
                text={
                  locale === "tr"
                    ? "En iyi fiyat garantisi, esnek iptal ve concierge desteği ile direkt rezervasyon avantajı."
                    : "Direct booking advantage with best price guarantee, flexible cancellation, and concierge support."
                }
              />
              <WeatherRibbon />
              <HMSBookingEmbed />
            </FadeIn>
          </div>
        </section>

        {/* ============ SSS (AKORDEON) ============ */}
        <section className="section section-alt" id="faq" style={{ paddingTop: "88px" }}>
          <div className="container" style={{ maxWidth: 880 }}>
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "SIK SORULANLAR" : "FAQ"}
                title={locale === "tr" ? "Karar Sürecini Kısaltın" : "Shorten the Decision Process"}
              />
              <FaqAccordion locale={locale} />
            </FadeIn>
          </div>
        </section>

        {/* ============ FİNAL CTA ============ */}
        <section className="cta-banner section-dark grain">
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <FadeIn>
              <span className="eyebrow">{locale === "tr" ? "KOZBEYLİ SİZİ BEKLİYOR" : "KOZBEYLİ AWAITS"}</span>
              <h2>
                {locale === "tr" ? "Geceyi Taşın Hafızasında Geçirin" : "Spend the Night in the Memory of Stone"}
              </h2>
              <p>
                {locale === "tr"
                  ? "Tarih, gastronomi ve Ege sükuneti tek bir avluda. Yerinizi bugün ayırtın, hikayenin parçası olun."
                  : "History, gastronomy and Aegean serenity in a single courtyard. Reserve today and become part of the story."}
              </p>
              <div className="hero-actions" style={{ marginTop: 0 }}>
                <Link href="/rezervasyon" className="button gold">
                  {locale === "tr" ? "Rezervasyon Yap" : "Book Your Stay"}
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="button ghost-light"
                  data-event="whatsapp_click"
                >
                  {locale === "tr" ? "WhatsApp Concierge" : "WhatsApp Concierge"}
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
