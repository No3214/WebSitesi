import { fbqTrack, pushEvent } from "@/lib/gtm";

// CTA tıklama köprüsü.
// Site genelinde [data-event] taşıyan CTA'lar (booking engine open, WhatsApp,
// telefon, vb.) şimdiye dek hiçbir dinleyiciye bağlı DEĞİLDİ → GA4/Meta/Ads'e
// dönüşüm event'i basmıyorlardı. Bu modül tek bir delege click listener'ı ile
// bunları standart funnel event'lerine bağlar. Tüm helper'lar (pushEvent/
// fbqTrack) consent-gated'dır; rıza yoksa no-op olur. Reklam dönüşümü için
// kritik olan "booking_engine_open" (resmi HMS rezervasyon ekranını açma) artık
// begin_checkout / InitiateCheckout olarak ölçülür.

type CtaMap = {
  ga4: { event: string; params?: Record<string, unknown> };
  meta?: { event: string; params?: Record<string, unknown> };
};

const CTA_EVENTS: Record<string, CtaMap> = {
  booking_engine_open: {
    ga4: { event: "begin_checkout", params: { method: "hms_engine" } },
    meta: { event: "InitiateCheckout" },
  },
  whatsapp_click: {
    ga4: { event: "contact", params: { method: "whatsapp" } },
    meta: { event: "Contact", params: { method: "whatsapp" } },
  },
  phone_click: {
    ga4: { event: "contact", params: { method: "phone" } },
    meta: { event: "Contact", params: { method: "phone" } },
  },
};

let wired = false;

/** Delege click listener'ı bağlar; idempotent. Cleanup fonksiyonu döner. */
export function wireCtaTracking(): () => void {
  if (typeof document === "undefined" || wired) return () => {};
  wired = true;

  const handler = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const el = target.closest("[data-event]");
    if (!el) return;
    const name = el.getAttribute("data-event");
    if (!name) return;

    const mapped = CTA_EVENTS[name];
    if (mapped) {
      pushEvent(mapped.ga4.event, mapped.ga4.params);
      if (mapped.meta) fbqTrack(mapped.meta.event, mapped.meta.params);
    }
    // Named event'i de bas: GTM/Google Ads tetikleyici esnekliği + bilinmeyen
    // data-event'lerin de jenerik yakalanması (consent-gated pushEvent).
    pushEvent(name);
  };

  document.addEventListener("click", handler, { capture: true });
  return () => {
    document.removeEventListener("click", handler, { capture: true });
    wired = false;
  };
}
