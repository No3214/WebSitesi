"use client";

import { FadeIn } from "@/components/animations";
import { HMSBookingEmbed } from "@/components/hms-booking-embed";
import { SectionTitle } from "@/components/section-title";
import { WeatherRibbon } from "@/components/weather-ribbon";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function BookingSection({ locale, eyebrow }: Props) {
  return (
    <section className="section" id="rezervasyon">
      <div className="container" style={{ maxWidth: 900 }}>
        <FadeIn>
          <SectionTitle
            eyebrow={eyebrow}
            title={locale === "tr" ? "Rezervasyon" : "Booking"}
            text={
              locale === "tr"
                ? "Tarih, kişi sayısı ve oda seçimi resmi HMS rezervasyon ekranında açılır; ekibimiz WhatsApp ve telefon desteğiyle yanınızda kalır."
                : "Dates, guests and room selection open in the official HMS booking screen; our team remains available by WhatsApp and phone."
            }
          />
          <WeatherRibbon locale={locale} />
          <HMSBookingEmbed locale={locale} />
        </FadeIn>
      </div>
    </section>
  );
}
