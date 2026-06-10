import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getPayloadClient } from "@/lib/payload";
import { extractClientIp, enforceRateLimit, validateSameOrigin, safeText } from "@/lib/security";

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
  cardNumber: z.string().min(15).max(19),
});

export async function POST(req: Request) {
  try {
    // 1. CSRF Protection: Validate Origin matches Host
    if (!validateSameOrigin(req)) {
      console.warn("[CHECKOUT] Blocked cross-origin/CSRF checkout attempt");
      return NextResponse.json(
        { ok: false, message: "Güvenlik İhlali: Yetkisiz çapraz istek engellendi." },
        { status: 403 }
      );
    }

    // 2. Rate Limiting: Prevent carding/brute-force attacks (5 attempts/min)
    const clientIp = extractClientIp(req.headers);
    const limitResult = enforceRateLimit(`checkout:${clientIp}`, 5, 60 * 1000);
    if (!limitResult.allowed) {
      console.warn(`[CHECKOUT] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { ok: false, message: `Çok fazla rezervasyon denemesi yaptınız. Lütfen ${limitResult.retryAfterSec} saniye sonra tekrar deneyin.` },
        { status: 429, headers: { "Retry-After": String(limitResult.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Geçersiz rezervasyon veya ödeme verileri.", errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // 3. Double check room pricing (prevent client-side price tampering)
    let rate = 4500;
    if (data.roomSlug.includes("superior")) rate = 8500;
    else if (data.roomSlug.includes("aile")) rate = 7500;
    else if (data.roomSlug.includes("uc-kisilik")) rate = 6000;

    let expectedTotal = rate * data.nights;

    // Apply promo code if present and valid
    if (data.promoCode && data.promoCode.toUpperCase() === "SLOWROTA15") {
      expectedTotal = expectedTotal * 0.85;
    }

    // Verify client total matches within 2 TRY variance due to potential floating point rounding
    if (Math.abs(expectedTotal - data.totalPrice) > 2) {
      console.warn(`[CHECKOUT] Price discrepancy detected. Expected: ${expectedTotal}, Received: ${data.totalPrice}`);
      return NextResponse.json({ ok: false, message: "Rezervasyon tutarı doğrulanamadı." }, { status: 400 });
    }

    // 4. Perform Mock Credit Card validation (Simulating payment gateway)
    const isMockCCTesting = data.cardNumber.startsWith("4111") || data.cardNumber.startsWith("4242") || data.cardNumber.startsWith("4");
    if (!isMockCCTesting) {
      return NextResponse.json({ ok: false, message: "Ödeme reddedildi: Geçersiz kart numarası veya bakiye yetersiz." }, { status: 400 });
    }

    // 5. Database Integration: Save reservation directly into PostgreSQL/Payload CMS
    const payload = await getPayloadClient();
    if (!payload) {
      throw new Error("Payload client could not be initialized");
    }

    const userAgent = req.headers.get("user-agent") || "";
    const dedupeHash = crypto.createHash("sha256").update(`booking:${data.bookingId}`).digest("hex");

    await payload.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: "organization-leads" as any,
      data: {
        name: safeText(data.guestName, 120),
        phone: safeText(data.guestPhone, 25),
        normalizedPhone: safeText(data.guestPhone.replace(/\D+/g, ""), 25),
        email: safeText(data.guestEmail.toLowerCase(), 200),
        normalizedEmail: safeText(data.guestEmail.toLowerCase(), 200),
        type: "booking",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leadPriority: "high" as any,
        leadScore: 100,
        source: "booking_wizard",
        dedupeHash,
        consent: true,
        ipAddress: clientIp,
        userAgent: safeText(userAgent, 500),
        message: [
          `Rezervasyon ID: ${data.bookingId}`,
          `Oda: ${safeText(data.roomTitle, 120)} (${data.roomSlug})`,
          `Giriş / Çıkış: ${data.checkIn} / ${data.checkOut} (${data.nights} Gece)`,
          `Konuk: ${data.guests} Yetişkin`,
          `Atmosfer Tercihleri:`,
          `  • Koku: ${safeText(data.scent, 100)}`,
          `  • Yastık: ${safeText(data.pillow, 100)}`,
          `  • Ses: ${safeText(data.sound, 100)}`,
          `  • Işık: ${safeText(data.light, 100)}`,
          `İndirim Kodu: ${data.promoCode ? safeText(data.promoCode, 50) : "Yok"}`,
          `Toplam Tutar: ${data.totalPrice} TRY`,
          `Kart Numarası (Maskelenmiş): **** **** **** ${data.cardNumber.replace(/\s+/g, "").slice(-4)}`
        ].join("\n"),
      },
      overrideAccess: true,
    });

    console.log(`[BOOKING SUCCESS]: ID: ${data.bookingId}, Room: ${data.roomTitle}, Guest: ${data.guestName}, Total: ${data.totalPrice} TRY`);

    // Complete transaction successfully
    return NextResponse.json({ 
      ok: true, 
      message:
        "Rezervasyon talebiniz alındı. Tahsilat yapılmadı — ekibimiz teyit ve güvenli ödeme için sizinle iletişime geçecek.",
      bookingId: data.bookingId 
    });

  } catch (error) {
    console.error("Checkout process error:", error);
    return NextResponse.json({ ok: false, message: "Rezervasyon işlenirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
