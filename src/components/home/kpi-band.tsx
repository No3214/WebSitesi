"use client";

import { FadeIn } from "@/components/animations";

export function KpiBand({ locale }: { locale: "tr" | "en" }) {
  const experienceScore = locale === "tr" ? "9,4/10" : "9.4/10";
  const receptionHours = locale === "tr" ? "12 Saat" : "12 Hrs";

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
              <strong>{receptionHours}</strong>
              <span>{locale === "tr" ? "Resepsiyon · 24:00'a kadar" : "Reception until 24:00"}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
