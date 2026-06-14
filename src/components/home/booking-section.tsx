"use client";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { HMSBookingEmbed } from "@/components/hms-booking-embed";
import { WeatherRibbon } from "@/components/weather-ribbon";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function BookingSection({ locale, eyebrow }: Props) {
  return (
    <section className="section" id="rezervasyon">
      <div className="container" style={{ maxWidth: 900 }}>
        <FadeIn>
          <SectionTitle
            eyebrow={eyebrow}
            title={locale === "tr" ? "Yerinizi Ayırtın" : "Reserve Your Stay"}
            text={
              locale === "tr"
                ? "Müsaitlik, oda tercihi ve güvenli ödeme adımı için talebinizi doğrudan rezervasyon ekibimize iletin."
                : "Send your availability, room preference and secure payment request directly to our reservation team."
            }
          />
          <WeatherRibbon />
          <HMSBookingEmbed locale={locale} />
        </FadeIn>
      </div>
    </section>
  );
}
