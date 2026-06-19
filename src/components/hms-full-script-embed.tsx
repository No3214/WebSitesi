"use client";

import { useEffect, useRef, useState } from "react";

import { getWhatsAppHref } from "@/lib/contact";
import { publicEnv } from "@/lib/public-env";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";

/**
 * HMS "iFrame [TAM]" script yontemi.
 * HMS panelinin verdigi kanal script'ini (app.hms.gen.tr/.../kozbeyli-konagi.js)
 * yalnizca istemci tarafinda, container hazir olduktan sonra yukler — LCP'yi
 * bloklamaz. Yuklenemezse rezervasyon linkine + WhatsApp'a dusurur.
 *
 * NOT: CSP'de script-src/connect-src icine app.hms.gen.tr eklenmistir.
 */
type Props = {
  locale?: "tr" | "en";
  /** Override; verilmezse env NEXT_PUBLIC_HMS_SCRIPT_URL kullanilir */
  scriptUrl?: string;
};

export function HMSFullScriptEmbed({ locale = "tr", scriptUrl }: Props) {
  const url = scriptUrl || publicEnv.NEXT_PUBLIC_HMS_SCRIPT_URL;
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    const container = containerRef.current;

    // Ayni script iki kez yuklenmesin
    if (document.querySelector(`script[data-hms-embed="${url}"]`)) return;

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.hmsEmbed = url;
    script.onerror = () => {
      console.warn("hms_script_error", url);
      setFailed(true);
    };
    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, [url]);

  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);
  const whatsappHref = getWhatsAppHref(
    locale === "tr"
      ? "Merhaba, web sitesinden geldim. Musaitlik ogrenmek istiyorum."
      : "Hello, I came from the website and would like to check availability."
  );

  return (
    <div className="embed-box" style={{ display: "grid", gap: 16 }}>
      <div ref={containerRef} data-event="booking_engine_open" style={{ minHeight: 640 }} />

      {failed && (
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {locale === "tr"
            ? "Rezervasyon modulu su an yuklenemedi. Asagidaki baglantidan dogrudan rezervasyon yapabilirsiniz."
            : "The booking module could not load. You can reserve directly via the link below."}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          className="button gold"
          href={bookingHref}
          target="_blank"
          rel="noopener noreferrer"
          data-event="booking_engine_open"
        >
          {locale === "tr" ? "Rezervasyon Sayfasini Ac" : "Open Booking Page"}
        </a>
        <a
          className="button secondary"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-event="whatsapp_click"
        >
          {locale === "tr" ? "WhatsApp Destek" : "WhatsApp Support"}
        </a>
      </div>
    </div>
  );
}
