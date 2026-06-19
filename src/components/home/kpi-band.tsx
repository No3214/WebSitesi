"use client";

import { FadeIn } from "@/components/animations";

export function KpiBand({ locale }: { locale: "tr" | "en" }) {
  const experienceScore = locale === "tr" ? "9,4/10" : "9.4/10";
  const responseTime = locale === "tr" ? "24 Saat" : "24 Hrs";

  return (
    <section className="section" style={{ paddingBlock: "72px" }}>
      <div className="container">
        <FadeIn>
          <div className="kpi-row">
            <div>
              <strong>{experienceScore}</strong>
              <span>{locale === "tr" ? "Misafir Deneyimi" : "Guest Experience"}</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>{locale === "tr" ? "Yıllık Taş Miras" : "Years of Stone Heritage"}</span>
            </div>
            <div>
              <strong>{responseTime}</strong>
              <span>{locale === "tr" ? "Destek Geri Dönüş" : "Support Response"}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
