"use client";

import { FadeIn } from "@/components/animations";

const facts = {
  tr: [
    { value: "Tescilli", label: "19. Yüzyıl Taş Konak" },
    { value: "Foça", label: "Kozbeyli Köyü" },
    { value: "Doğrudan", label: "Rezervasyon & Misafir İlişkileri" },
  ],
  en: [
    { value: "Registered", label: "19th-Century Stone Mansion" },
    { value: "Foça", label: "Kozbeyli Village" },
    { value: "Direct", label: "Booking & Guest Relations" },
  ],
} as const;

export function KpiBand({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section" style={{ paddingBlock: "72px" }} aria-label={locale === "tr" ? "Konağa dair bilgiler" : "Mansion facts"}>
      <div className="container">
        <FadeIn>
          <div className="kpi-row">
            {facts[locale].map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
