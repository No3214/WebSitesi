"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { Building, Coffee, Leaf, Users, Wifi, Utensils } from "lucide-react";
import { useDictionary } from "@/hooks/use-dictionary";

const features = {
  tr: [
    { icon: Building, title: "Özel Toplantı Alanı", text: "Tarihi taş konakta 30 kişiye kadar toplantı ve sunum imkanı." },
    { icon: Users, title: "Team Building", text: "Şarap tadımı, zeytin hasadı, yemek atölyesi gibi takım aktiviteleri." },
    { icon: Leaf, title: "Doğa Retreat", text: "Şehir stresinden uzakta, Ege'nin huzurunda stratejik planlama." },
    { icon: Coffee, title: "Dibek Kahvesi Molası", text: "180 yıllık gelenek ile kahve molalarınızı özelleştirin." },
    { icon: Utensils, title: "Özel Menü", text: "Kurumsal etkinliğinize özel tasarlanmış Antakya & Ege menüsü." },
    { icon: Wifi, title: "Teknik Altyapı", text: "Yüksek hızlı Wi-Fi, projeksiyon, beyaz tahta ve ses sistemi." },
  ],
  en: [
    { icon: Building, title: "Private Meeting Space", text: "Meeting and presentation facilities for up to 30 guests in a historic stone manor." },
    { icon: Users, title: "Team Building", text: "Team activities such as wine tasting, olive harvesting, and cooking workshops." },
    { icon: Leaf, title: "Nature Retreat", text: "Strategic planning in the serenity of the Aegean, away from city stress." },
    { icon: Coffee, title: "Dibek Coffee Break", text: "Customize your coffee breaks with a 180-year-old tradition." },
    { icon: Utensils, title: "Custom Menu", text: "A bespoke Antakya & Aegean menu tailored for your corporate event." },
    { icon: Wifi, title: "Technical Infrastructure", text: "High-speed Wi-Fi, projector, whiteboard, and sound system." },
  ],
};

const t = {
  tr: {
    sectionEyebrow: "KURUMSAL",
    sectionTitle: "İş Dünyası İçin Eşsiz Bir Mekan",
    sectionText: "Tarihin ve doğanın buluştuğu yerde, verimli toplantılar ve unutulmaz ekip deneyimleri.",
    formEyebrow: "TEKLİF ALIN",
    formTitle: "Kurumsal Etkinliğinizi Planlayalım",
    formText: "İhtiyaçlarınıza özel fiyat teklifi için formu doldurun.",
  },
  en: {
    sectionEyebrow: "CORPORATE",
    sectionTitle: "A Unique Venue for Business",
    sectionText: "Productive meetings and unforgettable team experiences where history meets nature.",
    formEyebrow: "GET A QUOTE",
    formTitle: "Let Us Plan Your Corporate Event",
    formText: "Fill out the form to receive a custom quote tailored to your needs.",
  },
};

export function CorporateClient() {
  const { locale } = useDictionary();
  const text = t[locale];
  const featureList = features[locale];

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={text.sectionEyebrow} title={text.sectionTitle} text={text.sectionText} />
            </FadeIn>

            <div className="feature-grid">
              {featureList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={idx} delay={idx * 0.08}>
                    <div className="feature-box" style={{ padding: "36px 28px", background: "var(--white)", border: "1px solid var(--border)" }}>
                      <Icon size={28} style={{ color: "var(--gold)", marginBottom: "16px" }} />
                      <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{item.title}</h3>
                      <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.92rem" }}>{item.text}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="kurumsal-teklif">
          <div className="container" style={{ maxWidth: "900px" }}>
            <FadeIn>
              <SectionTitle eyebrow={text.formEyebrow} title={text.formTitle} text={text.formText} />
              <LeadForm />
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
