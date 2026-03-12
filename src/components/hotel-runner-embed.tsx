"use client";

import Script from "next/script";

export function HotelRunnerEmbed() {
  const slug = process.env.NEXT_PUBLIC_HOTELRUNNER_SLUG || "KOZBEYLI_KONAGI_SLUG";
  const hasLiveSlug = slug !== "KOZBEYLI_KONAGI_SLUG";

  return (
    <div className="embed-box">
      <div id="hotelrunner-booking-widget" />
      <Script src="https://app.hotelrunner.com/widgets/booker.js" strategy="afterInteractive" />
      <Script id="hotelrunner-init" strategy="afterInteractive">
        {`
          if (window.HotelRunnerBooker) {
            window.HotelRunnerBooker.init({
              hotelSlug: "${slug}",
              container: "#hotelrunner-booking-widget",
              language: "tr"
            });
          }
        `}
      </Script>
      
      <p className="muted" style={{ marginTop: "16px" }}>
        {hasLiveSlug
          ? "Canlı rezervasyon motoru aktif. En iyi fiyat için direkt rezervasyon yapabilirsiniz."
          : "HotelRunner slug bilgisi eklendiğinde bu alanda canlı rezervasyon motoru görünecek."}
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
        <a className="button secondary" href="tel:+902328261234">
          Rezervasyon Hattı
        </a>
        <a className="button primary" href="https://wa.me/905300000000" target="_blank" rel="noreferrer">
          WhatsApp Concierge
        </a>
      </div>
    </div>
  );
}
