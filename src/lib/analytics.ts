/**
 * GA4 Analytics Event Tracking — Kozbeyli Konağı
 *
 * Centralizes all tracking events. Fires only when GTM/GA4 is loaded.
 * No-op in development or when dataLayer is unavailable.
 */

type EventParams = Record<string, string | number | boolean | null | undefined>;

function push(event: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  const dl = (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
  if (!dl) return;
  dl.push({ event, ...params });
}

// ─── Booking Funnel ───────────────────────────────────────────────

export function trackBookingWidgetView(page: string) {
  push("booking_widget_view", { page });
}

export function trackBookingDateSelected(checkin: string, checkout: string) {
  push("booking_date_selected", { checkin, checkout });
}

export function trackBookingRoomSelected(roomType: string, price: number) {
  push("booking_room_selected", { room_type: roomType, price });
}

export function trackBookingCompleted(value: number) {
  push("booking_completed", { value, currency: "TRY" });
}

// ─── Page & Content Engagement ────────────────────────────────────

export function trackRoomDetailView(roomType: string) {
  push("room_detail_view", { room_type: roomType });
}

export function trackGalleryInteraction(page: string, imageCount: number) {
  push("gallery_interaction", { page, image_count: imageCount });
}

export function trackMenuView(section: string) {
  push("menu_view", { section });
}

export function trackScrollDepth(percent: 25 | 50 | 75 | 100, page: string) {
  push("scroll_depth", { percent, page });
}

// ─── Contact & Conversion ─────────────────────────────────────────

export function trackPhoneClick(page: string) {
  push("phone_click", { page });
}

export function trackWhatsAppClick(page: string) {
  push("whatsapp_click", { page });
}

export function trackInquiryFormStart(type: "contact" | "wedding" | "event") {
  push("inquiry_form_start", { type });
}

export function trackInquiryFormComplete(type: "contact" | "wedding" | "event") {
  push("inquiry_form_complete", { type });
}

export function trackInquiryFormAbandon(type: string, lastField: string) {
  push("inquiry_form_abandon", { type, last_field: lastField });
}

// ─── Navigation & UX ──────────────────────────────────────────────

export function trackCTAClick(location: "header" | "sticky" | "inline" | "footer" | "mobile_bar") {
  push("cta_click", { location });
}

export function trackLanguageSwitch(from: string, to: string) {
  push("language_switch", { from, to });
}
