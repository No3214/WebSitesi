"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Coffee, Leaf, Sun, Utensils, Wine } from "lucide-react";
import { useDictionary } from "@/hooks/use-dictionary";
import { CONTACT } from "@/lib/constants";

const highlights = [
  {
    icon: Utensils,
    title: { tr: "İnci Hanım'ın Mutfağı", en: "İnci Hanım's Kitchen" },
    text: {
      tr: "Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir gastronomi laboratuvarı. Sac kavurma, zeytinyağlılar ve ev yapımı baklava.",
      en: "A gastronomic workshop uniting the family heritage of Antakya with the ancient lands of the Aegean. Sac kavurma, olive oil dishes and homemade baklava.",
    },
  },
  {
    icon: Coffee,
    title: { tr: "180 Yıllık Taş Dibek", en: "180-Year Stone Mortar" },
    text: {
      tr: "Orijinal taş dibekte her gün taze olarak elde dövülen Dibek Kahvesi. Köydeki tek gerçek uygulayıcısı olduğumuz bir ritüel.",
      en: "Dibek Coffee hand-pounded fresh daily in the original stone mortar. A ritual of which we are the sole authentic practitioners in the village.",
    },
  },
  {
    icon: Sun,
    title: { tr: "Organik Köy Kahvaltısı", en: "Organic Village Breakfast" },
    text: {
      tr: "Asırlık zeytin ağaçlarından soğuk sıkım zeytinyağı, taze keçi peyniri, İnci Hanım'ın geleneksel reçelleri ve taş fırın ekmeği.",
      en: "Cold-pressed olive oil from century-old trees, fresh goat cheese, İnci Hanım's traditional preserves and stone-oven bread.",
    },
  },
  {
    icon: Leaf,
    title: { tr: "Tarladan Sofraya", en: "Farm to Table" },
    text: {
      tr: "Bahçemizden toplanan mevsim sebzeleri, köyün zeytin tarlalarından gelen ürünler ve yerel üreticilerden temin edilen malzemeler.",
      en: "Seasonal vegetables from our garden, products from the village's olive groves, and ingredients sourced from local producers.",
    },
  },
  {
    icon: Wine,
    title: { tr: "Ege Şarapları", en: "Aegean Wines" },
    text: {
      tr: "Foça ve çevresindeki butik bağlardan özenle seçilmiş yerel şaraplar, her yemeğe eşlik eden profesyonel eşleştirme önerileri.",
      en: "Carefully curated local wines from boutique vineyards around Foça, with professional pairing suggestions for every dish.",
    },
  },
];

const menuCategories = [
  {
    name: { tr: "Serpme Kahvaltı", en: "Spread Breakfast" },
    time: "08:30 – 11:00",
    desc: {
      tr: "Serpme kahvaltı + sucuklu yumurta + pişi — tüm konaklama paketlerine dahil",
      en: "Spread breakfast + eggs with sucuk + pişi — included in all accommodation packages",
    },
  },
  {
    name: { tr: "Fix Menü (Soft İçecek Dahil)", en: "Fixed Menu (Soft Drinks Incl.)" },
    time: "19:00 – 22:00",
    desc: {
      tr: "Ege & Antakya mutfağı fix menü. Soft içecekler dahil. ₺2.500/kişi",
      en: "Aegean & Antakya cuisine fixed menu. Soft drinks included. ₺2,500/person",
    },
    price: "₺2.500",
  },
  {
    name: { tr: "Fix Menü (Alkol Dahil)", en: "Fixed Menu (Alcohol Incl.)" },
    time: "19:00 – 22:00",
    desc: {
      tr: "Ege & Antakya mutfağı fix menü. Alkollü içecekler dahil. ₺2.750/kişi",
      en: "Aegean & Antakya cuisine fixed menu. Alcoholic beverages included. ₺2,750/person",
    },
    price: "₺2.750",
  },
  {
    name: { tr: "Dibek Kahve & Tatlı", en: "Dibek Coffee & Desserts" },
    time: { tr: "Gün boyu", en: "All day" },
    desc: {
      tr: "Taş dibekte dövülen kahve, ev yapımı baklava ve tatlılar",
      en: "Coffee ground in stone mortar, homemade baklava and desserts",
    },
  },
];

const t = {
  tr: {
    heroEyebrow: "GASTRONOMİ",
    heroTitle1: "Antakya'dan Ege'ye",
    heroTitle2: "Bir Lezzet Köprüsü",
    heroAlt: "Kozbeyli Konağı restoran ve gastronomi",
    introEyebrow: "MUTFAK FELSEFEMİZ",
    introTitle: "Toprağın Mirası, Annenin Eli",
    introP1: "İnci Hanım, Antakya'nın zengin lezzet kültürünü Ege'nin bereket dolu topraklarıyla buluşturarak eşsiz bir mutfak yaratmıştır. Her tabak, nesiller arası aktarılan tariflerin ve mevsimin en taze ürünlerinin buluşmasıdır.",
    introP2: "Restoranımız sadece otel misafirlerine değil, tüm yemekseverlere açıktır. Fix menü ağırlıklı servis (alakart yok). Mutfak kapanış 22:00, restoran kapanış 23:00.",
    introImgAlt: "Organik serpme köy kahvaltısı",
    menuBtn: "GÜNCEL MENÜ",
    reserveBtn: "REZERVASYON",
    highlightsEyebrow: "ÖNE ÇIKANLAR",
    highlightsTitle: "Gastronomi Deneyimleri",
    highlightsText: "Her biri bir hikaye, her biri bir gelenek.",
    menuEyebrow: "RESTORAN",
    menuTitle: "Servis Saatleri & Menü",
    seeAllMenu: "TÜM MENÜYÜ GÖR",
    ctaEyebrow: "ÖZEL DENEYİMLER",
    ctaTitle: "Gastronomi Atölyesi & Şarap Tadımı",
    ctaText: "İnci Hanım ile birlikte yemek yapın, Ege şaraplarını tadın veya taş dibek kahve ritüeline katılın. Konaklayan ve dış misafirlerimize özel deneyim paketleri.",
    ctaBtn1: "DENEYİMLERİ KEŞFEDİN",
    ctaBtn2: "ETKİNLİK TAKVİMİ",
  },
  en: {
    heroEyebrow: "GASTRONOMY",
    heroTitle1: "From Antakya to the Aegean",
    heroTitle2: "A Bridge of Flavors",
    heroAlt: "Kozbeyli Konağı restaurant and gastronomy",
    introEyebrow: "OUR CULINARY PHILOSOPHY",
    introTitle: "Heritage of the Land, Touch of a Mother",
    introP1: "İnci Hanım has created a unique cuisine by uniting the rich culinary culture of Antakya with the bountiful lands of the Aegean. Each plate is a meeting of generational recipes and the freshest seasonal produce.",
    introP2: "Our restaurant is open not only to hotel guests but to all food lovers. Fixed menu service (no à la carte). Kitchen closes at 22:00, restaurant at 23:00.",
    introImgAlt: "Organic spread village breakfast",
    menuBtn: "CURRENT MENU",
    reserveBtn: "RESERVATION",
    highlightsEyebrow: "HIGHLIGHTS",
    highlightsTitle: "Gastronomic Experiences",
    highlightsText: "Each one a story, each one a tradition.",
    menuEyebrow: "RESTAURANT",
    menuTitle: "Service Hours & Menu",
    seeAllMenu: "VIEW FULL MENU",
    ctaEyebrow: "SPECIAL EXPERIENCES",
    ctaTitle: "Gastronomy Workshop & Wine Tasting",
    ctaText: "Cook alongside İnci Hanım, taste Aegean wines, or join the stone mortar coffee ritual. Exclusive experience packages for guests and visitors alike.",
    ctaBtn1: "EXPLORE EXPERIENCES",
    ctaBtn2: "EVENT CALENDAR",
  },
};

export function GastronomyClient() {
  const { locale } = useDictionary();
  const text = t[locale];

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section style={{ position: "relative", height: "50vh", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Image
            src="/images/rooms/aile-3.jpeg"
            alt={text.heroAlt}
            fill
            className="object-cover"
            priority
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "white" }}>
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>{text.heroEyebrow}</span>
            <h1 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "700px", margin: "12px auto 0", lineHeight: 1.15 }}>
              {text.heroTitle1}<br />{text.heroTitle2}
            </h1>
          </div>
        </section>

        {/* Intro */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }} className="gastro-intro-grid">
              <FadeIn direction="left">
                <div style={{ position: "relative", height: "460px" }}>
                  <Image
                    src="/images/rooms/standart-2.jpeg"
                    alt={text.introImgAlt}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              </FadeIn>
              <FadeIn direction="right">
                <div>
                  <span className="eyebrow">{text.introEyebrow}</span>
                  <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--olive)", margin: "12px 0 24px", lineHeight: 1.2 }}>
                    {text.introTitle}
                  </h2>
                  <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
                    {text.introP1}
                  </p>
                  <p style={{ color: "#555", lineHeight: 1.8 }}>
                    {text.introP2}
                  </p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
                    <Link href="/menu" className="button primary">{text.menuBtn}</Link>
                    <a href={`tel:${CONTACT.phone}`} className="button secondary">{text.reserveBtn}</a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="section section-alt">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={text.highlightsEyebrow} title={text.highlightsTitle} text={text.highlightsText} />
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.08}>
                    <div className="feature-box" style={{ background: "var(--white)", padding: "36px 28px", border: "1px solid var(--border)" }}>
                      <Icon size={24} style={{ color: "var(--gold)", marginBottom: "14px" }} />
                      <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{item.title[locale]}</h3>
                      <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.92rem" }}>{item.text[locale]}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* Menu Times */}
        <section className="section">
          <div className="container" style={{ maxWidth: "800px" }}>
            <FadeIn>
              <SectionTitle eyebrow={text.menuEyebrow} title={text.menuTitle} />
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {menuCategories.map((cat, idx) => (
                <FadeIn key={idx} delay={idx * 0.05}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0", borderBottom: "1px solid var(--border)", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <h3 className="serif" style={{ fontSize: "1.15rem", marginBottom: "6px", color: "var(--olive)" }}>{cat.name[locale]}</h3>
                      <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>{cat.desc[locale]}</p>
                    </div>
                    <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {typeof cat.time === "string" ? cat.time : cat.time[locale]}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn>
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Link href="/menu" className="button primary">{text.seeAllMenu}</Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="section section-alt">
          <div className="container" style={{ textAlign: "center" }}>
            <FadeIn>
              <span className="eyebrow">{text.ctaEyebrow}</span>
              <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--olive)", margin: "12px 0 20px" }}>{text.ctaTitle}</h2>
              <p style={{ color: "#555", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.7 }}>
                {text.ctaText}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/deneyimler" className="button primary">{text.ctaBtn1}</Link>
                <Link href="/etkinlikler" className="button secondary">{text.ctaBtn2}</Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.gastro-intro-grid) {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </>
  );
}
