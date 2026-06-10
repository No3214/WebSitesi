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
                ? "En iyi fiyat garantisi, esnek iptal ve concierge desteği ile direkt rezervasyon avantajı."
                : "Direct booking advantage with best price guarantee, flexible cancellation, and concierge support."
            }
          />
          <WeatherRibbon />
          <HMSBookingEmbed />
        </FadeIn>
      </div>
    </section>
  );
}
