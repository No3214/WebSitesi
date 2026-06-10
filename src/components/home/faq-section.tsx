"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { faqs } from "@/data/faqs";

const EASE_LUX = [0.16, 1, 0.3, 1] as const;

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
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="faq-a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_LUX }}
                >
                  <p>{faq.a[locale]}</p>
                </motion.div>
              )}
            </AnimatePresence>
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
