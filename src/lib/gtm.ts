import { CONSENT_STORAGE_KEY, getDefaultConsent, parseConsent } from "@/lib/consent";

// GA4 / GTM + Meta Pixel funnel yardımcıları.
//
// Rıza modeli (tracking-scripts.tsx):
// - GTM yalnızca consent.analytics ile yüklenir ve event helper'ı her çağrıda
//   güncel analytics rızasını tekrar okur. Rıza geri çekildiyse dataLayer'a
//   yeni event yazılmaz.
// - Meta Pixel yalnızca consent.marketing ile yüklenir ve fbqTrack her çağrıda
//   güncel marketing rızasını tekrar okur. Rıza geri çekildiyse no-op olur.
//
// Her huni adımı GA4 ve Meta'nın standart event karşılığıyla İKİLİ basılır:
//   view_item        ↔ ViewContent
//   begin_checkout   ↔ InitiateCheckout
//   generate_lead    ↔ Lead
//   purchase         ↔ Purchase (HMS webhook/engine entegrasyonu sonrası)

type DataLayerEvent = {
  event: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    fbq?: (...args: unknown[]) => void;
  }
}

function hasOptionalConsent(category: "analytics" | "marketing") {
  if (typeof window === "undefined") return false;
  const consent = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)) || getDefaultConsent();
  return consent[category];
}

export function pushEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!hasOptionalConsent("analytics")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/** Meta Pixel standart eventi — pixel rızayla yüklenmemişse no-op. */
export function fbqTrack(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (!hasOptionalConsent("marketing")) return;
  window.fbq("track", event, params);
}

/** Oda detay görüntüleme — GA4 view_item + Meta ViewContent */
export function trackViewItem(room: { slug: string; title: string }) {
  pushEvent("view_item", {
    items: [{ item_id: room.slug, item_name: room.title, item_category: "oda" }],
  });
  fbqTrack("ViewContent", {
    content_ids: [room.slug],
    content_name: room.title,
    content_type: "product",
    content_category: "oda",
  });
}

/** Rezervasyon niyeti — GA4 begin_checkout + Meta InitiateCheckout */
export function trackBeginCheckout(roomSlug?: string) {
  pushEvent("begin_checkout", roomSlug ? { item_id: roomSlug } : {});
  fbqTrack("InitiateCheckout", roomSlug ? { content_ids: [roomSlug], content_type: "product" } : {});
}

/** Form lead'i — GA4 generate_lead + Meta Lead */
export function trackGenerateLead(leadType: string) {
  pushEvent("generate_lead", { lead_type: leadType });
  fbqTrack("Lead", { content_name: leadType, currency: "TRY", value: 0 });
}
