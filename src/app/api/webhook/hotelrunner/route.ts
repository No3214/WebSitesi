import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendGa4Purchase } from "@/lib/ga4-server";
import { sendMetaPurchase } from "@/lib/meta-capi";
import { getPayloadClient } from "@/lib/payload";
import { logEvent } from "@/lib/logger";
import { hasSeen, markSeen } from "@/lib/rate-limit";
import { safeText, verifyEs256Signature } from "@/lib/security";
import { invalidWebhookPayloadSnapshot, redactWebhookPayload } from "@/lib/webhook-audit";
import { readLimitedWebhookBody } from "@/lib/webhook-body-limit";

type ReservationBody = {
  reservation?: {
    id?: string | number;
    guest_first_name?: string;
    guest_last_name?: string;
    guest_email?: string;
    guest_phone?: string;
    status?: string;
    room_type_name?: string;
    checkin?: string;
    checkout?: string;
    total_price?: string | number;
    currency_code?: string;
    guest_notes?: string;
  };
};

// Audit T4: yerel Map yerine paylaşımlı replay store (lib/rate-limit).
const REPLAY_TTL_MS = 6 * 60 * 60 * 1000;

function markReplay(messageUid: string) {
  return markSeen(`hr:${messageUid}`, REPLAY_TTL_MS);
}

function hasReplay(messageUid: string) {
  return hasSeen(`hr:${messageUid}`);
}

function createDigest(bodyText: string) {
  return crypto.createHmac("sha256", env.HOTELRUNNER_WEBHOOK_SECRET).update(bodyText).digest("hex");
}

function safeCompare(a: string, b: string) {
  // Constant-time comparison without a length-based early return:
  // both inputs are hashed to fixed-length digests first, so neither the
  // byte comparison nor a length mismatch leaks timing information.
  const left = crypto.createHash("sha256").update(a, "utf8").digest();
  const right = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(left, right);
}

async function writeAuditLog(data: Record<string, unknown>) {
  const payload = await getPayloadClient();
  if (!payload) return;

  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "webhook-events" as any,
    data,
    overrideAccess: true,
  });
}

function notFound() {
  return NextResponse.json(
    { error: "Not found" },
    { status: 404, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export function GET() {
  return notFound();
}

export async function POST(req: Request) {
  const messageUid = req.headers.get("x-message-uid") || "";
  const signature = req.headers.get("x-payload-signature") || "";
  const receivedAt = new Date().toISOString();

  // Fail-close: Block if security headers are missing
  if (!messageUid || !signature) {
    logEvent("warn", "webhook.hr.blocked_missing_headers", {
      hasMessageUid: Boolean(messageUid),
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ ok: false, error: "Unauthorized access attempt" }, { status: 401 });
  }

  // Security Hardening: Ensure we are using a real secret in production
  if (process.env.NODE_ENV === "production" && env.HOTELRUNNER_WEBHOOK_SECRET === "hotelrunner-dev-secret") {
    logEvent("error", "webhook.hr.dev_secret_in_prod");
    return NextResponse.json({ ok: false, error: "Configuration Error" }, { status: 500 });
  }

  if (await hasReplay(messageUid)) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "duplicate",
      signatureValid: true,
      receivedAt,
    });

    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  const bodyResult = await readLimitedWebhookBody(req);
  if (!bodyResult.ok) return bodyResult.response;
  const bodyText = bodyResult.bodyText;

  // İmza doğrulama çatallaması:
  // - HMS_WEBHOOK_ES256_PUBLIC_KEY DOLU ise ECC (ES256) modu: ham bodyText'i
  //   SPKI PEM public key ile doğrula (HMS/PSP ECC imzalı gönderdiğinde).
  // - BOŞ ise mevcut HMAC safeCompare akışı birebir korunur (geriye dönük uyum).
  const signatureValid = env.HMS_WEBHOOK_ES256_PUBLIC_KEY
    ? await verifyEs256Signature(bodyText, signature, env.HMS_WEBHOOK_ES256_PUBLIC_KEY)
    : safeCompare(signature, createDigest(bodyText));

  if (!signatureValid) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: false,
      errorMessage: "Invalid signature",
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: ReservationBody;
  try {
    body = JSON.parse(bodyText) as ReservationBody;
  } catch {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Invalid JSON",
      payloadJson: invalidWebhookPayloadSnapshot(bodyText),
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const reservation = body.reservation;
  if (!reservation?.id) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Unsupported payload structure",
      payloadJson: redactWebhookPayload(body),
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Unsupported payload structure" }, { status: 400 });
  }

  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error("Payload client could not be initialized");
  }

  const reservationId = String(reservation.id);

  const existingLead = await payload.find({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "organization-leads" as any,
    where: {
      source: { equals: `hotelrunner:${reservationId}` }
    },
    limit: 1
  });

  if (existingLead.totalDocs > 0) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      reservationId,
      status: "processed",
      signatureValid: true,
      payloadJson: {
        ...(redactWebhookPayload(body) as Record<string, unknown>),
        auditNote: "Duplicate reservation ID detected",
      },
      receivedAt,
    });
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "organization-leads" as any,
    data: {
      name: safeText(`${reservation.guest_first_name || ""} ${reservation.guest_last_name || ""}`.trim() || "HotelRunner Guest", 120),
      normalizedPhone: safeText((reservation.guest_phone || "").replace(/\D+/g, ""), 25),
      phone: safeText(reservation.guest_phone || "", 25) || "Bilinmiyor",
      normalizedEmail: safeText((reservation.guest_email || `booking-${reservationId}@hotelrunner.local`).toLowerCase(), 200),
      email: safeText((reservation.guest_email || `booking-${reservationId}@hotelrunner.local`).toLowerCase(), 200),
      type: "reservation",
      consent: true,
      leadScore: 90,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      leadPriority: "high" as any,
      source: `hotelrunner:${reservationId}`,
      dedupeHash: crypto.createHash("sha256").update(`hotelrunner:${reservationId}`).digest("hex"),
      message: [
        `Rezervasyon ID: ${reservationId}`,
        `Durum: ${safeText(reservation.status || "bilinmiyor", 50)}`,
        `Oda: ${safeText(reservation.room_type_name || "bilinmiyor", 120)}`,
        `Konaklama: ${safeText(reservation.checkin || "-", 30)} / ${safeText(reservation.checkout || "-", 30)}`,
        `Toplam Tutar: ${safeText(String(reservation.total_price || "-"), 30)} ${safeText(reservation.currency_code || "", 10)}`,
        `Notlar: ${safeText(reservation.guest_notes || "Yok", 1000)}`,
      ].join("\n"),
    },
    overrideAccess: true,
  });

  await writeAuditLog({
    provider: "hotelrunner",
    messageUid,
    reservationId,
    status: "processed",
    signatureValid: true,
    payloadJson: redactWebhookPayload(body),
    receivedAt,
  });

  // GA4 server-side purchase: rezervasyonun tek güvenilir tamamlanma anı bu
  // webhook'tur (misafir engine'de ödedikten sonra tarayıcı bizde olmayabilir).
  // İptal/no-show durumlarında purchase basılmaz. Hata webhook'u asla kırmaz.
  const status = (reservation.status || "").toLowerCase();
  const isCancelled = ["cancelled", "canceled", "no_show", "no-show", "rejected"].some((s) =>
    status.includes(s)
  );
  if (!isCancelled) {
    const purchaseValue = Number(reservation.total_price) || 0;
    const purchaseCurrency = safeText(reservation.currency_code || "TRY", 10);
    const purchaseRoom = safeText(reservation.room_type_name || "Konaklama Rezervasyonu", 120);
    await sendGa4Purchase({
      transactionId: reservationId,
      value: purchaseValue,
      currency: purchaseCurrency,
      itemName: purchaseRoom,
    });
    // Meta CAPI Purchase — ayni event_id (rezervasyon no) ile tarayici Pixel'iyle dedupe.
    await sendMetaPurchase({
      transactionId: reservationId,
      value: purchaseValue,
      currency: purchaseCurrency,
      roomName: purchaseRoom,
    });
  }

  await markReplay(messageUid);

  const response = NextResponse.json({ ok: true });
  response.headers.set("x-message-delivery", "confirmed");
  return response;
}
