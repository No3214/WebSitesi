"use client";

import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { getWhatsAppHref } from "@/lib/contact";

export function FinalCta({ locale }: { locale: "tr" | "en" }) {
  const whatsappHref = getWhatsAppHref(
    locale === "tr"
      ? "Merhaba, Kozbeyli Konağı'nda konaklama planlıyorum. Yardımcı olur musunuz?"
      : "Hello, I am planning a stay at Kozbeyli Konağı. Could you assist me?"
  );

  return (
    <section className="cta-banner section-dark grain">
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <FadeIn>
          <span className="eyebrow">{locale === "tr" ? "KOZBEYLİ SİZİ BEKLİYOR" : "KOZBEYLİ AWAITS"}</span>
          <h2>
            {locale === "tr" ? "Geceyi Taşın Hafızasında Geçirin" : "Spend the Night in the Memory of Stone"}
          </h2>
          <p>
            {locale === "tr"
              ? "Tarih, gastronomi ve Ege sükuneti tek bir avluda. Yerinizi bugün ayırtın, hikayenin parçası olun."
              : "History, gastronomy and Aegean serenity in a single courtyard. Reserve today and become part of the story."}
          </p>
          <div className="hero-actions" style={{ marginTop: 0 }}>
            <Link href="/rezervasyon" className="button gold">
              {locale === "tr" ? "Rezervasyon Yap" : "Book Your Stay"}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="button ghost-light"
              data-event="whatsapp_click"
            >
              {locale === "tr" ? "WhatsApp Destek" : "WhatsApp Concierge"}
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
