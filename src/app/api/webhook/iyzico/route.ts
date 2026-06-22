import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendGa4Purchase } from "@/lib/ga4-server";
import { getPayloadClient } from "@/lib/payload";
import { logEvent } from "@/lib/logger";
import { hasSeen, markSeen } from "@/lib/rate-limit";
import { safeText } from "@/lib/security";
import { invalidWebhookPayloadSnapshot, redactWebhookPayload } from "@/lib/webhook-audit";
import { readLimitedWebhookBody } from "@/lib/webhook-body-limit";

type IyzicoWebhookBody = {
  status?: string;
  paymentId?: string;
  merchantOrderId?: string; // corresponds to our bookingId
  price?: string | number;
  currency?: string;
  iyziCommissionRateAmount?: string | number;
  iyziCommissionFeeType?: string;
  signature?: string;
};

// Audit T4: yerel Map yerine paylaşımlı replay store (lib/rate-limit).
const REPLAY_TTL_MS = 6 * 60 * 60 * 1000;
const SUCCESSFUL_IYZICO_STATUSES = new Set(["success", "successful", "succeeded", "paid", "approved", "captured"]);

function markReplay(messageUid: string) {
  return markSeen(`iyzico:${messageUid}`, REPLAY_TTL_MS);
}

function hasReplay(messageUid: string) {
  return hasSeen(`iyzico:${messageUid}`);
}

function createDigest(bodyText: string) {
  return crypto.createHmac("sha256", env.IYZICO_WEBHOOK_SECRET).update(bodyText).digest("hex");
}

function safeCompare(a: string, b: string) {
  const left = crypto.createHash("sha256").update(a, "utf8").digest();
  const right = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(left, right);
}

function isSuccessfulPaymentStatus(status?: string) {
  return SUCCESSFUL_IYZICO_STATUSES.has(safeText(status || "", 50).trim().toLowerCase());
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

  // 1. Fail-close: Block if security headers are missing
  if (!messageUid || !signature) {
    logEvent("warn", "webhook.iyzico.blocked_missing_headers", {
      hasMessageUid: Boolean(messageUid),
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ ok: false, error: "Unauthorized access attempt" }, { status: 401 });
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!env.IYZICO_WEBHOOK_SECRET.trim() || env.IYZICO_WEBHOOK_SECRET === "iyzico-dev-secret")
  ) {
    logEvent("error", "webhook.iyzico.dev_secret_in_prod");
    return NextResponse.json({ ok: false, error: "Configuration Error" }, { status: 500 });
  }

  // 2. Replay Protection
  if (await hasReplay(messageUid)) {
    await writeAuditLog({
      provider: "iyzico",
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

  // 3. Iyzico webhooks use their own HMAC secret. Do not couple this provider
  // to HMS ES256 keys; enabling HMS signing must not break Iyzico callbacks.
  const signatureValid = safeCompare(signature, createDigest(bodyText));

  if (!signatureValid) {
    await writeAuditLog({
      provider: "iyzico",
      messageUid,
      status: "rejected",
      signatureValid: false,
      errorMessage: "Invalid signature verification failed",
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: IyzicoWebhookBody;
  try {
    body = JSON.parse(bodyText) as IyzicoWebhookBody;
  } catch {
    await writeAuditLog({
      provider: "iyzico",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Invalid JSON format in body",
      payloadJson: invalidWebhookPayloadSnapshot(bodyText),
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = body.merchantOrderId;
  if (!bookingId) {
    await writeAuditLog({
      provider: "iyzico",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Missing merchantOrderId/bookingId reference",
      payloadJson: redactWebhookPayload(body),
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Missing booking reference" }, { status: 400 });
  }

  const payload = await getPayloadClient();
  if (!payload) {
    throw new Error("Payload client could not be initialized");
  }

  // 4. Update the reservation status in the Database
  const targetDedupeHash = crypto.createHash("sha256").update(`booking:${bookingId}`).digest("hex");
  const paymentSucceeded = isSuccessfulPaymentStatus(body.status);
  const queryResult = await payload.find({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: "organization-leads" as any,
    where: {
      dedupeHash: {
        equals: targetDedupeHash,
      },
    },
    limit: 1,
    overrideAccess: true,
  });

  let reservationFound = false;
  if (queryResult.docs && queryResult.docs.length > 0) {
    reservationFound = true;
    const lead = queryResult.docs[0];
    const statusLine = paymentSucceeded
      ? "Ödeme iyzico ağ geçidinden başarıyla çekilmiştir."
      : `Iyzico ödeme bildirimi alındı; durum başarılı değil: ${safeText(body.status || "bilinmiyor", 50)}.`;
    
    // Update booking status detail
    await payload.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: "organization-leads" as any,
      id: lead.id,
      data: {
        message: `${lead.message}\n\n[IYZICO WEBHOOK CONFIRMATION]: ${statusLine}\nÖdeme ID: ${safeText(body.paymentId || "bilinmiyor", 100)}\nTutar: ${safeText(String(body.price || "-"), 30)} ${safeText(body.currency || "TRY", 10)}\nZaman damgası: ${receivedAt}`,
      },
      overrideAccess: true,
    });
  }

  // 5. Save event in Webhook Audit logs
  await writeAuditLog({
    provider: "iyzico",
    messageUid,
    reservationId: bookingId,
    status: "processed",
    signatureValid: true,
    payloadJson: redactWebhookPayload(body),
    errorMessage: !reservationFound
      ? "Webhook signature validated, but booking reference was not found in leads"
      : paymentSucceeded
        ? undefined
        : "Iyzico payment status was not successful; no purchase event emitted",
    receivedAt,
  });

  // GA4 server-side purchase: Iyzico callbacks can be the only reliable proof
  // that a site-originated pre-reservation payment finished. Never include
  // guest PII; GA4 env absence is a safe no-op inside sendGa4Purchase.
  if (reservationFound && paymentSucceeded) {
    await sendGa4Purchase({
      transactionId: bookingId,
      value: Number(body.price) || 0,
      currency: safeText(body.currency || "TRY", 10),
      itemName: "Konaklama Rezervasyonu",
    });
  }

  await markReplay(messageUid);

  const response = NextResponse.json({ ok: true, matched: reservationFound });
  response.headers.set("x-message-delivery", "confirmed");
  return response;
}
