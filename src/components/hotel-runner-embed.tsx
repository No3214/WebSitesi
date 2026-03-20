"use client";

import Script from "next/script";
import { Phone, MessageCircle, Shield, Gift, Clock } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export function HotelRunnerEmbed() {
  const slug = process.env.NEXT_PUBLIC_HOTELRUNNER_SLUG;
  const hasLiveSlug = slug && slug !== "replace_with_hotelrunner_slug" && slug.length > 3;

  return (
    <div className="booking-section">
      {hasLiveSlug && (
        <>
          <div id="hotelrunner-booking-widget" />
          <Script src="https://app.hotelrunner.com/widgets/booker.js" strategy="afterInteractive" />
          <Script id="hotelrunner-init" strategy="afterInteractive">
            {`
              (function initHR(attempts) {
                if (attempts > 20) { if (typeof window !== 'undefined' && window.location.hostname === 'localhost') { console.warn("HotelRunner widget failed to load after 10s"); } return; }
                if (window.HotelRunnerBooker) {
                  window.HotelRunnerBooker.init({
                    hotelSlug: "${slug}",
                    container: "#hotelrunner-booking-widget",
                    language: document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr"
                  });
                } else {
                  setTimeout(function() { initHR(attempts + 1); }, 500);
                }
              })(0);
            `}
          </Script>
        </>
      )}

      {/* Booking Trust Signals */}
      <div className="trust-strip">
        <div className="trust-item">
          <Shield size={16} />
          <span>Güvenli Ödeme</span>
        </div>
        <div className="trust-item">
          <Gift size={16} />
          <span>Hoşgeldin Kokteyli</span>
        </div>
        <div className="trust-item">
          <Clock size={16} />
          <span>48 Saat Ücretsiz İptal</span>
        </div>
      </div>

      {/* Fallback / Alternative CTA */}
      <div className="booking-cta-row">
        <p className="booking-hint">
          {hasLiveSlug
            ? "Canlı müsaitlik ve en iyi fiyat için yukarıdan tarih seçin."
            : "Rezervasyon ve fiyat bilgisi için bize doğrudan ulaşabilirsiniz."}
        </p>
        <div className="booking-buttons">
          <a className="button secondary" href={`tel:${CONTACT.phone}`} aria-label="Telefon ile rezervasyon">
            <Phone size={16} /> Rezervasyon Hattı
          </a>
          <a className="button primary" href={CONTACT.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp ile rezervasyon">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>

      <style jsx>{`
        .booking-section {
          background: var(--white);
          padding: 40px;
          border: 1px solid var(--border);
        }

        .trust-strip {
          display: flex;
          justify-content: center;
          gap: 32px;
          padding: 20px 0;
          margin-top: 20px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .booking-cta-row {
          text-align: center;
          margin-top: 24px;
        }

        .booking-hint {
          color: #999;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .booking-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .booking-buttons .button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
