"use client";

import Script from "next/script";

export function HotelRunnerEmbed() {
  const slug =
    process.env.NEXT_PUBLIC_HOTELRUNNER_SLUG || "KOZBEYLI_KONAGI_SLUG";

  return (
    <div className="embed-box">
      <div id="hotelrunner-booking-widget" />
      <Script
        src="https://app.hotelrunner.com/widgets/booker.js"
        strategy="afterInteractive"
      />
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
      <p className="muted">
        HotelRunner canlı slug girildiğinde bu alan aktif rezervasyon motoruna döner.
      </p>
    </div>
  );
}
