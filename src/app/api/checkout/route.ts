import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getPayloadClient } from "@/lib/payload";
import { calculateBookingQuote } from "@/lib/booking-pricing";
import { errField, logEvent, maskIp } from "@/lib/logger";
import { extractClientIp, enforceRateLimit, validateSameOrigin, safeText } from "@/lib/security";

const forbiddenPaymentFields = [
  "cardNumber",
  "card_number",
  "pan",
  "cvv",
  "cvc",
  "expiry",
  "expireMonth",
  "expireYear",
] as const;

const checkoutSchema = z.object({
  bookingId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number().int().positive(),
  guests: z.number().int().positive(),
  roomSlug: z.string(),
  roomTitle: z.string(),
  guestName: z.string().trim().min(2).max(100),
  guestEmail: z.string().trim().email(),
  guestPhone: z.string().trim().min(8).max(25),
  scent: z.string(),
  pillow: z.string(),
  sound: z.string(),
  light: z.string(),
  promoCode: z.string().optional(),
  totalPrice: z.number().positive(),
  consent: z.preprocess((value) => {
    if (value === true || value === "true" || value === "on" || value === "1") return true;
    if (value === false || value === "false" || value === "0" || value === "" || value == null) return false;
    return value;
  }, z.boolean()),
  // Kart alanı YOK (Audit F13): tahsilat Garanti BBVA Sanal POS'un 3D Secure
  // sayfasında yapılacak — PAN bu API'ye asla gönderilmez.
}).strict();

export async function POST(req: Request) {
  try {
    // 1. CSRF Protection: Validate Origin matches Host
    if (!validateSameOrigin(req)) {
      logEvent("warn", "checkout.csrf_blocked");
      return NextResponse.json(
        { ok: false, message: "Güvenlik İhlali: Yetkisiz çapraz istek engellendi." },
        { status: 403 }
      );
    }

    // 2. Rate Limiting: Prevent carding/brute-force attacks (5 attempts/min)
    const clientIp = extractClientIp(req.headers);
    const limitResult = await enforceRateLimit(`checkout:${clientIp}`, 5, 60 * 1000);
    if (!limitResult.allowed) {
      logEvent("warn", "checkout.rate_limited", { ip: maskIp(clientIp) });
      return NextResponse.json(
        { ok: false, message: `Çok fazla rezervasyon denemesi yaptınız. Lütfen ${limitResult.retryAfterSec} saniye sonra tekrar deneyin.` },
        { status: 429, headers: { "Retry-After": String(limitResult.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const receivedForbiddenPaymentFields = forbiddenPaymentFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(body, field),
    );
    if (receivedForbiddenPaymentFields.length > 0) {
      logEvent("warn", "checkout.card_data_rejected", {
        fieldCount: receivedForbiddenPaymentFields.length,
      });
      return NextResponse.json(
        { ok: false, message: "Kart bilgileri bu sitede alınmaz. Lütfen güvenli ödeme adımı için ekibimizin yönlendirmesini bekleyin." },
        { status: 400 },
      );
    }

    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Geçersiz rezervasyon veya ödeme verileri.", errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (!data.consent) {
      return NextResponse.json(
        { ok: false, message: "KVKK ve gizlilik onayı zorunludur." },
        { status: 400 },
      );
    }

    // 3. Double check room catalog, date-derived nights, and pricing.
    const quote = calculateBookingQuote(data.roomSlug, data.checkIn, data.checkOut);
    if (!quote.ok) {
      logEvent("warn", "checkout.quote_invalid", {
        reason: quote.reason,
        roomSlug: data.roomSlug,
      });
      const message =
        quote.reason === "unknown-room"
          ? "Oda doğrulanamadı."
          : "Konaklama tarihi doğrulanamadı.";
      return NextResponse.json({ ok: false, message }, { status: 400 });
    }

    if (data.nights !== quote.nights) {
      logEvent("warn", "checkout.nights_mismatch", {
        expected: quote.nights,
        received: data.nights,
        roomSlug: data.roomSlug,
      });
      return NextResponse.json({ ok: false, message: "Gece sayısı doğrulanamadı." }, { status: 400 });
    }

    // Verify client total matches within 2 TRY variance due to potential floating point rounding
    if (Math.abs(quote.totalPrice - data.totalPrice) > 2) {
      logEvent("warn", "checkout.price_mismatch", {
        expected: quote.totalPrice,
        received: data.totalPrice,
        roomSlug: data.roomSlug,
      });
      return NextResponse.json({ ok: false, message: "Rezervasyon tutarı doğrulanamadı." }, { status: 400 });
    }

    // 4. Tahsilat bu route'ta YAPILMAZ: ödeme, Garanti BBVA Sanal POS 3D Secure
    // sayfasında ayrı bir adımda alınır (entegrasyon: docs/odeme-karari.md).
    // Bu route yalnızca doğrulanmış ön-rezervasyon talebini CMS'e kaydeder.

    // 5. Database Integration: Save reservation directly into PostgreSQL/Payload CMS
    const payload = await getPayloadClient();
    if (!payload) {
      throw new Error("Payload client could not be initialized");
    }

    const userAgent = req.headers.get("user-agent") || "";
    const dedupeHash = crypto.createHash("sha256").update(`booking:${data.bookingId}`).digest("hex");

    await payload.create({
      collection: "organization-leads",
      data: {
        name: safeText(data.guestName, 120),
        phone: safeText(data.guestPhone, 25),
        normalizedPhone: safeText(data.guestPhone.replace(/\D+/g, ""), 25),
        email: safeText(data.guestEmail.toLowerCase(), 200),
        normalizedEmail: safeText(data.guestEmail.toLowerCase(), 200),
        type: "booking",
        leadPriority: "high",
        leadScore: 100,
        source: "booking_wizard",
        dedupeHash,
        consent: true,
        ipAddress: clientIp,
        userAgent: safeText(userAgent, 500),
        message: [
          `Rezervasyon ID: ${data.bookingId}`,
          `Oda: ${safeText(data.roomTitle, 120)} (${data.roomSlug})`,
          `Giriş / Çıkış: ${data.checkIn} / ${data.checkOut} (${quote.nights} Gece)`,
          `Konuk: ${data.guests} Yetişkin`,
          `Atmosfer Tercihleri:`,
          `  • Koku: ${safeText(data.scent, 100)}`,
          `  • Yastık: ${safeText(data.pillow, 100)}`,
          `  • Ses: ${safeText(data.sound, 100)}`,
          `  • Işık: ${safeText(data.light, 100)}`,
          `Teklif notu: Fiyat ve kampanya ekibin manuel onayına tabidir.`,
          `Toplam Tutar: ${quote.totalPrice} TRY`,
          `Tahsilat: Garanti Sanal POS ile alınacak (ödeme bu sitede yapılmadı)`
        ].join("\n"),
      },
      overrideAccess: true,
    });

    // PII: misafir adı log'a HAM yazılmaz (F12) — kayıt zaten CMS'te.
    logEvent("info", "checkout.booking_created", {
      bookingId: data.bookingId,
      roomSlug: data.roomSlug,
      nights: quote.nights,
      total: quote.totalPrice,
      currency: "TRY",
    });

    // Complete transaction successfully
    return NextResponse.json({ 
      ok: true, 
      message:
        "Rezervasyon talebiniz alındı. Tahsilat yapılmadı — ekibimiz teyit ve güvenli ödeme için sizinle iletişime geçecek.",
      bookingId: data.bookingId 
    });

  } catch (error) {
    logEvent("error", "checkout.unhandled", { err: errField(error) });
    return NextResponse.json({ ok: false, message: "Rezervasyon işlenirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
