"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Coffee, Leaf, Sun, Utensils, Wine } from "lucide-react";

const highlights = [
  {
    icon: Utensils,
    title: "İnci Hanım'ın Mutfağı",
    text: "Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir gastronomi laboratuvarı. Sac kavurma, zeytinyağlılar ve ev yapımı baklava.",
  },
  {
    icon: Coffee,
    title: "180 Yıllık Taş Dibek",
    text: "Orijinal taş dibekte her gün taze olarak elde dövülen Dibek Kahvesi. Köydeki tek gerçek uygulayıcısı olduğumuz bir ritüel.",
  },
  {
    icon: Sun,
    title: "Organik Köy Kahvaltısı",
    text: "Asırlık zeytin ağaçlarından soğuk sıkım zeytinyağı, taze keçi peyniri, İnci Hanım'ın geleneksel reçelleri ve taş fırın ekmeği.",
  },
  {
    icon: Leaf,
    title: "Farm-to-Table Felsefesi",
    text: "Bahçemizden toplanan mevsim sebzeleri, köyün zeytin tarlalarından gelen ürünler ve yerel üreticilerden temin edilen malzemeler.",
  },
  {
    icon: Wine,
    title: "Ege Şarapları",
    text: "Foça ve çevresindeki butik bağlardan özenle seçilmiş yerel şaraplar, her yemeğe eşlik eden profesyonel eşleştirme önerileri.",
  },
];

const menuCategories = [
  { name: "Serpme Kahvaltı", time: "08:30 – 11:00", desc: "Serpme kahvaltı + sucuklu yumurta + pişi — tüm konaklama paketlerine dahil" },
  { name: "Fix Menü (Soft İçecek Dahil)", time: "19:00 – 22:00", desc: "Ege & Antakya mutfağı fix menü. Soft içecekler dahil. ₺2.500/kişi", price: "₺2.500" },
  { name: "Fix Menü (Alkol Dahil)", time: "19:00 – 22:00", desc: "Ege & Antakya mutfağı fix menü. Alkollü içecekler dahil. ₺2.750/kişi", price: "₺2.750" },
  { name: "Dibek Kahve & Tatlı", time: "Gün boyu", desc: "Taş dibekte dövülen kahve, ev yapımı baklava ve tatlılar" },
];

export function GastronomyClient() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section style={{ position: "relative", height: "50vh", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Image
            src="/images/rooms/aile-3.jpeg"
            alt="Kozbeyli Konağı restoran ve gastronomi"
            fill
            className="object-cover"
            priority
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "white" }}>
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>GASTRONOMİ</span>
            <h1 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "700px", margin: "12px auto 0", lineHeight: 1.15 }}>
              Antakya&apos;dan Ege&apos;ye<br />Bir Lezzet Köprüsü
            </h1>
          </div>
        </section>

        {/* Intro */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
              <FadeIn direction="left">
                <div style={{ position: "relative", height: "460px" }}>
                  <Image
                    src="/images/rooms/standart-2.jpeg"
                    alt="Organik serpme köy kahvaltısı"
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              </FadeIn>
              <FadeIn direction="right">
                <div>
                  <span className="eyebrow">MUTFAK FELSEFEMİZ</span>
                  <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--olive)", margin: "12px 0 24px", lineHeight: 1.2 }}>
                    Toprağın Mirası, Annenin Eli
                  </h2>
                  <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
                    İnci Hanım, Antakya&apos;nın zengin lezzet kültürünü Ege&apos;nin bereket dolu topraklarıyla buluşturarak eşsiz bir mutfak yaratmıştır. Her tabak, nesiller arası aktarılan tariflerin ve mevsimin en taze ürünlerinin buluşmasıdır.
                  </p>
                  <p style={{ color: "#555", lineHeight: 1.8 }}>
                    Restoranımız sadece otel misafirlerine değil, tüm yemekseverlere açıktır. Fix menü ağırlıklı servis (alakart yok). Mutfak kapanış 22:00, restoran kapanış 23:00.
                  </p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
                    <Link href="/menu" className="button primary">GÜNCEL MENÜ</Link>
                    <a href="tel:+902328261112" className="button secondary">REZERVASYON</a>
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
              <SectionTitle eyebrow="ÖNE ÇIKANLAR" title="Gastronomi Deneyimleri" text="Her biri bir hikaye, her biri bir gelenek." />
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.08}>
                    <div className="feature-box" style={{ background: "var(--white)", padding: "36px 28px", border: "1px solid var(--border)" }}>
                      <Icon size={24} style={{ color: "var(--gold)", marginBottom: "14px" }} />
                      <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{item.title}</h3>
                      <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.92rem" }}>{item.text}</p>
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
              <SectionTitle eyebrow="RESTORAN" title="Servis Saatleri & Menü" />
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {menuCategories.map((cat, idx) => (
                <FadeIn key={idx} delay={idx * 0.05}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 0", borderBottom: "1px solid var(--border)", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <h3 className="serif" style={{ fontSize: "1.15rem", marginBottom: "6px", color: "var(--olive)" }}>{cat.name}</h3>
                      <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>{cat.desc}</p>
                    </div>
                    <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>{cat.time}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn>
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Link href="/menu" className="button primary">TÜM MENÜYÜ GÖR</Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="section section-alt">
          <div className="container" style={{ textAlign: "center" }}>
            <FadeIn>
              <span className="eyebrow">ÖZEL DENEYİMLER</span>
              <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--olive)", margin: "12px 0 20px" }}>Gastronomi Atölyesi &amp; Şarap Tadımı</h2>
              <p style={{ color: "#555", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.7 }}>
                İnci Hanım ile birlikte yemek yapın, Ege şaraplarını tadın veya taş dibek kahve ritüeline katılın. Konaklayan ve dış misafirlerimize özel deneyim paketleri.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/deneyimler" className="button primary">DENEYİMLERİ KEŞFEDİN</Link>
                <Link href="/etkinlikler" className="button secondary">ETKİNLİK TAKVİMİ</Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
