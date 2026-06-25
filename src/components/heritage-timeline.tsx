import { FadeIn } from "@/components/animations";

type Locale = "tr" | "en";

type Entry = { year: string; title: string; text: string };

// YALNIZ dogrulanmis tarihler/olgular (history-client mevcut metniyle ayni kaynak):
// 5 asirlik koy dokusu, 1870-1891 insa, 2012 Anitlar Kurulu denetiminde
// cimentosuz restorasyon, Living Museum. Uydurma tarih YOK.
const TIMELINE: Record<Locale, { eyebrow: string; heading: string; entries: Entry[] }> = {
  tr: {
    eyebrow: "ZAMAN ÇİZGİSİ",
    heading: "Taşın Hafızası",
    entries: [
      {
        year: "Beş Asır",
        title: "Köyün taş dokusu",
        text: "Kozbeyli'nin beş asırlık sivil mimari dokusu; konak bu mirasın en eski örneklerinden biri.",
      },
      {
        year: "1870–1891",
        title: "Konağın inşası",
        text: "Bölgenin varlıklı tüccar aileleri için inşa edildi; zemin katındaki şarap ve zeytinyağı mahzenleri dönemin ticari gücünü taşır.",
      },
      {
        year: "2012",
        title: "Restorasyonun başlangıcı",
        text: "Anıtlar Kurulu denetiminde, çimento kullanılmadan, orijinal tekniklerle restorasyona başlandı.",
      },
      {
        year: "Bugün",
        title: "Living Museum",
        text: "Her taş aslına sadık korunarak, yaşayan bir müze felsefesiyle misafirleri ağırlıyor.",
      },
    ],
  },
  en: {
    eyebrow: "TIMELINE",
    heading: "The Memory of Stone",
    entries: [
      {
        year: "Five Centuries",
        title: "The village's stone fabric",
        text: "Kozbeyli's five-century civil-architecture fabric; the mansion is one of its oldest surviving examples.",
      },
      {
        year: "1870–1891",
        title: "Building the mansion",
        text: "Built for the region's prosperous merchant families; the ground-floor wine and olive-oil cellars still carry the era's commercial strength.",
      },
      {
        year: "2012",
        title: "Restoration begins",
        text: "Restoration began under heritage-board supervision, using original techniques with no cement.",
      },
      {
        year: "Today",
        title: "Living Museum",
        text: "Each stone preserved faithfully, welcoming guests within a living-museum philosophy.",
      },
    ],
  },
};

/**
 * Konağın zaman çizgisi — ince (hairline) dikey omurga + dönüm noktaları.
 * Scroll-hijack YOK; sadece FadeIn ile nazik giriş (reduced-motion FadeIn'de güvenli).
 * Tüm tarihler doğrulanmış; uydurma içerik yok.
 */
export function HeritageTimeline({ locale = "tr" }: { locale?: Locale }) {
  const t = TIMELINE[locale];
  return (
    <div className="heritage-timeline-wrap">
      <div className="heritage-timeline-head">
        <span className="eyebrow">{t.eyebrow}</span>
        <h3 className="serif heritage-timeline-heading">{t.heading}</h3>
      </div>
      <ol className="heritage-timeline">
        {t.entries.map((e) => (
          <li key={e.year} className="heritage-timeline-item">
            {/* Dot, FadeIn'in DISINDA: FadeIn transform uyguladigi icin absolute
                dot'u kendi kutusuna gore konumlandirip yili ortmesin diye li'nin
                dogrudan cocugu olarak omurgaya hizalanir. */}
            <span className="heritage-timeline-dot" aria-hidden />
            <FadeIn>
              <span className="heritage-timeline-year">{e.year}</span>
              <h4 className="heritage-timeline-title">{e.title}</h4>
              <p className="heritage-timeline-text">{e.text}</p>
            </FadeIn>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default HeritageTimeline;
