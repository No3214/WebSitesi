"use client";

import { Counter, FadeIn } from "@/components/animations";

export function KpiBand({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section" style={{ paddingBlock: "72px" }}>
      <div className="container">
        <FadeIn>
          <div className="kpi-row">
            <div>
              <strong>
                <Counter to={9.4} decimals={1} suffix="/10" />
              </strong>
              <span>{locale === "tr" ? "Misafir Deneyimi" : "Guest Experience"}</span>
            </div>
            <div>
              <strong>
                <Counter to={500} suffix="+" />
              </strong>
              <span>{locale === "tr" ? "Yıllık Taş Miras" : "Years of Stone Heritage"}</span>
            </div>
            <div>
              <strong>
                <Counter to={24} suffix={locale === "tr" ? " Saat" : " Hrs"} />
              </strong>
              <span>{locale === "tr" ? "Destek Geri Dönüş" : "Support Response"}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
