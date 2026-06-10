import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getPayloadClient } from "@/lib/payload";
import { hasSeen, markSeen } from "@/lib/rate-limit";
import { safeText, verifyEs256Signature } from "@/lib/security";

type IyzicoWebhookBody = {
  status?: string;
  paymentId?: string;
  merchantOrderId?: string; // corresponds to our bookingId
  price?: string | number;
  iyziCommissionRateAmount?: string | number;
  iyziCommissionFeeType?: string;
  signature?: string;
};

// Audit T4: yerel Map yerine paylaşımlı replay store (lib/rate-limit).
const REPLAY_TTL_MS = 6 * 60 * 60 * 1000;

function markReplay(messageUid: string) {
  return markSeen(`iyzico:${messageUid}`, REPLAY_TTL_MS);
}

function hasReplay(messageUid: string) {
  return hasSeen(`iyzico:${messageUid}`);
}

function createDigest(bodyText: string) {
  return crypto.createHmac("sha256", env.HOTELRUNNER_WEBHOOK_SECRET).update(bodyText).digest("hex");
}

function safeCompare(a: string, b: string) {
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

export async function GET() {
  return NextResponse.json({ status: "active", provider: "iyzico" });
}

export async function POST(req: Request) {
  const messageUid = req.headers.get("x-message-uid") || "";
  const signature = req.headers.get("x-payload-signature") || "";
  const receivedAt = new Date().toISOString();

  // 1. Fail-close: Block if security headers are missing
  if (!messageUid || !signature) {
    console.warn(`[IYZICO WEBHOOK] Blocked attempt - MessageUID: ${messageUid ? 'present' : 'missing'}, Signature: ${signature ? 'present' : 'missing'}`);
    return NextResponse.json({ ok: false, error: "Unauthorized access attempt" }, { status: 401 });
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

  const bodyText = await req.text();

  // 3. Signature verification (ES256 or Fallback HMAC)
  const signatureValid = env.HMS_WEBHOOK_ES256_PUBLIC_KEY
    ? await verifyEs256Signature(bodyText, signature, env.HMS_WEBHOOK_ES256_PUBLIC_KEY)
    : safeCompare(signature, createDigest(bodyText));

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
      payloadJson: { raw: bodyText },
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
      payloadJson: body,
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
    
    // Update booking status detail
    await payload.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: "organization-leads" as any,
      id: lead.id,
      data: {
        message: `${lead.message}\n\n[IYZICO WEBHOOK CONFIRMATION]: Ödeme iyzico ağ geçidinden başarıyla çekilmiştir.\nÖdeme ID: ${safeText(body.paymentId || "bilinmiyor", 100)}\nTutar: ${safeText(String(body.price || "-"), 30)} TRY\nZaman damgası: ${receivedAt}`,
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
    payloadJson: body,
    errorMessage: reservationFound ? undefined : "Webhook signature validated, but booking reference was not found in leads",
    receivedAt,
  });

  await markReplay(messageUid);

  const response = NextResponse.json({ ok: true, matched: reservationFound });
  response.headers.set("x-message-delivery", "confirmed");
  return response;
}
