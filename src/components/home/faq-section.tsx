"use client";

import { useState } from "react";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { faqs } from "@/data/faqs";

function FaqAccordion({ locale }: { locale: "tr" | "en" }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((faq, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span>{faq.q[locale]}</span>
              <span className="faq-icon" aria-hidden>+</span>
            </button>
            {isOpen && (
              <div className="faq-a">
                <p>{faq.a[locale]}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FaqSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt" id="faq" style={{ paddingTop: "88px" }}>
      <div className="container" style={{ maxWidth: 880 }}>
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "SIK SORULANLAR" : "FAQ"}
            title={locale === "tr" ? "Karar Sürecini Kısaltın" : "Shorten the Decision Process"}
          />
          <FaqAccordion locale={locale} />
        </FadeIn>
      </div>
    </section>
  );
}
