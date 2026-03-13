"use client";

import { SiteHeader } from "@/components/site-header";
import { FadeIn, StaggerContainer } from "@/components/animations";
import { Clock, Coffee, Wifi, MapPin, ShieldCheck, HeartPulse } from "lucide-react";

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
    content: "Kozbeyli Köyü'nün merkezindeyiz. Yeni Foça'ya 12km, Eski Foça'ya 18km mesafedeyiz. VIP transfer hizmetimiz için concierge ile iletişime geçebilirsiniz."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-gold" />,
    title: "Güvenlik & Hijyen",
    content: "Konağımız 7/24 güvenlik kameraları ile izlenmekte ve en yüksek hijyen standartlarında günlük temizlik yapılmaktadır."
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-gold" />,
    title: "Esneklik & İptal",
    content: "Direkt rezervasyonlarda 48 saat öncesine kadar ücretsiz iptal ve tarih değişikliği imkanı sunuyoruz."
  }
];

export default function GuestGuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="guest-guide-page">
        <section className="section bg-fdfaf6 pt-32 pb-20 border-b border-zinc-100">
          <div className="container text-center">
            <FadeIn>
              <span className="eyebrow tracking-widest text-zinc-400 uppercase text-xs mb-4 block">SERVİS STANDARTLARIMIZ</span>
              <h1 className="serif text-5xl md:text-6xl text-zinc-900 mb-6">Misafir Rehberi</h1>
              <p className="max-w-2xl mx-auto text-zinc-600 leading-relaxed text-lg">
                Konaklamanız süresince ihtiyacınız olabilecek tüm teknik detaylar ve servis saatlerimizi aşağıda bulabilirsiniz. 
                Daha fazlası için AI Concierge her an yanınızda.
              </p>
            </FadeIn>
          </div>
        </section>

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
        <section className="section bg-zinc-900 py-20 overflow-hidden">
          <div className="container relative text-center text-white">
            <FadeIn>
               <h2 className="serif text-3xl md:text-5xl mb-8">Henüz Cevap Almadınız mı?</h2>
               <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
                 Kozbeyli Konağı Dijital Asistanı (AI Concierge) WhatsApp üzerinden de hizmetinizdedir.
               </p>
               <a href="https://wa.me/905322342686" className="button secondary invert">WHATSAPP İLE SORUN</a>
            </FadeIn>
          </div>
        </section>
      </main>

      <style jsx>{`
        .guest-guide-page { min-height: 100vh; }
        .guide-card { cursor: default; }
      `}</style>
    </>
  );
}
