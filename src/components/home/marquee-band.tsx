"use client";

const marqueeItems = {
  tr: ["Beş Asırlık Köy Dokusu", "180 Yıllık Dibek Ritüeli", "Ege & Antakya Mutfağı", "Foça", "Slow Living", "Butik Misafirperverlik"],
  en: ["Five-Century Village Texture", "180-Year Dibek Ritual", "Aegean & Antakya Cuisine", "Foça", "Slow Living", "Boutique Hospitality"],
};

export function MarqueeBand({ locale }: { locale: "tr" | "en" }) {
  const marquee = marqueeItems[locale];

  return (
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
  );
}
