"use client";

const marqueeItems = {
  tr: ["500 Yıllık Taş Mimari", "Dibek Kahvesi Ritüeli", "Ege & Antakya Mutfağı", "Foça — Kozbeyli Köyü", "Slow Living", "Butik Misafirperverlik"],
  en: ["500-Year Stone Architecture", "Dibek Coffee Ritual", "Aegean & Antakya Cuisine", "Foça — Kozbeyli Village", "Slow Living", "Boutique Hospitality"],
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
