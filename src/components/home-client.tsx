"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { FadeIn, StaggerContainer } from "@/components/animations";
import { HotelRunnerEmbed } from "@/components/hotel-runner-embed";
import { SectionTitle } from "@/components/section-title";
import { SiteHeader } from "@/components/site-header";
import { rooms } from "@/data/rooms";
import { getDictionary } from "@/lib/dictionary";
import { Star, ArrowRight, Utensils, Gem, MapPin, CalendarDays, Users, Wine, ChevronDown } from "lucide-react";

const experiences = [
  {
    icon: Utensils,
    title: { tr: "Antakya & Ege Gastronomisi", en: "Antakya & Aegean Gastronomy" },
    text: {
      tr: "İnci Hanım'ın özel reçeteleri, sac kavurma ve 180 yıllık taş dibekte dövülen taze kahve.",
      en: "İnci Hanım's special recipes, sac kavurma, and fresh coffee ground in a 180-year-old stone dibek.",
    },
  },
  {
    icon: Gem,
    title: { tr: "500 Yıllık Taş Miras", en: "500-Year Stone Heritage" },
    text: {
      tr: "Horasan harcıyla örülmüş duvarlar, orijinal andezit taş ve L-Tipi Sofa mimarisi.",
      en: "Walls woven with Horasan mortar, original andesite stone, and L-Type Sofa architecture.",
    },
  },
  {
    icon: MapPin,
    title: { tr: "Küratörlü Foça Kaçamağı", en: "Curated Foça Escape" },
    text: {
      tr: "Tekne turu, köy rotası ve gastronomi deneyimi tek pakette.",
      en: "Boat tour, village route, and gastronomy experience in one package.",
    },
  },
];

const testimonials = [
  {
    text: "Tarihi dokunun bu kadar zarif korunduğu bir yer görmedik. Kahvaltı muhteşemdi.",
    author: "Selin & Murat",
    source: "Google",
    rating: 5,
  },
  {
    text: "Konağın atmosferi, İnci Hanım'ın yemekleri ve Ege'nin huzuru... Tekrar geleceğiz.",
    author: "Ayşe K.",
    source: "Booking.com",
    rating: 5,
  },
  {
    text: "Direkt rezervasyon yaptık, ekstra indirim ve hoşgeldin kokteyli aldık. Tavsiye ederiz.",
    author: "Emre T.",
    source: "TripAdvisor",
    rating: 5,
  },
];

const faqs = [
  {
    q: { tr: "Check-in ve check-out saatleri nedir?", en: "What are the check-in and check-out times?" },
    a: {
      tr: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır. Erken giriş ve geç çıkış talepleriniz için bizimle iletişime geçebilirsiniz.",
      en: "Check-in is from 14:00, check-out is by 12:00. Contact us for early check-in or late check-out requests.",
    },
  },
  {
    q: { tr: "Direkt rezervasyonun avantajı nedir?", en: "What is the advantage of direct booking?" },
    a: {
      tr: "Web sitemizden yapacağınız direkt rezervasyonlarda en iyi fiyat garantisi, ücretsiz hoşgeldin kokteyli ve esnek iptal koşulları sunuyoruz. OTA kanallarında bu avantajlar geçerli değildir.",
      en: "Direct bookings through our website include best price guarantee, complimentary welcome cocktail, and flexible cancellation. These advantages are not available on OTA channels.",
    },
  },
  {
    q: { tr: "Çocuklu aileler için uygun mu?", en: "Is it suitable for families with children?" },
    a: {
      tr: "Evet, 45 ve 50 m² aile odalarımız, ücretsiz bebek yatağı hizmeti ve çocuk dostu menülerimiz bulunmaktadır.",
      en: "Yes, we have 45 and 50 m² family rooms, free baby cot service, and child-friendly menus.",
    },
  },
  {
    q: { tr: "Restoran sadece konaklayan misafirlere mi açık?", en: "Is the restaurant only for hotel guests?" },
    a: {
      tr: "Hayır, restoranımız dış misafirlere de açıktır. Ancak yoğun dönemlerde rezervasyon yapmanızı öneririz.",
      en: "No, our restaurant is also open to outside guests. However, we recommend making a reservation during busy periods.",
    },
  },
  {
    q: { tr: "Organizasyon ve özel etkinlik düzenliyor musunuz?", en: "Do you organize events and private functions?" },
    a: {
      tr: "Evet, butik düğünler, kurumsal toplantılar, şarap tadımı ve özel akşam yemekleri düzenliyoruz. Detaylar için organizasyonlar sayfamızı ziyaret edin.",
      en: "Yes, we host boutique weddings, corporate meetings, wine tastings, and special dinners. Visit our events page for details.",
    },
  },
];

export function HomeClient() {
  const [dict, setDict] = useState<Record<string, Record<string, string>> | null>(null);
  const [locale, setLocale] = useState<"tr" | "en">("tr");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    setLocale(currentLocale);
    getDictionary(currentLocale).then(setDict);
  }, []);

  if (!dict) return <div style={{ minHeight: "100vh" }} />;

  const nav = dict.Navigation;
  const featuredRooms = rooms.slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main>
        {/* === HERO === */}
        <section className="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
              alt="Kozbeyli Konağı - 500 yıllık taş butik otel"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }} />
          </div>

          <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: "80px" }}>
            <FadeIn direction="down">
              <span className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
                {locale === "tr" ? "FOÇA · KOZBEYLİ KÖYÜ · 1870" : "FOÇA · KOZBEYLİ VILLAGE · 1870"}
              </span>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h1 className="serif" style={{ color: "#fff", fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.08, marginBottom: "24px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
                {locale === "tr" ? (
                  <>Taş Duvarların Arasında<br />Zamanın Durduğu Yer</>
                ) : (
                  <>Where Time Stands Still<br />Among Stone Walls</>
                )}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.15rem", maxWidth: "640px", margin: "0 auto 40px", lineHeight: 1.7 }}>
                {locale === "tr"
                  ? "500 yıllık tescilli taş mimarinin içinde, Antakya & Ege mutfağı, kişiselleştirilmiş hizmet ve rafine bir kaçış."
                  : "Within 500-year-old registered stone architecture, Antakya & Aegean cuisine, personalized service and a refined escape."}
              </p>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/#rezervasyon" className="button primary" style={{ background: "var(--gold)", borderColor: "var(--gold)", color: "#fff", fontSize: "0.85rem" }}>
                  {locale === "tr" ? "HEMEN REZERVASYON" : "BOOK NOW"}
                </Link>
                <Link href="/odalar" className="button secondary" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>
                  {locale === "tr" ? "ODALARI KEŞFEDİN" : "EXPLORE ROOMS"}
                </Link>
              </div>
            </FadeIn>
          </div>

          <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 2, animation: "bounce 2s infinite" }}>
            <ChevronDown size={28} color="rgba(255,255,255,0.5)" />
          </div>
        </section>

        {/* === DIRECT BOOKING ADVANTAGE === */}
        <section style={{ padding: "0", background: "var(--olive)" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "48px", padding: "28px 0", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.9)" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {locale === "tr" ? "Direkt Rezervasyon Avantajları:" : "Direct Booking Benefits:"}
                </span>
              </div>
              {[
                locale === "tr" ? "En İyi Fiyat Garantisi" : "Best Price Guarantee",
                locale === "tr" ? "Hoşgeldin Kokteyli" : "Welcome Cocktail",
                locale === "tr" ? "Esnek İptal" : "Flexible Cancellation",
                locale === "tr" ? "Ücretsiz Kahvaltı" : "Free Breakfast",
              ].map((item, i) => (
                <span key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>✓</span> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* === ROOMS === */}
        <section className="section" id="konaklama">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={nav.rooms || "ODALAR"}
                title={locale === "tr" ? "Sükunet ve Konfor" : "Serenity & Comfort"}
                text={locale === "tr" ? "Her odası tarihin dokusunu taşıyan, ruhu olan konaklama birimleri." : "Accommodation units with soul, each carrying the texture of history."}
              />
            </FadeIn>
            <StaggerContainer delay={0.1}>
              <div className="card-grid">
                {featuredRooms.map((room) => (
                  <FadeIn key={room.slug}>
                    <Link href={`/odalar/${room.slug}`} className="card">
                      <div style={{ position: "relative", height: "280px" }}>
                        <Image src={room.images[0]} alt={room.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                      <div className="card-body">
                        <span className="meta">{room.size} · {room.capacity} · {room.view}</span>
                        <h3>{room.title}</h3>
                        <p>{room.short}</p>
                        <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          {locale === "tr" ? "Detayları Gör" : "View Details"} <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
            <FadeIn>
              <div style={{ textAlign: "center", marginTop: "48px" }}>
                <Link href="/odalar" className="button secondary">
                  {locale === "tr" ? "TÜM ODALARI GÖRÜNTÜLE" : "VIEW ALL ROOMS"} →
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* === EXPERIENCES === */}
        <section className="section section-alt" id="experiences">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "DENEYİM" : "EXPERIENCE"}
                title={locale === "tr" ? "Sadece Konaklama Değil" : "More Than Just a Stay"}
                text={locale === "tr" ? "Ömür boyu hatırlanacak anılar biriktirmeniz için tasarlanmış özel deneyimler." : "Special experiences designed for you to collect lifelong memories."}
              />
            </FadeIn>
            <div className="feature-grid">
              {experiences.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.1}>
                    <div className="feature-box" style={{ background: "var(--white)", padding: "48px 36px", border: "1px solid var(--border)" }}>
                      <Icon size={28} style={{ color: "var(--gold)", marginBottom: "20px" }} />
                      <h3 className="serif" style={{ fontSize: "1.35rem", marginBottom: "14px" }}>{item.title[locale]}</h3>
                      <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.95rem" }}>{item.text[locale]}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* === RESTAURANT TEASER === */}
        <section className="section" id="gastronomi-teaser">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
              <FadeIn direction="left">
                <div style={{ position: "relative", height: "500px", borderRadius: "0" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
                    alt="Kozbeyli Konağı Restoran - Antakya ve Ege Mutfağı"
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              </FadeIn>
              <FadeIn direction="right">
                <div>
                  <span className="eyebrow">{locale === "tr" ? "GASTRONOMİ" : "GASTRONOMY"}</span>
                  <h2 className="serif" style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "var(--olive)", margin: "12px 0 24px", lineHeight: 1.2 }}>
                    {locale === "tr" ? "İnci Hanım'ın Mutfağı" : "İnci Hanım's Kitchen"}
                  </h2>
                  <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
                    {locale === "tr"
                      ? "Antakya'nın derin lezzet mirasını Ege'nin taze ürünleriyle buluşturan bir mutfak. Sac kavurma, zeytinyağlılar, organik köy kahvaltısı ve 180 yıllık taş dibekte dövülen Türk kahvesi."
                      : "A cuisine that brings together Antakya's deep flavor heritage with the fresh produce of the Aegean. Sac kavurma, olive oil dishes, organic village breakfast, and Turkish coffee ground in a 180-year-old stone dibek."}
                  </p>
                  <div style={{ display: "flex", gap: "24px", marginBottom: "32px", color: "#888", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Wine size={16} /> {locale === "tr" ? "Ege Şarapları" : "Aegean Wines"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={16} /> {locale === "tr" ? "Dış Misafire Açık" : "Open to Outside Guests"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href="/gastronomi" className="button primary">{locale === "tr" ? "MENÜYÜ KEŞFEDİN" : "EXPLORE MENU"}</Link>
                    <Link href="/menu" className="button secondary">{locale === "tr" ? "GÜNCEL MENÜ" : "CURRENT MENU"}</Link>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* === EVENTS TEASER === */}
        <section className="section section-alt" id="events-teaser">
          <div className="container" style={{ textAlign: "center" }}>
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "ORGANİZASYON" : "EVENTS"}
                title={locale === "tr" ? "Özel Anlarınız İçin" : "For Your Special Moments"}
                text={locale === "tr" ? "Butik düğün, kurumsal toplantı, şarap tadımı ve özel akşam yemekleri." : "Boutique weddings, corporate meetings, wine tastings, and special dinners."}
              />
            </FadeIn>
            <div className="feature-grid">
              {[
                { icon: CalendarDays, title: locale === "tr" ? "Butik Düğün" : "Boutique Wedding", text: locale === "tr" ? "Tarihi avluda 60 kişilik samimi kutlama" : "Intimate celebration for 60 in a historic courtyard" },
                { icon: Users, title: locale === "tr" ? "Kurumsal Toplantı" : "Corporate Meeting", text: locale === "tr" ? "Off-site retreat ve team building" : "Off-site retreat and team building" },
                { icon: Wine, title: locale === "tr" ? "Gastronomi Etkinliği" : "Gastronomy Event", text: locale === "tr" ? "Şarap tadımı ve özel menü akşamları" : "Wine tasting and special menu evenings" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.1}>
                    <div className="feature-box" style={{ background: "var(--white)", padding: "48px 36px", border: "1px solid var(--border)", textAlign: "center" }}>
                      <Icon size={32} style={{ color: "var(--gold)", marginBottom: "20px" }} />
                      <h3 className="serif" style={{ fontSize: "1.3rem", marginBottom: "12px" }}>{item.title}</h3>
                      <p style={{ color: "#666", lineHeight: 1.6, fontSize: "0.95rem" }}>{item.text}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
            <FadeIn>
              <div style={{ marginTop: "40px" }}>
                <Link href="/organizasyonlar" className="button primary">
                  {locale === "tr" ? "TEKLİF ALIN" : "GET A QUOTE"} →
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* === TESTIMONIALS === */}
        <section className="section" id="yorumlar">
          <div className="container">
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "MİSAFİR YORUMLARI" : "GUEST REVIEWS"}
                title={locale === "tr" ? "Misafirlerimiz Ne Diyor?" : "What Our Guests Say"}
              />
            </FadeIn>
            <div className="feature-grid">
              {testimonials.map((t, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <div className="feature-box" style={{ background: "var(--white)", padding: "40px 32px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />
                      ))}
                    </div>
                    <p style={{ color: "#444", lineHeight: 1.7, fontStyle: "italic", marginBottom: "20px", fontSize: "0.95rem" }}>
                      &quot;{t.text}&quot;
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--olive)" }}>{t.author}</span>
                      <span style={{ fontSize: "0.75rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.source}</span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* === BOOKING === */}
        <section className="section section-alt" id="rezervasyon">
          <div className="container" style={{ maxWidth: "900px" }}>
            <FadeIn>
              <SectionTitle
                eyebrow={nav.booking || "REZERVASYON"}
                title={locale === "tr" ? "Yerinizi Ayırtın" : "Reserve Your Stay"}
                text={locale === "tr" ? "En iyi fiyat garantisi ve ücretsiz hoşgeldin kokteyli ile direkt rezervasyon avantajı." : "Direct booking advantage with best price guarantee and complimentary welcome cocktail."}
              />
              <HotelRunnerEmbed />
            </FadeIn>
          </div>
        </section>

        {/* === FAQ === */}
        <section className="section" id="faq">
          <div className="container" style={{ maxWidth: "800px" }}>
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "SIK SORULAN SORULAR" : "FAQ"}
                title={locale === "tr" ? "Merak Ettikleriniz" : "Frequently Asked Questions"}
              />
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item" style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0" }}>
                      <h3 className="serif" style={{ fontSize: "1.1rem", margin: 0 }}>{faq.q[locale]}</h3>
                      <ChevronDown size={18} style={{ color: "#999", transform: openFaq === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s ease", flexShrink: 0, marginLeft: "16px" }} />
                    </div>
                    {openFaq === idx && (
                      <p style={{ color: "#555", lineHeight: 1.7, paddingBottom: "20px", margin: 0 }}>{faq.a[locale]}</p>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* === LOCATION === */}
        <section className="section section-alt" id="konum">
          <div className="container" style={{ textAlign: "center" }}>
            <FadeIn>
              <SectionTitle
                eyebrow={locale === "tr" ? "KONUM" : "LOCATION"}
                title={locale === "tr" ? "Kozbeyli Köyü, Foça" : "Kozbeyli Village, Foça"}
                text={locale === "tr" ? "İzmir'e 80 km, Ege Denizi'ne 12 km. Tarihi köy yaşamının huzurunda." : "80 km from İzmir, 12 km from the Aegean Sea. In the serenity of historic village life."}
              />
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="https://maps.app.goo.gl/kozbeylikonagi" target="_blank" rel="noreferrer" className="button primary">
                  {locale === "tr" ? "HARİTADA GÖR" : "VIEW ON MAP"}
                </a>
                <a href="https://wa.me/905322521010" target="_blank" rel="noreferrer" className="button secondary">
                  {locale === "tr" ? "WHATSAPP İLE ULAŞIN" : "CONTACT VIA WHATSAPP"}
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        @media (max-width: 768px) {
          .hero h1 { font-size: 2.2rem !important; }
        }
      `}</style>
    </>
  );
}
