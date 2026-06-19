import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { Clock, Coffee, Wifi, MapPin, ShieldCheck, HeartPulse } from "lucide-react";
import { getWhatsAppHref } from "@/lib/contact";

import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Misafir Rehberi & Konaklama Bilgileri",
  description: "Kozbeyli Konağı giriş-çıkış saatleri, serpme köy kahvaltısı saatleri, fiber internet, konaklama ve iptal politikaları gibi ihtiyacınız olan tüm pratik bilgiler.",
  keywords: [
    "kozbeyli konağı misafir rehberi",
    "foça otel kuralları",
    "kozbeyli serpme kahvaltı saatleri",
    "butik otel giriş çıkış saatleri",
    "kozbeyli konağı iletişim"
  ],
  alternates: { canonical: "/misafir-rehberi" },
  openGraph: {
    title: "Misafir Rehberi & Konaklama Bilgileri | Kozbeyli Konağı",
    description: "Kozbeyli Konağı giriş-çıkış saatleri, serpme köy kahvaltısı saatleri, fiber internet, konaklama ve iptal politikaları.",
    url: absoluteUrl("/misafir-rehberi"),
    images: [
      {
        url: absoluteUrl("/images/odalar/superrior-oda-deniz-manzarali/1.jpg"),
        alt: "Kozbeyli Konağı'nda manzaralı taş oda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Misafir Rehberi",
    description: "Konağımızın servis standartları, kahvaltı saatleri ve pratik konaklama rehberi.",
    images: [absoluteUrl("/images/odalar/superrior-oda-deniz-manzarali/1.jpg")],
  }
};

const guideItems = [
  {
    icon: <Clock className="w-6 h-6 text-gold" />,
    title: "Giriş & Çıkış",
    content: "Oda giriş saatimiz 14:00, çıkış saatimiz ise 12:00'dir. Erken giriş ve geç çıkış talepleriniz doluluk durumuna göre değerlendirilir."
  },
  {
    icon: <Coffee className="w-6 h-6 text-gold" />,
    title: "Kahvaltı Saatleri",
    content: "Kozbeyli serpme köy kahvaltımız her sabah 09:00 - 11:30 saatleri arasında restorantımızda veya bahçemizde servis edilir."
  },
  {
    icon: <Wifi className="w-6 h-6 text-gold" />,
    title: "İnternet",
    content: "Konağımızın tüm alanlarında yüksek hızlı fiber internet ücretsiz olarak misafirlerimizin kullanımına sunulmaktadır."
  },
  {
    icon: <MapPin className="w-6 h-6 text-gold" />,
    title: "Konum & Ulaşım",
    content: "Kozbeyli Köyü'nün merkezindeyiz. Yeni Foça'ya 12km, Eski Foça'ya 18km mesafedeyiz. Transfer planlama desteği için misafir ilişkileri ekibimizle iletişime geçebilirsiniz."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-gold" />,
    title: "Güvenlik & Hijyen",
    content: "Konağımız 7/24 güvenlik kameraları ile izlenmekte ve en yüksek hijyen standartlarında günlük temizlik yapılmaktadır."
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-gold" />,
    title: "Esneklik & İptal",
    content: "İptal ve tarih değişikliği koşulları rezervasyon kanalı, seçilen teklif, ödeme tipi ve konaklama tarihine göre değişir; güncel koşullar rezervasyon onayından önce yazılı olarak paylaşılır."
  }
];

export default function GuestGuidePage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="guest-guide-page">
        <PageHero
          eyebrow="SERVİS STANDARTLARIMIZ"
          title="Misafir Rehberi"
          text="Konaklamanız süresince ihtiyacınız olabilecek tüm teknik detaylar ve servis saatleri. Daha fazlası için ekibimiz aynı gün içinde yanınızda."
        />

        <section className="section py-24 bg-white">
          <div className="container">
            <StaggerContainer>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guideItems.map((item, idx) => (
                  <FadeIn key={idx}>
                    <div className="guide-card p-10 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="mb-6 p-4 bg-white rounded-xl w-fit shadow-sm border border-zinc-50">
                        {item.icon}
                      </div>
                      <h3 className="serif text-2xl mb-4 text-zinc-900">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed text-sm">
                        {item.content}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>
        
        {/* LOCAL TIPS BANNER */}
        <section className="section section-alt py-20 overflow-hidden">
          <div className="container relative text-center" style={{ zIndex: 2 }}>
            <FadeIn>
               <h2 className="serif text-3xl md:text-5xl mb-8" style={{ color: "var(--olive)" }}>Henüz Cevap Almadınız mı?</h2>
               <p className="mb-10 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
                 Kozbeyli Konağı ekibi WhatsApp üzerinden sorularınızı yanıtlar.
               </p>
               <a
                 href={getWhatsAppHref("Merhaba, misafir rehberinden ulaşıyorum.")}
                 className="button secondary"
                 data-event="whatsapp_click"
               >
                 WHATSAPP İLE SORUN
               </a>
            </FadeIn>
          </div>
        </section>
      </main>

      <style>{`
        .guest-guide-page { min-height: 100vh; }
        .guide-card { cursor: default; }
      `}</style>
    </>
  );
}
